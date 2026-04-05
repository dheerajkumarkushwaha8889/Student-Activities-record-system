import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [activities, setActivities] = useState([]);

  // ✅ FETCH FROM BACKEND (FIXED API)
  useEffect(() => {
    if (!user.email) return;

    fetch(`http://localhost:5000/my-activities?email=${user.email}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Activities:", data);
        setActivities(data);
      })
      .catch((err) => {
        console.log("FETCH ERROR:", err);
      });
  }, [user.email]);

  // ✅ STATS CALCULATION
  const stats = {
    total: activities.length,
    approved: activities.filter((a) => a.status === "Approved").length,
    pending: activities.filter((a) => a.status === "Pending").length,
    rejected: activities.filter((a) => a.status === "Rejected").length,
  };

  return (
    <div style={{ padding: "25px" }}>

      {/* HEADER */}
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#4f46e5" }}>
        Welcome, {user.name || "Student"} 👋
      </h1>

      <p style={{ color: "#6b7280", marginBottom: "20px" }}>
        Your Activity Dashboard
      </p>

      {/* STATS CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        <div style={cardStyle("#e0e7ff")}>
          <h3>Total Activities</h3>
          <h2>{stats.total}</h2>
        </div>

        <div style={cardStyle("#d1fae5")}>
          <h3>Approved</h3>
          <h2>{stats.approved}</h2>
        </div>

        <div style={cardStyle("#fef3c7")}>
          <h3>Pending</h3>
          <h2>{stats.pending}</h2>
        </div>

        <div style={cardStyle("#fee2e2")}>
          <h3>Rejected</h3>
          <h2>{stats.rejected}</h2>
        </div>
      </div>

      {/* RECENT ACTIVITIES */}
      <h2 style={{ marginTop: "30px" }}>Recent Activities</h2>

      {activities.length > 0 ? (
        activities
          .slice(-5)
          .reverse()
          .map((a, i) => (
            <div key={i} style={activityStyle}>
              <div>
                <strong>{a.title}</strong>
                <p style={{ fontSize: "12px", color: "#6b7280" }}>
                  {a.type} • {a.date}
                </p>
              </div>

              <span style={statusStyle(a.status)}>
                {a.status}
              </span>
            </div>
          ))
      ) : (
        <p>No activities found</p>
      )}
    </div>
  );
}

/* 🔥 STYLES */
const cardStyle = (bg) => ({
  background: bg,
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
});

const activityStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  marginTop: "10px",
};

const statusStyle = (status) => ({
  padding: "5px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  background:
    status === "Approved"
      ? "#22c55e"
      : status === "Pending"
      ? "#f59e0b"
      : "#ef4444",
  color: "white",
});