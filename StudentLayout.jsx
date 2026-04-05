import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <div style={{ display: "flex" }}>

      {/* ✅ FIXED SIDEBAR */}
      <div
        style={{
          width: "250px",
          background: "linear-gradient(180deg, #1e3a8a, #2563eb)",
          color: "white",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "fixed",      // 🔥 FIXED
          height: "100vh",
          left: 0,
          top: 0
        }}
      >
        <div>
          {/* HEADER */}
          <h2
            style={{
              marginBottom: "10px",
              whiteSpace: "nowrap",
              fontSize: "18px",
              fontWeight: "bold"
            }}
          >
            📊 Student Dashboard
          </h2>

          {/* USER NAME */}
          <p style={{ fontSize: "14px", opacity: 0.8, marginBottom: "20px" }}>
            {user.name}
          </p>

          {/* MENU */}
          <p
            style={{
              ...linkStyle,
              background:
                location.pathname === "/student" ? "#1d4ed8" : "transparent"
            }}
            onClick={() => navigate("/student")}
            onMouseEnter={(e) => {
              e.target.style.background = "#3b82f6";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background =
                location.pathname === "/student"
                  ? "#1d4ed8"
                  : "transparent";
              e.target.style.transform = "scale(1)";
            }}
          >
            📊 Dashboard
          </p>

          <p
            style={{
              ...linkStyle,
              marginLeft: "10px",
              background:
                location.pathname === "/student/submit"
                  ? "#1d4ed8"
                  : "transparent"
            }}
            onClick={() => navigate("/student/submit")}
            onMouseEnter={(e) => {
              e.target.style.background = "#3b82f6";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background =
                location.pathname === "/student/submit"
                  ? "#1d4ed8"
                  : "transparent";
              e.target.style.transform = "scale(1)";
            }}
          >
            ➕ Submit Activity
          </p>

          <p
            style={{
              ...linkStyle,
              marginLeft: "10px",
              background:
                location.pathname === "/student/my"
                  ? "#1d4ed8"
                  : "transparent"
            }}
            onClick={() => navigate("/student/my")}
            onMouseEnter={(e) => {
              e.target.style.background = "#3b82f6";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background =
                location.pathname === "/student/my"
                  ? "#1d4ed8"
                  : "transparent";
              e.target.style.transform = "scale(1)";
            }}
          >
            📄 My Activities
          </p>
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => {
            localStorage.removeItem("user");
            navigate("/");
          }}
          style={logoutBtn}
          onMouseEnter={(e) => {
            e.target.style.background = "#dc2626";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#ef4444";
            e.target.style.transform = "scale(1)";
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* ✅ SCROLLABLE MAIN CONTENT */}
      <div
        style={{
          marginLeft: "250px",   // 🔥 IMPORTANT
          flex: 1,
          padding: "30px",
          background: "#f3f4f6",
          height: "100vh",
          overflowY: "auto"     // 🔥 ONLY CONTENT SCROLL
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}

/* STYLES */
const linkStyle = {
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "10px",
  cursor: "pointer",
  transition: "0.3s"
};

const logoutBtn = {
  background: "#ef4444",
  color: "white",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "0.3s"
};