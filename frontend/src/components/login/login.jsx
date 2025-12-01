import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/api";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  const handleSubmit = async(e) => {
    e.preventDefault();

   try {
      const res = await login({ email, password });
      
      // simpan token JWT ke localStorage
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("user_id", res.data.user._id); // simpan _id

      // redirect ke home
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Login gagal!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Masuk ke TutorPedia</h2>
        <p className="subtitle">
          Selamat datang kembali! Silakan masuk ke akun Anda
        </p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="nama@contoh.com"
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

        <p className="register-link">
          Belum punya akun? <a href="/register">Daftar di sini</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
