import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import axios from "axios";

const GenerateTryout = () => {
  const [category, setCategory] = useState("Matematika");
  const [jumlah, setJumlah] = useState(10);
  const [loading, setLoading] = useState(false);

  const generateSoal = async () => {
    setLoading(true);

    const res = await axios.post("/admin/tryout/generate", {
      category,
      jumlah
    });

    alert(res.data.message);
    setLoading(false);
  };

  return (
    <div className="page-container">
      <Sidebar active="tryout-generate" />

      <div className="page-content">
        <h2>Generate Soal Tryout</h2>

        <label>Kategori Soal</label>
        <select onChange={(e) => setCategory(e.target.value)}>
          <option value="Matematika">Matematika</option>
          <option value="Numerasi">Numerasi</option>
          <option value="Literasi">Literasi</option>
          <option value="Sains">Sains</option>
        </select>

        <label>Jumlah Soal</label>
        <input
          type="number"
          value={jumlah}
          min="1"
          max="50"
          onChange={(e) => setJumlah(e.target.value)}
        />

        <button onClick={generateSoal} disabled={loading}>
          {loading ? "Menghasilkan soal..." : "Generate"}
        </button>
      </div>
    </div>
  );
};

export default GenerateTryout;
