import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({ menuItems }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      width: "250px",
      background: "#1e3a8a",
      color: "white",
      minHeight: "100vh",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>

      <div>
        <h2 style={{ marginBottom: "30px" }}>📊 Student Dashboard</h2>

        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            style={{
              display: "block",
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "8px",
              textDecoration: "none",
              color: "white",
              background:
                location.pathname === item.path ? "#2563eb" : "transparent",
              transition: "0.3s"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#3b82f6";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background =
                location.pathname === item.path ? "#2563eb" : "transparent";
              e.target.style.transform = "scale(1)";
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Logout Button bottom */}
      <button
        onClick={() => {
          localStorage.removeItem("user");
          navigate("/");
        }}
        style={{
          padding: "12px",
          background: "#ef4444",
          border: "none",
          borderRadius: "8px",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold"
        }}
        onMouseEnter={(e) => (e.target.style.background = "#dc2626")}
        onMouseLeave={(e) => (e.target.style.background = "#ef4444")}
      >
        🚪 Logout
      </button>
    </div>
  );
}