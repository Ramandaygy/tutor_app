import re
import os
from datetime import datetime
from bson import ObjectId
from extensions import mongo
import pdfplumber   # pip install pdfplumber

# ================= COLLECTION =================

tryout_col = mongo.db.tryout
tryout_pdf_col = mongo.db.tryout_pdf

# =====================================================
# ================= PDF TEXT EXTRACT ==================
# =====================================================

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Ambil seluruh text dari PDF
    """
    full_text = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text.append(text)

    return "\n".join(full_text)


# =====================================================
# ================= NORMALIZE TEXT ====================
# =====================================================

def normalize_text(text: str) -> str:
    """
    Rapikan format text PDF
    """
    text = text.replace("\r", "\n")
    text = re.sub(r"\n{2,}", "\n", text)      # hapus newline berlebih
    text = re.sub(r"[ \t]+", " ", text)      # hapus spasi ganda
    text = re.sub(r"\n\s+", "\n", text)      # newline + spasi
    return text.strip()


# =====================================================
# ================= QUESTION SPLITTER =================
# =====================================================

def split_questions(text: str):
    """
    Deteksi pemisah soal berdasarkan pola:
    1.
    1)
    Soal 1:
    """

    patterns = [
        r"\n\d+\.\s",           # 1.
        r"\n\d+\)\s",           # 1)
        r"\nSoal\s+\d+\s*[:.]"  # Soal 1:
    ]

    regex = "|".join(patterns)

    # prepend newline supaya soal pertama ikut kebaca
    parts = re.split(regex, "\n" + text)

    blocks = [p.strip() for p in parts if p.strip()]
    return blocks


# =====================================================
# ================= MC PARSER =========================
# =====================================================

def parse_multiple_choice(block: str):
    """
    Deteksi pilihan ganda:
    A. ...
    B. ...
    C. ...
    D. ...
    """

    option_pattern = r"\n([A-D])[\.\)]\s+"

    splits = re.split(option_pattern, block)

    # format splits:
    # [question, 'A', optA, 'B', optB, 'C', optC, 'D', optD]
    if len(splits) < 9:
        return None  # bukan pilihan ganda valid

    question_text = splits[0].strip()
    options = []

    for i in range(1, len(splits), 2):
        opt_text = splits[i + 1].strip()
        opt_text = opt_text.split("\n")[0]  # potong jika kepanjangan
        options.append(opt_text)

    if len(options) < 4:
        return None

    return {
        "type": "multiple_choice",
        "question": question_text,
        "options": options,
        "answer": None,        # jawaban tidak ada di PDF
        "answer_desc": None,
        "keywords": []
    }


# =====================================================
# ================= ESSAY PARSER ======================
# =====================================================

def parse_essay(block: str):
    """
    Jika tidak ada opsi A-D → dianggap essay
    """
    return {
        "type": "essay",
        "question": block.strip(),
        "options": [],
        "answer": None,
        "answer_desc": None,
        "keywords": []
    }


# =====================================================
# ================= MAIN PARSER =======================
# =====================================================

def parse_pdf_to_questions(pdf_path: str, category: str = "Umum"):
    """
    PDF → soal satuan → simpan ke DB
    """

    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    raw_text = extract_text_from_pdf(pdf_path)
    clean_text = normalize_text(raw_text)

    blocks = split_questions(clean_text)

    saved_questions = []

    for block in blocks:
        # coba parse pilihan ganda
        mc = parse_multiple_choice(block)

        if mc:
            doc = {
                **mc,
                "category": category,
                "image_url": None,
                "created_at": datetime.utcnow(),
                "updated_at": None,
                "source": "pdf"
            }
        else:
            es = parse_essay(block)
            doc = {
                **es,
                "category": category,
                "image_url": None,
                "created_at": datetime.utcnow(),
                "updated_at": None,
                "source": "pdf"
            }

        tryout_col.insert_one(doc)
        saved_questions.append(doc)

    return saved_questions


# =====================================================
# ================= PDF PROCESSOR =====================
# =====================================================

def process_uploaded_pdf(pdf_doc_id: str, upload_folder="uploads/tryout_pdf"):
    """
    Ambil PDF dari DB → parsing → simpan soal → update processed
    """

    pdf_doc = tryout_pdf_col.find_one({"_id": ObjectId(pdf_doc_id)})

    if not pdf_doc:
        raise Exception("PDF document not found")

    if pdf_doc.get("processed") is True:
        return {
            "status": "skipped",
            "message": "PDF sudah diproses sebelumnya",
            "total_questions": pdf_doc.get("total_questions", 0)
        }

    filename = pdf_doc["filename"]
    category = pdf_doc.get("category", "Umum")
    pdf_path = os.path.join(upload_folder, filename)

    questions = parse_pdf_to_questions(pdf_path, category)

    # tandai PDF sudah diproses
    tryout_pdf_col.update_one(
        {"_id": ObjectId(pdf_doc_id)},
        {"$set": {
            "processed": True,
            "processed_at": datetime.utcnow(),
            "total_questions": len(questions)
        }}
    )

    return {
        "status": "success",
        "pdf_id": str(pdf_doc_id),
        "total_questions": len(questions)
    }
