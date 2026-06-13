import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation
} from "react-router-dom";

/* STUDENT */
import StudentDashboard from "./pages/StudentDashboard.jsx";
import StudentLayout from "./pages/StudentLayout.jsx";
import SubmitActivity from "./pages/SubmitActivity.jsx";
import MyActivities from "./pages/MyActivities.jsx";

/* FACULTY */
import FacultyLayout from "./pages/FacultyLayout.jsx";
import FacultyDashboard from "./pages/FacultyDashboard.jsx";
import VerifyActivities from "./pages/VerifyActivities.jsx";

/* ADMIN */
import AdminLayout from "./pages/AdminLayout.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AllRecords from "./pages/AllRecords.jsx";
import GeneratePortfolio from "./pages/GeneratePortfolio.jsx";
import AddFaculty from "./pages/AddFaculty.jsx";

/* FORGOT */
import ForgotPassword from "./pages/ForgotPassword.jsx";

/* PUBLIC VERIFICATION */
import VerifyPortfolio from "./pages/VerifyPortfolio.jsx";

/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/* ================= AUTH PAGE ================= */
function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);

  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState("login");

  const [formData, setFormData] = useState({
    name: "",
    roll: "",
    email: "",
    password: "",
    role: "student",
    branch: "",
    batch: "",
    mobile: "",
    facultyId: "",
    adminCode: "",
    semester: ""
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (window.location.pathname === "/forgot") return;

    if (user?.role?.toLowerCase() === "student") navigate("/student");
    if (user?.role?.toLowerCase() === "faculty") navigate("/faculty");
    if (user?.role?.toLowerCase() === "admin") navigate("/admin");
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const numberCount = (formData.password.match(/\d/g) ?? []).length;

    if (!formData.email || !formData.password) {
      setError("Email & Password required!");
      return;
    }

    if (!emailPattern.test(formData.email)) {
      setError("Invalid Email Format!");
      return;
    }

    if (numberCount < 3) {
      setError("Password must contain at least 3 digits!");

      return;
    }
    if (mode === "register") {

      const mobilePattern = /^\d{10}$/;

      if (!mobilePattern.test(formData.mobile)) {
        setError("Enter 10 digit mobile number!");
        return;
      }
    }

    setError("");

    try {
      const url =
        mode === "login"
          ? "https://student-activities-record-system.onrender.com/login"
          : "https://student-activities-record-system.onrender.com/register";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      alert(data.message);

      if (mode === "login" && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "student") navigate("/student");
        if (data.user.role === "faculty") navigate("/faculty");
        if (data.user.role === "admin") navigate("/admin");
      } else if (mode === "register" && data.message.includes("successful")) {
        setMode("login");
      }

    } catch (err) {
      console.log(err);
      setError("Server error");
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* ================= TITLE ================= */}
      <div className="title-wrapper" style={{ marginTop: showForm ? "15px" : "60px", marginBottom: showForm ? "15px" : "30px", transition: "0.3s" }}>

        {/* TOP RIGHT BUTTONS */}
        <div className="top-buttons">
          <button
            onClick={() => {
              setMode("login");
              setShowForm(true);
            }}
          >
            Login
          </button>

          <button
            onClick={() => {
              setMode("register");
              setShowForm(true);
            }}
          >
            Register
          </button>
        </div>

        <div className="app-title" style={{ fontSize: showForm ? "30px" : "40px", transition: "0.3s" }}>
          STUDENT ACTIVITY RECORD SYSTEM
        </div>

        <div className="app-subtitle">
          Manage • Submit • Verify • Track Student Activities
        </div>
      </div>

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="auth-container">
          <div className="auth-form-box" style={{ width: "400px", padding: "30px 40px", maxHeight: "75vh", overflowY: "auto", transition: "0.3s" }}>

            <h2 style={{ marginBottom: "15px" }}>{mode === "login" ? "Login" : "Register"}</h2>

            <form onSubmit={handleSubmit} autoComplete="off">

              {mode === "register" && (
                <>
                  <label style={{ marginTop: "10px" }}>Full Name</label>
                  <input name="name" placeholder="Full Name" onChange={handleChange} required autoComplete="off" />

                  {/* Role selection removed — defaulting to student */}

                  {formData.role === "student" && (
                    <>
                      <label style={{ marginTop: "10px" }}>Roll</label>
                      <input name="roll" placeholder="Roll No." onChange={handleChange} required autoComplete="off" />

                      <label style={{ marginTop: "10px" }}>Branch</label>
                      <input name="branch" placeholder="Branch" onChange={handleChange} required autoComplete="off" />

                      <label style={{ marginTop: "10px" }}>Batch</label>
                      <input name="batch" placeholder="Batch (e.g. 2022-2026)" onChange={handleChange} required autoComplete="off" />

                      <label style={{ marginTop: "10px" }}>Semester</label>
                      <input name="semester" placeholder="Semester (e.g. 6th)" onChange={handleChange} required autoComplete="off" />
                    </>
                  )}

                  {formData.role === "faculty" && (
                    <>
                      <label style={{ marginTop: "10px" }}>Faculty ID</label>
                      <input name="facultyId" onChange={handleChange} required autoComplete="off" />

                      <label style={{ marginTop: "10px" }}>Branch</label>
                      <input name="branch" onChange={handleChange} required autoComplete="off" />
                    </>
                  )}

                  {formData.role === "admin" && (
                    <>
                      <label style={{ marginTop: "10px" }}>Admin Code</label>
                      <input name="adminCode" onChange={handleChange} required autoComplete="off" />
                    </>
                  )}

                  <label style={{ marginTop: "10px" }}>Mobile</label>
                  <input name="mobile" placeholder="Mobile No." onChange={handleChange} autoComplete="off" />

                  <label style={{ marginTop: "10px" }}>Email</label>
                  <input name="email" placeholder="Email Id" onChange={handleChange} required autoComplete="off" />

                  <label style={{ marginTop: "10px" }}>Password</label>
                  <input type="password" name="password" placeholder="Password" onChange={handleChange} required autoComplete="new-password" />
                </>
              )}

              {mode === "login" && (
                <>
                  <label>Email</label>
                  <input name="email" placeholder="Email Id" onChange={handleChange} required autoComplete="off" />

                  <label>Password</label>
                  <input type="password" name="password" placeholder="Password" onChange={handleChange} required autoComplete="current-password" />
                </>
              )}

              <button type="submit" style={{ marginTop: "20px" }}>
                {mode === "login" ? "Login" : "Create Account"}
              </button>
            </form>

            {mode === "login" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <p
                  style={{ color: "#93c5fd", cursor: "pointer", marginTop: "15px", textDecoration: "underline" }}
                  onClick={() => navigate("/forgot")}
                >
                  Forgot Password?
                </p>

                <div style={{ display: "flex", alignItems: "center", width: "100%", margin: "20px 0 10px" }}>
                  <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(255,255,255,0.3)" }} />
                  <span style={{ padding: "0 10px", color: "#ccc", fontSize: "14px" }}>OR</span>
                  <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(255,255,255,0.3)" }} />
                </div>

                <button
                  type="button"
                  style={{
                    background: "#fff",
                    color: "#333",
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                  onClick={() => alert("Google Login functionality to be implemented soon!")}
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{ width: "18px", height: "18px" }} />
                  Sign in with Google
                </button>
              </div>
            )}

            {error && <p className="error">{error}</p>}

          </div>
        </div>
      )}
    </div>
  );
}

/* ================= ROUTER ================= */
function App() {
  return (
    <Router>
        <Routes>

          <Route path="/" element={<AuthPage />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/verify/:token" element={<VerifyPortfolio />} />

          <Route path="/student" element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="submit" element={<SubmitActivity />} />
            <Route path="my" element={<MyActivities />} />
          </Route>

          <Route path="/faculty" element={<ProtectedRoute><FacultyLayout /></ProtectedRoute>}>
            <Route index element={<FacultyDashboard />} />
            <Route path="verify" element={<VerifyActivities />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="records" element={<AllRecords />} />
            <Route path="portfolio" element={<GeneratePortfolio />} />
            <Route path="add-faculty" element={<AddFaculty />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
    </Router>
  );
}

export default App;