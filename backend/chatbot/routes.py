import base64
import os
import re
import uuid
from bson import ObjectId
from flask import Blueprint, json, request, jsonify
from extensions import mongo
from datetime import datetime, timedelta
from admin.progress_service import recalc_progress
from .service import ask_chatbot

chatbot_bp = Blueprint("chatbot", __name__)
ALLOWED_THEMES = ["literasi", "numerik", "sains"]

# ------------------ Fungsi bantu: update streak ------------------
def update_streak(user_id: ObjectId):
    """
    Update jumlah hari belajar berurutan (streak_days)
    setiap kali user berinteraksi / menjawab soal.
    """
    try:
        progress_col = mongo.db.progress
        today = datetime.now().date()

        progress = progress_col.find_one({"_id": ObjectId(user_id)})

        if not progress:
            # jika belum ada progress, buat baru
            new_data = {
                "_id": ObjectId(user_id),
                "literasi": 0,
                "numerik": 0,
                "sains": 0,
                "rating": 0,
                "rating_count": 0,
                "total_lessons": 0,
                "streak_days": 1,
                "last_activity_date": today.isoformat()
            }
            progress_col.insert_one(new_data)
            return

        last_activity = progress.get("last_activity_date")
        streak = progress.get("streak_days", 0)

        if last_activity:
            last_date = datetime.strptime(last_activity, "%Y-%m-%d").date()
            delta = (today - last_date).days

            if delta == 1:
                streak += 1  # belajar berturut-turut
            elif delta > 1:
                streak = 1  # reset streak karena bolong
            else:
                streak = streak  # masih di hari yang sama
        else:
            streak = 1

        progress_col.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "streak_days": streak,
                    "last_activity_date": today.isoformat()
                }
            },
        )

    except Exception as e:
        print("❌ update_streak error:", e)

# ------------------ Chat umum ------------------
@chatbot_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message", "")
    user_id = data.get("user_id")

    if not message:
        return jsonify({"error": "Message is required"}), 400

    answer = ask_chatbot(message)

    if user_id:
        update_streak(user_id)

    return jsonify({"answer": answer})

# ------------------ Ambil Soal ------------------
@chatbot_bp.route("/get_question", methods=["GET"])
def get_question():
    """Ambil soal dari LLM berdasarkan tema dan kelas user"""
    theme = request.args.get("theme")
    user_id = request.args.get("user_id")

    if not theme or not user_id:
        return jsonify({"error": "theme dan user_id wajib dikirim"}), 400

    # 🔹 Ambil data user dari database
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"kelas": 1, "name": 1})
    kelas = user.get("kelas", "tidak diketahui") if user else "tidak diketahui"

    prompt = (
        f"Buatkan 1 soal {theme} untuk siswa kelas {kelas} SD dalam format JSON murni. "
        f"Gunakan bahasa anak-anak dan tingkat kesulitan yang sesuai dengan anak SD kelas {kelas}. "
        f"Gunakan field: pertanyaan (string), opsi (list berisi 4 string), "
        f"jawaban (string), dan penjelasan (string). "
        f"Pastikan soal sesuai tingkat kesulitan kelas {kelas} dan anak SD. "
        f"JANGAN tambahkan teks lain di luar JSON!"
    )

    soal_text = ask_chatbot(prompt)

    match = re.search(r"\{.*\}", soal_text, re.DOTALL)
    soal_json_str = match.group(0) if match else "{}"

    try:
        soal_dict = json.loads(soal_json_str)
    except Exception:
        soal_dict = {
            "pertanyaan": soal_text,
            "opsi": ["A", "B", "C", "D"],
            "jawaban": "A",
            "penjelasan": "Model belum memberikan format JSON yang sesuai."
        }

    soal_dict["id"] = str(uuid.uuid4())
    soal_dict["theme"] = theme
    soal_dict["kelas"] = kelas

    # 🔹 Cegah duplikasi soal yang sudah dijawab user
    sudah_dijawab = mongo.db.activity_logs.distinct("soal_id", {"user_id": str(user_id), "theme": theme})
    if soal_dict["id"] in sudah_dijawab:
        return jsonify({"message": "Semua soal sudah dijawab"}), 204

    #simpan ke DB
    mongo.db.questions.insert_one(soal_dict)

    #data dikirim ke fe 
    soal_for_frontend = {
        "id": soal_dict["id"],
        "theme": soal_dict["theme"],
        "pertanyaan": soal_dict["pertanyaan"],
        "opsi": soal_dict["opsi"]
    }

    return jsonify(soal_for_frontend)

