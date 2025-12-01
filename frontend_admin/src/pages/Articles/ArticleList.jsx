import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/Api"; 
import { useNavigate } from "react-router-dom";

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  // Ambil semua artikel
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await api.get("/admin/articles");
        setArticles(res.data.articles || []);
      } catch (err) {
        console.error("Gagal memuat artikel:", err);
      }
    };
    fetchArticles();
  }, []);

  // Fungsi hapus
  const deleteArticle = async (id) => {
    if (!window.confirm("Hapus artikel ini?")) return;

    try {
      await api.delete(`/admin/articles/delete/${id}`);
      setArticles(articles.filter((item) => item._id !== id));
      alert("Artikel berhasil dihapus!");
    } catch (err) {
      console.error("Gagal menghapus artikel:", err);
      alert("Gagal menghapus artikel");
    }
  };

  return (
    <div className="page-container">
      <Sidebar active="articles-list" />

      <div className="page-content">
        <h2>Daftar Artikel</h2>


        <table className="admin-table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Judul</th>
              <th>Kategori</th>
              <th>Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {articles.map((a) => (
              <tr key={a._id}>
                <td>
                  {a.thumbnail_url ? (
                    <img
                      src={a.thumbnail_url}
                      alt="thumb"
                      style={{ width: "70px", borderRadius: "6px" }}
                    />
                  ) : (
                    "Tidak ada"
                  )}
                </td>

                <td>{a.title}</td>
                <td>{a.category}</td>
                <td>{new Date(a.created_at).toLocaleDateString()}</td>

                <td>
                  <button
                    className="edit-btn"
                    onClick={() => navigate(`/articles/edit/${a._id}`)}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteArticle(a._id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>


      </div>
    </div>
  );
};

export default ArticleList;
