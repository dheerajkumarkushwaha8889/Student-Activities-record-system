import { useEffect, useState } from "react";

export default function VerifyActivities() {

  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  // FETCH DATA
  useEffect(() => {
    fetch("http://localhost:5000/all-activities")
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.log(err));
  }, []);

  // SEARCH FILTER (student name/email)
  const filtered = activities.filter(a =>
    a.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    a.studentEmail?.toLowerCase().includes(search.toLowerCase())
  );

  // APPROVE / REJECT
  const handleAction = (id, status) => {
    const remarks = prompt("Enter remarks:");

    fetch(`http://localhost:5000/update-status/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status,
        remarks: remarks || ""
      })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);

        setActivities(prev =>
          prev.map(a =>
            a.id === id ? { ...a, status, remarks } : a
          )
        );
      })
      .catch(err => console.log(err));
  };

  return (
    <div style={container}>

      <h1 style={heading}>🎓 Activity Verification Panel</h1>

      {/* 🔍 SEARCH */}
      <input
        placeholder="Search student by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={searchBox}
      />

      {/* TABLE */}
      <div style={tableWrapper}>
        <table style={table}>
          <thead>
            <tr style={headRow}>
              <th style={th}>Student</th>
              <th style={th}>Activity</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
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
                    <small>{a.type} • {a.date}</small>
                  </td>

                  {/* STATUS */}
                  <td style={td}>
                    <span style={statusStyle(a.status)}>
                      {a.status}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td style={td}>
                    <div style={{ display: "flex", gap: "8px" }}>

                      <button
                        style={viewBtn}
                        onClick={() => setSelected(a)}
                      >
                        👁 View
                      </button>

                      {a.status === "Pending" && (
                        <>
                          <button
                            style={approveBtn}
                            onClick={() => handleAction(a.id, "Approved")}
                          >
                            ✔
                          </button>

                          <button
                            style={rejectBtn}
                            onClick={() => handleAction(a.id, "Rejected")}
                          >
                            ✖
                          </button>
                        </>
                      )}

                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={noData}>
                  No Activities Found 🚫
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔥 VIEW MODAL */}
      {selected && (
        <div style={modalOverlay}>
          <div style={modal}>

            <h2>{selected.title}</h2>

            <p><b>Student:</b> {selected.studentName}</p>
            <p><b>Email:</b> {selected.studentEmail}</p>
            <p><b>Branch:</b> {selected.branch}</p>
            <p><b>Batch:</b> {selected.batch}</p>
            <p><b>Date:</b> {selected.date}</p>
            <p><b>Type:</b> {selected.type}</p>

            <p><b>Description:</b></p>
            <p style={{ color: "#555" }}>{selected.description}</p>

            <p><b>Status:</b> {selected.status}</p>
            <p><b>Remarks:</b> {selected.remarks || "-"}</p>

            <button style={closeBtn} onClick={() => setSelected(null)}>
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  padding: "30px",
  background: "#f8fafc",
  minHeight: "100vh"
};

const heading = {
  marginBottom: "15px",
  color: "#1e293b"
};

const searchBox = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const tableWrapper = {
  background: "white",
  borderRadius: "10px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const headRow = {
  background: "#2563eb",
  color: "white"
};

const th = { padding: "12px", textAlign: "left" };
const td = { padding: "12px", borderBottom: "1px solid #eee" };

const row = {
  transition: "0.2s"
};

const approveBtn = {
  background: "#22c55e",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer"
};

const rejectBtn = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer"
};

const viewBtn = {
  background: "#3b82f6",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer"
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