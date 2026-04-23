import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [activities, setActivities] = useState([]);

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
        <h2 style={{ marginBottom: "15px", color: "#2563eb" }}>
          🎓 Student Profile
        </h2>

        <div style={grid}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Roll No:</strong> {user.roll}</p>
          <p><strong>Branch:</strong> {user.branch}</p>
          <p><strong>Batch:</strong> {user.batch}</p>
          <p><strong>Mobile:</strong> {user.mobile}</p>
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