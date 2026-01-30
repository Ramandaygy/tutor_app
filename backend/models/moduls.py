from datetime import datetime

def module_schema(
    title, kelas, kategori, deskripsi, content, source_pdf
):
    return {
        "title": title,
        "kelas": kelas,
        "kategori": kategori,
        "deskripsi": deskripsi,
        "content": content,
        "source_pdf": source_pdf,
        "created_at": datetime.utcnow()
    }
