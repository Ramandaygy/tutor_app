from datetime import datetime
from bson import ObjectId
from extensions import mongo

class Activity:
    def __init__(self, user_id, action, description, timestamp=None, _id=None):
        self._id = ObjectId(_id) if _id else ObjectId()
        self.user_id = str(user_id)
        self.action = action
        self.description = description
        self.timestamp = timestamp or datetime.utcnow()

    def to_dict(self):
        return {
            "_id": str(self._id),
            "user_id": self.user_id,
            "action": self.action,
            "description": self.description,
            "timestamp": self.timestamp.isoformat(),
        }

    def save(self):
        data = {
            "_id": self._id,
            "user_id": self.user_id,
            "action": self.action,
            "description": self.description,
            "timestamp": self.timestamp,
        }
        mongo.db.activities.update_one({"_id": self._id}, {"$set": data}, upsert=True)
        return self

    # --- class methods ---
    @classmethod
    def collection(cls):
        return mongo.db.activities

    @classmethod
    def log(cls, user_id, action, description):
        """Utility buat nyimpan aktivitas"""
        act = cls(user_id=user_id, action=action, description=description)
        act.save()
        return act
