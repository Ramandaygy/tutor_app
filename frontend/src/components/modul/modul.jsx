import React, { useState, useEffect } from "react";
import { getModules, getModuleDetail } from "../../services/api";
import "./modul.css";

const Modul = ({ userKelas }) => {
  const [currentTab, setCurrentTab] = useState("literasi");
  const [modules, setModules] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    getModules(currentTab, "all").then((res) => {
      setModules(res.data);
      setSelectedLesson(null);
    });
  }, [currentTab]);

  const openModuleContent = async (modulId) => {
    const res = await getModuleDetail(modulId);
    // ambil langsung isi modul (tanpa bab)
    setSelectedLesson(res.data.content?.[0] || null);
  };

  return (
    <div className="modul-container">
      {/* HEADER */}
      <header className="header">
        <h1>🎓 TutorPedia</h1>
        <p>Belajar Literasi, Numerasi, dan Sains dengan cara seru 📘</p>
      </header>

      {/* TAB */}
      <div className="tab-container">
        {["literasi", "numerasi", "sains"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${currentTab === tab ? "active" : ""}`}
            onClick={() => {
              setCurrentTab(tab);
              setSelectedClass(null);
              setSelectedLesson(null);
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* KELAS */}
      <div className="kelas-wrapper">
        {[1, 2, 3, 4, 5, 6].map((kls) => (
          <div
            key={kls}
            className={`kelas-card ${
              selectedClass === kls ? "active" : ""
            }`}
            onClick={() => {
              setSelectedClass(kls);
              setSelectedLesson(null);
            }}
          >
            Kelas {kls}
          </div>
        ))}
      </div>

      {/* SPLIT SCREEN */}
      <div className="content-layout">
        {/* KIRI: JUDUL MODUL */}
        <div className="module-list">
          {!selectedClass && (
            <p className="placeholder">Pilih kelas terlebih dahulu</p>
          )}

          {modules
            .filter((m) => m.kelas === selectedClass)
            .map((modul) => (
              <div
                key={modul._id}
                className="module-item"
                onClick={() => openModuleContent(modul._id)}
              >
                📘 {modul.title}
              </div>
            ))}
        </div>

        {/* KANAN: ISI MODUL */}
        <div className="lesson-viewer">
          {selectedLesson ? (
            <>
              <h2>{selectedLesson.title}</h2>
              <div
                className="lesson-reader"
                dangerouslySetInnerHTML={{
                  __html: selectedLesson.content,
                }}
              />
            </>
          ) : (
            <p className="placeholder">
              Pilih judul modul untuk membaca 👉
            </p>
          )}
        </div>
      </div>

      <footer className="footer">
        <p>TutorPedia © 2025</p>
      </footer>
    </div>
  );
};

export default Modul;
