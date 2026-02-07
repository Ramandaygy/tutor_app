from flask import request, jsonify, current_app
from datetime import datetime
import traceback

from flask_jwt_extended import get_jwt_identity
from admin.decorators import admin_required
from admin import admin_bp
from models.user import User


# ================================
# USERS MANAGEMENT (ADMIN)
# ================================

@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_all_users():
    """Admin endpoint untuk melihat semua user"""
    try:
        search = request.args.get("search", "").strip()
        role_filter = request.args.get("role", "").strip()
        status_filter = request.args.get("status", "").strip()  # active / inactive / all

        query = {}

        # Search
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
            ]

        # Role filter
        if role_filter:
            query["role"] = role_filter

        # Status filter
        if status_filter == "active":
            query["is_active"] = True
        elif status_filter == "inactive":
            query["is_active"] = False

        current_app.logger.info(f"📡 Query users: {query}")

        users = User.find_all(query)

        return jsonify({
            "status": "success",
            "total": len(users),
            "users": [u.to_dict() for u in users],
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get users error: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500


# ================================
# USER DETAIL
# ================================

@admin_bp.route("/users/<user_id>", methods=["GET"])
@admin_required
def get_user_detail(user_id):
    """Lihat detail user"""
    try:
        user = User.get_by_id(user_id)

        if not user:
            return jsonify({
                "status": "error",
                "message": "User tidak ditemukan"
            }), 404

        return jsonify({
            "status": "success",
            "user": user.to_dict()
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get user detail error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500


# ================================
# TOGGLE USER STATUS
# ================================

@admin_bp.route("/users/<user_id>/toggle-status", methods=["POST"])
@admin_required
def toggle_user_status(user_id):
    """Aktif/nonaktifkan user"""
    try:
        current_user_id = get_jwt_identity()

        if str(user_id) == str(current_user_id):
            return jsonify({
                "status": "error",
                "message": "Tidak bisa ubah status akun sendiri"
            }), 400

        user = User.get_by_id(user_id)

        if not user:
            return jsonify({
                "status": "error",
                "message": "User tidak ditemukan"
            }), 404

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
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500


# ================================
# CHANGE USER ROLE
# ================================

@admin_bp.route("/users/<user_id>/change-role", methods=["POST"])
@admin_required
def change_user_role(user_id):
    """Ubah role user"""
    try:
        data = request.get_json()
        new_role = data.get("role", "").lower()

        if new_role not in ["student", "teacher", "admin"]:
            return jsonify({
                "status": "error",
                "message": "Role tidak valid"
            }), 400

        user = User.get_by_id(user_id)

        if not user:
            return jsonify({
                "status": "error",
                "message": "User tidak ditemukan"
            }), 404

        user.role = new_role
        user.updated_at = datetime.utcnow()
        user.save()

        return jsonify({
            "status": "success",
            "message": f"Role user berhasil diubah ke {new_role}"
        }), 200

    except Exception as e:
        current_app.logger.error(f"Change role error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500


# ================================
# DELETE USER
# ================================

@admin_bp.route("/users/<user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    """Hapus user"""
    try:
        confirm = request.args.get("confirm", "").lower()

        if confirm != "true":
            return jsonify({
                "status": "error",
                "message": "Konfirmasi diperlukan ?confirm=true"
            }), 400

        user = User.get_by_id(user_id)

        if not user:
            return jsonify({
                "status": "error",
                "message": "User tidak ditemukan"
            }), 404

        user.delete()

        return jsonify({
            "status": "success",
            "message": "User berhasil dihapus"
        }), 200

    except Exception as e:
        current_app.logger.error(f"Delete user error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500


# ================================
# ADMIN STATS
# ================================

@admin_bp.route("/stats", methods=["GET"])
@admin_required
def get_admin_stats():
    """Statistik user"""
    try:
        stats = User.get_stats()

        return jsonify({
            "status": "success",
            "stats": stats
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get stats error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500
