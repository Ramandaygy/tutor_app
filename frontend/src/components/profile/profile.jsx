import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../../services/api";
import "./profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nama: "",
    kelas: "Kelas 4",
  });

  // Ambil data profil saat pertama kali render
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        const user = res.data.user;
        setName(user?.name || user?.email || "User");
        setForm({
          nama: user?.name || "",
          kelas: user?.kelas || "Kelas 4",
        });
      } catch (err) {
        console.error("Gagal ambil profil:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Ubah input form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Simpan ke backend
  const handleSave = async () => {
    try {
      const res = await updateProfile(form);
      alert("Profil berhasil diperbarui! 🎉");
      console.log("Update success:", res.data);
    } catch (err) {
      console.error("Gagal update profil:", err);
      alert("Gagal update profil! 😢");
    }
  };

  const handleLogout = () => {
    alert("Logout berhasil! Sampai jumpa lagi! 👋");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="profile-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        fontSize: '18px',
        fontWeight: '600',
        color: '#4a5568'
      }}>
        <div>Memuat profil... 🔄</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">TutorPedia</div>
        <div className="nav-links">
          <button onClick={() => navigate("/home")}>🏠 Home</button>
          <button onClick={() => navigate("/progress")}>📊 Progress</button>
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
          <button onClick={() => navigate("/profile")}>{name}</button>
        </div>
      </nav>

      {/* Profil utama */}
      <div className="profile-card">
        <div className="profile-info">
          <div className="profile-avatar">👦</div>
          <div>
            <h3 className="profile-name">{form.nama}</h3>
            <p className="profile-class">Pelajar {form.kelas} SD</p>
          </div>
        </div>

        {/* Form */}
        <div className="form-section">
          <h4>Informasi Lengkap</h4>

          <label>Nama Lengkap</label>
          <input
            type="text"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            placeholder="Masukkan nama lengkap kamu"
          />

          <label>Kelas</label>
          <select name="kelas" value={form.kelas} onChange={handleChange}>
            <option>Kelas 1</option>
            <option>Kelas 2</option>
            <option>Kelas 3</option>
            <option>Kelas 4</option>
            <option>Kelas 5</option>
            <option>Kelas 6</option>
          </select>

          <button className="save-btn" onClick={handleSave}>
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;