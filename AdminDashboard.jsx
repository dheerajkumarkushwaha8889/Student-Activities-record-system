import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell
} from "recharts";

export default function AdminDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const activities = JSON.parse(localStorage.getItem("activities")) || [];
    setData(activities);
  }, []);

  const stats = {
    total: data.length,
    approved: data.filter(a => a.status === "Approved").length,
    pending: data.filter(a => a.status === "Pending").length,
    rejected: data.filter(a => a.status === "Rejected").length,
  };

  const chartData = [
    { name: "Approved", value: stats.approved },
    { name: "Pending", value: stats.pending },
    { name: "Rejected", value: stats.rejected }
  ];

  return (
    <div style={container}>

      {/* HEADER */}
      <h1 style={heading}>Admin Dashboard</h1>
      <p style={subHeading}>Overview of all activities</p>

      {/* STATS */}
      <div style={cardGrid}>
        <div style={card("#e0e7ff")}>
          <h4>Total Activities</h4>
          <h2>{stats.total}</h2>
        </div>

        <div style={card("#d1fae5")}>
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

      {/* CHARTS */}
      <div style={chartContainer}>

        {/* BAR CHART */}
        <div style={chartCard}>
          <h3>Activity Status (Bar)</h3>
          <BarChart width={350} height={250} data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </div>

        {/* PIE CHART */}
        <div style={chartCard}>
          <h3>Distribution (Pie)</h3>
          <PieChart width={350} height={250}>
            <Pie data={chartData} dataKey="value" outerRadius={90}>
              {chartData.map((entry, index) => (
                <Cell key={index} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

      </div>

    </div>
  );
}

/* 🔥 STYLES */

const container = {
  height: "100%",
  overflowY: "auto",   // ✅ only page scroll
  padding: "25px"
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#1e3a8a"
};

const subHeading = {
  color: "#6b7280",
  marginBottom: "20px"
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
  marginBottom: "30px"
};

const card = (bg) => ({
  background: bg,
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  textAlign: "center"
});

const chartContainer = {
  display: "flex",
  flexWrap: "wrap",
  gap: "30px"
};

const chartCard = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
};