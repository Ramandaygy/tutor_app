import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../../../services/api";
import "./literasi.css";

const LiterasiChatbot = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [showSoal, setShowSoal] = useState(false);
  const [soal, setSoal] = useState(null);
  const [penjelasanSoal, setPenjelasanSoal] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const theme ="literasi";

  // ✅ Ambil profil user
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setName(res.data.user?.name || res.data.user?.email || "User");
      } catch (err) {
        console.error("Gagal ambil profil:", err);
        navigate("/login");
      }
    };
    fetchProfile();
  }, [navigate]);

  // ✅ Ambil riwayat dari backend saat pertama kali masuk
  useEffect(() => {
    const fetchHistory = async () => {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) return;

      try {
        const res = await fetch(
          `http://localhost:5000/chatbot/get_history?user_id=${user_id}&theme=${theme}`
        );
        const data = await res.json();
        if (data.messages?.length > 0) {
          setMessages(data.messages);
        } else {
          const cached = localStorage.getItem("literasi_messages");
          if (cached) setMessages(JSON.parse(cached));
        }
      } catch (err) {
        console.error("Gagal ambil riwayat:", err);
      }
    };
    fetchHistory();
  }, []);

  // ✅ Simpan otomatis ke backend & localStorage
  useEffect(() => {
    const saveHistory = async () => {
      const user_id = localStorage.getItem("user_id");
      if (!user_id || messages.length === 0) return;
      localStorage.setItem("literasi_messages", JSON.stringify(messages));

      try {
        await fetch("http://localhost:5000/chatbot/save_history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id, theme, messages }),
        });
      } catch (err) {
        console.error("Gagal simpan riwayat:", err);
      }
    };
    saveHistory();
  }, [messages]);

  // ✅ Kirim pesan ke chatbot
  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { from: "user", text: input };
    const currentChatId = activeChatId || Date.now();
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    try {
      const response = await fetch("http://localhost:5000/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botReply = { from: "bot", text: data.answer };
      const finalMessages = [...updatedMessages, botReply];

      setMessages(finalMessages);
      updateHistory(currentChatId, finalMessages);

      // 🔹 Kirim feedback ke backend
      await fetch("http://localhost:5000/chatbot/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: localStorage.getItem("user_id"),
          theme: "literasi",
          score: 1,
        }),
      });
    } catch (error) {
      const botError = { from: "bot", text: "❌ Error: " + error.message };
      const finalMessages = [...updatedMessages, botError];
      setMessages(finalMessages);
      updateHistory(currentChatId, finalMessages);
    }

    setInput("");
  };

  // ✅ Ambil soal baru
  const handleSoalBaru = async () => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      alert("⚠️ User ID tidak ditemukan. Silakan login ulang terlebih dahulu.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/chatbot/get_question?theme=literasi&user_id=${userId}`
      );

      if (!res.ok) {
        throw new Error(`Gagal mengambil soal (${res.status})`);
      }

      const data = await res.json();
      setSoal(data);
      setShowSoal(true);
      setPenjelasanSoal(null);
    } catch (err) {
      console.error("Gagal ambil soal:", err);
    }
  };


  // ✅ Kirim jawaban ke backend
  const handleJawabSoal = async (opsi) => {
    try {
      const res = await fetch("http://localhost:5000/chatbot/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: localStorage.getItem("user_id"),
          theme: soal.theme,
          soal_id: soal.id,
          jawaban: opsi,
        }),
      });

      const data = await res.json();
      setPenjelasanSoal({
        benar: data.benar,
        jawaban_benar: data.jawaban_benar,
        penjelasan: data.penjelasan,
        progress: data.progress,
      });

      localStorage.setItem("progress", JSON.stringify(data.progress));
    } catch (err) {
      console.error("Gagal kirim jawaban:", err);
    }
  };

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: `Obrolan ${history.length + 1}`,
      messages: [],
    };
    setHistory((prev) => [newChat, ...prev]);
    setMessages([]);
    setSoal(null);
    setPenjelasanSoal(null);
    setShowSoal(false);
    setActiveChatId(newChat.id);
  };

  const handleLoadChat = (id) => {
    const chat = history.find((h) => h.id === id);
    if (chat) {
      setMessages(chat.messages);
      setActiveChatId(id);
      setSoal(null);
      setPenjelasanSoal(null);
    }
  };

  const updateHistory = (chatId, newMessages) => {
    setHistory((prev) => {
      const existingChat = prev.find((chat) => chat.id === chatId);
      if (existingChat) {
        return prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: newMessages,
                preview:
                  newMessages[newMessages.length - 1]?.text.slice(0, 20) + "...",
              }
            : chat
        );
      } else {
        return [
          {
            id: chatId,
            title: `Obrolan ${prev.length + 1}`,
            messages: newMessages,
            preview: newMessages[0]?.text.slice(0, 20) + "...",
          },
          ...prev,
        ];
      }
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;

      const newMessage = {
        from: "user",
        type: "image",
        image: base64Image,
        filename: file.name,
      };
      setMessages((prev) => [...prev, newMessage]);

      try {
        const response = await fetch(
          "http://localhost:5000/chatbot/analyze_image",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Image }),
          }
        );

        const data = await response.json();
        const botReply = {
          from: "bot",
          text: data.answer || "Tidak ada hasil analisis.",
        };
        setMessages((prev) => [...prev, botReply]);
      } catch (error) {
        const botError = { from: "bot", text: "❌ Gagal menganalisis gambar." };
        setMessages((prev) => [...prev, botError]);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleFeedback = async (rating, text) => {
    console.log("Rating diklik:", rating, "untuk:", text); // debug

    try {
      const user_id = localStorage.getItem("user_id");

      const res = await fetch("http://localhost:5000/chatbot/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          theme: "literasi",
          rating: rating,
          message: text,
        }),
      });

      const data = await res.json();
      console.log("Feedback terkirim:", data);

      // Update tampilan bintang di chat yg diklik
      setMessages((prev) =>
        prev.map((m) =>
          m.text === text ? { ...m, userRating: rating } : m
        )
      );

      // tampilkan popup
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    } catch (err) {
      console.error("❌ Gagal kirim feedback:", err);
    }
  };



  return (
    <div className="chatbot-container">
      {/* 🔹 Navbar */}
      <nav className="navbar">
        {/* Tombol Menu (ikon garis 3 seperti ChatGPT) */}
        <button
          className="menu-icon"
          onClick={() => setSidebarVisible(!sidebarVisible)}
          aria-label="Toggle Sidebar"
        >
          {sidebarVisible ? (
            // Ikon X (close)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            // Ikon hamburger (3 garis)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>


        <div className="logo">TutorPedia</div>
        <div className="nav-links">
          <button onClick={() => navigate("/home")}>🏠 Home</button>
          <button onClick={() => navigate("/progress")}>📊 Progress</button>
          <button onClick={() => navigate("/profile")}>{name}</button>
        </div>
      </nav>

      {/* 🔹 Overlay (mobile) */}
      {sidebarVisible && (
        <div className="overlay" onClick={() => setSidebarVisible(false)}></div>
      )}

      <div className="chatbot-layout">
        {/* 🔹 Sidebar Riwayat */}
      <div className={`chatbot-history ${sidebarVisible ? "show" : ""}`}>
        <h3>💬 Riwayat</h3>
        <button className="new-chat-btn" onClick={handleNewChat}>
          🆕 Obrolan Baru
        </button>

        {history.length === 0 && <p>Belum ada riwayat</p>}

        <ul>
          {history.map((h) => (
            <li
              key={h.id}
              className={activeChatId === h.id ? "active" : ""}
              onClick={() => handleLoadChat(h.id)}
            >
              <strong>{h.title}</strong>
              <p className="preview">{h.preview}</p>
            </li>
          ))}
        </ul>
      </div>


        {/* 🔹 Area Chat */}
        <div className="chatbot-main">
          <div className="literasi-header">
            <h2>Ruang Belajar - literasi</h2>
            <button className="soal-btn" onClick={handleSoalBaru}>
              + Soal Baru
            </button>
          </div>

         <div className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.from}`}>
              {/* Jika pesan berupa gambar */}
              {msg.type === "image" ? (
                <img
                  src={msg.image}
                  alt={msg.filename || "gambar"}
                  className="chat-image"
                />
              ) : (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              )}

              {/* Tombol feedback hanya untuk balasan bot */}
              {msg.from === "bot" && (
              <div className="rating-box">
                <p className="rating-label">Seberapa paham kamu dengan jawaban ini?</p>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <span
                      key={num}
                      className={`star ${msg.userRating >= num ? "selected" : ""}`}
                      onClick={() => handleFeedback(num, msg.text)} // 👈 pastikan ini terhubung
                      style={{ cursor: "pointer" }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            )}


            </div>
          ))}
        </div>


            <div className="chat-input">
            <input
              type="text"
              value={input}
              placeholder="Ketik pertanyaan kamu..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            

            {/* Upload file */}
            <input
              type="file"
              accept="image/*"
              id="imageUpload"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />

            {/* Ikon kamera */}
            <label htmlFor="imageUpload" className="upload-btn" title="Upload gambar">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </label>

            {/* Ikon kirim */}
            <button onClick={handleSend} className="send-btn" title="Kirim pesan">
               ➤
            </button>
          </div>

        </div>

        {/* 🔹 Panel Soal */}
        <div className={`chatbot-soal ${showSoal ? "active" : ""}`}>
          <h3>📚 Soal Baru</h3>
          {soal ? (
            <div className="soal-card">
              <p className="pertanyaan">{soal.pertanyaan}</p>
              <ul>
                {soal.opsi.map((o, i) => (
                  <li key={i}>
                    <button onClick={() => handleJawabSoal(o)}>{o}</button>
                  </li>
                ))}
              </ul>

              {penjelasanSoal && (
                <div className="penjelasan-box">
                  <p className={penjelasanSoal.benar ? "benar" : "salah"}>
                    {penjelasanSoal.benar ? "✅ Jawaban Kamu Benar!" : "❌ Jawabanmu Salah!"}
                  </p>
                  <p>
                    <strong>Jawaban yang benar:</strong> {penjelasanSoal.jawaban_benar}
                  </p>
                  <p className="info">💡 {penjelasanSoal.penjelasan}</p>
                </div>
              )}
            </div>
          ) : (
            <p>Klik tombol soal baru untuk mulai</p>
          )}
        </div>
      </div>
      {/* 🔹 Popup Feedback */}
      {showPopup && <div className="popup-box">✅ Terima kasih atas feedback kamu!</div>}
    </div>
  );
};

export default LiterasiChatbot;
