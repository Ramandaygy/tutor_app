import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./modul.css";

const ModuleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/modules/${id}`).then((res) => {
      setModule(res.data);
    });
  }, [id]);

  if (!module) return <p>Loading...</p>;

  return (
    <div className="modul-container">
      <h1>{module.title}</h1>

      <div className="bab-list">
        {module.content.map((bab, index) => (
          <div
            key={index}
            className="bab-card"
            onClick={() =>
              navigate(`/modules/${id}/bab/${index}`)
            }
          >
            📘 Bab {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleDetail;
