import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getModules, deleteModule } from "../../services/Api";
import { useNavigate } from "react-router-dom";

const ModuleList = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await getModules();
        setModules(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Gagal memuat modul:", err);
        setModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus modul ini?")) return;

    try {
      await deleteModule(id);
      setModules(modules.filter((m) => m._id !== id));
      alert("Modul berhasil dihapus");
    } catch (err) {
      console.error("Gagal hapus modul:", err);
      alert("Gagal menghapus modul");
    }
  };

  return (
    <div className="page-container">
      <Sidebar active="modules-list" />

      <div className="page-content">
        <h2>Daftar Modul</h2>
        
        <button
            className="add-btn"
            onClick={() => navigate("/modules/upload")}
          >
            + Upload Modul
          </button>

        {loading ? (
          <p>Loading modul...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Kelas</th>
                <th>Kategori</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {modules.length === 0 ? (
                <tr>
                  <td colSpan="4">Belum ada modul</td>
                </tr>
              ) : (
                modules.map((m) => (
                  <tr key={m._id}>
                    <td>{m.title}</td>
                    <td>{m.kelas}</td>
                    <td>{m.kategori}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => navigate(`/modules/edit/${m._id}`)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(m._id)}
                        style={{ marginLeft: "8px" }}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ModuleList;
