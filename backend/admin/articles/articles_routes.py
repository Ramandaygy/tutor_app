import os
from datetime import datetime
from bson import ObjectId

from flask import request, jsonify, current_app
from werkzeug.utils import secure_filename

from admin import admin_bp
from admin.decorators import admin_required
from extensions import mongo   # sesuaikan dengan file mongo init kamu


UPLOAD_FOLDER = "uploads/articles"


# =====================================================
# ==================== ARTIKEL ADMIN ==================
# =====================================================

def ensure_upload_folder():
    """Pastikan folder upload ada"""
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)


# -------------------- Tambah Artikel --------------------

@admin_bp.route("/articles/add", methods=["POST"])
@admin_required
def add_article():
    """Tambah artikel baru"""
    try:
        title = request.form.get("title")
        content = request.form.get("content")
        category = request.form.get("category")
        image = request.files.get("image")

        if not title or not content or not category:
            return jsonify({
                "status": "error",
                "message": "title, content, dan category wajib diisi"
            }), 400

        image_url = None
        if image:
            ensure_upload_folder()
            filename = secure_filename(image.filename)
            path = os.path.join(UPLOAD_FOLDER, filename)
            image.save(path)
            image_url = f"/uploads/articles/{filename}"

        mongo.db.articles.insert_one({
            "title": title,
            "content": content,
            "category": category,
            "thumbnail_url": image_url,
            "created_at": datetime.utcnow(),
            "updated_at": None
        })

        return jsonify({
            "status": "success",
            "message": "Artikel berhasil ditambahkan"
        }), 201

    except Exception as e:
        current_app.logger.error(f"Add article error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500


# -------------------- List Artikel --------------------

@admin_bp.route("/articles", methods=["GET"])
def get_articles():
    """List semua artikel"""
    try:
        articles = list(mongo.db.articles.find({}, {
            "_id": 1,
            "title": 1,
            "category": 1,
            "content": 1,
            "thumbnail_url": 1,
            "created_at": 1,
            "updated_at": 1
        }))

        for a in articles:
            a["_id"] = str(a["_id"])

        return jsonify({
            "status": "success",
            "total": len(articles),
            "articles": articles
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get articles error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500


# -------------------- Get Artikel by ID --------------------

@admin_bp.route("/articles/<article_id>", methods=["GET"])
def get_article(article_id):
    """Ambil artikel by ID"""
    try:
        if not ObjectId.is_valid(article_id):
            return jsonify({
                "status": "error",
                "message": "ID artikel tidak valid"
            }), 400

        article = mongo.db.articles.find_one(
            {"_id": ObjectId(article_id)}
        )

        if not article:
            return jsonify({
                "status": "error",
                "message": "Artikel tidak ditemukan"
            }), 404

        article["_id"] = str(article["_id"])

        return jsonify({
            "status": "success",
            "article": article
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get article error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500


# -------------------- Update Artikel --------------------

@admin_bp.route("/articles/update/<article_id>", methods=["PUT"])
@admin_required
def update_article(article_id):
    """Update artikel"""
    try:
        if not ObjectId.is_valid(article_id):
            return jsonify({
                "status": "error",
                "message": "ID artikel tidak valid"
            }), 400

        data = request.form.to_dict()
        image = request.files.get("image")

        update_data = {}

        allowed_fields = {"title", "content", "category"}

        for k, v in data.items():
            if k in allowed_fields:
                update_data[k] = v

        if image:
            ensure_upload_folder()
            filename = secure_filename(image.filename)
            path = os.path.join(UPLOAD_FOLDER, filename)
            image.save(path)
            update_data["thumbnail_url"] = f"/uploads/articles/{filename}"

        if not update_data:
            return jsonify({
                "status": "error",
                "message": "Tidak ada data yang diupdate"
            }), 400

        update_data["updated_at"] = datetime.utcnow()

        result = mongo.db.articles.update_one(
            {"_id": ObjectId(article_id)},
            {"$set": update_data}
        )

        if result.matched_count == 0:
            return jsonify({
                "status": "error",
                "message": "Artikel tidak ditemukan"
            }), 404

        return jsonify({
            "status": "success",
            "message": "Artikel berhasil diupdate"
        }), 200

    except Exception as e:
        current_app.logger.error(f"Update article error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500


# -------------------- Delete Artikel --------------------

@admin_bp.route("/articles/delete/<article_id>", methods=["DELETE"])
@admin_required
def delete_article(article_id):
    """Hapus artikel"""
    try:
        if not ObjectId.is_valid(article_id):
            return jsonify({
                "status": "error",
                "message": "ID artikel tidak valid"
            }), 400

        result = mongo.db.articles.delete_one({"_id": ObjectId(article_id)})

        if result.deleted_count == 0:
            return jsonify({
                "status": "error",
                "message": "Artikel tidak ditemukan"
            }), 404

        return jsonify({
            "status": "success",
            "message": "Artikel berhasil dihapus"
        }), 200

    except Exception as e:
        current_app.logger.error(f"Delete article error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500
