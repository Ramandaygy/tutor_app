import os
from datetime import datetime
from bson import ObjectId

from flask import request, jsonify, current_app
from werkzeug.utils import secure_filename

from admin import admin_bp
from admin.decorators import admin_required
from admin.tryout.tryout_service import (
    create_tryout_question,
    upload_tryout_pdf,
    get_all_tryout_questions,
    process_tryout_pdf,
    tryout_pdf_col
)


UPLOAD_IMAGE_FOLDER = "uploads/tryout_images"
UPLOAD_PDF_FOLDER = "uploads/tryout_pdf"


def ensure_folder(path: str):
    if not os.path.exists(path):
        os.makedirs(path)


# =====================================================
# ================= TAMBAH SOAL TRYOUT =================
# =====================================================

@admin_bp.route("/tryout/add", methods=["POST"])
@admin_required
def add_tryout():
    """Tambah soal tryout manual"""
    try:
        question_type = request.form.get("type")
        question = request.form.get("question")
        category = request.form.get("category", "Umum")

        if not question_type or not question:
            return jsonify({
                "status": "error",
                "message": "type dan question wajib diisi"
            }), 400

        payload = {
            "type": question_type,
            "question": question,
            "category": category
        }

        # ================= PILIHAN GANDA =================
        if question_type == "multiple_choice":
            options = [request.form.get(f"options[{i}]") for i in range(4)]
            answer = request.form.get("answer")

            if not all(options) or not answer:
                return jsonify({
                    "status": "error",
                    "message": "Options dan answer wajib diisi"
                }), 400

            image = request.files.get("image")
            if image:
                ensure_folder(UPLOAD_IMAGE_FOLDER)
                filename = secure_filename(image.filename)
                path = os.path.join(UPLOAD_IMAGE_FOLDER, filename)
                image.save(path)
                payload["image_url"] = f"/uploads/tryout_images/{filename}"

            payload["options"] = options
            payload["answer"] = answer

        # ================= ESSAY =================
        elif question_type == "essay":
            answer_desc = request.form.get("answer_desc")
            keywords = request.form.get("keywords", "")

            if not answer_desc:
                return jsonify({
                    "status": "error",
                    "message": "answer_desc wajib diisi"
                }), 400

            payload["answer_desc"] = answer_desc
            payload["keywords"] = [k.strip() for k in keywords.split(",") if k.strip()]

        else:
            return jsonify({
                "status": "error",
                "message": "Tipe soal tidak valid"
            }), 400

        create_tryout_question(payload)

        return jsonify({
            "status": "success",
            "message": "Soal tryout berhasil ditambahkan"
        }), 201

    except Exception as e:
        current_app.logger.error(f"Add tryout error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500


# =====================================================
# ================= UPLOAD PDF TRYOUT ==================
# =====================================================

@admin_bp.route("/tryout/upload", methods=["POST"])
@admin_required
def upload_tryout_file():
    """Upload PDF soal tryout"""
    try:
        file = request.files.get("file")
        category = request.form.get("category", "Umum")

        if not file:
            return jsonify({
                "status": "error",
                "message": "File tidak ditemukan"
            }), 400

        ensure_folder(UPLOAD_PDF_FOLDER)

        filename = secure_filename(file.filename)
        path = os.path.join(UPLOAD_PDF_FOLDER, filename)
        file.save(path)

        upload_tryout_pdf(filename, category)

        return jsonify({
            "status": "success",
            "message": "File soal tryout berhasil diupload"
        }), 201

    except Exception as e:
        current_app.logger.error(f"Upload tryout pdf error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500

# =====================================================
# ============ PROCESS PDF → SOAL TRYOUT ===============
# =====================================================

@admin_bp.route("/tryout/process/<pdf_id>", methods=["POST"])
@admin_required
def process_tryout_pdf_route(pdf_id):
    try:
        from admin.tryout.tryout_service import process_tryout_pdf
        from bson import ObjectId

        pdf = tryout_pdf_col.find_one({"_id": ObjectId(pdf_id)})
        if not pdf:
            return jsonify({
                "status": "error",
                "message": "PDF tidak ditemukan"
            }), 404

        file_path = os.path.join(UPLOAD_PDF_FOLDER, pdf["filename"])

        result = process_uploaded_pdf(str(pdf["_id"]))

        return jsonify({
            "status": "success",
            "message": "PDF berhasil diproses",
            "total_questions": result["total_questions"]
        }), 200


    except Exception as e:
        current_app.logger.error(f"Process tryout pdf error: {e}")
        return jsonify({
            "status": "error",
            "message": "Gagal memproses PDF"
        }), 500


# =====================================================
# ================= GET SOAL TRYOUT ====================
# =====================================================

@admin_bp.route("/tryout/soal", methods=["GET"])
def get_tryout_soal():
    """
    Dipakai USER (latihan / tryout)
    TANPA admin_required
    """
    try:
        questions = get_all_tryout_questions()

        return jsonify({
            "status": "success",
            "total": len(questions),
            "questions": questions
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get tryout soal error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500
