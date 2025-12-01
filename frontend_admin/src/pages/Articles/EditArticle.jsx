import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/Api";
import { useParams, useNavigate } from "react-router-dom";

const EditArticle = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Edukasi");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [oldThumbnail, setOldThumbnail] = useState("");

  // Ambil detail artikel
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/admin/articles/${articleId}`);

        const a = res.data;
        setTitle(a.title || "");
        setCategory(a.category || "Edukasi");
        setContent(a.content || "");
        setOldThumbnail(a.thumbnail_url || "");
      } catch (err) {
        console.error("Gagal mengambil artikel:", err);
        alert("Artikel tidak ditemukan!");
      }
    };

    fetchDetail();
  }, [articleId]);

  // Simpan perubahan
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("content", content);

      if (thumbnail) {
        formData.append("image", thumbnail);
      }

      await api.put(`/admin/articles/update/${articleId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Artikel berhasil diperbarui!");
      navigate("/articles/list");
    } catch (err) {
      console.error("Gagal update artikel:", err);
      alert("Gagal memperbarui artikel!");
    }
  };

  return (
    <div className="page-container">
      <Sidebar active="articles-list" />

      <div className="page-content">
        <h2>Edit Artikel</h2>

        <input
          type="text"
          placeholder="Judul artikel..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Edukasi">Edukasi</option>
          <option value="Tips">Tips</option>
          <option value="Motivasi">Motivasi</option>
        </select>

        <textarea
          placeholder="Isi artikel..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

        <label>Thumbnail Lama</label>
        {oldThumbnail ? (
          <img
            src={oldThumbnail}
            alt="thumbnail lama"
            style={{ width: "140px", marginBottom: "10px", borderRadius: "6px" }}
          />
        ) : (
          <p>Tidak ada gambar</p>
        )}

        <input type="file" onChange={(e) => setThumbnail(e.target.files[0])} />

        <button onClick={handleSave}>Simpan Perubahan</button>
      </div>
    </div>
  );
};

export default EditArticle;
