import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

export default function AdminDashboard() {
  const [data, setData] = useState([]);

  // ✅ FETCH FROM DATABASE (IMPORTANT FIX)
  useEffect(() => {
    fetch("http://localhost:5000/all-activities")
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.log(err));
  }, []);

  // ✅ STATS
  const stats = {
    total: data.length,
    approved: data.filter(a => a.status === "Approved").length,
    pending: data.filter(a => a.status === "Pending").length,
    rejected: data.filter(a => a.status === "Rejected").length,
  };

  // ✅ CHART DATA
  const chartData = [
    { name: "Approved", value: stats.approved },
    { name: "Pending", value: stats.pending },
    { name: "Rejected", value: stats.rejected }
  ];

  return (
    <div style={container}>

      {/* HEADER */}
      <div style={header}>
        <h1 style={heading}>📊 Admin Dashboard</h1>
        <p style={subHeading}>System Overview & Analytics</p>
      </div>

      {/* STATS CARDS */}
      <div style={cardGrid}>

        <div style={card("#4f46e5")}>
          <h4>Total Activities</h4>
          <h2>{stats.total}</h2>
        </div>

        <div style={card("#16a34a")}>
          <h4>Approved</h4>
          <h2>{stats.approved}</h2>
        </div>

        <div style={card("#f59e0b")}>
          <h4>Pending</h4>
          <h2>{stats.pending}</h2>
        </div>

        <div style={card("#dc2626")}>
          <h4>Rejected</h4>
          <h2>{stats.rejected}</h2>
        </div>

      </div>

      {/* CHART SECTION */}
      <div style={chartGrid}>

        {/* BAR CHART */}
        <div style={chartCard}>
          <h3 style={chartTitle}>📈 Activity Status</h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PIE CHART */}
        <div style={chartCard}>
          <h3 style={chartTitle}>📊 Distribution</h3>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                outerRadius={90}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* RECENT ACTIVITIES */}
      <div style={recentCard}>
        <h3 style={chartTitle}>🕒 Recent Activities</h3>

        {data.length > 0 ? (
          data.slice(-5).reverse().map((a, i) => (
            <div key={i} style={activityRow}>
              <div>
                <b>{a.title}</b>
                <p style={smallText}>
                  {a.studentName} • {a.type}
                </p>
              </div>

              <span style={statusStyle(a.status)}>
                {a.status}
              </span>
            </div>
          ))
        ) : (
          <p>No data found</p>
        )}
      </div>

    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  padding: "30px",
  background: "#f1f5f9",
  minHeight: "100vh"
};

const header = {
  marginBottom: "20px"
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#1e293b"
};

const subHeading = {
  color: "#6b7280"
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
  marginBottom: "30px"
};

const card = (bg) => ({
  background: bg,
  color: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
  textAlign: "center"
});

const chartGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
  marginBottom: "30px"
};

const chartCard = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 10px 20px rgba(0,0,0,0.08)"
};

const chartTitle = {
  marginBottom: "10px",
  color: "#1e293b"
};

const recentCard = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 10px 20px rgba(0,0,0,0.08)"
};

const activityRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px",
  borderBottom: "1px solid #eee"
};

const smallText = {
  fontSize: "12px",
  color: "#6b7280"
};

const statusStyle = (status) => ({
  padding: "5px 10px",
  borderRadius: "20px",
  color: "white",
  fontSize: "12px",
  background:
    status === "Approved"
      ? "#16a34a"
      : status === "Pending"
      ? "#f59e0b"
      : "#dc2626"
});