import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { addTryoutQuestion, uploadTryoutPDF } from "../../services/Api";
import "../../styles/tryout.css";

const AddTryout = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("Matematika");
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      // =====================
      // UPLOAD FILE (PDF/EXCEL)
      // =====================
      if (file) {
        formData.append("file", file);
        formData.append("category", category);

        const res = await uploadTryoutPDF(formData);
        alert(res.data.message || "File soal berhasil diupload");
      }

      // =====================
      // INPUT MANUAL PILGAN
      // =====================
      else {
        if (!question || !answer || options.some((o) => !o)) {
          alert("Soal, pilihan, dan jawaban wajib diisi");
          return;
        }

        formData.append("type", "multiple_choice");
        formData.append("question", question);
        formData.append("answer", answer);
        formData.append("category", category);

        options.forEach((opt, i) =>
          formData.append(`options[${i}]`, opt)
        );

        if (image) formData.append("image", image);

        const res = await addTryoutQuestion(formData);
        alert(res.data.message || "Soal berhasil ditambahkan");
      }

      // Reset form
      setQuestion("");
      setOptions(["", "", "", ""]);
      setAnswer("");
      setCategory("Matematika");
      setImage(null);
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan soal");
    }
  };

  return (
    <div className="page-container">
      <Sidebar active="add-tryout" />

      <div className="page-content">
        <h2>Tambah Soal Tryout</h2>

        <p><strong>Input Soal Manual (Pilihan Ganda):</strong></p>

        <textarea
          placeholder="Tuliskan soal..."
          value={question}
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
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Matematika">Matematika</option>
          <option value="Numerasi">Numerasi</option>
          <option value="Literasi">Literasi</option>
          <option value="Sains">Sains</option>
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <hr />

        <p><strong>Atau Upload File Soal (PDF / Excel / CSV):</strong></p>

        <input
          type="file"
          accept=".pdf,.xls,.xlsx,.csv"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={handleSubmit}>Simpan</button>
      </div>
    </div>
  );
};

export default AddTryout;
