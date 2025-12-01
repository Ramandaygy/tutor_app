import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./tryout.css";

// Komponen dekorasi samping
const SideDecorations = ({ currentCategory }) => {
  const leftImages = {
    numerik: ["🔢", "📐", "🧮", "🔺", "⭐"],
    literasi: ["📚", "✏️", "📖", "🔤", "📝"],
    sains: ["🔬", "🌱", "⚗️", "🔍", "💡"]
  };

  const rightImages = {
    numerik: ["➗", "✖️", "➕", "➖", "📊"],
    literasi: ["📚", "📰", "📓", "✒️", "🔠"],
    sains: ["🌿", "🔭", "🧪", "🌡️", "🔦"]
  };

  const currentLeft = leftImages[currentCategory] || leftImages.numerik;
  const currentRight = rightImages[currentCategory] || rightImages.numerik;

  return (
    <>
      <div className="left-decoration">
        {currentLeft.map((emoji, index) => (
          <div 
            key={index} 
            className="decoration-item"
            style={{ animationDelay: `${index * 0.3}s` }}
          >
            {emoji}
          </div>
        ))}
      </div>
      <div className="right-decoration">
        {currentRight.map((emoji, index) => (
          <div 
            key={index} 
            className="decoration-item"
            style={{ animationDelay: `${index * 0.3 + 0.1}s` }}
          >
            {emoji}
          </div>
        ))}
      </div>
    </>
  );
};

