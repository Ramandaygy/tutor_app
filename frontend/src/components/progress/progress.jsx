import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../../services/api";
import "./progress.css";

const Progress = () => {
  const [name, setName] = useState("");
  const [progress, setProgress] = useState(null);
  const [riwayatLiterasi, setRiwayatLiterasi] = useState([]);
  const [riwayatNumerik, setRiwayatNumerik] = useState([]);
  const [riwayatSains, setRiwayatSains] = useState([]);
  const [expanded, setExpanded] = useState({
    literasi: false,
    numerik: false,
    sains: false,
  });
  const navigate = useNavigate();

  const toggleExpand = (theme) => {
    setExpanded((prev) => ({ ...prev, [theme]: !prev[theme] }));
  };

  // 🔹 Ambil profil user
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await getProfile();
        const userName =
          profileRes.data.user?.name || profileRes.data.user?.email || "User";
        setName(userName);
      } catch (err) {
        console.error("Gagal ambil profil:", err);
        navigate("/login");
      }
    };
    fetchProfile();
  }, [navigate]);

  // 🔹 Fungsi ambil progres dari backend
  const refreshProgress = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:5000/admin/progress/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.status === "success") {
        setProgress({
          literasi: data.progress?.literasi || 0,
          numerik: data.progress?.numerik || 0,
          sains: data.progress?.sains || 0,
          rating: data.progress?.rating || 0,
          rating_count: data.progress?.rating_count || 0,
          total_lessons: data.progress?.total_lessons || 0,
          streak_days: data.progress?.streak_days || 0,
        });
      }
    } catch (err) {
      console.error("Gagal ambil progress:", err);
    }
  };

  // 🔹 Ambil data awal saat halaman dimuat
  useEffect(() => {
    refreshProgress();
  }, []);

  // 🔹 Refresh progress otomatis setiap 5 detik (sinkron feedback rating)
  useEffect(() => {
    const interval = setInterval(refreshProgress, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Ambil riwayat progres tiap tema
  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    const fetchRiwayat = async (theme, setter) => {
      try {
        const res = await fetch(
          `http://localhost:5000/chatbot/progress/history?user_id=${userId}&theme=${theme}`
        );
        const data = await res.json();
        setter(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(`Gagal ambil riwayat ${theme}:`, err);
        setter([]);
      }
    };

    fetchRiwayat("literasi", setRiwayatLiterasi);
    fetchRiwayat("numerik", setRiwayatNumerik);
    fetchRiwayat("sains", setRiwayatSains);
  }, []);

  if (!progress) {
    return <p style={{ textAlign: "center" }}>Memuat progres...</p>;
  }

  const {
    literasi,
    numerik,
    sains,
    rating,
    rating_count,
    total_lessons,
    streak_days,
  } = progress;

  // 🔹 Komponen rating bintang
  const renderStars = (value) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= value ? "#f5c518" : "#ddd",
            fontSize: "1.5rem",
            marginRight: 2,
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // 🔹 Render tiap bagian riwayat
  const renderRiwayat = (theme, riwayat) => (
    <div
      className={`progress-item ${theme}`}
      onClick={() => toggleExpand(theme)}
      style={{ cursor: "pointer" }}
    >
      <h4>{theme.charAt(0).toUpperCase() + theme.slice(1)}</h4>
      <p>{progress[theme] ?? 0}%</p>

      <div className="riwayat-mini">
        <h5>Riwayat {expanded[theme] ? "▲" : "▼"}</h5>
        {expanded[theme] ? (
          Array.isArray(riwayat) && riwayat.length > 0 ? (
            <ul>
              {riwayat.map((r, i) => (
                <li key={i} className={r.benar ? "benar" : "salah"}>
                  <strong>Soal:</strong> {r.pertanyaan || "-"} <br />
                  <strong>Jawabanmu:</strong> {r.jawaban_user || "-"} <br />
                  <strong>Penjelasan:</strong>{" "}
                  {r.penjelasan || "Tidak ada penjelasan"} <br />
                  <small>
                    {new Date(r.created_at).toLocaleDateString("id-ID")}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="kosong">Belum ada data</p>
          )
        ) : (
          <p style={{ fontSize: "0.85rem", color: "#888" }}>
            Klik untuk lihat detail
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="progress-container">
      {/* 🔹 Navbar */}
      <nav className="navbar">
        <div className="logo">TutorPedia</div>
        <div className="nav-links">
          <button onClick={() => navigate("/home")}>🏠 Home</button>
          <button onClick={() => navigate("/progress")}>📊 Progress</button>
          <button onClick={() => navigate("/profile")}>{name}</button>
        </div>
      </nav>


      <div className="dashboard-box">
        <h2>Dashboard Progres</h2>
        <p>Lihat perkembangan belajarmu dari waktu ke waktu</p>

        {/* 🔹 Statistik utama */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>⭐ Rata-rata Pemahaman</h3>
            <div>{renderStars(Math.round(rating))}</div>
            <p className="stat-value">{rating.toFixed(1)} / 5</p>
            <small>{rating_count} feedback</small>
          </div>

          <div className="stat-card">
            <h3>📚 Soal Diselesaikan</h3>
            <p className="stat-value">{total_lessons}</p>
          </div>

          <div className="stat-card">
            <h3>🔥 Hari Berurut Belajar</h3>
            <p className="stat-value">{streak_days}</p>
          </div>
        </div>

        {/* 🔹 Progres Per Tema */}
        <h3>Progres Per Tema</h3>
        <div className="progress-grid">
          {renderRiwayat("literasi", riwayatLiterasi)}
          {renderRiwayat("numerik", riwayatNumerik)}
          {renderRiwayat("sains", riwayatSains)}
        </div>
      </div>
    </div>
  );
};

export default Progress;
