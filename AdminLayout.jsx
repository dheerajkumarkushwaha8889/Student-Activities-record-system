import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ display: "flex" }}>

      {/* SIDEBAR (FIXED) */}
      <div style={{
        width: "250px",
        height: "100vh",
        position: "fixed",   // ✅ IMPORTANT
        top: 0,
        left: 0,
        background: "linear-gradient(180deg, #1442ac, #12469b)",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}>

        <div>
          <h2 style={{ marginBottom: "20px" }}>
            🛠 Admin Dashboard
          </h2>

          <p style={linkStyle(location, "/admin")} onClick={() => navigate("/admin")}>
            📊 Dashboard
          </p>

          <p style={linkStyle(location, "/admin/records")} onClick={() => navigate("/admin/records")}>
            📋 All Records
          </p>

          <p 
           style={linkStyle(location, "/admin/portfolio")} 
           onClick={() => navigate("/admin/portfolio")} >
             📁 Generate Portfolio
       </p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("user");
            navigate("/");
          }}
          style={logoutBtn}
        >
          🚪 Logout
        </button>

      </div>

      {/* MAIN CONTENT */}
      <div style={{
        marginLeft: "250px",   // ✅ sidebar ke barabar space
        width: "100%",
        height: "100vh",
        overflowY: "auto",
        padding: "20px",
        background: "#f1f5f9"
      }}>
        <Outlet />
      </div>

    </div>
  );
}

/* styles */
const linkStyle = (location, path) => ({
  padding: "10px",
  borderRadius: "6px",
  cursor: "pointer",
  marginBottom: "10px",
  background: location.pathname === path ? "#263852" : "transparent"
});

const logoutBtn = {
  background: "#ef4444",
  color: "white",
  padding: "10px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};