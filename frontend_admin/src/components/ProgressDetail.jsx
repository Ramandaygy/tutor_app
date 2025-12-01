import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getAllProgress } from "../services/Api";
import { useNavigate } from "react-router-dom";

const ProgressDetail = () => {
  const [progressList, setProgressList] = useState([]);
  const [activeSection, setActiveSection] = useState("progress");
  const navigate = useNavigate();

  useEffect(() => {
    getAllProgress().then(setProgressList);
  }, []);

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
        }}
      />

      <div className="page-content">
        <h1>📘 Progress Pengguna</h1>

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
            {progressList.map((p,i)=>(
              <tr key={i}>
                <td>{p.user_id}</td>
                <td>{p.literasi}</td>
                <td>{p.numerik}</td>
                <td>{p.sains}</td>
                <td>{p.rating?.toFixed(2)}</td>
                <td>{p.total_lessons}</td>
                <td>{p.streak_days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgressDetail;
