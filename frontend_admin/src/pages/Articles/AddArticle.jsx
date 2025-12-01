import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/Api"; // WAJIB pakai ini

const AddArticle = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Edukasi");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState(null);

  const handleSubmit = async () => {
    if (!title || !content) {
      alert("Judul dan isi artikel wajib diisi!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("content", content);
    if (thumbnail) formData.append("image", thumbnail);

    try {
      const res = await api.post("/admin/articles/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Success:", res.data);
      alert("Artikel berhasil ditambahkan!");

      // Reset form
      setTitle("");
      setContent("");
      setThumbnail(null);

    } catch (err) {
      console.error("Gagal menambahkan artikel:", err.response?.data || err);
      alert("Gagal menambahkan artikel!");
    }
  };

  return (
    <div className="page-container">
      <Sidebar active="articles-add" />

      <div className="page-content">
        <h2>Tambah Artikel Baru</h2>

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
          placeholder="Isi artikel lengkap..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnail(e.target.files[0])}
        />

        <button onClick={handleSubmit}>Simpan Artikel</button>
      </div>
    </div>
  );
};

export default AddArticle;
