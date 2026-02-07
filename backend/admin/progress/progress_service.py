from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
import os
from ..activity.activity_service import activity_col

# --- Setup koneksi MongoDB ---
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client["tutor_app"]
progress_col = db["progress"]

# ------------------ Fungsi Progress User ------------------ #
def get_user_progress(user_id: str):
    """Ambil progress 1 user. Jika belum ada, buat default."""
    progress = progress_col.find_one({"_id":ObjectId(user_id) }, {"_id": 0})
    if not progress:
        progress = {
            "_id": ObjectId(user_id),
            "literasi": 0,
            "numerik": 0,
            "sains": 0,
            "rating": 0,
            "total_lessons": 0,
            "streak_days": 0
        }
        progress_col.insert_one(progress)
    return progress


def update_user_progress(user_id: str, data: dict):
    """Update progress user (dipakai oleh user sendiri)."""
    progress_col.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": data},
        upsert=True
    )
    return get_user_progress(user_id)

# ------------------ Fungsi untuk Admin ------------------ #
def get_all_progress():
    """Ambil progress semua user (rekap untuk Admin Dashboard)."""
    progresses = list(progress_col.find({}, {"_id": 0}))
    return progresses


def admin_update_progress(user_id: str, data: dict):
    """Admin update progress user tertentu secara manual."""
    allowed_fields = {"literasi", "numerik", "sains", "rating", "total_lessons", "streak_days"}
    update_data = {k: v for k, v in data.items() if k in allowed_fields}

    progress_col.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data},
        upsert=True
    )
    return get_user_progress(user_id)


def get_progress_stats():
    """Hitung statistik global progress semua user."""
    pipeline = [
        {"$group": {
            "_id": None,
            "avg_literasi": {"$avg": "$literasi"},
            "avg_numerik": {"$avg": "$numerik"},
            "avg_sains": {"$avg": "$sains"},
            "total_users": {"$sum": 1}
        }}
    ]
    stats = list(progress_col.aggregate(pipeline))
    return stats[0] if stats else {}


def recalc_progress(user_id: str):
    """Hitung ulang progress user dari semua activity_logs"""
    logs = list(activity_col.find({"user_id": str(user_id)}, {"_id": 0}))

    # progress default (tidak ada _id)
    progress = {
        "user_id": str(user_id),
        "literasi": 0,
        "numerik": 0,
        "sains": 0,
        "rating": 0,
        "total_lessons": len(logs),
        "streak_days": 0
    }

    if not logs:
        # buat baru kalau belum ada
        progress_col.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": progress},
            upsert=True
        )
        return progress

    # hanya hitung kategori valid
    valid_themes = {"literasi", "numerik", "sains"}

    for log in logs:
        theme = log.get("theme")
        score = int(log.get("score", 0))
        if theme in valid_themes:
            progress[theme] += score

    # pastikan _id tidak ikut di-set
    update_data = {k: v for k, v in progress.items() if k != "_id"}

    # simpan ke collection progress
    progress_col.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data},
        upsert=True
    )

    return progress


def update_feedback_score(user_id: str, new_score: int):
    """
    Update rata-rata rating (1–5) user setiap kali memberi feedback chatbot.
    Disimpan di koleksi `progress`.
    """
    try:
        # ✅ Pastikan user_id valid
        if not ObjectId.is_valid(user_id):
            print("❌ Invalid user_id")
            return None

        # 🔹 Cari berdasarkan user_id (bukan _id dokumen)
        progress = progress_col.find_one({"user_id": user_id})

        if not progress:
            # Jika belum ada progress, buat baru
            progress = {
                "user_id": user_id,
                "literasi": 0,
                "numerik": 0,
                "sains": 0,
                "rating": float(new_score),
                "rating_count": 1,
                "total_lessons": 0,
                "streak_days": 0,
                "last_updated": datetime.utcnow(),
            }
            progress_col.insert_one(progress)
            return progress

        # 🔹 Hitung rata-rata rating baru
        old_rating = progress.get("rating", 0.0)
        rating_count = progress.get("rating_count", 0)
        new_avg = ((old_rating * rating_count) + new_score) / (rating_count + 1)

        # 🔹 Update ke database
        progress_col.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "rating": round(new_avg, 2),
                    "last_updated": datetime.utcnow(),
                },
                "$inc": {"rating_count": 1},
            },
        )

        print(f"⭐ Rating baru untuk user {user_id}: {round(new_avg, 2)}")
        return round(new_avg, 2)

    except Exception as e:
        print("❌ update_feedback_score error:", e)
        return None
