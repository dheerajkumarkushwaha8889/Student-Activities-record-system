import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function FacultyLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <div style={{ display: "flex" }}>

      {/* SIDEBAR */}
      <div
        style={{
          width: "250px",
          background: "linear-gradient(180deg, #2e5abe, #1e293b)",
          color: "white",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0
        }}
      >

        {/* TOP SECTION */}
        <div>
          <h2 style={{ marginBottom: "10px" }}>
            👨‍🏫 Faculty Panel
          </h2>

          <p style={{ fontSize: "14px", opacity: 0.8, marginBottom: "20px" }}>
            {user.name}
          </p>

          {/* MENU */}
          <p
            style={menuStyle(location.pathname === "/faculty")}
            onClick={() => navigate("/faculty")}
          >
            📊 Dashboard
          </p>

          <p
            style={menuStyle(location.pathname === "/faculty/verify")}
            onClick={() => navigate("/faculty/verify")}
          >
            ✅ Verify Activities
          </p>
        </div>

        {/* 🔥 LOGOUT BUTTON */}
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

      {/* MAIN CONTENT */}
      <div
        style={{
          marginLeft: "250px",
          padding: "20px",
          height: "100vh",
          overflowY: "auto",
          flex: 1,
          background: "#f3f4f6"
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}

/* STYLES */
const menuStyle = (active) => ({
  padding: "12px",
  marginBottom: "10px",
  borderRadius: "8px",
  cursor: "pointer",
  background: active ? "#2563eb" : "transparent",
  transition: "0.3s"
});

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