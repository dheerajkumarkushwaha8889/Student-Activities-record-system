import { useEffect, useState } from "react";

export default function FacultyDashboard() {
  const [activities, setActivities] = useState([]);

  // FETCH FROM BACKEND
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const branchQuery = user.branch ? `?branch=${user.branch}` : "";

    fetch(`http://localhost:5000/all-activities${branchQuery}`)
      .then((res) => res.json())
      .then((data) => setActivities(data))
      .catch((err) => console.log(err));
  }, []);

  // STATS
  const stats = {
    total: activities.length,
    pending: activities.filter(a => a.status === "Pending").length,
    approved: activities.filter(a => a.status === "Approved").length,
    rejected: activities.filter(a => a.status === "Rejected").length
  };

  return (
    <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}>

      {/* HEADER */}
      <h1 style={heading}>👨‍🏫 Faculty Dashboard</h1>
      <p style={subHeading}>Manage and verify student activities</p>

      {/* STATS CARDS */}
      <div style={grid}>
        <div style={card("#e0e7ff")}>
          <h3>Total Activities</h3>
          <h2>{stats.total}</h2>
        </div>

        <div style={card("#fef3c7")}>
          <h3>Pending</h3>
          <h2>{stats.pending}</h2>
        </div>

        <div style={card("#d1fae5")}>
          <h3>Approved</h3>
          <h2>{stats.approved}</h2>
        </div>

        <div style={card("#fee2e2")}>
          <h3>Rejected</h3>
          <h2>{stats.rejected}</h2>
        </div>
      </div>

      {/* RECENT ACTIVITIES */}
      <h2 style={{ marginTop: "30px" }}>📄 Recent Submissions</h2>

      <div style={tableBox}>
        <table style={table}>
          <thead style={thead}>
            <tr>
              <th style={th}>Student</th>
              <th style={th}>Title</th>
              <th style={th}>Type</th>
              <th style={th}>Date</th>
              <th style={th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {activities.length > 0 ? (
              activities
                .slice(0, 5)
                .map((a) => (
                  <tr key={a.id}>
                    <td style={td}>{a.studentName}</td>
                    <td style={td}>{a.title}</td>
                    <td style={td}>{a.type}</td>
                    <td style={td}>{a.date}</td>

                    <td style={td}>
                      <span style={statusStyle(a.status)}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="5" style={empty}>
                  No Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

/* ================= STYLES ================= */

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#1e293b"
};

const subHeading = {
  color: "#64748b",
  marginBottom: "20px"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px"
};

const card = (bg) => ({
  background: bg,
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  textAlign: "center"
});

const tableBox = {
  background: "white",
  borderRadius: "12px",
  marginTop: "15px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  overflow: "hidden"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const thead = {
  background: "#2563eb",
  color: "white"
};

const th = {
  padding: "12px",
  textAlign: "left"
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #eee"
};

const empty = {
  textAlign: "center",
  padding: "20px",
  color: "#64748b"
};

const statusStyle = (status) => ({
  padding: "5px 12px",
  borderRadius: "20px",
  color: "white",
  fontSize: "12px",
  background:
    status === "Approved"
      ? "#22c55e"
      : status === "Pending"
      ? "#f59e0b"
      : "#ef4444"
});