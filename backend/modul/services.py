import os
from werkzeug.utils import secure_filename
from extensions import mongo
from models.moduls import module_schema
from .pdf_parser import parse_module_pdf


def create_module_from_pdf(title, kelas, kategori, deskripsi, pdf_file, upload_folder):
    os.makedirs(upload_folder, exist_ok=True)

    filename = secure_filename(pdf_file.filename)
    file_path = os.path.join(upload_folder, filename)
    pdf_file.save(file_path)

    # ✅ LANGSUNG DAPAT 1 RINGKASAN MODUL
    lessons = parse_module_pdf(file_path)

    modul_data = module_schema(
        title=title,
        kelas=int(kelas),
        kategori=kategori,
        deskripsi=deskripsi,
        content=lessons,
        source_pdf=filename
    )

    mongo.db.modules.insert_one(modul_data)
    return modul_data
