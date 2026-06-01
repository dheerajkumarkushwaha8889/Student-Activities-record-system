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

  const getDocumentInfo = (link) => {
    if (!link) return null;
    if (link.startsWith("http")) return { name: "View Link", url: link };
    // Check if it's an uploaded file (starts with timestamp)
    if (link.match(/^\d+-/)) {
      const parts = link.split("-");
      const name = parts.slice(1).join("-");
      return { name: name, url: `http://localhost:5000/uploads/${link}` };
    }
    // Fallback for external links without http
    return { name: "View Link", url: `https://${link}` };
  };

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

                    {a.proofLink && (
                      <button
                        style={docBtn}
                        onClick={() => window.open(getDocumentInfo(a.proofLink).url, "_blank")}
                        title={getDocumentInfo(a.proofLink).name}
                      >
                        📄 {getDocumentInfo(a.proofLink).name.length > 15 ? getDocumentInfo(a.proofLink).name.substring(0, 15) + "..." : getDocumentInfo(a.proofLink).name}
                      </button>
                    )}

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
            <div style={modalHeader}>
              <h2 style={{ margin: 0, color: "#1e293b", fontSize: "22px" }}>{selected.title}</h2>
              <span style={statusBadge(selected.status)}>{selected.status}</span>
            </div>

            <div style={modalSection}>
              <h4 style={sectionTitle}>📝 Activity Details</h4>
              <div style={detailsGrid}>
                <p style={detailText}><b>Type:</b> {selected.type}</p>
                <p style={detailText}><b>Date:</b> {selected.date}</p>
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
              <h4 style={sectionTitle}>📎 Attached Document</h4>
              {selected.proofLink ? (
                <div style={documentBox}>
                  <p style={{ margin: 0, color: "#475569", fontSize: "14px", marginBottom: "8px" }}>You have uploaded a supporting document for this activity.</p>
                  <a 
                    href={getDocumentInfo(selected.proofLink).url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={documentLink}
                  >
                    <span style={{ fontSize: "18px" }}>📄</span> {getDocumentInfo(selected.proofLink).name}
                  </a>
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

const docBtn = {
  marginRight: "8px",
  padding: "5px 10px",
  background: "#10b981",
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