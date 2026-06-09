import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [activities, setActivities] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name || "",
    roll: user.roll || "",
    branch: user.branch || "",
    batch: user.batch || "",
    semester: user.semester || "",
    mobile: user.mobile || ""
  });

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/edit-student/${user.email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      alert(data.message);

      if (data.message.includes("successful")) {
        const updatedUser = { ...user, ...editForm };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
      }
    } catch (err) {
      console.log(err);
      alert("Error updating profile");
    }
  };
  // FETCH ACTIVITIES
  useEffect(() => {
    if (!user.email) return;

    fetch(`http://localhost:5000/my-activities?email=${user.email}`)
      .then((res) => res.json())
      .then((data) => {
        setActivities(data);
      })
      .catch((err) => console.log(err));
  }, [user.email]);

  // STATS
  const stats = {
    total: activities.length,
    approved: activities.filter((a) => a.status === "Approved").length,
    pending: activities.filter((a) => a.status === "Pending").length,
    rejected: activities.filter((a) => a.status === "Rejected").length,
  };

  return (
    <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}>

      {/* HEADER */}
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#1e293b" }}>
        👋 Welcome, {user.name}
      </h1>

      <p style={{ color: "#64748b", marginBottom: "25px" }}>
        Manage and track your academic activities
      </p>

      {/* USER INFO CARD */}
      <div style={profileCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "15px", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, color: "#1e293b", fontSize: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            🎓 Student Profile
          </h2>
          <button style={editBtn} onClick={() => setIsEditing(true)}>✏️ Edit Profile</button>
        </div>

        <div style={profileLayout}>
          <div style={profileAvatarSection}>
            <div style={avatarCircle}>
              {user.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "ST"}
            </div>
            <h3 style={{ margin: "10px 0 5px 0", color: "#0f172a", fontSize: "18px" }}>{user.name}</h3>
            <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>{user.email}</p>
          </div>

          <div style={profileDetailsSection}>
            <div style={grid}>
              <div style={detailField}>
                <span style={detailLabel}>Roll Number</span>
                <span style={detailValue}>{user.roll || "—"}</span>
              </div>
              <div style={detailField}>
                <span style={detailLabel}>Branch / Stream</span>
                <span style={detailValue}>{user.branch || "—"}</span>
              </div>
              <div style={detailField}>
                <span style={detailLabel}>Academic Batch</span>
                <span style={detailValue}>{user.batch || "—"}</span>
              </div>
              <div style={detailField}>
                <span style={detailLabel}>Current Semester</span>
                <span style={detailValue}>{user.semester || "—"}</span>
              </div>
              <div style={detailField}>
                <span style={detailLabel}>Mobile Number</span>
                <span style={detailValue}>{user.mobile || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={statsGrid}>
        <div style={card("#dbeafe")}>
          <h4>Total Activities</h4>
          <h2>{stats.total}</h2>
        </div>

        <div style={card("#dcfce7")}>
          <h4>Approved</h4>
          <h2>{stats.approved}</h2>
        </div>

        <div style={card("#fef3c7")}>
          <h4>Pending</h4>
          <h2>{stats.pending}</h2>
        </div>

        <div style={card("#fee2e2")}>
          <h4>Rejected</h4>
          <h2>{stats.rejected}</h2>
        </div>
      </div>

      {/* RECENT ACTIVITIES */}
      <h2 style={{ marginTop: "35px", marginBottom: "15px" }}>
        📌 Recent Activities
      </h2>

      {activities.length > 0 ? (
        activities
          .slice(-5)
          .reverse()
          .map((a, i) => (
            <div key={i} style={activityCard}>
              <div>
                <h3 style={{ margin: "0" }}>{a.title}</h3>
                <p style={subText}>
                  {a.type} • {a.date}
                </p>
                <p style={descText}>{a.description}</p>
              </div>

              <span style={statusStyle(a.status)}>
                {a.status}
              </span>
            </div>
          ))
      ) : (
        <p style={{ color: "#6b7280" }}>No activities found</p>
      )}

      {/* EDIT MODAL */}
      {isEditing && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0, borderBottom: "1px solid #e2e8f0", paddingBottom: "15px" }}>Edit Profile</h2>
            <form onSubmit={submitEdit} style={form}>
              <label style={label}>Name</label>
              <input name="name" value={editForm.name} onChange={handleEditChange} required style={input} />

              <label style={label}>Roll No</label>
              <input name="roll" value={editForm.roll} onChange={handleEditChange} required style={input} />

              <label style={label}>Branch</label>
              <input name="branch" value={editForm.branch} onChange={handleEditChange} required style={input} />

              <label style={label}>Batch (e.g. 2022-2026)</label>
              <input name="batch" value={editForm.batch} onChange={handleEditChange} required style={input} />

              <label style={label}>Semester</label>
              <input name="semester" value={editForm.semester} onChange={handleEditChange} required style={input} />

              <label style={label}>Mobile</label>
              <input name="mobile" value={editForm.mobile} onChange={handleEditChange} style={input} />

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsEditing(false)} style={cancelBtn}>Cancel</button>
                <button type="submit" style={btn}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const profileCard = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  marginBottom: "25px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "10px",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
};

const card = (bg) => ({
  background: bg,
  padding: "20px",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
});

const activityCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "white",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};

const subText = {
  fontSize: "12px",
  color: "#6b7280",
  margin: "3px 0",
};

const descText = {
  fontSize: "13px",
  color: "#475569",
};

const statusStyle = (status) => ({
  padding: "6px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "bold",
  color: "white",
  background:
    status === "Approved"
      ? "#22c55e"
      : status === "Pending"
        ? "#f59e0b"
        : "#ef4444",
});

const editBtn = {
  padding: "6px 12px",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "12px",
  boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
  transition: "transform 0.1s ease"
};

const profileLayout = {
  display: "flex",
  gap: "30px",
  flexWrap: "wrap",
};

const profileAvatarSection = {
  flex: "1 1 200px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  background: "#f8fafc",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
};

const avatarCircle = {
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
  fontWeight: "bold",
  boxShadow: "0 4px 10px rgba(37, 99, 235, 0.2)",
};

const profileDetailsSection = {
  flex: "2 1 400px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const detailField = {
  background: "#f8fafc",
  padding: "12px 15px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const detailLabel = {
  fontSize: "11px",
  fontWeight: "bold",
  textTransform: "uppercase",
  color: "#64748b",
  letterSpacing: "0.5px",
};

const detailValue = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#1e293b",
};

const modalOverlay = {
  position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
  background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
  display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
};

const modal = {
  background: "white", padding: "30px", borderRadius: "16px",
  width: "500px", maxWidth: "90%", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const label = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#475569",
  marginBottom: "-10px"
};

const input = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  outline: "none",
};

const btn = {
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};

const cancelBtn = {
  padding: "12px",
  background: "#f1f5f9",
  color: "#475569",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};