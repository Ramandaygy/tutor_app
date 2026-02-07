from . import admin_bp
from flask import jsonify

@admin_bp.route("/test", methods=["GET"])
def admin_test():
    return jsonify({"status": "admin root aktif"})
