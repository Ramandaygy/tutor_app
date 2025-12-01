import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";  // ← WAJIB PAKAI INI
import "./articledetail.css";

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    api.get(`/articles/${id}`)
      .then((res) => {
        console.log("DETAIL ARTIKEL:", res.data);
        setArticle(res.data);
      })
      .catch((err) => {
        console.error("Gagal mengambil artikel:", err);
      });
  }, [id]);

  if (!article) {
    return <p style={{ textAlign: "center", marginTop: 40 }}>Memuat artikel...</p>;
  }

  return (
    <div className="article-detail-container">
      <Link className="back-btn" to="/">← Kembali</Link>

      <h1>{article.title}</h1>

      {article.thumbnail_url && (
        <img
          src={`http://localhost:5000${article.thumbnail_url}`}
          alt="thumbnail"
          className="article-image"
        />
      )}


      <p className="article-date">
        {new Date(article.created_at).toLocaleDateString()}
      </p>

      <div className="article-content">{article.content}</div>
    </div>
  );
};

export default ArticleDetail;
