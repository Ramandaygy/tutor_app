from flask import Blueprint

admin_bp = Blueprint("admin", __name__)

# import semua routes agar ter-register
from . import routes
from .activity import activity_routes
from .articles import articles_routes
from .auth_admin import auth_admin_routes
from .progress import progress_routes
from .tryout import tryout_routes
from .users import users_routes