const TryoutPage = () => {
  const [soalList, setSoalList] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResultModal, setShowResultModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tryoutResult, setTryoutResult] = useState(null);
  const navigate = useNavigate();

  // State untuk melacak apakah user sudah memilih jawaban untuk soal ini
  const [answeredQuestions, setAnsweredQuestions] = useState({});

  // Gambar untuk setiap kategori
  const categoryImages = {
    numerik: "🔢",
    literasi: "📚",
    sains: "🔬"
  };

  // Gambar hewan untuk variasi
  const animalEmojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯"];

  // === Ambil soal dari backend ===
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/soal")
      .then((res) => setSoalList(res.data))
      .catch((err) => console.error("Gagal memuat soal:", err));
  }, []);

  // === Navigasi soal ===
  const goToQuestion = (index) => setCurrentQuestionIndex(index);

  // === Handle pilihan jawaban ===
  const handleAnswer = (no, option) => {
    const currentSoal = soalList.find(soal => soal.no === no);
    
    // Jika belum ada jawaban untuk soal ini, simpan jawaban
    if (!answeredQuestions[no]) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [no]: option
      }));
      
      // Tandai bahwa soal ini sudah dijawab
      setAnsweredQuestions((prev) => ({
        ...prev,
        [no]: true
      }));
    }
    // Jika sudah ada jawaban, tidak lakukan apa-apa (user tidak bisa ganti)
  };

  const goToNext = () =>
    currentQuestionIndex < soalList.length - 1 &&
    setCurrentQuestionIndex(currentQuestionIndex + 1);

  const goToPrev = () =>
    currentQuestionIndex > 0 && setCurrentQuestionIndex(currentQuestionIndex - 1);

  // === Hitung hasil tryout ===
  const calculateResult = () => {
    let correct = 0;
    soalList.forEach((soal) => {
      if (selectedAnswers[soal.no] === soal.jawaban_benar) correct++;
    });

    const score = ((correct / soalList.length) * 100).toFixed(2);
    const unanswered = soalList.length - Object.keys(selectedAnswers).length;

    // Tentukan pesan berdasarkan skor
    let message = "";
    let emoji = "🎉";
    
    if (score >= 90) {
      message = "Luar biasa! Kamu jenius! 🌟";
      emoji = "🏆";
    } else if (score >= 80) {
      message = "Hebat! Kamu pintar sekali! ✨";
      emoji = "⭐";
    } else if (score >= 70) {
      message = "Bagus! Terus belajar ya! 📚";
      emoji = "👍";
    } else if (score >= 60) {
      message = "Lumayan! Ayo tingkatkan lagi! 💪";
      emoji = "📈";
    } else {
      message = "Jangan menyerah! Terus berlatih! 🎯";
      emoji = "🔥";
    }

    return {
      correct,
      total: soalList.length,
      score,
      unanswered,
      message,
      emoji
    };
  };

  // === Submit tryout ===
  const submitTryout = () => {
    const result = calculateResult();
    setTryoutResult(result);
    setShowResultModal(true);
    setShowConfirmModal(false);
  };

  // === Handle konfirmasi submit ===
  const handleSubmitClick = () => {
    const unanswered = soalList.length - Object.keys(selectedAnswers).length;
    
    if (unanswered > 0) {
      setShowConfirmModal(true);
    } else {
      submitTryout();
    }
  };

  // === Render Navigasi Soal dengan gambar ===
  const renderNavigation = () => (
    <div className="question-navigation">
      <h3>🗺️ Navigasi Soal</h3>
      <div className="nav-buttons">
        {soalList.map((soal, i) => {
          const isActive = i === currentQuestionIndex;
          const isAnswered = answeredQuestions[soal?.no] !== undefined;
          const category = soal?.kategori?.toLowerCase() || "numerik";
          
          return (
            <button
              key={i}
              onClick={() => goToQuestion(i)}
              className={`nav-btn ${isActive ? "active" : ""} ${
                isAnswered ? "answered" : ""
              } ${category}`}
            >
              <span className="nav-number">{i + 1}</span>
              <span className="nav-category-icon">
                {categoryImages[category] || "📝"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const currentSoal = soalList[currentQuestionIndex];
  const currentCategory = currentSoal?.kategori?.toLowerCase() || "numerik";
  const currentAnswer = selectedAnswers[currentSoal?.no];
  const isAnswered = answeredQuestions[currentSoal?.no];

  return (
    <div className="tryout-container">
      {/* Dekorasi samping kiri dan kanan */}
      <SideDecorations currentCategory={currentCategory} />

      <header className="tryout-header">
        <h1>🎯 TRYOUT UJIAN NASIONAL SD</h1>
        <div className="exam-info">
          <div className="exam-details">
            <h2>📖 Mata Pelajaran: Campuran</h2>
            <p>📊 Jumlah Soal: {soalList.length}</p>
          </div>
          <div className="animal-friends">
            {animalEmojis.slice(0, 4).map((animal, index) => (
              <span key={index} className="animal-emoji">{animal}</span>
            ))}
          </div>
        </div>
      </header>

      {renderNavigation()}

      {currentSoal ? (
        <div className="question-container">
          <div className="question-header">
            <span className="question-number">
              📝 Soal Nomor {currentQuestionIndex + 1}
            </span>
            <span className={`question-type type-${currentCategory}`}>
              <span className="category-icon">
                {categoryImages[currentCategory] || "📝"}
              </span>
              {currentSoal.kategori?.toUpperCase() || "UMUM"}
            </span>
          </div>

          <div className="question-content">
            {/* Tambahkan ilustrasi berdasarkan kategori */}
            <div className="question-illustration">
              {currentCategory === 'numerik' && (
                <div className="math-symbols">
                  <span>➕</span><span>➖</span><span>✖️</span><span>➗</span>
                </div>
              )}
              {currentCategory === 'sains' && (
                <div className="science-icons">
                  <span>🔬</span><span>🌱</span><span>🔍</span><span>💡</span>
                </div>
              )}
              {currentCategory === 'literasi' && (
                <div className="literacy-icons">
                  <span>📖</span><span>✏️</span><span>📝</span><span>🔤</span>
                </div>
              )}
            </div>
            {currentSoal.pertanyaan}
          </div>

          {/* === Pilihan Jawaban === */}
          <div className="options-container">
            {Object.entries(currentSoal.opsi).map(([key, value]) => (
              <div
                key={key}
                className={`option-card ${
                  currentAnswer === key ? "selected" : ""
                } ${isAnswered ? "disabled" : ""}`}
                onClick={() => !isAnswered && handleAnswer(currentSoal.no, key)}
              >
                <div className="option-letter">
                  {key}
                  {currentAnswer === key && (
                    <span className="selection-indicator">✓</span>
                  )}
                </div>
                <div className="option-text">{value}</div>
                {isAnswered && currentAnswer !== key && (
                  <div className="option-disabled-overlay"></div>
                )}
              </div>
            ))}
          </div>

          {/* === Feedback HANYA untuk jawaban yang dipilih === */}
          {isAnswered && (
            <div className="answer-feedback">
              {currentAnswer === currentSoal.jawaban_benar ? (
                <div className="correct-answer">
                  <p className="correct-text">
                    🎉 Horee! Jawaban kamu benar!
                  </p>
                  <div className="celebration">
                    <span>✨</span><span>🌟</span><span>🎊</span>
                  </div>
                </div>
              ) : (
                <div className="wrong-answer">
                  <p className="wrong-text">
                    ❌ Wah, jawaban kamu belum tepat
                  </p>
                </div>
              )}
              
              {/* Pembahasan muncul hanya untuk jawaban yang dipilih */}
              <div className="explanation-section">
                <p className="explanation-text">
                  <strong>💡 Jawaban yang benar:</strong> {currentSoal.jawaban_benar}
                  {currentSoal.pembahasan && (
                    <>
                      <br />
                      <strong>📚 Penjelasan:</strong> {currentSoal.pembahasan}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* === Tombol Navigasi === */}
          <div className="action-buttons">
            <button
              className="btn-prev"
              onClick={goToPrev}
              disabled={currentQuestionIndex === 0}
            >
              ⬅️ Soal Sebelumnya
            </button>
            <button
              className="btn-next"
              onClick={goToNext}
              disabled={currentQuestionIndex === soalList.length - 1}
            >
              Soal Berikutnya ➡️
            </button>
            <button
              className="btn-submit"
              onClick={handleSubmitClick}
            >
              🏁 Kumpulkan Tryout
            </button>
          </div>
        </div>
      ) : (
        <div className="loading-container">
          <p className="loading-text">🔄 Memuat soal...</p>
          <div className="loading-animals">
            {animalEmojis.slice(0, 3).map((animal, index) => (
              <span key={index} className="bouncing-animal">{animal}</span>
            ))}
          </div>
        </div>
      )}

      <footer className="tryout-footer">
        <p>© 2023 Tryout Ujian Online. Semua hak cipta dilindungi.</p>
        <div className="footer-emoji">🐶🐱🐭🐹🐰</div>
      </footer>

      {/* Modal Konfirmasi Submit */}
      {showConfirmModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-emoji">🤔</div>
            <h3 className="confirm-title">Tunggu dulu!</h3>
            <p className="confirm-message">
              Masih ada {soalList.length - Object.keys(selectedAnswers).length} soal yang belum dijawab. 
              Yakin mau kumpulkan sekarang?
            </p>
            <div className="confirm-buttons">
              <button 
                className="confirm-btn confirm-btn-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                🔄 Lanjutkan Mengerjakan
              </button>
              <button 
                className="confirm-btn confirm-btn-submit"
                onClick={submitTryout}
              >
                ✅ Ya, Kumpulkan!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hasil Tryout */}
      {showResultModal && tryoutResult && (
        <div className="result-modal-overlay">
          <div className="result-modal">
            <div className="result-content">
              <div className="result-emoji">{tryoutResult.emoji}</div>
              <h2 className="result-title">Selamat! Tryout Selesai!</h2>
              
              <div className="result-score">{tryoutResult.score}</div>
              
              <div className="result-details">
                <div className="result-detail-item">
                  <span className="result-detail-label">✅ Jawaban Benar:</span>
                  <span className="result-detail-value">
                    {tryoutResult.correct} / {tryoutResult.total}
                  </span>
                </div>
                <div className="result-detail-item">
                  <span className="result-detail-label">❓ Tidak Dijawab:</span>
                  <span className="result-detail-value">
                    {tryoutResult.unanswered} soal
                  </span>
                </div>
              </div>

              <p className="result-message">{tryoutResult.message}</p>

              <div className="result-buttons">
                <button 
                  className="result-btn result-btn-home"
                  onClick={() => navigate("/home")}
                >
                  🏠 Kembali ke Home
                </button>
                <button 
                  className="result-btn result-btn-review"
                  onClick={() => setShowResultModal(false)}
                >
                  🔍 Lihat Kembali Soal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TryoutPage;