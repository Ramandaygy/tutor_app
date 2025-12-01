import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import "../../styles/tryout.css";


const AddTryout = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("Matematika");
  const [image, setImage] = useState(null);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("question", question);
      formData.append("answer", answer);
      formData.append("category", category);
      if (image) formData.append("image", image);

      options.forEach((opt, i) => formData.append(`options[${i}]`, opt));

      const res = await axios.post("/admin/tryout/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(res.data.message);
    } catch (err) {
      alert("Gagal menambahkan soal");
    }
  };

  return (
    <div className="page-container">
      <Sidebar active="add-tryout" />

      <div className="page-content">
        <h2>Tambah Soal Tryout</h2>

        <textarea
          placeholder="Tuliskan soal..."
          onChange={(e) => setQuestion(e.target.value)}
        />

        {options.map((opt, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Pilihan ${i + 1}`}
            value={opt}
            onChange={(e) => {
              const copy = [...options];
              copy[i] = e.target.value;
              setOptions(copy);
            }}
          />
        ))}

        <input
          type="text"
          placeholder="Jawaban benar"
          onChange={(e) => setAnswer(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Matematika">Matematika</option>
          <option value="Numerasi">Numerasi</option>
          <option value="Literasi">Literasi</option>
          <option value="Sains">Sains</option>
        </select>

        <input type="file" onChange={(e) => setImage(e.target.files[0])} />

        <button onClick={handleSubmit}>Simpan</button>
      </div>
    </div>
  );
};

export default AddTryout;
