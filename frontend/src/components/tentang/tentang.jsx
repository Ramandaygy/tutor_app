import React from 'react';
import { Link } from 'react-router-dom';
import './tentang.css';

const Tentang = () => {
  return (
    <div className="tentang-container">

      {/* Header */}
            <header>
              <div className="container">
                <div className="header-content">
                  <div className="logo">TutorPedia</div>
                  <nav className="center-nav">
                    <ul>
                      <li><a href="/">Beranda</a></li>
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
      <section className="tentang-hero" id="beranda">
        <div className="container">
          <h2>Tentang TutorPedia</h2>
          <p>Mengenal lebih dekat platform belajar online yang menyenangkan untuk anak Sekolah Dasar</p>
        </div>
      </section>

      {/* Visi Misi Section */}
      <section className="vision-mission" id="visi-misi">
        <div className="container">
          <h2 className="section-title">Visi & Misi Kami</h2>
          <div className="vision-mission-content">
            <div className="vision-box">
              <h3><i className="fas fa-eye"></i> Visi Kami</h3>
              <p>Menjadi platform edukasi digital terdepan yang menciptakan pengalaman belajar yang menyenangkan, interaktif, dan efektif bagi anak-anak Sekolah Dasar di Indonesia.</p>
            </div>
            <div className="mission-box">
              <h3><i className="fas fa-bullseye"></i> Misi Kami</h3>
              <ul className="mission-list">
                <li>Menyediakan konten pembelajaran berkualitas sesuai kurikulum nasional.</li>
                <li>Mengembangkan metode pembelajaran yang inovatif dan menarik.</li>
                <li>Membangun sistem evaluasi yang komprehensif.</li>
                <li>Menjangkau seluruh anak Indonesia dengan teknologi yang mudah diakses.</li>
                <li>Berkolaborasi dengan pendidik untuk meningkatkan kualitas pembelajaran.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tentang Kami Detail */}
      <section className="about-detail" id="tentang">
        <div className="container">
          <h2 className="section-title">Mengapa Memilih TutorPedia?</h2>
          <div className="about-grid">

            <div className="about-item">
              <div className="about-icon emoji">📚</div>
              <h3>Kurikulum Terstandar</h3>
              <p>Materi pembelajaran disusun sesuai kurikulum nasional.</p>
            </div>

            <div className="about-item">
              <div className="about-icon emoji">🧒✨</div>
              <h3>Ramah Anak</h3>
              <p>Antarmuka dengan warna cerah dan navigasi yang mudah.</p>
            </div>

            <div className="about-item">
              <div className="about-icon emoji">🎮🧠</div>
              <h3>Pembelajaran Menyenangkan</h3>
              <p>Metode permainan dan aktivitas interaktif.</p>
            </div>

            <div className="about-item">
              <div className="about-icon emoji">📈⭐</div>
              <h3>Progress Tracking</h3>
              <p>Sistem pelacakan perkembangan belajar anak.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Nilai Perusahaan */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title">Nilai-nilai Kami</h2>
          <div className="values-content">
            <div className="value-item">
              <h3><i className="fas fa-heart"></i> Peduli</h3>
              <p>Kami peduli terhadap perkembangan pendidikan anak Indonesia.</p>
            </div>
            <div className="value-item">
              <h3><i className="fas fa-lightbulb"></i> Inovatif</h3>
              <p>Kami terus berinovasi dalam metode pembelajaran.</p>
            </div>
            <div className="value-item">
              <h3><i className="fas fa-handshake"></i> Kolaboratif</h3>
              <p>Bekerja sama dengan pendidik dan orang tua.</p>
            </div>
            <div className="value-item">
              <h3><i className="fas fa-star"></i> Berkualitas</h3>
              <p>Konten dan layanan selalu berkualitas tinggi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="tentang-footer" id="kontak">
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h3>TutorPedia</h3>
              <p>Platform belajar online yang menyenangkan.</p>
            </div>
            <div className="footer-column">
              <h3>Kontak Kami</h3>
              <ul>
                <li><i className="fas fa-envelope"></i> info@tutorpedia.com</li>
                <li><i className="fas fa-phone"></i> 021-12345678</li>
                <li><i className="fas fa-map-marker-alt"></i> Yogyakarta</li>
              </ul>
            </div>
          </div>

          <div className="copyright">
            <p>&copy; 2025 TutorPedia. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Tentang;
