import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landingpage/landingpage.jsx";
import Login from "./components/login/login";
import Register from "./components/register/register";
import Profile from "./components/profile/profile";
import Progress from "./components/progress/progress";
import TryoutPage from "./components/tryoutpage/tryoutpage";
import Home from "./components/home/home";

// Import chatbot sesuai tema dengan nama berbeda
import LiterasiChatbot from "./components/chatbot/literasi/literasi";
import NumerikChatbot from "./components/chatbot/numerik/numerik";
import SainsChatbot from "./components/chatbot/sains/sains";

import "./App.css";
import ArticleDetail from "./components/articledetail/articledetail.jsx";
import Tentang from "./components/tentang/tentang.jsx";
import Contact from "./components/contact/contact.jsx";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Chatbot sesuai tema */}
          <Route path="/literasi" element={<LiterasiChatbot />} />
          <Route path="/numerik" element={<NumerikChatbot />} />
          <Route path="/sains" element={<SainsChatbot />} />
          
          <Route path="/progress" element={<Progress />} />
          <Route path="//tryout" element={<TryoutPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
