import { useEffect, useState } from "react";

export default function VerifyActivities() {

  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  // FETCH DATA
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const branchQuery = user.branch ? `?branch=${user.branch}` : "";
    
    fetch(`http://localhost:5000/all-activities${branchQuery}`)
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.log(err));
  }, []);

  const getDocuments = (proofLink) => {
    if (!proofLink) return [];
    return proofLink.split(",").map(link => link.trim()).filter(Boolean).map(link => {
      if (link.startsWith("http")) return { name: "View Link", url: link };
      if (link.match(/^\d+-/)) {
        const parts = link.split("-");
        const name = parts.slice(1).join("-");
        return { name: name, url: `http://localhost:5000/uploads/${link}` };
      }
      return { name: "View Link", url: `https://${link}` };
    });
  };

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
            <div style={modalHeader}>
              <h2 style={{ margin: 0, color: "#1e293b", fontSize: "22px" }}>{selected.title}</h2>
              <span style={statusBadge(selected.status)}>{selected.status}</span>
            </div>

            <div style={modalSection}>
              <h4 style={sectionTitle}>🧑‍🎓 Student Details</h4>
              <div style={detailsGrid}>
                <p style={detailText}><b>Name:</b> {selected.studentName}</p>
                <p style={detailText}><b>Email:</b> {selected.studentEmail}</p>
                <p style={detailText}><b>Branch:</b> {selected.branch}</p>
                <p style={detailText}><b>Batch:</b> {selected.batch}</p>
              </div>
            </div>

            <div style={modalSection}>
              <h4 style={sectionTitle}>📝 Activity Details</h4>
              <div style={detailsGrid}>
                <p style={detailText}><b>Type:</b> {selected.type}</p>
                <p style={detailText}><b>Date:</b> {selected.date}</p>
                <p style={detailText}><b>Organizer:</b> {selected.organizer || "N/A"}</p>
                <p style={detailText}><b>Mode:</b> {selected.mode || "N/A"}</p>
                <p style={detailText}><b>Position/Rank:</b> {selected.position || "N/A"}</p>
              </div>
              <div style={{ marginTop: "10px" }}>
                <p style={detailText}><b>Description:</b></p>
                <div style={descriptionBox}>{selected.description}</div>
              </div>
              {selected.remarks && (
                <div style={{ marginTop: "10px" }}>
                  <p style={detailText}><b>Remarks:</b></p>
                  <p style={{ color: "#dc2626", fontSize: "14px", fontStyle: "italic" }}>{selected.remarks}</p>
                </div>
              )}
            </div>

            <div style={modalSection}>
              <h4 style={sectionTitle}>📎 Attached Documents</h4>
              {getDocuments(selected.proofLink).length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {getDocuments(selected.proofLink).map((doc, idx) => (
                    <div key={idx} style={documentBox}>
                      <p style={{ margin: 0, color: "#475569", fontSize: "14px", marginBottom: "8px" }}>Supporting document #{idx + 1}:</p>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={documentLink}
                      >
                        <span style={{ fontSize: "18px" }}>📄</span> {doc.name}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "14px" }}>No document attached.</p>
              )}
            </div>

            <div style={modalFooter}>
              <button style={closeBtn} onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
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

/* MODAL STYLES */
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(15, 23, 42, 0.6)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modal = {
  background: "white",
  borderRadius: "16px",
  width: "550px",
  maxWidth: "90%",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  display: "flex",
  flexDirection: "column"
};

const modalHeader = {
  padding: "20px 25px",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#f8fafc",
  borderTopLeftRadius: "16px",
  borderTopRightRadius: "16px"
};

const statusBadge = (status) => ({
  padding: "6px 12px",
  borderRadius: "20px",
  fontSize: "13px",
  fontWeight: "bold",
  color: "white",
  background:
    status === "Approved"
      ? "#22c55e"
      : status === "Pending"
      ? "#f59e0b"
      : "#ef4444"
});

const modalSection = {
  padding: "20px 25px",
  borderBottom: "1px solid #f1f5f9"
};

const sectionTitle = {
  margin: "0 0 15px 0",
  color: "#334155",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const detailsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px"
};

const detailText = {
  margin: 0,
  fontSize: "14px",
  color: "#475569"
};

const descriptionBox = {
  background: "#f8fafc",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  fontSize: "14px",
  color: "#334155",
  marginTop: "6px",
  whiteSpace: "pre-wrap"
};

const documentBox = {
  background: "#eff6ff",
  padding: "15px",
  borderRadius: "10px",
  border: "1px dashed #93c5fd"
};

const documentLink = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  textDecoration: "none",
  color: "#2563eb",
  fontWeight: "600",
  padding: "8px 16px",
  background: "white",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  transition: "all 0.2s"
};

const modalFooter = {
  padding: "20px 25px",
  background: "#f8fafc",
  borderBottomLeftRadius: "16px",
  borderBottomRightRadius: "16px",
  display: "flex",
  justifyContent: "flex-end"
};

const closeBtn = {
  padding: "10px 20px",
  background: "#64748b",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "background 0.2s"
};