# ------------------ Simpan Jawaban Soal ------------------
@chatbot_bp.route("/answer", methods=["POST"])
def save_answer():
    data = request.json
    user_id = data.get("user_id")
    theme = data.get("theme")
    soal_id = data.get("soal_id")
    jawaban_user = data.get("jawaban")

    if not user_id or not theme or not soal_id or not jawaban_user:
        return jsonify({"error": "Data tidak lengkap"}), 400

    soal = mongo.db.questions.find_one({"id": soal_id}, {"_id": 0})
    if not soal:
        return jsonify({"error": "Soal tidak ditemukan"}), 404

    opsi = soal.get("opsi", [])
    jawaban_benar = soal.get("jawaban")

    if isinstance(jawaban_benar, int):
        jawaban_benar_text = opsi[jawaban_benar] if 0 <= jawaban_benar < len(opsi) else None
    else:
        jawaban_benar_text = str(jawaban_benar).strip()

    if not jawaban_benar_text:
        return jsonify({"error": "Format jawaban di soal tidak valid"}), 500

    benar = jawaban_user.strip().lower() == jawaban_benar_text.lower()
    score = 1 if benar else 0

    mongo.db.activity_logs.insert_one({
        "user_id": str(user_id),
        "theme": theme,
        "soal_id": soal_id,
        "pertanyaan": soal.get("pertanyaan", "-"),  
        "penjelasan": soal.get("penjelasan", "-"),
        "jawaban_user": jawaban_user,
        "jawaban_benar": jawaban_benar_text,
        "benar": benar,
        "score": score,
        "created_at": datetime.utcnow()
    })

    # update progres belajar & streak
    progress = recalc_progress(user_id)
    update_streak(user_id)

    return jsonify({
        "message": "Jawaban diproses",
        "benar": benar,
        "jawaban_benar": jawaban_benar_text,
        "penjelasan": soal.get("penjelasan", ""),
        "progress": progress
    })

# ------------------ Feedback ------------------
@chatbot_bp.route("/feedback", methods=["POST"])
def chatbot_feedback():
    data = request.get_json()
    user_id = data.get("user_id")
    theme = data.get("theme", "umum")
    rating = data.get("rating")  # dari 1–5
    message = data.get("message")

    if not user_id or rating is None:
        return jsonify({"error": "user_id dan rating wajib dikirim"}), 400

    # Simpan feedback ke MongoDB
    mongo.db.activity_logs.insert_one({
        "user_id": user_id,
        "theme": theme,
        "feedback": f"rating_{rating}",
        "message": message,
        "rating": rating,
        "created_at": datetime.utcnow()
    })

    # Optional: update nilai rata-rata user (kalau kamu punya sistem poin)
    from admin.progress_service import update_feedback_score
    new_rating = update_feedback_score(user_id, rating)

    return jsonify({"message": "Feedback tersimpan", "new_rating": new_rating})

# ------------------ Analisis Gambar ------------------
@chatbot_bp.route("/analyze_image", methods=["POST"])
def analyze_image():
    try:
        data = request.get_json()
        image_base64 = data.get("image")

        if not image_base64:
            return jsonify({"error": "Tidak ada gambar dikirim"}), 400

        image_data = image_base64.split(",")[1]
        image_bytes = base64.b64decode(image_data)

        os.makedirs("temp", exist_ok=True)
        img_path = os.path.join("temp", f"image_{uuid.uuid4().hex}.png")

        with open(img_path, "wb") as f:
            f.write(image_bytes)

        import pytesseract
        from PIL import Image
        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

        text = pytesseract.image_to_string(Image.open(img_path))
        if os.path.exists(img_path):
            os.remove(img_path)

        if not text.strip():
            return jsonify({"answer": "Gambar tidak memiliki teks yang bisa dibaca."})

        prompt = f"Analisis teks berikut dari gambar dan berikan jawaban singkat untuk anak SD:\n\n{text}"
        answer = ask_chatbot(prompt)

        return jsonify({"answer": answer})

    except Exception as e:
        print("❌ Error analisis gambar:", e)
        return jsonify({"answer": "Gagal menganalisis gambar."}), 500

# ------------------ Riwayat Progress ------------------
@chatbot_bp.route("/progress/history", methods=["GET"])
def get_progress_history():
    user_id = request.args.get("user_id")
    theme = request.args.get("theme")

    if not user_id:
        return jsonify({"error": "user_id wajib dikirim"}), 400

    query = {"user_id": str(user_id)}
    if theme:
        query["theme"] = theme

    logs = list(
        mongo.db.activity_logs.find(query, {"_id": 0})
        .sort("created_at", -1)
        .limit(10)
    )

    # agar date di progress masing-masing theme tersimpan
    for log in logs:
        if isinstance(log.get("created_at"), datetime):
            log["created_at"] = log["created_at"].isoformat()
            
    return jsonify(logs)

# Simpan riwayat
@chatbot_bp.route('/save_history', methods=['POST'])
def save_history():
    data = request.json
    user_id = data.get("user_id")
    theme = data.get("theme")
    messages = data.get("messages")  # list of {role, content}

    if not user_id or not theme or not messages:
        return jsonify({"error": "Data tidak lengkap"}), 400

    mongo.db.chat_history.update_one(
        {"user_id": user_id, "theme": theme},
        {"$set": {"messages": messages}},
        upsert=True
    )
    return jsonify({"message": "Riwayat tersimpan"}), 200


# Ambil riwayat
@chatbot_bp.route('/get_history', methods=['GET'])
def get_history():
    user_id = request.args.get("user_id")
    theme = request.args.get("theme")

    history = mongo.db.chat_history.find_one({"user_id": user_id, "theme": theme})
    if not history:
        return jsonify({"messages": []})

    return jsonify({"messages": history.get("messages", [])})
