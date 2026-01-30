from flask import Blueprint

modul_bp = Blueprint("modul", __name__)

from . import routes
