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

/* FORGOT */
import ForgotPassword from "./pages/ForgotPassword.jsx";

/* ================= 🔒 PROTECTED ROUTE ================= */
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

  const [isLogin, setIsLogin] = useState(
  query.get("mode") === "register" ? false : true
);
  const [formData, setFormData] = useState({
    name: "",
    roll: "",
    email: "",
    password: "",
    role: "",
    branch: "",
    batch: "",
    mobile: "",
    facultyId: "",
    adminCode: ""
  });

  const [error, setError] = useState("");

  /* 🔥 FIX: AUTO REDIRECT ONLY IF USER EXISTS */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    // ❌ Forgot page par redirect nahi hoga
    if (window.location.pathname === "/forgot") return;

    if (user?.role === "student") navigate("/student");
    if (user?.role === "faculty") navigate("/faculty");
    if (user?.role === "admin") navigate("/admin");
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Email & Password required!");
      return;
    }

    if (!isLogin) {
      if (!formData.name || !formData.role) {
        setError("Fill all required fields!");
        return;
      }
    }

    setError("");

    try {
      const url = isLogin
        ? "http://localhost:5000/login"
        : "http://localhost:5000/register";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      alert(data.message);

      if (isLogin && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "student") navigate("/student");
        if (data.user.role === "faculty") navigate("/faculty");
        if (data.user.role === "admin") navigate("/admin");
      }

    } catch (err) {
      console.log(err);
      setError("Server error");
    }
  };

  return (
    <div className="container">
      <div className="form-box">

        <h2>{isLogin ? "Login" : "Register"}</h2>

        <form onSubmit={handleSubmit}>

          {!isLogin && (
            <>
              <label>Full Name</label>
              <input name="name" onChange={handleChange} required />

              <label>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>

              {formData.role === "student" && (
                <>
                  <label>Roll</label>
                  <input name="roll" onChange={handleChange} required />

                  <label>Branch</label>
                  <input name="branch" onChange={handleChange} required />

                  <label>Batch</label>
                  <input name="batch" onChange={handleChange} required />
                </>
              )}

              {formData.role === "faculty" && (
                <>
                  <label>Faculty ID</label>
                  <input name="facultyId" onChange={handleChange} required />

                  <label>Branch</label>
                  <input name="branch" onChange={handleChange} required />
                </>
              )}

              {formData.role === "admin" && (
                <>
                  <label>Admin Code</label>
                  <input name="adminCode" onChange={handleChange} required />
                </>
              )}

              <label>Mobile</label>
              <input name="mobile" onChange={handleChange} />
            </>
          )}

          <label>Email</label>
          <input name="email" onChange={handleChange} required />

          <label>Password</label>
          <input type="password" name="password" onChange={handleChange} required />

          <button type="submit">
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        {/* FORGOT PASSWORD */}
        {isLogin && (
          <p
            style={{ color: "blue", cursor: "pointer", marginTop: "10px" }}
            onClick={() => navigate("/forgot")}
          >
            Forgot Password?
          </p>
        )}

        {error && <p className="error">{error}</p>}

        {/* TOGGLE */}
        <p className="toggle">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <span onClick={() => setIsLogin(false)} className="click-text">
                Register
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span onClick={() => setIsLogin(true)} className="click-text">
                Login
              </span>
            </>
          )}
        </p>

      </div>
    </div>
  );
}

/* ================= ROUTER ================= */
function App() {
  return (
    <Router>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<AuthPage />} />

        {/* FORGOT */}
        <Route path="/forgot" element={<ForgotPassword />} />

        {/* 🔒 PROTECTED ROUTES */}

        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="submit" element={<SubmitActivity />} />
          <Route path="my" element={<MyActivities />} />
        </Route>

        <Route
          path="/faculty"
          element={
            <ProtectedRoute>
              <FacultyLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<FacultyDashboard />} />
          <Route path="verify" element={<VerifyActivities />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="records" element={<AllRecords />} />
          <Route path="portfolio" element={<GeneratePortfolio />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;