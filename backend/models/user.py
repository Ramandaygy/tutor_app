from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from extensions import mongo


class User:
    """User model untuk MongoDB"""

    def __init__(self, name, email, kelas=None, role="student", is_active=True, _id=None,
                 created_at=None, last_login=None, updated_at=None, password_hash=None):
        self._id = ObjectId(_id) if _id else ObjectId()
        self.name = name
        self.email = email.lower()
        self.kelas = kelas
        self.role = role
        self.is_active = is_active
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
        self.last_login = last_login
        self.password_hash = password_hash

    # ---------- Password ----------
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    # ---------- CRUD ----------
    def save(self):
        """Insert atau update user"""
        data = {
            "_id": self._id,
            "name": self.name,
            "email": self.email,
            "kelas": self.kelas,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "updated_at": datetime.utcnow(),
            "last_login": self.last_login,
            "password_hash": self.password_hash,
        }
        mongo.db.users.update_one({"_id": self._id}, {"$set": data}, upsert=True)
        return self

    def delete(self):
        """Hapus user"""
        mongo.db.users.delete_one({"_id": self._id})

    # ---------- Finder ----------
    @classmethod
    def collection(cls):
        return mongo.db.users

    @classmethod
    def create_user(cls, name, email, password, role="student", kelas=None):
        """Buat user baru (admin/student/teacher)"""
        user = cls(name=name.strip(), email=email.strip().lower(), kelas=kelas, role=role)
        user.set_password(password)
        user.save()
        return user

    @classmethod
    def get_by_email(cls, email):
        data = cls.collection().find_one({"email": email.lower()})
        return cls.from_dict(data) if data else None

    @classmethod
    def get_by_id(cls, user_id):
        try:
            data = cls.collection().find_one({"_id": ObjectId(user_id)})
            return cls.from_dict(data) if data else None
        except Exception:
            return None

    @classmethod
    def find_all(cls, query=None):
        """Temukan semua user (mendukung filter)"""
        query = query or {}
        users = list(cls.collection().find(query))
        return [cls.from_dict(u) for u in users]

    @classmethod
    def get_stats(cls):
        """Hitung statistik user"""
        total = cls.collection().count_documents({})
        active = cls.collection().count_documents({"is_active": True})
        inactive = total - active
        by_role = {
            "admin": cls.collection().count_documents({"role": "admin"}),
            "student": cls.collection().count_documents({"role": "student"}),
            "teacher": cls.collection().count_documents({"role": "teacher"}),
        }
        return {
            "total_users": total,
            "active_users": active,
            "inactive_users": inactive,
            "by_role": by_role,
        }

    # ---------- Utils ----------
    @classmethod
    def from_dict(cls, data):
        if not data:
            return None
        return cls(
            _id=data.get("_id"),
            name=data.get("name"),
            email=data.get("email"),
            kelas=data.get("kelas"),
            role=data.get("role", "student"),
            is_active=data.get("is_active", True),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
            last_login=data.get("last_login"),
            password_hash=data.get("password_hash"),
        )

    def to_dict(self):
        return {
            "_id": str(self._id),
            "name": self.name,
            "email": self.email,
            "kelas": self.kelas,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
        }
