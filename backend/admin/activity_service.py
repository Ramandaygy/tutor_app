from extensions import mongo
from datetime import datetime

activity_col = mongo.db.activity_logs

def log_activity(user_id: str, action: str, detail: dict):
    activity = {
        "user_id": str(user_id),
        "action": action,
        "detail": detail,
        "timestamp": datetime.utcnow()
    }
    activity_col.insert_one(activity)
    return activity

def get_user_activity(user_id: str, limit: int = 50):
    return list(activity_col.find(
        {"user_id": str(user_id)},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit))

def get_all_activity(limit: int = 100):
    return list(activity_col.find(
        {},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit))
