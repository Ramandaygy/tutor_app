import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { uploadModule } from "../../services/Api";
import { useNavigate } from "react-router-dom";

export default function ModuleUpload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [kelas, setKelas] = useState("");
  const [mapel, setMapel] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    if (!file || !title || !kelas || !mapel) {
      alert("Semua field wajib diisi!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("pdf", file); // sesuaikan key dengan backend
      formData.append("title", title);
      formData.append("kelas", kelas);
      formData.append("kategori", mapel);

      await uploadModule(formData);
      alert("Modul berhasil diupload!");
      navigate("/modules/list"); // kembali ke list modul
    } catch (err) {
      console.error("Upload modul gagal:", err);
      alert("Upload modul gagal, cek console.");
    }
  };

  return (
    <div className="page-container">
      <Sidebar active="modules-upload" />

      <div className="page-content">
        <h2>Upload Modul Baru</h2>

        <form className="admin-form" onSubmit={submit}>
          <label>
            Judul Modul
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul modul"
            />
          </label>

          <label>
            Kelas
            <input
              type="text"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              placeholder="Masukkan kelas (contoh: 7)"
            />
          </label>

          <label>
            Mata Pelajaran
            <input
              type="text"
              value={mapel}
              onChange={(e) => setMapel(e.target.value)}
              placeholder="Masukkan mata pelajaran (contoh: IPA)"
            />
          </label>

          <label>
            Upload PDF
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          <button type="submit" className="add-btn">
            Upload Modul
          </button>
        </form>
      </div>
    </div>
  );
}
