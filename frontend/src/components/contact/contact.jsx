import React from "react";
import { Link } from 'react-router-dom';

import "./contact.css";

const Contact = () => {

  return (
    <div className="contact-page">
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

      {/* Hero */}
      <section className="contact-hero">
        <div className="container">
          <h1>Hubungi Kami</h1>
          <p>Kami siap membantu kamu kapan saja!</p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="contact-content">
        <div className="container">
          <h2 className="contact-title">Informasi contact</h2>

          <div className="contact-cards-grid">
            <div className="contact-card">
              <div className="contact-card-icon">📧</div>
              <h3>Email</h3>
              <p>hello@tutorpedia.com</p>
              <span>Kami membalas dalam 24 jam</span>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">📞</div>
              <h3>Telepon</h3>
              <p>(021) 1234-5678</p>
              <span>Senin - Jumat, 08.00–17.00</span>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">🏢</div>
              <h3>Kantor</h3>
              <p>Jakarta, Indonesia</p>
              <span>Kunjungi kantor kami</span>
            </div>
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

export default Contact;
