import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/sidebar.css";
import {
  BarChart2,
  Users,
  Activity,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
  Zap,
  Upload,
  FileText,
} from "lucide-react";

const Sidebar = ({ active }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: "stats", label: "Statistik", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { id: "users", label: "Daftar Pengguna", icon: <Users size={20} />, path: "/users" },
    { id: "activity", label: "Aktivitas", icon: <Activity size={20} />, path: "/activity" },
    { id: "add-tryout", label: "Tambah Soal", icon: <Plus size={20} />, path: "/tryout/add" },
    { id: "tryout-generate", label: "Generate Tryout", icon: <Zap size={20} />,path: "/tryout/generate"},
    { id: "articles-add", label: "Tambah Artikel", icon: <Plus size={20} />, path: "/articles/add" },
    { id: "articles-list", label: "List Artikel", icon: <FileText size={20} />, path: "/articles/list" },

  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <h2 className="sidebar-title">{collapsed ? "TP" : "TutorPedia Admin"}</h2>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu */}
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={`menu-item ${active === item.id ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="menu-icon">{item.icon}</span>
            {!collapsed && <span className="menu-label">{item.label}</span>}
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("admin_token");
            navigate("/login");
          }}
        >
          <LogOut size={18} />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
