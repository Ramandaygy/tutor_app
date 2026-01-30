from datetime import datetime
from extensions import mongo

def save_tryout_pdf(filename, category):
    data = {
        "filename": filename,
        "category": category,
        "created_at": datetime.utcnow()
    }
    mongo.db.tryout_pdf.insert_one(data)
    return data
