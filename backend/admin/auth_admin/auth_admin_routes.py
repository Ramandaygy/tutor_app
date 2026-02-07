from flask import request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token
from admin import admin_bp
from models.user import User


@admin_bp.route("/auth/register", methods=["POST"])
def admin_register():
    """Register akun admin baru"""
    try:
        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not all([name, email, password]):
            return jsonify({
                "status": "error",
                "message": "Semua field wajib diisi"
            }), 400

        if User.get_by_email(email):
            return jsonify({
                "status": "error",
                "message": "Email sudah terdaftar"
            }), 400

        User.create_user(name, email, password, role="admin")

        return jsonify({
            "status": "success",
            "message": "Admin berhasil didaftarkan"
        }), 201

    except Exception as e:
        current_app.logger.error(f"Admin register error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500


@admin_bp.route("/auth/login", methods=["POST"])
def admin_login():
    """Login khusus admin"""
    try:
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        user = User.get_by_email(email)

        if not user or not user.check_password(password):
            return jsonify({
                "status": "error",
                "message": "Email atau password salah"
            }), 401

        if user.role != "admin":
            return jsonify({
                "status": "error",
                "message": "Hanya admin yang bisa login"
            }), 403

        access_token = create_access_token(
            identity=str(user._id),
            additional_claims={"role": "admin"}
        )

        refresh_token = create_refresh_token(
            identity=str(user._id)
        )

        return jsonify({
            "status": "success",
            "access_token": access_token,
            "refresh_token": refresh_token
        }), 200

    except Exception as e:
        current_app.logger.error(f"Admin login error: {e}")
        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan server"
        }), 500
