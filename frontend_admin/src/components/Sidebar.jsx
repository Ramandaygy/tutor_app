import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/sidebar.css";
import {
  Users,
  Activity,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
  Zap,
  FileText,
  Edit3,
} from "lucide-react";

/**
 * Props:
 * - active: string
 * - onCollapse: function(boolean)
 */
const Sidebar = ({ active, onCollapse }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (onCollapse) {
      onCollapse(collapsed);
    }
  }, [collapsed, onCollapse]);

  const menuItems = [
    {
      id: "stats",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    {
      id: "users",
      label: "Daftar Pengguna",
      icon: <Users size={20} />,
      path: "/users",
    },
    {
      id: "activity",
      label: "Aktivitas",
      icon: <Activity size={20} />,
      path: "/activity",
    },
    {
      id: "add-tryout",
      label: "Tambah Soal",
      icon: <Plus size={20} />,
      path: "/tryout/add",
    },
    {
      id: "essay-add",
      label: "Soal Essay",
      icon: <Zap size={20} />,
      path: "/soalessay/essay",
    },
    {
      id: "articles-add",
      label: "Tambah Artikel",
      icon: <Plus size={20} />,
      path: "/articles/add",
    },
    {
      id: "articles-list",
      label: "List Artikel",
      icon: <FileText size={20} />,
      path: "/articles/list",
    },
    {
      id: "essay-list",
      label: "List Soal",
      icon: <Edit3 size={20} />,
      path: "/essay/list",
    },
    { id: "module-list", 
      label: "List module", 
      icon: <FileText size={20} />, 
      path: "/modules/list" 
    },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* HEADER */}
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          {collapsed ? "TP" : "TutorPedia"}
        </h2>
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* MENU */}
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={`menu-item ${active === item.id ? "active" : ""}`}
            title={collapsed ? item.label : ""}
            onClick={() => navigate(item.path)}
          >
            <span className="menu-icon">{item.icon}</span>
            {!collapsed && (
              <span className="menu-label">{item.label}</span>
            )}
          </li>
        ))}
      </ul>

      {/* FOOTER */}
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
