import { useEffect, useState } from "react";

export default function AllRecords() {

  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // ✅ FETCH FROM DATABASE
  useEffect(() => {
    fetch("http://localhost:5000/all-activities")
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.log(err));
  }, []);

  // ✅ FILTER + SEARCH
  const filtered = activities.filter(a =>
    (filter === "All" || a.status === filter) &&
    (
      a.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      a.studentEmail?.toLowerCase().includes(search.toLowerCase()) ||
      a.title?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div style={container}>

      {/* HEADER */}
      <h1 style={heading}>📋 All Activity Records</h1>

      {/* CONTROLS */}
      <div style={controls}>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search by student, email or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchBox}
        />

        {/* FILTER */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={filterBox}
        >
          <option value="All">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>

      </div>

      {/* TABLE */}
      <div style={tableWrapper}>
        <table style={table}>

          <thead>
            <tr style={headRow}>
              <th style={th}>Student</th>
              <th style={th}>Activity</th>
              <th style={th}>Type</th>
              <th style={th}>Date</th>
              <th style={th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((a) => (
                <tr key={a.id} style={row}>

                  {/* STUDENT */}
                  <td style={td}>
                    <b>{a.studentName}</b><br />
                    <small>{a.studentEmail}</small>
                  </td>

                  {/* ACTIVITY */}
                  <td style={td}>
                    <b>{a.title}</b><br />
                    <small>{a.description}</small>
                  </td>

                  {/* TYPE */}
                  <td style={td}>{a.type}</td>

                  {/* DATE */}
                  <td style={td}>{a.date}</td>

                  {/* STATUS */}
                  <td style={td}>
                    <span style={statusStyle(a.status)}>
                      {a.status}
                    </span>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={noData}>
                  No Records Found 🚫
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

const container = {
  padding: "30px",
  background: "#f1f5f9",
  minHeight: "100vh"
};

const heading = {
  marginBottom: "15px",
  color: "#1e293b"
};

const controls = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  marginBottom: "15px",
  flexWrap: "wrap"
};

const searchBox = {
  flex: "1",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const filterBox = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const tableWrapper = {
  background: "white",
  borderRadius: "10px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  overflowX: "auto"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const headRow = {
  background: "#2563eb",
  color: "white"
};

const th = {
  padding: "12px",
  textAlign: "left"
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  verticalAlign: "top"
};

const row = {
  transition: "0.2s"
};

const statusStyle = (status) => ({
  padding: "5px 10px",
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

const noData = {
  textAlign: "center",
  padding: "20px"
};