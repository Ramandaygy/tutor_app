from flask import jsonify, current_app
from auth.blacklist import is_token_blacklisted
from models.user import User
from bson import ObjectId

def register_jwt_handlers(jwt, app):
    """Register semua JWT event handlers untuk error handling dan security"""
    
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        return is_token_blacklisted(jti)
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        current_app.logger.warning(
            f"Expired token access attempt: {jwt_payload.get('sub', 'unknown')}"
        )
        return jsonify({
            'error': 'Token expired',
            'message': 'Token telah kedaluwarsa. Silakan login kembali.',
            'code': 'TOKEN_EXPIRED'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        current_app.logger.warning(f"Invalid token access attempt: {error}")
        return jsonify({
            'error': 'Invalid token',
            'message': 'Token tidak valid atau rusak.',
            'code': 'INVALID_TOKEN'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'error': 'Authorization required',
            'message': 'Token akses diperlukan. Silakan login terlebih dahulu.',
            'code': 'MISSING_TOKEN'
        }), 401
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        current_app.logger.info(
            f"Revoked token access attempt: {jwt_payload.get('sub', 'unknown')}"
        )
        return jsonify({
            'error': 'Token revoked',
            'message': 'Token telah dicabut. Silakan login kembali.',
            'code': 'TOKEN_REVOKED'
        }), 401
    
    @jwt.needs_fresh_token_loader
    def fresh_token_required_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Fresh token required',
            'message': 'Token segar diperlukan untuk aksi ini. Silakan login ulang.',
            'code': 'FRESH_TOKEN_REQUIRED'
        }), 401
    
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        if hasattr(user, '_id'):
            return str(user._id)
        return str(user)
    
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        try:
            identity = jwt_data['sub']
            return User.get_by_id(identity)   # ✅ pakai Mongo
        except Exception as e:
            current_app.logger.error(f"Error loading user from token: {e}")
            return None
    
    @jwt.additional_claims_loader
    def add_claims_to_access_token(identity):
        try:
            user = User.get_by_id(identity)   # ✅ pakai Mongo
            if user:
                return {
                    'email': user.email,
                    'name': user.name,
                    'kelas': user.kelas,
                    'role': user.role,
                    'is_active': user.is_active,
                    'is_admin': user.role == 'admin'
                }
        except Exception as e:
            current_app.logger.error(f"Error adding claims to token: {e}")
        
        return {}
    
    @jwt.decode_key_loader
    def custom_decode(jwt_header, jwt_payload):
        return current_app.config["JWT_SECRET_KEY"]

    app.logger.info("✅ JWT handlers registered successfully")
