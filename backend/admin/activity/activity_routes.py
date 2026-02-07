from flask import request, jsonify, current_app
from admin import admin_bp
from .activity_service import get_all_activity, get_user_activity
from admin.decorators import admin_required

# =====================================================
# ================= ACTIVITY LOG (ADMIN) ==============
# =====================================================

@admin_bp.route("/activity", methods=["GET"])
@admin_required
def admin_get_all_activity():
    """
    Admin ambil semua activity log (global)
    Query param:
    - limit (default: 100)
    """
    try:
        limit = int(request.args.get("limit", 100))

        logs = get_all_activity(limit)

        return jsonify({
            "status": "success",
            "total": len(logs),
            "logs": logs
        }), 200

    except Exception as e:
        current_app.logger.error(f"Admin get all activity error: {e}")
        return jsonify({
            "status": "error",
            "message": "Gagal mengambil activity log"
        }), 500


@admin_bp.route("/activity/<user_id>", methods=["GET"])
@admin_required
def admin_get_user_activity(user_id):
    """
    Admin ambil activity log per user
    Query param:
    - limit (default: 50)
    """
    try:
        limit = int(request.args.get("limit", 50))

        logs = get_user_activity(user_id, limit)

        return jsonify({
            "status": "success",
            "user_id": user_id,
            "total": len(logs),
            "logs": logs
        }), 200

    except Exception as e:
        current_app.logger.error(f"Admin get user activity error: {e}")
        return jsonify({
            "status": "error",
            "message": "Gagal mengambil activity user"
        }), 500
