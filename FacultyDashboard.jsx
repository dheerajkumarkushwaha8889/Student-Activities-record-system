import { useEffect, useState } from "react";

export default function FacultyDashboard() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("activities")) || [];
    setActivities(data);
  }, []);

  const pending = activities.filter(a => a.status === "Pending").length;
  const approved = activities.filter(a => a.status === "Approved").length;

  return (
    <div>
      <h1>👨‍🏫 Faculty Dashboard</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={card}>Pending: {pending}</div>
        <div style={card}>Approved: {approved}</div>
      </div>
    </div>
  );
}

const card = {
  padding: "20px",
  background: "#e0e7ff",
  borderRadius: "8px"
};