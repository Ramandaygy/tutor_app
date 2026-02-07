from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from admin import admin_bp
from admin.decorators import admin_required
from admin.progress.progress_service import (
    get_user_progress,
    update_user_progress,
    progress_col
)


# =====================================================
# ================= PROGRESS (USER) ===================
# =====================================================

@admin_bp.route("/progress/me", methods=["GET"])
@jwt_required()
def my_progress():
    """User melihat progres dirinya sendiri"""
    try:
        user_id = get_jwt_identity()
        progress = get_user_progress(user_id)

        return jsonify({
            "status": "success",
            "progress": progress
        }), 200

    except Exception as e:
        current_app.logger.error(f"My progress error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500


@admin_bp.route("/progress/update", methods=["POST"])
@jwt_required()
def update_progress():
    """User update progres"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}

        allowed_fields = {
            "literasi",
            "numerik",
            "sains",
            "rating",
            "total_lessons",
            "streak_days"
        }

        update_data = {k: v for k, v in data.items() if k in allowed_fields}

        if not update_data:
            return jsonify({
                "status": "error",
                "message": "Tidak ada field valid untuk diupdate"
            }), 400

        progress = update_user_progress(user_id, update_data)

        return jsonify({
            "status": "success",
            "progress": progress
        }), 200

    except Exception as e:
        current_app.logger.error(f"Update progress error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500


# =====================================================
# ================= PROGRESS (ADMIN) ==================
# =====================================================

@admin_bp.route("/progress/all", methods=["GET"])
@admin_required
def get_all_progress():
    """Admin lihat semua progress user"""
    try:
        all_progress = list(progress_col.find({}, {"_id": 0}))

        return jsonify({
            "status": "success",
            "total": len(all_progress),
            "progress": all_progress
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get all progress error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500


@admin_bp.route("/progress/<user_id>", methods=["GET"])
@admin_required
def get_user_progress_admin(user_id):
    """Admin lihat progress user tertentu"""
    try:
        progress = get_user_progress(user_id)

        return jsonify({
            "status": "success",
            "progress": progress
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get user progress error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500
