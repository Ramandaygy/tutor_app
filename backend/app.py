from flask import Flask, jsonify, request, session
from extensions import mongo
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
import logging
import os
import json
from dotenv import load_dotenv
from bson.objectid import ObjectId
from flask import send_from_directory



# Load environment variables
load_dotenv()

# Initialize extensions
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # -----------------------------
    # 🔧 Basic Configuration
    # -----------------------------
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'tutor-secret-key-change-this')

    # MongoDB Configuration
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/tutor_app')
    app.config['MONGO_URI'] = mongodb_uri

    # JWT configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-change-this')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)
    
    # -----------------------------
    # 🔗 Initialize Extensions
    # -----------------------------
    mongo.init_app(app)
    jwt.init_app(app)
    
    # -----------------------------
    # 🌐 CORS Configuration
    # -----------------------------
    frontend_user_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    frontend_admin_url = os.getenv('FRONTEND_ADMIN_URL', 'http://localhost:3001')

    CORS(app, resources={
        r"/*": {"origins": [frontend_user_url, frontend_admin_url]},
    }, supports_credentials=True)

    # -----------------------------
    # 🧠 Bedakan session cookie
    # -----------------------------
    @app.before_request
    def differentiate_sessions():
        if "/admin" in request.path:
            app.config["SESSION_COOKIE_NAME"] = "admin_session"
        else:
            app.config["SESSION_COOKIE_NAME"] = "user_session"
    
    # -----------------------------
    # 🪵 Logging Setup
    # -----------------------------
    logging.basicConfig(level=logging.INFO)
    app.logger.info('🚀 Initializing Tutor Belajar Pribadi API...')
    
    # -----------------------------
    # 🔐 JWT Handlers
    # -----------------------------
    from auth.jwt_handlers import register_jwt_handlers
    register_jwt_handlers(jwt, app)
    
    # -----------------------------
    # 📦 Register Blueprints
    # -----------------------------
    from auth.routes import auth_bp
    from admin.routes import admin_bp
    from chatbot.routes import chatbot_bp
    
    app.register_blueprint(chatbot_bp, url_prefix="/chatbot")
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    
    # -----------------------------
    # 🏠 Default Route
    # -----------------------------
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Tutor Belajar Pribadi API',
            'version': '1.0',
            'status': 'running',
            'database': 'MongoDB',
            'endpoints': {
                'register': 'POST /auth/register',
                'login': 'POST /auth/login',
                'logout': 'POST /auth/logout',
                'profile': 'GET /auth/profile',
                'test_db': 'GET /api/test-db',
                'get_soal': 'GET /api/soal',
                'admin_users': 'GET /admin/users'
            }
        })

    # -----------------------------
    # 📘 Route Soal Tryout (JSON)
    # -----------------------------
    @app.route('/api/soal', methods=['GET'])
    def get_all_soal():
        try:
            with open('soal_sd.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
            return jsonify(data),200
        except Exception as e:
            return jsonify({'error': str(e)}), 500


    # ----------------- PUBLIC ARTICLE ROUTES ----------------#

    @app.route("/articles", methods=["GET"])
    def public_articles():
        articles = list(mongo.db.articles.find({}, {
            "_id": 1,
            "title": 1,
            "content": 1,
            "thumbnail_url": 1,
            "created_at": 1
        }))

        for a in articles:
            a["_id"] = str(a["_id"])

        return jsonify({"articles": articles})


    @app.route("/articles/<article_id>", methods=["GET"])
    def public_article_detail(article_id):
        article = mongo.db.articles.find_one(
            {"_id": ObjectId(article_id)},
            {"_id": 0}
        )

        if not article:
            return jsonify({"error": "Artikel tidak ditemukan"}), 404

        return jsonify(article)

    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
        return send_from_directory(upload_dir, filename)


    # -----------------------------
    # 🔍 Test Koneksi Database
    # -----------------------------
    @app.route('/api/test-db')
    def test_db():
        try:
            from models.user import User
            mongo.db.command('ping')
            user_count = User.count()
            db_stats = mongo.db.command('dbstats')

            return jsonify({
                'status': 'success',
                'message': 'Database connection successful',
                'database': 'MongoDB',
                'total_users': user_count,
                'database_name': mongo.db.name,
                'collections': mongo.db.list_collection_names(),
                'db_size_mb': round(db_stats.get('dataSize', 0) / 1024 / 1024, 2)
            })
        except Exception as e:
            app.logger.error(f'MongoDB connection error: {str(e)}')
            return jsonify({'status': 'error','message': f'Database connection failed: {str(e)}'}), 500

    # -----------------------------
    # 🧱 Inisialisasi Database
    # -----------------------------
    @app.route('/api/db-init')
    def init_database():
        try:
            from models.user import User
            User.create_indexes()
            
            admin_email = 'admin@tutorbelajar.com'
            admin = User.get_by_email(admin_email)
            
            if not admin:
                admin_user = User.create_user(
                    name='Administrator',
                    email=admin_email,
                    password='admin123',
                    role='admin'
                )
                admin_user.save()
                app.logger.info(f"✅ Default admin created: {admin_email} / admin123")
            
            user_count = User.count()
            return jsonify({
                'message': 'Database initialized successfully',
                'admin_created': admin is None,
                'total_users': user_count,
                'admin_email': admin_email
            })
        except Exception as e:
            app.logger.error(f'Database initialization error: {str(e)}')
            return jsonify({'error': f'Database initialization failed: {str(e)}'}), 500

    # -----------------------------
    # ❌ Error Handlers
    # -----------------------------
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint tidak ditemukan'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Terjadi kesalahan server'}), 500

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Request tidak valid'}), 400
    
    # -----------------------------
    # 🧩 Test MongoDB Connection
    # -----------------------------
    with app.app_context():
        try:
            mongo.db.command('ping')
            app.logger.info("✅ MongoDB connection established")
        except Exception as e:
            app.logger.error(f"❌ MongoDB connection failed: {str(e)}")
    
    return app


# -----------------------------
# 🚀 Run the App
# -----------------------------
if __name__ == '__main__':
    app = create_app()
    print("🚀 Starting Tutor Belajar Pribadi API...")
    print("🌐 Frontend User URL: http://localhost:3000")
    print("🌐 Frontend Admin URL: http://localhost:3001")
    print("🔧 Backend URL: http://localhost:5000")
    print("📖 API Docs: http://localhost:5000/")

    app.run(debug=True, host='0.0.0.0', port=5000)
