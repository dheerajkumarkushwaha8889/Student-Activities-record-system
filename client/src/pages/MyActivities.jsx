import { useState, useEffect } from "react";

export default function MyActivities() {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [activities, setActivities] = useState([]);
  const [selected, setSelected] = useState(null);

  // FETCH
  useEffect(() => {
    if (!user.email) return;

    fetch(`http://localhost:5000/my-activities?email=${user.email}`)
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.log(err));
  }, [user.email]);

  // FILTER + SEARCH
  const filtered = activities.filter(a =>
    (filter === "All" || a.status === filter) &&
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this activity?")) return;

    const res = await fetch(`http://localhost:5000/delete-activity/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();
    alert(data.message);

    setActivities(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div style={{ padding: "30px", background: "#f1f5f9", minHeight: "100vh" }}>

      {/* HEADER */}
      <h1 style={heading}>📄 My Activities</h1>

      {/* TOP BAR */}
      <div style={topBar}>
        <input
          placeholder="Search activity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchBox}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={filterStyle}>
          <option>All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>

      {/* TABLE */}
      <div style={tableBox}>
        <table style={table}>
          <thead style={thead}>
            <tr>
              <th style={th}>Title</th>
              <th style={th}>Type</th>
              <th style={th}>Status</th>
              <th style={th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((a) => (
                <tr key={a.id}>
                  <td style={td}>{a.title}</td>
                  <td style={td}>{a.type}</td>

                  <td style={td}>
                    <span style={statusStyle(a.status)}>
                      {a.status}
                    </span>
                  </td>

                  <td style={td}>
                    <button
                      style={viewBtn}
                      onClick={() => setSelected(a)}
                    >
                      👁 View
                    </button>

                    <button
                      style={deleteBtn}
                      onClick={() => handleDelete(a.id)}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={empty}>No Activities Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔥 MODAL */}
      {selected && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2>{selected.title}</h2>

            <p><b>Type:</b> {selected.type}</p>
            <p><b>Date:</b> {selected.date}</p>
            <p><b>Status:</b> {selected.status}</p>
            <p><b>Remarks:</b> {selected.remarks || "-"}</p>
            <p><b>Description:</b> {selected.description}</p>

            <button onClick={() => setSelected(null)} style={closeBtn}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/* ================= STYLES ================= */

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  marginBottom: "20px"
};

const topBar = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "15px"
};

const searchBox = {
  padding: "8px",
  width: "200px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const filterStyle = {
  padding: "8px",
  borderRadius: "8px"
};

const tableBox = {
  background: "white",
  borderRadius: "10px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const thead = {
  background: "#2563eb",
  color: "white"
};

const th = { padding: "12px", textAlign: "left" };
const td = { padding: "12px", borderBottom: "1px solid #eee" };

const viewBtn = {
  marginRight: "8px",
  padding: "5px 10px",
  background: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

const deleteBtn = {
  padding: "5px 10px",
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

const empty = {
  textAlign: "center",
  padding: "20px"
};

const statusStyle = (status) => ({
  padding: "5px 10px",
  borderRadius: "20px",
  color: "white",
  background:
    status === "Approved"
      ? "green"
      : status === "Pending"
      ? "orange"
      : "red"
});

/* MODAL */
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modal = {
  background: "white",
  padding: "25px",
  borderRadius: "10px",
  width: "400px"
};

const closeBtn = {
  marginTop: "10px",
  padding: "8px 12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};