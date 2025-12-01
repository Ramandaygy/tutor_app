import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArticles } from "../../services/api"; 
import "./landingpage.css";

const LandingPage = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    getArticles()
      .then((res) => {
        console.log("DATA DARI BACKEND:", res.data);
        setArticles(res.data.articles || []);
      })
      .catch((err) => console.error("Gagal memuat artikel:", err));
  }, []);

  return (
    <div className="landing-page">
      
      {/* Header */}
      <header>
        <div className="container">
          <div className="header-content">
            <div className="logo">TutorPedia</div>
            <nav className="center-nav">
              <ul>
                <li><a href="#">Beranda</a></li>
                <li><a href="/tentang">About</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </nav>
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Masuk</Link>
              <Link to="/register" className="register-btn">Daftar</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Belajar Jadi Menyenangkan untuk Siswa SD</h1>
          <p>
            TutorPedia membantu siswa SD belajar dengan cara yang menyenangkan
            dan interaktif. Dapatkan pengalaman belajar personal dengan materi
            literasi, numerasi, dan sains yang disesuaikan dengan kebutuhan belajar kamu.
          </p>
          <a href="/login" className="cta-button">Mulai Belajar Sekarang</a>
        </div>
      </section>

      <div className="container">
        <div className="divider"></div>
      </div>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Fitur Belajar</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Literasi Interaktif</h3>
              <p>Belajar membaca dan memahami teks dengan cara yang seru dan menyenangkan untuk anak SD.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">➕</div>
              <h3>Numerasi Menantang</h3>
              <p>Latihan soal matematika yang membuat anak berpikir kreatif dan menyukai angka.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧪</div>
              <h3>Eksperimen Sains</h3>
              <p>Pelajari konsep sains dengan eksperimen sederhana yang aman dan menarik.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="articles">
        <div className="container">
          <h2 className="section-title">Artikel Terbaru</h2>
          
          <div className="articles-grid">
            {articles.length === 0 ? (
              <p>Tidak ada artikel.</p>
            ) : (
              articles.map((a, i) => (
                <div key={i} className="article-card">
              
                  <h3>{a.title}</h3>
                  <p>{a.content.substring(0, 120)}...</p>
                  <Link to={`/article/${a._id}`}>Baca Selengkapnya</Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content">
            
            <div className="copyright">
              © 2025 TutorPedia. Semua hak dilindungi.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
