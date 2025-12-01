import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css"; // bisa pakai CSS yang sama biar konsisten

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/admin/register", {
        name,
        email,
        password,
      });

      setSuccess("Admin berhasil didaftarkan, silakan login.");
      setError("");
      // setelah sukses register, redirect ke login admin
      setTimeout(() => navigate("/admin/login"), 2000);
    } catch (err) {
      console.error("Register error:", err);
      setError(err.response?.data?.message || "Register gagal!");
      setSuccess("");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Daftar Admin</h2>
        <p className="subtitle">Buat akun admin baru</p>

        <form onSubmit={handleSubmit}>
          <label>Nama</label>
          <input
            type="text"
            placeholder="Nama lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="nama@contoh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
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
            Daftar
          </button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <p className="register-link">
          Sudah punya akun? <a href="/admin/login">Masuk di sini</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
