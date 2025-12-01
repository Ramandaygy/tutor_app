import React, { useEffect, useState } from "react";
import { getAllUsers } from "../services/Api";
import "../styles/usertable.css";

const UserTable = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData || []);
      } catch (err) {
        console.error("❌ Gagal memuat data users:", err);
      }
    };
    fetchData();
  }, []);

  // 🔍 Search + Filter Logic
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

  return (
    <div className="user-table-container">
      {/* 🔍 Search dan Filter */}
      <div className="table-controls">
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      {/* 📊 Tabel Daftar User */}
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr 
                key={user.id || index} 
                onClick={() => onSelectUser(user.id || user.user_id)}
                className="user-row"
              >
                <td className="user-name">{user.name || "-"}</td>
                <td className="user-email">{user.email || "-"}</td>
                <td>
                  <span className={`role-badge ${user.role || 'student'}`}>
                    {user.role || 'student'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="no-data">
          <p>Tidak ada data pengguna yang ditemukan</p>
        </div>
      )}

      <div className="table-info">
        <p>Menampilkan {filteredUsers.length} dari {users.length} pengguna</p>
      </div>
    </div>
  );
};

export default UserTable;