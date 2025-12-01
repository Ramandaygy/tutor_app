import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserTable from "../components/UserTable";
import ProgressDetail from "../components/ProgressDetail";
import Sidebar from "../components/Sidebar";


const UsersPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeSection, setActiveSection] = useState("users");
  const navigate = useNavigate();

  const lastLogin = new Date().toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <div className="users-page-container">
      {/* 🔹 Sidebar */}
      <Sidebar
        active={activeSection}
        onSelect={(id) => {
          setActiveSection(id);
          if (id === "stats") navigate("/dashboard");
          if (id === "chart") navigate("/activity");
          if (id === "users") navigate("/users");
          if (id === "progress") navigate("/progress");
        }}
      />

      {/* 🔹 Main Content */}
      <div className="users-main-content">
        
        {/* 🔹 Content Area */}
        <div className="users-content-area">
          {!selectedUser ? (
            <UserTable onSelectUser={setSelectedUser} />
          ) : (
            <ProgressDetail 
              userId={selectedUser} 
              onBack={() => setSelectedUser(null)} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;