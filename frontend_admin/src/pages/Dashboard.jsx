import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, getAllProgress, getStats } from "../services/Api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("stats");

  const lastLogin = new Date().toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await getAllUsers();
        const progressData = await getAllProgress();
        const statsData = await getStats();

        setUsers(usersData || []);
        setProgress(progressData || []);
        setStats(statsData || {});
      } catch (err) {
        console.error("❌ Gagal memuat data dashboard:", err);
        if (err.response?.status === 401) navigate("/login");
      }
    };
    fetchData();
  }, [navigate]);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filter === "all"
        ? true
        : filter === "active"
        ? u.is_active
        : !u.is_active;
    return matchSearch && matchStatus;
  });

  // 🔹 Data untuk grafik
  const chartData = [
    {
      name: "Literasi",
      total: progress.reduce((acc, p) => acc + (p.literasi || 0), 0),
    },
    {
      name: "Numerik",
      total: progress.reduce((acc, p) => acc + (p.numerik || 0), 0),
    },
    {
      name: "Sains",
      total: progress.reduce((acc, p) => acc + (p.sains || 0), 0),
    },
  ];

  return (
    <div className="admin-container">
      <Sidebar
            active={activeSection}
            onSelect={(id) => {
              setActiveSection(id);

              if (id === "stats") navigate("/dashboard");
              if (id === "chart") navigate("/activity");
              if (id === "users") navigate("/users");
              if (id === "progress") navigate("/progress");
              if (id === "add-tryout") navigate("/tryout/add");
              if (id === "import-tryout") navigate("/tryout/import");

            }}
          />
      {/* 🔹 Navbar */}
      <header className="admin-navbar">
         
        <div className="admin-nav-actions">
          <span className="last-login">
            ⏰ Login: {lastLogin}
          </span>
        
        </div>
      </header>

      {/* 🔹 Statistik Ringkas */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <h3>Total Pengguna</h3>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📈</div>
          <h3>Total Progress</h3>
          <div className="stat-value">{progress.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">⭐</div>
          <h3>Rating Rata-rata</h3>
          <div className="stat-value">
            {stats?.avg_rating?.toFixed(2) || "-"}
          </div>
        </div>
      </div>

      {/* 🔹 Grafik Progress */}
      <div className="chart-section">
        <h2>📊 Grafik Total Progress per Tema</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 Daftar Pengguna */}
      <div className="table-section">
        <h2>👤 Daftar Pengguna</h2>

        {/* Filter dan Search */}
        <div className="table-controls">
          <input
            type="text"
            placeholder=" Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Semua</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u, i) => (
              <tr key={i}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <span
                    className={`status-badge ${
                      u.is_active ? "active" : "inactive"
                    }`}
                  >
                    {u.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 Progress Pengguna */}
      <div className="table-section">
        <h2>📘 Progress Pengguna</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Literasi</th>
              <th>Numerik</th>
              <th>Sains</th>
              <th>Rating</th>
              <th>Total Lesson</th>
              <th>Hari Aktif</th>
            </tr>
          </thead>
          <tbody>
            {progress.map((p, i) => (
              <tr key={i}>
                <td>{p.user_id}</td>
                <td>{p.literasi || 0}</td>
                <td>{p.numerik || 0}</td>
                <td>{p.sains || 0}</td>
                <td>{p.rating?.toFixed(1) || 0}</td>
                <td>{p.total_lessons || 0}</td>
                <td>{p.streak_days || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="admin-footer">
        © {new Date().getFullYear()} TutorPedia Dashboard | Dibuat dengan ❤️ oleh Admin
      </footer>
    </div>
  );
};

export default Dashboard;
