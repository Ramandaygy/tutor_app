import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ModuleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [kelas, setKelas] = useState("");
  const [mapel, setMapel] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/admin/modules/${id}`)
      .then(res => {
        setTitle(res.data.title);
        setKelas(res.data.kelas);
        setMapel(res.data.mapel);
      });
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("kelas", kelas);
    formData.append("mapel", mapel);
    if (file) formData.append("file", file);

    await axios.put(`http://localhost:5000/admin/modules/${id}`, formData);
    alert("Modul berhasil diupdate");
    navigate("/admin/modules");
  };

  return (
    <form onSubmit={submit}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <input value={kelas} onChange={e => setKelas(e.target.value)} />
      <input value={mapel} onChange={e => setMapel(e.target.value)} />
      <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} />
      <button>Simpan Perubahan</button>
    </form>
  );
}
