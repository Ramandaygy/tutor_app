import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./soal.css";

const SoalTryout = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [markedQuestions, setMarkedQuestions] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  // ================= FETCH SOAL =================
  useEffect(() => {
    const fetchSoal = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/admin/tryout/soal"
        );

        console.log("RESP DARI BACKEND:", res.data);

        const soal =
          res.data.questions ||
          res.data.data ||
          (Array.isArray(res.data) ? res.data : []);

        setQuestions(soal);
        setUserAnswers(Array(soal.length).fill(null));
        setMarkedQuestions(Array(soal.length).fill(false));
      } catch (err) {
        console.error("Gagal fetch soal:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSoal();
  }, []);


  if (loading) return <p style={{ padding: 20 }}>Loading soal...</p>;
  if (questions.length === 0)
    return <p style={{ padding: 20 }}>Tidak ada soal.</p>;

  // ================= NAVIGATION =================
  const loadQuestion = (index) => setCurrentQuestion(index);
  const prevQuestion = () =>
    currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1);
  const nextQuestion = () =>
    currentQuestion < questions.length - 1
      ? setCurrentQuestion(currentQuestion + 1)
      : setQuizCompleted(true);

  const toggleMarkQuestion = () => {
    const copy = [...markedQuestions];
    copy[currentQuestion] = !copy[currentQuestion];
    setMarkedQuestions(copy);
  };

  // ================= ANSWER HANDLER =================
  const setAnswer = (index, value) => {
    setUserAnswers((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };



  // ================= RESULT =================
  const calculateResults = () => {
    let correct = 0;
    let totalMC = 0;

    questions.forEach((q, i) => {
      if (q.type === "multiple_choice") {
        totalMC++;
        if (
          userAnswers[i] !== null &&
          q.options[userAnswers[i]] === q.answer
        ) {
          correct++;
        }
      }
    });

    const score = totalMC > 0 ? (correct / totalMC) * 100 : 0;
    return { correct, totalMC, score };
  };

  // ================= QUESTION COMPONENT =================
  const QuestionComponent = ({ question, index }) => {
    const type = (question.type || "").toLowerCase();

    if (type === "multiple_choice" || type === "pg" || type === "pilgan") {
      return <MultipleChoice question={question} index={index} />;
    }

    if (type === "essay") {
      return <Essay question={question} index={index} />;
    }

    return (
      <p style={{ color: "red" }}>
        ⚠️ Tipe soal tidak dikenal: {question.type}
      </p>
    );
  };


  // ================= PILIHAN GANDA =================
  const MultipleChoice = ({ question, index }) => {
    const optionLetters = ["A", "B", "C", "D"];
    const userAnswer = userAnswers[index];
    const correctIndex = question.options.indexOf(question.answer);

    return (
      <div className="question-container">
        <div className="question-header">
          <h3>{index + 1}. Soal Pilihan Ganda</h3>
          <button
            className={`mark-btn ${markedQuestions[index] ? "marked" : ""}`}
            onClick={toggleMarkQuestion}
          >
            🚩
          </button>
        </div>

        <p className="question-text">{question.question}</p>

        {question.image_url && (
          <img
            src={`http://localhost:5000${question.image_url}`}
            alt="Soal"
            className="question-image"
          />
        )}

        <div className="options-container">
          {question.options.map((opt, i) => (
            <div
              key={i}
              className={`option ${
                userAnswer !== null
                  ? i === correctIndex
                    ? "correct"
                    : i === userAnswer
                    ? "wrong"
                    : ""
                  : ""
              }`}
              onClick={() => userAnswer === null && setAnswer(index, i)}

            >
              <span className="option-letter">{optionLetters[i]}</span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ================= ESSAY =================
  const Essay = ({ question, index }) => {
    return (
      <div className="question-container">
        <div className="question-header">
          <h3>{index + 1}. Soal Essay</h3>
          <button
            type="button"
            className={`mark-btn ${markedQuestions[index] ? "marked" : ""}`}
            onClick={toggleMarkQuestion}
          >
            🚩
          </button>

        </div>

        <p className="question-text">{question.question}</p>

        <textarea
          className="essay-textarea"
          placeholder="Tulis jawaban kamu di sini..."
          rows={6}
          value={userAnswers[index] ?? ""}
          onChange={(e) => setAnswer(index, e.target.value)}
        />


        {quizCompleted && (
          <div className="explanation-box">
            <h4>Pedoman Jawaban</h4>
            <p>{question.answer_desc}</p>
          </div>
        )}
      </div>
    );
  };



  // ================= RESULT COMPONENT =================
  const ResultComponent = () => {
    const { correct, totalMC, score } = calculateResults();

    return (
      <div className="result-container">
        <h2>🎉 Hasil Tryout</h2>

        <div className="score-circle">
          {score.toFixed(0)}
        </div>

        <p className="score-text">
          Benar {correct} dari {totalMC} soal pilihan ganda
        </p>

        <div className="result-buttons">
          <button className="btn ulangi" onClick={() => window.location.reload()}>
            🔄 Ulangi
          </button>
          <button className="btn kembali" onClick={() => navigate("/home")}>
            🏠 Kembali
          </button>
        </div>
      </div>
    );
  };


  // ================= REVIEW COMPONENT =================
  const ReviewComponent = () => {
    return (
      <div className="review-wrapper">
        <h3>📘 Ulasan Jawaban</h3>

        <div className="review-scroll">
          {questions.map((q, i) => {
            const isCorrect =
              q.type === "multiple_choice" &&
              userAnswers[i] !== null &&
              q.options[userAnswers[i]] === q.answer;

            return (
              <div
                key={i}
                className={`review-card ${isCorrect ? "correct" : "wrong"}`}
              >
                <h4>{i + 1}. {q.question}</h4>

                {q.type === "multiple_choice" && (
                  <>
                    <p>✍️ Jawaban kamu: <b>{userAnswers[i] !== null ? q.options[userAnswers[i]] : "Tidak dijawab"}</b></p>
                    <p>✅ Jawaban benar: <b>{q.answer}</b></p>
                  </>
                )}

                {q.type === "essay" && (
                  <>
                    <p><b>✍️ Jawaban kamu:</b></p>
                    <div className="essay-box">{userAnswers[i] || "Belum dijawab"}</div>

                    <p><b>📌 Pedoman Jawaban:</b></p>
                    <div className="guide-box">{q.answer_desc || "-"}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };






  // ================= UI =================
  return (
    <div className="latsoal-container">
      <div className="main-content">

        {/* 🔥 SIDEBAR HANYA MUNCUL SAAT MENGERJAKAN */}
        {!quizCompleted && (
          <div className="sidebar">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Kembali
            </button>

            <h3>Navigasi Soal</h3>
            <div className="question-numbers-grid">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`question-number-item 
                    ${i === currentQuestion ? "active" : ""} 
                    ${userAnswers[i] !== null ? "answered" : ""} 
                    ${markedQuestions[i] ? "marked" : ""}`}
                  onClick={() => loadQuestion(i)}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* 🔥 KETERANGAN */}
            <div className="legend">
              <h4>Keterangan</h4>
              <div><span className="dot answered"></span> Sudah dijawab</div>
              <div><span className="dot marked"></span> Ditandai</div>
              <div><span className="dot empty"></span> Belum dijawab</div>
            </div>

            {/* 🔥 RINGKASAN */}
            <div className="summary">
              <h4>Ringkasan</h4>
              <p>Dijawab: {userAnswers.filter(x => x !== null).length}</p>
              <p>Ditandai: {markedQuestions.filter(x => x).length}</p>
              <p>Belum: {questions.length - userAnswers.filter(x => x !== null).length}</p>
            </div>
          </div>
        )}

        {/* 🔥 CONTENT AREA */}
        <div className="content-area">
          {!quizCompleted ? (
            <>
              <QuestionComponent
                question={questions[currentQuestion]}
                index={currentQuestion}
              />

              <div className="navigation-buttons">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                >
                  Sebelumnya
                </button>

                <button onClick={nextQuestion}>
                  {currentQuestion === questions.length - 1
                    ? "Selesai"
                    : "Berikutnya"}
                </button>
              </div>
            </>
          ) : (
            <>
              <ResultComponent />
              <ReviewComponent />
            </>
          )}
        </div>

      </div>
    </div>
  );

};

export default SoalTryout;
