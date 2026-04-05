import { useState } from "react";

export default function SubmitActivity() {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
    date: "",
    file: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/submit-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentEmail: user.email,
          studentName: user.name,
          branch: user.branch,
          batch: user.batch,
          title: form.title,
          type: form.type,
          description: form.description,
          date: form.date
        })
      });

      const data = await res.json();

      alert(data.message || "Activity Submitted ✅");

      setForm({
        title: "",
        type: "",
        description: "",
        date: "",
        file: null
      });

    } catch (err) {
      console.log(err);
      alert("Server error ❌");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f1f5f9"
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "420px",
          padding: "30px",
          borderRadius: "15px",
          background: "white",
          boxShadow: "0 15px 35px rgba(0,0,0,0.1)"
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
            textAlign: "center",
            color: "#2563eb"
          }}
        >
          ➕ Submit Activity
        </h2>

        {/* TITLE */}
        <input
          placeholder="Activity Title"
          required
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          style={inputStyle}
        />

        {/* TYPE */}
        <select
          value={form.type}
          required
          onChange={(e) =>
            setForm({ ...form, type: e.target.value })
          }
          style={inputStyle}
        >
          <option value="">Select Activity Type</option>
          <option>Academic</option>
          <option>Sports</option>
          <option>Workshop</option>
          <option>Internship</option>
          <option>Cultural</option>
        </select>

        {/* DESCRIPTION */}
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          style={{ ...inputStyle, height: "80px" }}
        />

        {/* DATE */}
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
          style={inputStyle}
        />

        {/* FILE UI ONLY */}
        <div
          style={{
            border: "2px dashed #cbd5f5",
            padding: "15px",
            textAlign: "center",
            borderRadius: "10px",
            marginBottom: "15px"
          }}
        >
          <input
            type="file"
            onChange={(e) =>
              setForm({ ...form, file: e.target.files[0] })
            }
          />
          <p style={{ fontSize: "12px", color: "#6b7280" }}>
            Upload Certificate (optional)
          </p>
        </div>

        {/* BUTTON */}
        <button
          style={btnStyle}
          onMouseEnter={(e) => {
            e.target.style.background = "#1d4ed8";
            e.target.style.transform = "scale(1.03)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#2563eb";
            e.target.style.transform = "scale(1)";
          }}
        >
          Submit Activity
        </button>
      </form>
    </div>
  );
}

/* STYLES */
const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const btnStyle = {
  width: "100%",
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "0.3s"
};