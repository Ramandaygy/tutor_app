from flask import Blueprint, request, jsonify, current_app
from .activity_service import get_user_activity, get_all_activity
from flask_jwt_extended import (
    create_refresh_token, jwt_required, get_jwt_identity,
    create_access_token, verify_jwt_in_request, get_jwt
)
from .progress_service import get_user_progress, update_user_progress
from models.user import User
from datetime import datetime
from functools import wraps
import traceback
from extensions import mongo
from werkzeug.utils import secure_filename
from bson import ObjectId
import os


# ------------------ Dekorator Admin ------------------
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get("role") != "admin":
            return jsonify({"status": "error", "message": "Akses hanya untuk admin"}), 403
        return fn(*args, **kwargs)
    return wrapper

# ------------------ Blueprint ------------------
admin_bp = Blueprint("admin", __name__)

# ------------------ Auth untuk Admin ------------------
@admin_bp.route("/register", methods=["POST"])
def admin_register():
    """Register akun admin baru"""
    try:
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not all([name, email, password]):
            return jsonify({"status": "error", "message": "Semua field wajib diisi"}), 400

        if User.get_by_email(email):
            return jsonify({"status": "error", "message": "Email sudah terdaftar"}), 400

        User.create_user(name, email, password, role="admin")
        return jsonify({"status": "success", "message": "Admin berhasil didaftarkan"}), 201
    except Exception as e:
        current_app.logger.error(f"Admin register error: {e}")
        return jsonify({"status": "error", "message": "Terjadi kesalahan server"}), 500


@admin_bp.route("/login", methods=["POST"])
def admin_login():
    """Login khusus admin"""
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        user = User.get_by_email(email)
        if not user or not user.check_password(password):
            return jsonify({"status": "error", "message": "Email atau password salah"}), 401

        if user.role != "admin":
            return jsonify({"status": "error", "message": "Hanya admin yang bisa login"}), 403

        access_token = create_access_token(
            identity=str(user._id),
            additional_claims={"role": "admin"}
        )
        refresh_token = create_refresh_token(identity=str(user._id))

        return jsonify({
            "status": "success",
            "access_token": access_token,
            "refresh_token": refresh_token
        }), 200

    except Exception as e:
        current_app.logger.error(f"Admin login error: {e}")
        return jsonify({"status": "error", "message": "Terjadi kesalahan server"}), 500

# ------------------ Endpoint Admin ------------------
@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_all_users():
    """Admin endpoint untuk melihat semua user"""
    try:
        search = request.args.get("search", "").strip()
        role_filter = request.args.get("role", "").strip()
        status_filter = request.args.get("status", "").strip()  # active/inactive/all

        query = {}
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
            ]
        if role_filter:
            query["role"] = role_filter
        if status_filter == "active":
            query["is_active"] = True
        elif status_filter == "inactive":
            query["is_active"] = False

        print("📡 Query:", query)  # Debug
        users = User.find_all(query)
        print("✅ Jumlah user:", len(users))
        print("📋 Sample user:", users[0].to_dict() if users else "Tidak ada data")

        return jsonify({
            "status": "success",
            "total": len(users),
            "users": [u.to_dict() for u in users],
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get users error: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"status": "error", "message": "Terjadi kesalahan server"}), 500


@admin_bp.route("/users/<user_id>", methods=["GET"])
@admin_required
def get_user_detail(user_id):
    """Lihat detail user"""
    try:
        user = User.get_by_id(user_id)
        if not user:
            return jsonify({"status": "error", "message": "User tidak ditemukan"}), 404

        return jsonify({"status": "success", "user": user.to_dict()}), 200
    except Exception as e:
        current_app.logger.error(f"Get user detail error: {e}")
        return jsonify({"status": "error", "message": "Terjadi kesalahan server"}), 500


@admin_bp.route("/users/<user_id>/toggle-status", methods=["POST"])
@admin_required
def toggle_user_status(user_id):
    """Aktif/nonaktifkan user"""
    try:
        current_user_id = get_jwt_identity()
        if str(user_id) == str(current_user_id):
            return jsonify({"status": "error", "message": "Tidak bisa ubah status akun sendiri"}), 400

        user = User.get_by_id(user_id)
        if not user:
            return jsonify({"status": "error", "message": "User tidak ditemukan"}), 404

        user.is_active = not user.is_active
        user.updated_at = datetime.utcnow()
        user.save()

        return jsonify({
            "status": "success",
            "message": f"User {user.name} berhasil {'diaktifkan' if user.is_active else 'dinonaktifkan'}",
            "new_status": user.is_active,
        }), 200
    except Exception as e:
        current_app.logger.error(f"Toggle user status error: {e}")
        return jsonify({"status": "error", "message": "Terjadi kesalahan server"}), 500


