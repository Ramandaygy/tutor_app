import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { getAllProgress } from "../services/Api";
import { useNavigate } from "react-router-dom";
import "../styles/usertable.css";

const ActivityTable = () => {
  const [progress, setProgress] = useState([]);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("chart");

  useEffect(() => {
    getAllProgress().then((res) => setProgress(res || []));
  }, []);

  // Data untuk grafik
  const chartData = [
    { name: "Literasi", total: progress.reduce((a, b) => a + (b.literasi || 0), 0) },
    { name: "Numerik", total: progress.reduce((a, b) => a + (b.numerik || 0), 0) },
    { name: "Sains", total: progress.reduce((a, b) => a + (b.sains || 0), 0) }
  ];

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <Sidebar
        active={activeSection}
        onSelect={(id) => {
          setActiveSection(id);

          if (id === "stats") navigate("/dashboard");
          if (id === "users") navigate("/users");
          if (id === "activity") navigate("/activity");
          if (id === "progress") navigate("/progress");
          if (id === "add-tryout") navigate("/tryout/add");
          if (id === "import-tryout") navigate("/tryout/import");
        }}
      />

      {/* MAIN CONTENT */}
      <div className="admin-content">
        {/* Grafik */}
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

        {/* Tabel Progress */}
        <h1 style={{ marginTop: "40px" }}>📘 Progress Pengguna</h1>

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
                <td>{p.rating?.toFixed(2) || 0}</td>
                <td>{p.total_lessons || 0}</td>
                <td>{p.streak_days || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default ActivityTable;
