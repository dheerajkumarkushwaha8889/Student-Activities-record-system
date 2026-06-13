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
    files: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      
      // 🔥 AUTO USER DATA
      formData.append("studentName", user.name || "");
      formData.append("studentEmail", user.email || "");
      formData.append("roll", user.roll || "");
      formData.append("branch", user.branch || "");
      formData.append("batch", user.batch || "");
      formData.append("mobile", user.mobile || "");

      // 🔥 ACTIVITY DATA
      formData.append("title", form.title);
      formData.append("type", form.type);
      formData.append("description", form.description);
      formData.append("date", form.date);
      formData.append("organizer", form.organizer);
      formData.append("mode", form.mode);
      formData.append("position", form.position);
      formData.append("proofLink", form.proofLink);

      // 🔥 FILE
      if (form.files && form.files.length > 0) {
        formData.append("file", form.files[0]);
      }

      const res = await fetch("https://student-activities-record-system.onrender.com/submit-activity", {
        method: "POST",
        body: formData
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
        files: []
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
          <option>Internship</option>
          <option>Hackathon</option>
          <option>Seminar / Conference</option>
          <option>Certification Course</option>
          <option>Workshop / Training</option>
          <option>Project / Exhibition</option>
          <option>Publication / Research Paper</option>
          <option>Technical Competition</option>
          <option>Non-Technical Competition</option>
          <option>Social / Volunteer Work</option>
          <option>Sports</option>
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
          placeholder="Proof Link (optional if uploading file)"
          value={form.proofLink}
          onChange={(e) => setForm({ ...form, proofLink: e.target.value })}
          style={input}
        />

        {/* FILE (UI ONLY) */}
        <div style={uploadBox}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <input
              type="file"
              onChange={(e) => setForm({ ...form, files: Array.from(e.target.files) })}
            />
            {form.files && form.files.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "5px" }}>
                {form.files.map((file, index) => (
                  <span 
                    key={index}
                    style={{ textDecoration: "none", color: "#2563eb", fontWeight: "bold" }}
                  >
                    📄 {file.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p style={{ fontSize: "12px", color: "#777", marginTop: "5px" }}>
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