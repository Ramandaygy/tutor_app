import React, { useState } from "react";
import { Link } from "react-router-dom";
import { register } from "../../services/api"; // pastikan import fungsi API
import "./register.css";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    kelas: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Data Registrasi:", form);

      // payload sesuai backend
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "student", // default
        kelas: form.kelas //aktifkan kalau backend sudah support
      };

      const res = await register(payload);

      setMessage(res.data.message || "Registrasi berhasil!");
      alert("Registrasi berhasil! Silakan login.");
      window.location.href = "/login"; 

      setMessage(res.data.message || "Registrasi berhasil!");
    } catch (err) {
      setMessage(err.response?.data?.error || "Registrasi gagal!");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Daftar Akun TutorPedia</h2>
        <p>Bergabunglah dengan kami untuk pengalaman belajar yang menyenangkan</p>
        <form onSubmit={handleSubmit}>
          <label>Nama Lengkap</label>
          <input
            type="text"
            name="name"
            placeholder="Nama lengkap"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="nama@contoh.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Kata Sandi</label>
          <input
            type="password"
            name="password"
            placeholder="Buat kata sandi"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label>Kelas</label>
          <select
            name="kelas"
            value={form.kelas}
            onChange={handleChange}
            required
          >
            <option value="">Pilih kelas</option>
            <option value="1">Kelas 1</option>
            <option value="2">Kelas 2</option>
            <option value="3">Kelas 3</option>
            <option value="4">Kelas 4</option>
            <option value="5">Kelas 5</option>
            <option value="6">Kelas 6</option>
          </select>

          <button type="submit" className="btn-primary">
            Daftar
          </button>
        </form>

        {message && <p className="status-message">{message}</p>}

        <p className="login-text">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
