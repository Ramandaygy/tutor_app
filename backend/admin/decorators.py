from functools import wraps
from flask import jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User


def admin_required(fn):
    """
    Decorator untuk membatasi akses hanya untuk admin.
    Sudah include @jwt_required() di dalamnya.
    Tidak perlu pasang @jwt_required() lagi di route.
    """

    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        try:
            current_user_id = get_jwt_identity()

            # Ambil user dari database
            user = User.get_by_id(current_user_id)

            if not user:
                return jsonify({
                    "status": "error",
                    "message": "User tidak ditemukan"
                }), 404

            if not user.is_active:
                return jsonify({
                    "status": "error",
                    "message": "Akun tidak aktif"
                }), 403

            if user.role != "admin":
                return jsonify({
                    "status": "error",
                    "message": "Akses ditolak (admin only)"
                }), 403

            # Lolos semua validasi
            return fn(*args, **kwargs)

        except Exception as e:
            current_app.logger.error(f"[ADMIN_REQUIRED] Error: {e}")
            return jsonify({
                "status": "error",
                "message": "Terjadi kesalahan otorisasi"
            }), 500

    return wrapper
