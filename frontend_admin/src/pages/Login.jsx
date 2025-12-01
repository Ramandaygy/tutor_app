import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔹 Jika sudah login (ada token), langsung redirect ke dashboard
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/admin/login", {
        email: email.toLowerCase(),
        password,
      });

      // ✅ Simpan token dengan key yang konsisten dengan Api.js
      localStorage.setItem("admin_token", res.data.access_token);

      // ✅ Redirect ke dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Admin Login error:", err);
      setError(err.response?.data?.message || "Login admin gagal!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Masuk sebagai Admin</h2>
        <p className="subtitle">Silakan masuk dengan akun admin Anda</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="admin@contoh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Kata Sandi</label>
          <input
            type="password"
            placeholder="Masukkan kata sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn-primary full">
            Masuk
          </button>
        </form>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

        <p className="register-link">
          Belum punya akun admin? <a href="/register">Daftar di sini</a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
