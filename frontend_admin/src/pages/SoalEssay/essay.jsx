import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { addTryoutQuestion } from "../../services/Api";
import "../../styles/essay.css";

const AddEssay = () => {
  const [question, setQuestion] = useState("");
  const [answerKey, setAnswerKey] = useState("");
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("Literasi");

  const handleSubmit = async () => {
    if (!question || !answerKey) {
      alert("Semua field wajib diisi");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("type", "essay");
      formData.append("question", question);
      formData.append("answer_desc", answerKey);
      formData.append("keywords", keywords); // "a,b,c"
      formData.append("category", category);

      const res = await addTryoutQuestion(formData);

      alert(res.data.message || "Soal essay berhasil ditambahkan");

      setQuestion("");
      setAnswerKey("");
      setKeywords("");
      setCategory("Literasi");
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan soal essay");
    }
  };

  return (
    <div className="page-container">
      <Sidebar active="essay-add" />

      <div className="page-content">
        <h2>✍️ Tambah Soal Essay</h2>

        <label>Soal Essay</label>
        <textarea
          placeholder="Tuliskan soal essay di sini..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <label>Kunci Jawaban (Deskripsi)</label>
        <textarea
          placeholder="Tuliskan jawaban ideal / pedoman penilaian..."
          value={answerKey}
          onChange={(e) => setAnswerKey(e.target.value)}
        />

        <label>Kata Kunci Jawaban</label>
        <input
          type="text"
          placeholder="Pisahkan dengan koma"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />

        <label>Kategori</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Literasi">Literasi</option>
          <option value="Numerasi">Numerasi</option>
          <option value="Sains">Sains</option>
        </select>

        <button onClick={handleSubmit}>Simpan Soal Essay</button>
      </div>
    </div>
  );
};

export default AddEssay;
