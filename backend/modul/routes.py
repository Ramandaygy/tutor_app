from flask import request, jsonify, current_app
from bson import ObjectId
from extensions import mongo
from . import modul_bp
from .services import create_module_from_pdf

# ================= ADMIN =================
@modul_bp.route("/admin/modules", methods=["GET"])
def admin_get_modules():
    modules = list(mongo.db.modules.find({}, {"content": 0}))
    for m in modules:
        m["_id"] = str(m["_id"])
    return jsonify(modules), 200


@modul_bp.route("/admin/modules/upload", methods=["POST"])
def upload_modul():
    title = request.form.get("title")
    kelas = request.form.get("kelas")
    kategori = request.form.get("kategori")
    deskripsi = request.form.get("deskripsi")
    pdf = request.files.get("pdf")

    if not all([title, kelas, kategori, pdf]):
        return jsonify({"error": "Data tidak lengkap"}), 400

    create_module_from_pdf(
        title=title,
        kelas=kelas,
        kategori=kategori,
        deskripsi=deskripsi,
        pdf_file=pdf,
        upload_folder=current_app.config["UPLOAD_FOLDER"]
    )

    return jsonify({"message": "Modul berhasil diupload"}), 201


@modul_bp.route("/admin/modules/delete/<modul_id>", methods=["DELETE"])
def delete_modul(modul_id):
    mongo.db.modules.delete_one({"_id": ObjectId(modul_id)})
    return jsonify({"message": "Modul dihapus"}), 200


# ================= FRONTEND =================
@modul_bp.route("/modules", methods=["GET"])
def get_modul():
    kelas = request.args.get("kelas")  # bisa 'all' atau angka
    kategori = request.args.get("kategori")

    query = {}
    if kelas and kelas != "all":
        try:
            query["kelas"] = int(kelas)
        except ValueError:
            return jsonify({"error": "Kelas harus berupa angka atau 'all'"}), 400

    if kategori:
        query["kategori"] = kategori

    modules = list(mongo.db.modules.find(query, {"content": 0}))
    for m in modules:
        m["_id"] = str(m["_id"])

    return jsonify(modules), 200


@modul_bp.route("/modules/<modul_id>", methods=["GET"])
def get_modul_detail(modul_id):
    try:
        modul = mongo.db.modules.find_one({"_id": ObjectId(modul_id)})
        if not modul:
            return jsonify({"error": "Modul tidak ditemukan"}), 404

        modul["_id"] = str(modul["_id"])
        return jsonify(modul), 200

    except Exception:
        return jsonify({"error": "ID tidak valid"}), 400

@modul_bp.route("/modules/<modul_id>/bab/<int:bab_index>", methods=["GET"])
def get_bab_detail(modul_id, bab_index):
    modul = mongo.db.modules.find_one({"_id": ObjectId(modul_id)})

    if not modul:
        return jsonify({"error": "Modul tidak ditemukan"}), 404

    content = modul.get("content", [])

    if bab_index < 0 or bab_index >= len(content):
        return jsonify({"error": "Bab tidak ditemukan"}), 404

    return jsonify({
        "modul_id": str(modul["_id"]),
        "title": modul["title"],
        "bab_index": bab_index,
        "bab": content[bab_index]
    }), 200
