from functools import wraps
from flask import jsonify, current_app
from flask_jwt_extended import get_jwt_identity, jwt_required
from models.user import User


def admin_required(fn):
    """
    Decorator untuk membatasi akses hanya untuk admin.
    Harus dipasang setelah @jwt_required().
    """
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        try:
            current_user_id = get_jwt_identity()
            user = User.get_by_id(current_user_id)

            if not user:
                return jsonify({"error": "User tidak ditemukan"}), 404

            if not user.is_active:
                return jsonify({"error": "Akun tidak aktif"}), 403

            if user.role != "admin":
                return jsonify({"error": "Akses ditolak, admin only"}), 403

            return fn(*args, **kwargs)

        except Exception as e:
            current_app.logger.error(f"admin_required error: {e}")
            return jsonify({"error": "Terjadi kesalahan otorisasi"}), 500

    return wrapper
