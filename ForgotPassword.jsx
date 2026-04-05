import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("All fields required ❌");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          newPassword: password   // ✅ IMPORTANT
        })
      });

      const data = await res.json();

      setMessage(data.message);

      // ✅ SUCCESS → LOGIN PAGE
      if (data.message.includes("success")) {
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }

    } catch (err) {
      console.log(err);
      setMessage("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>

        <h2 style={title}>🔐 Reset Password</h2>

        <form onSubmit={handleReset}>

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
          />

          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />

          <button type="submit" style={button} disabled={loading}>
            {loading ? "Processing..." : "Reset Password"}
          </button>

        </form>

        {message && <p style={msg}>{message}</p>}

        <p style={back} onClick={() => navigate("/?mode=login")}>
          ⬅ Back to Login
        </p>

      </div>
    </div>
  );
}


/* ================= STYLES ================= */

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(to right, #00c6ff, #0072ff)"
};

const card = {
  background: "#fff",
  padding: "30px",
  borderRadius: "10px",
  width: "320px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
};

const title = {
  textAlign: "center",
  marginBottom: "20px"
};

const input = {
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "5px",
  border: "1px solid #ccc"
};

const button = {
  width: "100%",
  padding: "10px",
  background: "#0072ff",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

const msg = {
  textAlign: "center",
  marginTop: "10px",
  color: "green"
};

const back = {
  textAlign: "center",
  marginTop: "15px",
  color: "blue",
  cursor: "pointer"
};