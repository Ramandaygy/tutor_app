from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, 
    jwt_required, 
    get_jwt_identity, 
    get_jwt
)
from auth.validators import validate_email, validate_password, validate_name
from auth.blacklist import add_token_to_blacklist
from datetime import datetime
import traceback
from models.user import User

# Create blueprint
auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    """Endpoint untuk registrasi user baru"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Data tidak ditemukan"}), 400

        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        kelas = data.get("kelas")

        if not all ([name, email, password, kelas]):
            return jsonify({"error": "Semua field wajib diisi"}), 400

        # Validasi nama
        is_valid_name, name_msg = validate_name(name)
        if not is_valid_name:
            return jsonify({"error": name_msg}), 400

        # Validasi email
        if not validate_email(email):
            return jsonify({"error": "Format email tidak valid"}), 400

        # Validasi password
        is_valid_pw, pw_msg = validate_password(password)
        if not is_valid_pw:
            return jsonify({"error": pw_msg}), 400

        # Cek duplikat
        if User.get_by_email(email):
            return jsonify({"error": "Email sudah terdaftar"}), 409

        # Buat user baru
        user = User.create_user(name, email, password, kelas)

        return jsonify({
            "message": "Registrasi berhasil",
            "user": user.to_dict()
        }), 201

    except Exception as e:
        current_app.logger.error(f"Registration error: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Terjadi kesalahan server"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """Endpoint login"""
    try:
        data = request.get_json()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"error": "Email dan password wajib diisi"}), 400

        user = User.get_by_email(email)
        if not user or not user.check_password(password):
            return jsonify({"error": "Email atau password salah"}), 401

        if not user.is_active:
            return jsonify({"error": "Akun tidak aktif"}), 403

        # Update last login
        user.last_login = datetime.utcnow()
        user.save()

        # Buat token
        token = create_access_token(identity=str(user._id), additional_claims={
            "role": user.role,
            "kelas": user.kelas  # 🔹 simpan kelas di token
        })

        return jsonify({
            "message": f"Selamat datang, {user.name}!",
            "access_token": token,
            "token_type": "Bearer",
            "expires_in": 86400,
            "user": user.to_dict()
        }), 200

    except Exception as e:
        current_app.logger.error(f"Login error: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Terjadi kesalahan server"}), 500

from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh_access_token():
    """Perbarui access_token menggunakan refresh_token"""
    try:
        user_id = get_jwt_identity()
        new_token = create_access_token(identity=user_id)
        return jsonify({"access_token": new_token}), 200
    except Exception as e:
        current_app.logger.error(f"Refresh token error: {e}")
        return jsonify({"error": "Gagal memperbarui token"}), 500

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """Endpoint logout"""
    try:
        token_data = get_jwt()
        jti = token_data["jti"]
        add_token_to_blacklist(jti)

        current_user_id = get_jwt_identity()
        current_app.logger.info(f"User logged out: {current_user_id}")

        return jsonify({
            "message": "Logout berhasil",
            "logged_out_at": datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        current_app.logger.error(f"Logout error: {e}")
        return jsonify({"error": "Logout gagal"}), 500


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """Ambil profil user"""
    try:
        current_user_id = get_jwt_identity()
        user = User.get_by_id(current_user_id)

        if not user:
            return jsonify({"error": "User tidak ditemukan"}), 404

        return jsonify({"user": user.to_dict()}), 200
    except Exception as e:
        current_app.logger.error(f"Get profile error: {e}")
        return jsonify({"error": "Gagal memuat profil"}), 500


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """Update profil"""
    try:
        current_user_id = get_jwt_identity()
        user = User.get_by_id(current_user_id)

        if not user:
            return jsonify({"error": "User tidak ditemukan"}), 404

        data = request.get_json()
        updates = {}

        if "name" in data:
            name = data["name"].strip()
            is_valid, msg = validate_name(name)
            if not is_valid:
                return jsonify({"error": msg}), 400
            updates["name"] = name

        if "email" in data:
            email = data["email"].strip().lower()
            if not validate_email(email):
                return jsonify({"error": "Format email tidak valid"}), 400
            if User.get_by_email(email) and email != user.email:
                return jsonify({"error": "Email sudah digunakan"}), 409
            updates["email"] = email

        if updates:
            for k, v in updates.items():
                setattr(user, k, v)
            user.updated_at = datetime.utcnow()
            user.save()

        return jsonify({
            "message": "Profil berhasil diupdate",
            "user": user.to_dict()
        }), 200

    except Exception as e:
        current_app.logger.error(f"Update profile error: {e}")
        return jsonify({"error": "Gagal update profil"}), 500


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    """Ubah password"""
    try:
        current_user_id = get_jwt_identity()
        user = User.get_by_id(current_user_id)

        if not user:
            return jsonify({"error": "User tidak ditemukan"}), 404

        data = request.get_json()
        current_password = data.get("current_password", "")
        new_password = data.get("new_password", "")
        confirm_password = data.get("confirm_password", "")

        if not user.check_password(current_password):
            return jsonify({"error": "Password lama salah"}), 401

        if new_password != confirm_password:
            return jsonify({"error": "Konfirmasi password tidak sama"}), 400

        is_valid, msg = validate_password(new_password)
        if not is_valid:
            return jsonify({"error": msg}), 400

        user.set_password(new_password)
        user.updated_at = datetime.utcnow()
        user.save()

        return jsonify({"message": "Password berhasil diubah"}), 200
    except Exception as e:
        current_app.logger.error(f"Change password error: {e}")
        return jsonify({"error": "Gagal ubah password"}), 500


@auth_bp.route("/verify-token", methods=["GET"])
@jwt_required()
def verify_token():
    """Cek token valid"""
    try:
        current_user_id = get_jwt_identity()
        user = User.get_by_id(current_user_id)

        if not user or not user.is_active:
            return jsonify({"valid": False}), 401

        return jsonify({"valid": True, "user": user.to_dict()}), 200
    except Exception:
        return jsonify({"valid": False}), 401

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    identity = get_jwt_identity()
    new_token = create_access_token(identity=identity, additional_claims={"role": "admin"})
    return jsonify(access_token=new_token), 200