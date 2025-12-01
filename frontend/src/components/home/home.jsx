import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../../services/api";
import "./home.css";

const Home = () => {
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState("Selamat datang");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setName(res.data.user?.name || res.data.user?.email || "User");
      } catch (err) {
        console.error("Gagal ambil profil:", err);
        navigate("/login");
      }
    };

    fetchProfile();

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Selamat pagi");
    else if (hour < 15) setGreeting("Selamat siang");
    else if (hour < 19) setGreeting("Selamat sore");
    else setGreeting("Selamat malam");
  }, [navigate]);

   const handleTryoutClick = () => {
    // Tambahkan efek animasi sebelum navigasi
    const button = document.querySelector('.tryout-button');
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = '';
        // Navigasi ke halaman Tryout
        navigate("/tryout");
      }, 150);
    } else {
      navigate("/tryout");
    }
  };

 

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="logo">TutorPedia</div>
        <div className="nav-links">
          <button onClick={() => navigate("/progress")}>📊 Progress</button>
          <button onClick={() => navigate("/profile")}>{name}</button>
        </div>
      </nav>

      <div className="welcome-card">
        <h2>
          {greeting}, {name} 🎉
        </h2>
        <p>Mari belajar dan berpetualang dengan pengetahuan!</p>
      </div>

      {/* Cards */}
      <div className="subject-grid">
        <div
          className="subject-card"
          onClick={() => navigate("/literasi")}
        >
          <h1>📖</h1>
          <h3>Literasi</h3>
          <p>Belajar membaca, menulis, dan memahami cerita</p>
        </div>

        <div
          className="subject-card"
          onClick={() => navigate("/numerik")}
        >
          <h1>➕</h1>
          <h3>Numerasi</h3>
          <p>Belajar berhitung, angka, dan matematika dasar</p>
        </div>

        <div
          className="subject-card"
          onClick={() => navigate("/sains")}
        >
          <h1>🧪</h1>
          <h3>Sains</h3>
          <p>Eksperimen dan penemuan dunia ilmu pengetahuan</p>
        </div>
      </div>

      {/* Bagian Tryout Baru - Menggantikan progress bawah */}
      <div className="tryout-section">
        <div className="tryout-title">Siap menguji kemampuan Anda?</div>
        <button className="tryout-button" onClick={handleTryoutClick}>
          TRYOUT
        </button>
        <div className="tryout-info">
          Klik tombol di atas untuk memulai tryout dan mengukur pemahaman Anda
        </div>
      </div>
    </div>
  );
};

export default Home;
