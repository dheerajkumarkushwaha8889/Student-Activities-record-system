import { useState } from "react";

export default function SubmitActivity() {

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
    date: "",
    organizer: "",
    mode: "",
    position: "",
    proofLink: "",
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

          // 🔥 AUTO USER DATA
          studentName: user.name,
          studentEmail: user.email,
          roll: user.roll,
          branch: user.branch,
          batch: user.batch,
          mobile: user.mobile,

          // 🔥 ACTIVITY DATA
          title: form.title,
          type: form.type,
          description: form.description,
          date: form.date,
          organizer: form.organizer,
          mode: form.mode,
          position: form.position,
          proofLink: form.proofLink
        })
      });

      const data = await res.json();

      alert(data.message || "Activity Submitted ✅");

      setForm({
        title: "",
        type: "",
        description: "",
        date: "",
        organizer: "",
        mode: "",
        position: "",
        proofLink: "",
        file: null
      });

    } catch (err) {
      console.log(err);
      alert("Server error ❌");
    }
  };

  return (
    <div style={container}>

      <form onSubmit={handleSubmit} style={card}>

        <h2 style={heading}>🚀 Submit Activity</h2>

  
        

        {/* TITLE */}
        <input
          placeholder="Activity Title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          style={input}
        />

        {/* TYPE */}
        <select
          value={form.type}
          required
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          style={input}
        >
          <option value="">Select Type</option>
          <option>Academic</option>
          <option>Sports</option>
          <option>Workshop</option>
          <option>Internship</option>
          <option>Cultural</option>
        </select>

        {/* ORGANIZER */}
        <input
          placeholder="Organizer (College / Company)"
          value={form.organizer}
          onChange={(e) => setForm({ ...form, organizer: e.target.value })}
          style={input}
        />

        {/* MODE */}
        <select
          value={form.mode}
          onChange={(e) => setForm({ ...form, mode: e.target.value })}
          style={input}
        >
          <option value="">Mode</option>
          <option>Online</option>
          <option>Offline</option>
        </select>

        {/* POSITION */}
        <input
          placeholder="Position / Rank (optional)"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
          style={input}
        />
    

        {/* DATE */}
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          style={input}
        />
        

        {/* DESCRIPTION */}
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          style={{ ...input, height: "80px" }}
        />

        {/* PROOF LINK */}
        <input
          placeholder="Proof Link (Google Drive / Certificate URL)"
          value={form.proofLink}
          onChange={(e) => setForm({ ...form, proofLink: e.target.value })}
          style={input}
        />

        {/* FILE (UI ONLY) */}
        <div style={uploadBox}>
          <input
            type="file"
            onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
          />
          <p style={{ fontSize: "12px", color: "#777" }}>
            Upload Certificate (optional)
          </p>
        </div>

        <button style={btn}>Submit Activity</button>

      </form>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: "#eef2ff"
};

const card = {
  width: "450px",
  padding: "25px",
  borderRadius: "15px",
  background: "white",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
};

const heading = {
  textAlign: "center",
  marginBottom: "15px",
  color: "#2563eb"
};

const userBox = {
  background: "#f1f5f9",
  padding: "10px",
  borderRadius: "8px",
  marginBottom: "15px",
  fontSize: "14px"
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const uploadBox = {
  border: "2px dashed #c7d2fe",
  padding: "10px",
  textAlign: "center",
  borderRadius: "10px",
  marginBottom: "10px"
};

const btn = {
  width: "100%",
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
};