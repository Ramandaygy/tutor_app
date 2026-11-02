# 📚 Tutor Pedia - Online Tutoring & Learning Platform

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Backend-Flask_Python-000000?style=for-the-badge&logo=flask&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Internship Project](https://img.shields.io/badge/Project-Software_Engineering_Internship-blue?style=for-the-badge)

**Tutor Pedia** adalah platform pembelajaran dan bimbingan belajar *online* berbasis web yang dikembangkan selama masa magang sebagai *Software Engineer Intern* di PT Git Solution. Platform ini memfasilitasi pengolahan materi pembelajaran, manajemen pengguna, pengerjaan kuis/tryout, hingga peninjauan nilai secara real-time.

---

## 🏗️ Arsitektur System

Project ini dibangun dengan arsitektur *monorepo* yang memisahkan aplikasi menjadi beberapa modul utama:

- **`frontend/`**: Web application utama untuk siswa/pengguna umum (React.js).
- **`frontend_admin/`**: Dashboard manajemen khusus admin & instruktur untuk kelola modul, kuis, dan tryout (React.js).
- **`backend/`**: RESTful API engine penanganan logika bisnis dan autentikasi (Flask/Python).
- **`backup_mongo/tutor_app`**: Skema database dan *backup* awal data aplikasi (MongoDB).

---

## ✨ Fitur Utama

### 👥 User Portal
- **Modul Pembelajaran:** Akses materi pembelajaran dan latihan soal.
- **Kuis & Tryout Interaktif:** Pengerjaan soal online dengan timer dan evaluasi jawaban.
- **Review Hasil Test:** Peninjauan ulang jawaban dan pembahasan setelah *submit* kuis.

### ⚙️ Admin Portal
- **Manajemen Content & Modul:** Pengelolaan materi, bank soal, dan kategori kuis.
- **Manajemen Tryout:** Pengaturan jadwal dan parameter penilaian tryout.
- **User Analytics:** Pemantauan progres siswa dan rekapitulasi nilai.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Python, Flask RESTful API
- **Database:** MongoDB
- **Tools & Workflow:** Postman (API Testing), Git & GitHub, VS Code

---

## 🔍 Quality Assurance & Testing Relevance

Sebagai project berskala produksi industri, komponen dari aplikasi ini dirancang untuk dapat diuji secara menyeluruh:
- **API Validation:** Pengujian endpoint REST API pada backend Flask (status codes, payload validation, JSON responses) menggunakan Postman.
- **End-to-End Workflow:** Pengujian skenario alur pengguna mulai dari pendaftaran, pengerjaan kuis, hingga peninjauan nilai pada portal siswa dan admin.

---

## 🚀 Cara Menjalankan Project (Local Setup)

### Prasyarat
- Node.js (v16+) & npm
- Python 3.x & `pip`
- MongoDB (Local / Atlas Instance)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Aktifkan virtualenv (Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
python app.py