@admin_bp.route("/users/<user_id>/change-role", methods=["POST"])
@admin_required
def change_user_role(user_id):
    """Ubah role user"""
    try:
        data = request.get_json()
        new_role = data.get("role", "").lower()
        if new_role not in ["student", "teacher", "admin"]:
            return jsonify({"status": "error", "message": "Role tidak valid"}), 400

        user = User.get_by_id(user_id)
        if not user:
            return jsonify({"status": "error", "message": "User tidak ditemukan"}), 404

        user.role = new_role
        user.updated_at = datetime.utcnow()
        user.save()

        return jsonify({"status": "success", "message": f"Role user berhasil diubah ke {new_role}"}), 200
    except Exception as e:
        current_app.logger.error(f"Change role error: {e}")
        return jsonify({"status": "error", "message": "Terjadi kesalahan server"}), 500


@admin_bp.route("/users/<user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    """Hapus user"""
    try:
        confirm = request.args.get("confirm", "").lower()
        if confirm != "true":
            return jsonify({"status": "error", "message": "Konfirmasi diperlukan ?confirm=true"}), 400

        user = User.get_by_id(user_id)
        if not user:
            return jsonify({"status": "error", "message": "User tidak ditemukan"}), 404

        user.delete()
        return jsonify({"status": "success", "message": "User berhasil dihapus"}), 200
    except Exception as e:
        current_app.logger.error(f"Delete user error: {e}")
        return jsonify({"status": "error", "message": "Terjadi kesalahan server"}), 500


@admin_bp.route("/stats", methods=["GET"])
@admin_required
def get_admin_stats():
    """Statistik user"""
    try:
        stats = User.get_stats()
        return jsonify({"status": "success", "stats": stats}), 200
    except Exception as e:
        current_app.logger.error(f"Get stats error: {e}")
        return jsonify({"status": "error", "message": "Terjadi kesalahan server"}), 500

# ------------------ Endpoint Progress untuk User ------------------
@admin_bp.route("/progress/me", methods=["GET"])
@jwt_required()
def my_progress():
    """User melihat progres dirinya sendiri"""
    try:
        user_id = get_jwt_identity()
        progress = get_user_progress(user_id)
        return jsonify({"status": "success", "progress": progress}), 200
    except Exception as e:
        current_app.logger.error(f"My progress error: {e}")
        return jsonify({"status": "error", "message": "Terjadi kesalahan server"}), 500


@admin_bp.route("/progress/update", methods=["POST"])
@jwt_required()
def update_progress():
    """User update progres"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        allowed_fields = {"literasi", "numerik", "sains", "rating", "total_lessons", "streak_days"}
        update_data = {k: v for k, v in data.items() if k in allowed_fields}

        progress = update_user_progress(user_id, update_data)
        return jsonify({"status": "success", "progress": progress}), 200
    except Exception as e:
        current_app.logger.error(f"Update progress error: {e}")
        return jsonify({"status": "error", "message": "Terjadi kesalahan server"}), 500

# ------------------ Endpoint Progress untuk Admin ------------------
@admin_bp.route("/progress/all", methods=["GET"])
@admin_required
def get_all_progress():
    """Admin lihat semua progress user"""
    try:
        from .progress_service import progress_col
        all_progress = list(progress_col.find({}, {"_id": 0}))
        return jsonify({"status": "success", "total": len(all_progress), "progress": all_progress}), 200
    except Exception as e:
        current_app.logger.error(f"Get all progress error: {e}")
        return jsonify({"status": "error", "message": "Terjadi kesalahan server"}), 500


@admin_bp.route("/progress/<user_id>", methods=["GET"])
@admin_required
def get_user_progress_admin(user_id):
    """Admin lihat progress user tertentu"""
    try:
        progress = get_user_progress(user_id)
        return jsonify({"status": "success", "progress": progress}), 200
    except Exception as e:
        current_app.logger.error(f"Get user progress error: {e}")
        return jsonify({"status": "error", "message": "Terjadi kesalahan server"}), 500



# 🔹 Ambil log semua user (global)
@admin_bp.route("/activity", methods=["GET"])
def admin_get_all_activity():
    limit = int(request.args.get("limit", 100))
    logs = get_all_activity(limit)
    return jsonify(logs)

# 🔹 Ambil log spesifik per user
@admin_bp.route("/activity/<user_id>", methods=["GET"])
def admin_get_user_activity(user_id):
    limit = int(request.args.get("limit", 50))
    logs = get_user_activity(user_id, limit)
    return jsonify(logs)


###### bagian sistem soal tryout #########

#add satu soal
@admin_bp.route("/tryout/add", methods=["POST"])
def add_tryout():
    question = request.form.get("question")
    answer = request.form.get("answer")
    category = request.form.get("category")
    options = [request.form.get(f"options[{i}]") for i in range(4)]

    image = request.files.get("image")
    image_url = None

    if image:
        filename = secure_filename(image.filename)
        path = os.path.join("uploads/tryout_images", filename)
        image.save(path)
        image_url = f"/uploads/tryout_images/{filename}"

    mongo.db.tryout.insert_one({
        "question": question,
        "options": options,
        "answer": answer,
        "category": category,
        "image_url": image_url,
        "created_at": datetime.utcnow(),
    })

    return jsonify({"message": "Soal berhasil disimpan"})

# import soal json
@admin_bp.route("/tryout/generate", methods=["POST"])
def generate_tryout_route():
    body = request.get_json()
    category = body.get("category", "Umum")
    jumlah = int(body.get("jumlah", 10))

    data = generate_soal_llm(category, jumlah)

    return jsonify({
        "message": f"{len(data)} soal berhasil digenerate!",
        "preview": data
    })

# ----------------- BAGIAN ARTIKEL ----------------#

# Tambah artikel
@admin_bp.route("/articles/add", methods=["POST"])
def add_article():
    title = request.form.get("title")
    content = request.form.get("content")
    category = request.form.get("category")
    image = request.files.get("image")

    image_url = None
    if image:
        filename = secure_filename(image.filename)

        # FIX: pastikan folder ada
        upload_folder = "uploads/articles"
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        path = os.path.join(upload_folder, filename)
        image.save(path)
        image_url = f"/uploads/articles/{filename}"

    mongo.db.articles.insert_one({
        "title": title,
        "content": content,
        "category": category,
        "thumbnail_url": image_url,
        "created_at": datetime.utcnow(),
    })

    return jsonify({"message": "Artikel berhasil ditambahkan!"})


# List artikel
@admin_bp.route("/articles", methods=["GET"])
def get_articles():
    articles = list(mongo.db.articles.find({}, {
        "_id": 1,
        "title": 1,
        "category": 1,
        "content": 1,
        "thumbnail_url": 1,
        "created_at": 1
    }))

    # convert ObjectId → string
    for a in articles:
        a["_id"] = str(a["_id"])

    return jsonify({"articles": articles})   # ← FIX INI


# Get artikel by ID  **FIXED SLASH**
@admin_bp.route("/articles/<article_id>", methods=["GET"])
def get_article(article_id):
    article = mongo.db.articles.find_one({"_id": ObjectId(article_id)}, {"_id": 0})
    return jsonify(article)


# Update artikel  **REMOVE double /admin**
@admin_bp.route("/articles/update/<article_id>", methods=["PUT"])
def update_article(article_id):
    data = request.form.to_dict()
    image = request.files.get("image")

    update_data = data

    if image:
        filename = secure_filename(image.filename)

        upload_folder = "uploads/articles"
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        path = os.path.join(upload_folder, filename)
        image.save(path)
        update_data["thumbnail_url"] = f"/uploads/articles/{filename}"

    mongo.db.articles.update_one(
        {"_id": ObjectId(article_id)},
        {"$set": update_data}
    )

    return jsonify({"message": "Artikel berhasil diupdate!"})


# Delete artikel  **REMOVE double /admin**
@admin_bp.route("/articles/delete/<article_id>", methods=["DELETE"])
def delete_article(article_id):
    mongo.db.articles.delete_one({"_id": ObjectId(article_id)})
    return jsonify({"message": "Artikel berhasil dihapus!"})
