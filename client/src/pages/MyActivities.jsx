import { useState, useEffect } from "react";

export default function MyActivities() {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [activities, setActivities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    type: "",
    description: "",
    date: "",
    organizer: "",
    mode: "",
    position: "",
    proofLink: "",
    files: []
  });
  const [existingFiles, setExistingFiles] = useState([]);

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

  const getDocuments = (proofLink) => {
    if (!proofLink) return [];
    return proofLink.split(",").map(link => link.trim()).filter(Boolean).map(link => {
      if (link.startsWith("http")) return { name: "View Link", url: link };
      // Check if it's an uploaded file (starts with timestamp)
      if (link.match(/^\d+-/)) {
        const parts = link.split("-");
        const name = parts.slice(1).join("-");
        return { name: name, url: `http://localhost:5000/uploads/${link}` };
      }
      // Fallback for external links without http
      return { name: "View Link", url: `https://${link}` };
    });
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

  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm({
      title: selected.title || "",
      type: selected.type || "",
      description: selected.description || "",
      date: selected.date ? selected.date.substring(0, 10) : "",
      organizer: selected.organizer || "",
      mode: selected.mode || "",
      position: selected.position || "",
      proofLink: selected.proofLink || "",
      files: []
    });
    setExistingFiles(selected.proofLink ? selected.proofLink.split(",").map(f => f.trim()).filter(Boolean) : []);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("type", editForm.type);
      formData.append("description", editForm.description);
      formData.append("date", editForm.date);
      formData.append("organizer", editForm.organizer || "");
      formData.append("mode", editForm.mode || "");
      formData.append("position", editForm.position || "");
      
      // Send the kept existing files
      formData.append("proofLink", existingFiles.join(","));

      // Append new files
      if (editForm.files && editForm.files.length > 0) {
        editForm.files.forEach(file => {
          formData.append("files", file);
        });
      }

      const res = await fetch(`http://localhost:5000/edit-activity/${selected.id}`, {
        method: "PUT",
        body: formData
      });

      const data = await res.json();
      alert(data.message || "Activity Updated Successfully ✅");

      if (res.ok) {
        // Refetch to sync state
        const refetchRes = await fetch(`http://localhost:5000/my-activities?email=${user.email}`);
        const updatedData = await refetchRes.json();
        setActivities(updatedData);

        // Update modal state
        const updatedActivity = updatedData.find(a => a.id === selected.id);
        if (updatedActivity) {
          setSelected(updatedActivity);
        }
        setIsEditing(false);
      }
    } catch (err) {
      console.log(err);
      alert("Error updating activity ❌");
    }
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
                      onClick={() => {
                        setSelected(a);
                        setIsEditing(false);
                      }}
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
            <div style={modalHeader}>
              <h2 style={{ margin: 0, color: "#1e293b", fontSize: "22px" }}>
                {isEditing ? "Edit Activity" : selected.title}
              </h2>
              <span style={statusBadge(selected.status)}>{selected.status}</span>
            </div>

            {isEditing ? (
              <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column" }}>
                <div style={modalSection}>
                  <h4 style={sectionTitle}>📝 Edit Activity Details</h4>
                  
                  <label style={labelStyle}>Activity Title</label>
                  <input
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    style={editInputStyle}
                  />

                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Type</label>
                      <select
                        required
                        value={editForm.type}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                        style={editInputStyle}
                      >
                        <option>Academic</option>
                        <option>Internship</option>
                        <option>Hackathon</option>
                        <option>Seminar / Conference</option>
                        <option>Certification Course</option>
                        <option>Workshop / Training</option>
                        <option>Project / Exhibition</option>
                        <option>Publication / Research Paper</option>
                        <option>Technical Competition</option>
                        <option>Non-Technical Competition</option>
                        <option>Social / Volunteer Work</option>
                        <option>Sports</option>
                        <option>Cultural</option>
                      </select>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Date</label>
                      <input
                        type="date"
                        required
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        style={editInputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Organizer</label>
                      <input
                        value={editForm.organizer}
                        onChange={(e) => setEditForm({ ...editForm, organizer: e.target.value })}
                        style={editInputStyle}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Mode</label>
                      <select
                        value={editForm.mode}
                        onChange={(e) => setEditForm({ ...editForm, mode: e.target.value })}
                        style={editInputStyle}
                      >
                        <option value="">Select Mode</option>
                        <option>Online</option>
                        <option>Offline</option>
                      </select>
                    </div>
                  </div>

                  <label style={labelStyle}>Position / Rank (optional)</label>
                  <input
                    value={editForm.position}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    style={editInputStyle}
                  />

                  <label style={labelStyle}>Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    style={{ ...editInputStyle, height: "80px" }}
                  />
                </div>

                <div style={modalSection}>
                  <h4 style={sectionTitle}>📎 Certificates & Documents</h4>
                  
                  {existingFiles.length > 0 && (
                    <div style={{ marginBottom: "15px" }}>
                      <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "bold", color: "#475569" }}>Current Documents:</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {existingFiles.map((file, idx) => {
                          const doc = getDocuments(file)[0];
                          if (!doc) return null;
                          return (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#2563eb", fontSize: "13px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>
                                📄 {doc.name}
                              </a>
                              <button
                                type="button"
                                onClick={() => setExistingFiles(prev => prev.filter(f => f !== file))}
                                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "16px" }}
                                title="Remove document"
                              >
                                🗑️
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <label style={labelStyle}>Add More Certificates (PDF/Images)</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setEditForm({ ...editForm, files: Array.from(e.target.files) })}
                    style={{ fontSize: "13px" }}
                  />
                  {editForm.files && editForm.files.length > 0 && (
                    <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      {editForm.files.map((file, index) => (
                        <span key={index} style={{ fontSize: "12px", color: "#10b981", fontWeight: "600" }}>
                          ➕ Ready to upload: {file.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={modalFooter}>
                  <button type="button" style={closeBtn} onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" style={submitBtnStyle}>
                    Submit Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
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
                  <button style={editBtnStyle} onClick={handleEditClick}>
                    ✏️ Edit Activity
                  </button>
                  <button style={closeBtn} onClick={() => setSelected(null)}>
                    Close
                  </button>
                </div>
              </>
            )}
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

const editBtnStyle = {
  marginRight: "auto",
  padding: "10px 20px",
  background: "#f59e0b",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "background 0.2s"
};

const submitBtnStyle = {
  marginLeft: "10px",
  padding: "10px 20px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "background 0.2s"
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "#475569",
  marginBottom: "4px",
  marginTop: "10px"
};

const editInputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "5px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box"
};