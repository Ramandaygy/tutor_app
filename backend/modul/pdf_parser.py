import pdfplumber
import re
import os
from groq import Groq

# =========================
# GROQ CLIENT
# =========================
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# =========================
# 1. EXTRACT TEXT
# =========================
def extract_pdf_text(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


# =========================
# 2. CLEAN TEXT
# =========================
def clean_text(text):
    text = re.sub(r"\n\d+\n", "\n", text)
    text = re.sub(r"\n[ivxlcdm]+\n", "\n", text, flags=re.IGNORECASE)

    text = re.sub(
        r"(Kata Pengantar|Prakata|Daftar Isi|Daftar Gambar|Daftar Tabel).*?(BAB|Tema|Unit)",
        r"\2",
        text,
        flags=re.IGNORECASE | re.DOTALL
    )

    text = re.sub(r"\n{2,}", "\n\n", text)
    return text.strip()


# =========================
# 3. AI SUMMARIZER (GROQ)
# =========================
def ai_summarize_module(text):
    prompt = f"""
    Kamu adalah guru SD profesional.

    Tugas kamu adalah MERANGKUM isi modul pelajaran SD
    menjadi satu paragraf panjang yang:
    - mudah dipahami siswa kelas 4–6
    - menggunakan bahasa sederhana
    - tidak menyebut penulis, editor, atau hak cipta
    - fokus pada inti pembelajaran dan manfaatnya

    Teks Modul:
    {text[:5000]}
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",  # ✅ MODEL AKTIF
        messages=[
            {
                "role": "system",
                "content": "Kamu adalah guru SD yang ramah, jelas, dan menggunakan bahasa sederhana."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.4,
        max_tokens=500
    )


    return response.choices[0].message.content.strip()


# =========================
# 4. FORMAT HTML
# =========================
def format_to_html(text):
    paragraphs = text.split("\n")
    html = ""
    for p in paragraphs:
        p = p.strip()
        if p:
            html += f"<p>{p}</p>"
    return f"<div class='lesson-reader'>{html}</div>"


# =========================
# 5. MAIN PIPELINE
# =========================
def parse_module_pdf(pdf_path):
    raw_text = extract_pdf_text(pdf_path)
    clean = clean_text(raw_text)

    summary = ai_summarize_module(clean)
    html = format_to_html(summary)

    return [{
        "title": "Ringkasan Modul",
        "content": html
    }]
