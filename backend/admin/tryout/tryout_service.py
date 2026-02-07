from datetime import datetime
from bson import ObjectId
from extensions import mongo

# parser PDF
from  .pdf_parsing import parse_pdf_to_questions

tryout_col = mongo.db.tryout
tryout_pdf_col = mongo.db.tryout_pdf


# =====================================================
# ================== CREATE QUESTION ==================
# =====================================================

def create_tryout_question(data: dict):
    payload = {
        **data,
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    tryout_col.insert_one(payload)
    return payload


# =====================================================
# ================== UPLOAD PDF =======================
# =====================================================

def upload_tryout_pdf(filename: str, category: str):
    doc = {
        "filename": filename,
        "category": category,
        "file_url": f"/uploads/tryout_pdf/{filename}",
        "processed": False,   # PDF belum diproses
        "created_at": datetime.utcnow()
    }
    tryout_pdf_col.insert_one(doc)
    return doc


# =====================================================
# ================= PROCESS PDF =======================
# =====================================================

def process_tryout_pdf(pdf_id: str, file_path: str, category: str = "Umum"):
    """
    PDF → parsing → soal satuan → simpan ke tryout
    Dipanggil dari tryout_routes
    """

    pdf_doc = tryout_pdf_col.find_one({"_id": ObjectId(pdf_id)})

    if not pdf_doc:
        raise Exception("PDF tidak ditemukan")

    if pdf_doc.get("processed") is True:
        return 0  # sudah pernah diproses

    # ===============================
    # PARSE PDF → QUESTIONS
    # ===============================
    total_questions = parse_pdf_to_questions(
        pdf_path=file_path,
        category=category
    )

    # ===============================
    # UPDATE STATUS PDF
    # ===============================
    tryout_pdf_col.update_one(
        {"_id": ObjectId(pdf_id)},
        {"$set": {
            "processed": True,
            "processed_at": datetime.utcnow(),
            "total_questions": total_questions
        }}
    )

    return total_questions


# =====================================================
# ================= GET QUESTIONS =====================
# =====================================================

def get_all_tryout_questions():
    questions = list(
        tryout_col.find({}, {
            "_id": 1,
            "type": 1,
            "question": 1,
            "options": 1,
            "answer": 1,
            "answer_desc": 1,
            "keywords": 1,
            "image_url": 1,
            "category": 1,
            "created_at": 1
        })
    )

    result = []

    for q in questions:
        q["_id"] = str(q["_id"])

        # fallback data lama
        if "type" not in q:
            if "options" in q:
                q["type"] = "multiple_choice"
            else:
                q["type"] = "essay"

        result.append(q)

    return result
