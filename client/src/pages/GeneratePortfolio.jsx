import { useEffect, useState, useRef } from "react";

export default function GeneratePortfolio() {
  const [filters, setFilters] = useState({
    name: "",
    branch: "",
    year: ""
  });

  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // NEW STATES FOR REVIEW & EDIT
  const [reviewMode, setReviewMode] = useState(false);
  const [reportMode, setReportMode] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "", type: "", description: "", date: "", organizer: "", mode: "", position: ""
  });

  // FETCH DATA
  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/all-students").then((res) => res.json()),
      fetch("http://localhost:5000/all-activities").then((res) => res.json())
    ])
      .then(([studentsData, activitiesData]) => {
        setStudents(studentsData);
        setActivities(activitiesData);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleGenerate = () => {
    const result = students.filter((s) => {
      const hasApprovedActivities = activities.some((a) => a.studentEmail === s.email && a.status === "Approved");
      
      return (
        hasApprovedActivities &&
        (!filters.name ||
          s.name?.toLowerCase().includes(filters.name.toLowerCase()) ||
          s.email?.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.branch || s.branch?.toLowerCase().includes(filters.branch.toLowerCase())) &&
        (!filters.year || s.batch?.toLowerCase().includes(filters.year.toLowerCase()))
      );
    });
    setFilteredStudents(result);
    setSelectedStudent(null);
    setReviewMode(false);
    setReportMode(false);
  };

  const openPortfolio = (student) => {
    setSelectedStudent(student);
    setReviewMode(true); // Open in review mode first
  };

  const closePortfolio = () => {
    setSelectedStudent(null);
    setReviewMode(false);
    setReportMode(false);
  };

  // --- EDIT & DELETE HANDLERS ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity? This cannot be undone.")) return;

    try {
      const res = await fetch(`http://localhost:5000/delete-activity/${id}`, { method: "DELETE" });
      const data = await res.json();
      alert(data.message);
      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.log(err);
      alert("Error deleting activity.");
    }
  };

  const openEditModal = (act) => {
    setEditingActivity(act);
    setEditForm({
      title: act.title,
      type: act.type,
      description: act.description,
      date: act.date,
      organizer: act.organizer || "",
      mode: act.mode || "",
      position: act.position || ""
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/edit-activity/${editingActivity.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      alert(data.message);

      setActivities(prev => prev.map(a => 
        a.id === editingActivity.id ? { ...a, ...editForm } : a
      ));
      setEditingActivity(null);
    } catch (err) {
      console.log(err);
      alert("Error updating activity.");
    }
  };

  // CATEGORIZE ACTIVITIES FOR PORTFOLIO (Only Approved ones show up in Review & Portfolio)
  const studentActivities = selectedStudent
    ? activities.filter((a) => a.studentEmail === selectedStudent.email && a.status === "Approved")
    : [];

  const achievements = studentActivities.filter(
    (a) =>
      a.type === "Hackathon" ||
      a.type === "Certification Course" ||
      a.type === "Workshop / Training" ||
      a.type === "Sports" ||
      a.type === "Internship" ||
      (a.position && a.position.trim() !== "")
  );

  const regularActivities = studentActivities.filter((a) => !achievements.includes(a));

  const printRef = useRef();
  const handlePrint = () => window.print();

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

  const isImage = (url) => {
    return url.match(/\.(jpeg|jpg|gif|png)$/i) != null;
  };

  const allActivitiesForReport = selectedStudent
    ? activities.filter((a) => a.studentEmail === selectedStudent.email)
    : [];
  
  const reportStats = {
    total: allActivitiesForReport.length,
    approved: allActivitiesForReport.filter(a => a.status === "Approved").length,
    pending: allActivitiesForReport.filter(a => a.status === "Pending").length,
    rejected: allActivitiesForReport.filter(a => a.status === "Rejected").length,
  };

  return (
    <div style={container}>
      {/* HEADER SECTION (Hidden when printing or viewing portfolio) */}
      {!selectedStudent && (
        <div className="no-print">
          <h1 style={heading}>📁 Portfolio Generator</h1>
          <p style={subHeading}>Find students and generate their professional portfolios</p>

          <div style={filterBox}>
            <input name="name" placeholder="Student Name / Email" onChange={handleChange} style={input} />
            <input name="branch" placeholder="Branch (CSE, IT...)" onChange={handleChange} style={input} />
            <input name="year" placeholder="Batch / Year" onChange={handleChange} style={input} />
            <button style={btn} onClick={handleGenerate}>Find Students</button>
          </div>

          {/* STUDENT LIST */}
          {filteredStudents.length > 0 && (
            <div style={studentGrid}>
              {filteredStudents.map((s, idx) => (
                <div key={idx} style={studentCard}>
                  <div style={studentAvatar}>
                    {s.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 5px 0", color: "#1e293b" }}>{s.name}</h3>
                    <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
                      {s.branch} • {s.batch}
                    </p>
                    <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>
                      {s.email}
                    </p>
                  </div>
                  <button style={generateBtn} onClick={() => openPortfolio(s)}>
                    Review & Generate
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REVIEW PHASE */}
      {selectedStudent && reviewMode && (
        <div style={portfolioContainer}>
          <div style={portfolioActions}>
            <button style={backBtn} onClick={closePortfolio}>← Back to Search</button>
            <button style={btn} onClick={() => setReviewMode(false)}>🚀 Generate Report & Portfolio</button>
          </div>
          
          <div style={{...portfolioPaper, padding: "30px"}}>
            <div style={{ borderBottom: "2px solid #f1f5f9", paddingBottom: "15px", marginBottom: "25px" }}>
              <h2 style={{ margin: 0, color: "#1e293b" }}>Review Activities for {selectedStudent.name}</h2>
              <p style={{ margin: "5px 0 0 0", color: "#64748b" }}>Edit or delete activities before generating the final portfolio.</p>
            </div>

            <div style={tableWrapper}>
              <table style={table}>
                <thead>
                  <tr style={headRow}>
                    <th style={th}>Title</th>
                    <th style={th}>Type & Date</th>
                    <th style={th}>Details</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentActivities.length > 0 ? studentActivities.map(a => (
                    <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={td}><b>{a.title}</b></td>
                      <td style={td}>{a.type}<br/><small style={{color: "#64748b"}}>{a.date}</small></td>
                      <td style={td}>
                        <small>{a.description.length > 50 ? a.description.substring(0, 50) + "..." : a.description}</small>
                      </td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button style={editBtn} onClick={() => openEditModal(a)}>✏️ Edit</button>
                          <button style={delBtn} onClick={() => handleDelete(a.id)}>🗑️ Delete</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>No approved activities found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingActivity && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0, color: "#1e293b", borderBottom: "1px solid #e2e8f0", paddingBottom: "15px" }}>Edit Activity</h2>
            <form onSubmit={submitEdit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
              
              <div>
                <label style={labelStyle}>Title</label>
                <input name="title" value={editForm.title} onChange={handleEditChange} required style={inputFull} />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Type</label>
                  <select name="type" value={editForm.type} onChange={handleEditChange} required style={inputFull}>
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
                  <input type="date" name="date" value={editForm.date} onChange={handleEditChange} required style={inputFull} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange} required style={{...inputFull, height: "70px"}} />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Organizer</label>
                  <input name="organizer" value={editForm.organizer} onChange={handleEditChange} style={inputFull} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Position/Rank</label>
                  <input name="position" value={editForm.position} onChange={handleEditChange} style={inputFull} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
                <button type="button" onClick={() => setEditingActivity(null)} style={cancelBtn}>Cancel</button>
                <button type="submit" style={saveBtn}>Save Changes</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PORTFOLIO VIEW */}
      {selectedStudent && !reviewMode && !reportMode && (
        <div style={portfolioContainer}>
          <div className="no-print" style={portfolioActions}>
            <button style={backBtn} onClick={() => setReviewMode(true)}>
              ← Back to Review
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={printBtn} onClick={() => setReportMode(true)}>
                📄 Generate Official Report
              </button>
              <button style={{...printBtn, background: "#3b82f6"}} onClick={handlePrint}>
                🖨️ Print Portfolio
              </button>
            </div>
          </div>

          <div style={portfolioPaper} className="printable-portfolio" ref={printRef}>
            {/* 1. STUDENT DETAILS HEADER */}
            <div style={portfolioHeader}>
              <div style={headerLeft}>
                <h1 style={portfolioName}>{selectedStudent.name}</h1>
                <p style={portfolioTagline}>Student Portfolio • {selectedStudent.branch}</p>
                <div style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "15px" }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`http://localhost:5173/verify/${btoa(selectedStudent.email)}`)}`} 
                    alt="Verification QR Code"
                    style={{ width: "80px", height: "80px", border: "2px solid #e2e8f0", borderRadius: "8px", padding: "5px", background: "white" }}
                  />
                  <div>
                    <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "bold", background: "#ecfdf5", padding: "4px 8px", borderRadius: "12px" }}>
                      ✓ Scan to Verify
                    </span>
                    <p style={{ fontSize: "11px", color: "#64748b", margin: "5px 0 0 0" }}>
                      Official Record Authenticity
                    </p>
                  </div>
                </div>
              </div>
              <div style={headerRight}>
                <div style={contactItem}>
                  <b>Roll No:</b> {selectedStudent.roll || "N/A"}
                </div>
                <div style={contactItem}>
                  <b>Batch:</b> {selectedStudent.batch || "N/A"}
                </div>
                <div style={contactItem}>
                  <b>Mobile:</b> {selectedStudent.mobile || "N/A"}
                </div>
                <div style={contactItem}>
                  <b>Email:</b> {selectedStudent.email}
                </div>
              </div>
            </div>

            {/* 2. ACHIEVEMENTS SECTION */}
            <div style={sectionBox}>
              <h2 style={sectionTitle}>🌟 Key Achievements & Certifications</h2>
              {achievements.length > 0 ? (
                <div style={timeline}>
                  {achievements.map((ach, idx) => (
                    <div key={idx} style={timelineItem}>
                      <div style={timelineDot}></div>
                      <div style={timelineContent}>
                        <div style={timelineHeader}>
                          <h3 style={itemTitle}>{ach.title}</h3>
                          <span style={itemDate}>{ach.date}</span>
                        </div>
                        <p style={itemMeta}>
                          {ach.type} • {ach.organizer} 
                          {ach.position ? ` • 🏆 ${ach.position}` : ""}
                        </p>
                        <p style={itemDesc}>{ach.description}</p>
                        <div style={statusRow}>
                          <span style={statusBadge(ach.status)}>{ach.status}</span>
                          {ach.remarks && (
                            <span style={remarksText}>Remark: {ach.remarks}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={emptyText}>No major achievements recorded yet.</p>
              )}
            </div>

            {/* 3. ACTIVITIES SECTION */}
            <div style={sectionBox}>
              <h2 style={sectionTitle}>📚 Extracurricular & Academic Activities</h2>
              {regularActivities.length > 0 ? (
                <div style={gridActivities}>
                  {regularActivities.map((act, idx) => (
                    <div key={idx} style={activityCard}>
                      <div style={actCardHeader}>
                        <h3 style={actTitle}>{act.title}</h3>
                        <span style={statusBadge(act.status)}>{act.status}</span>
                      </div>
                      <p style={actMeta}>
                        {act.type} • {act.date}
                      </p>
                      <p style={actDesc}>{act.description}</p>
                      {act.organizer && (
                        <p style={actOrganizer}><b>Organizer:</b> {act.organizer}</p>
                      )}
                      {act.remarks && (
                        <div style={actRemarks}><b>Faculty Remark:</b> {act.remarks}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={emptyText}>No other activities recorded.</p>
              )}
            </div>

            {/* FOOTER */}
            <div style={portfolioFooter}>
              <p>Generated by Student Activity Record System</p>
              <p>Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL REPORT VIEW */}
      {selectedStudent && !reviewMode && reportMode && (
        <div style={portfolioContainer}>
          <div className="no-print" style={portfolioActions}>
            <button style={backBtn} onClick={() => setReportMode(false)}>
              ← Back to Portfolio
            </button>
            <button style={{...printBtn, background: "#1e293b"}} onClick={handlePrint}>
              🖨️ Print Report
            </button>
          </div>

          <div style={reportPaper} className="printable-portfolio" ref={printRef}>
            <h1 style={{ textAlign: "center", textTransform: "uppercase", fontSize: "24px", marginBottom: "30px", borderBottom: "2px solid black", paddingBottom: "10px" }}>Student Activity Report</h1>
            
            <div style={{ marginBottom: "20px", fontSize: "14px", lineHeight: "1.6" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                <span style={{flex: "1 1 45%"}}><b>Student Name:</b> {selectedStudent.name}</span>
                <span style={{flex: "1 1 45%"}}><b>Enrollment No:</b> {selectedStudent.roll || "N/A"}</span>
                <span style={{flex: "1 1 45%"}}><b>Department:</b> {selectedStudent.branch}</span>
                <span style={{flex: "1 1 45%"}}><b>Semester:</b> {selectedStudent.semester || selectedStudent.batch}</span>
              </div>
              <div style={{ marginTop: "15px", fontWeight: "bold" }}>
                Total Activities: {reportStats.total} | Approved: {reportStats.approved} | Pending: {reportStats.pending} | Rejected: {reportStats.rejected}
              </div>
            </div>

            <p style={{ fontSize: "12px", fontStyle: "italic", marginBottom: "30px" }}>
              This report contains the complete activity records, approvals, certificates, and performance analysis of the student.
            </p>

            <h3 style={{ borderBottom: "1px solid black", paddingBottom: "5px", textTransform: "uppercase", fontSize: "16px" }}>Activity Records</h3>
            <div style={{ marginBottom: "30px", fontSize: "13px", lineHeight: "1.8" }}>
              {allActivitiesForReport.map((a, i) => (
                <div key={i}>
                  {i + 1}. <b>{a.title}</b> ({a.type}) - {a.date} - <b>{a.status}</b>
                </div>
              ))}
            </div>

            <h3 style={{ borderBottom: "1px solid black", paddingBottom: "5px", textTransform: "uppercase", fontSize: "16px" }}>Graphs / Certificates / Remarks</h3>
            <div style={{ marginBottom: "40px", fontSize: "13px" }}>
              <div style={{ marginBottom: "15px", fontWeight: "bold" }}>
                Approved: {reportStats.approved} | Pending: {reportStats.pending} | Rejected: {reportStats.rejected}
              </div>
              
              <div style={{ marginBottom: "20px" }}>
                <b>Faculty Remarks:</b> Student has actively participated in technical and social activities. All recorded remarks have been considered.
              </div>

              {/* CERTIFICATES */}
              {allActivitiesForReport.some(a => a.proofLink) && (
                <div style={{ marginTop: "20px" }}>
                  <b>Attached Documents / Certificates:</b>
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "10px" }}>
                    {allActivitiesForReport.filter(a => a.proofLink).map((a, i) => {
                      const docs = getDocuments(a.proofLink);
                      return (
                        <div key={i} style={{ padding: "10px", border: "1px solid #ccc" }}>
                          <p style={{ margin: "0 0 5px 0" }}><b>Activity:</b> {a.title}</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {docs.map((docInfo, idx) => (
                              <div key={idx} style={{ marginTop: "5px" }}>
                                {isImage(docInfo.url) ? (
                                  <img src={docInfo.url} alt="Certificate" style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }} />
                                ) : (
                                  <a href={docInfo.url} target="_blank" rel="noopener noreferrer" style={{ color: "blue", textDecoration: "underline" }}>
                                    📄 View Document: {docInfo.name}
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: "60px", display: "flex", justifyContent: "space-between" }}>
              <div style={{ borderTop: "1px solid black", paddingTop: "5px", width: "200px", textAlign: "center" }}>
                Faculty Signature
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL STYLES FOR PRINTING */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-portfolio, .printable-portfolio * {
            visibility: visible;
          }
          .printable-portfolio {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  padding: "40px 30px",
  background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  minHeight: "100vh",
  fontFamily: "'Inter', sans-serif"
};

const heading = {
  fontSize: "36px",
  fontWeight: "900",
  background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: "8px",
  letterSpacing: "-0.5px"
};

const subHeading = {
  color: "#64748b",
  marginBottom: "25px",
  fontSize: "16px"
};

const filterBox = {
  display: "flex",
  gap: "15px",
  flexWrap: "wrap",
  background: "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(12px)",
  padding: "25px",
  borderRadius: "20px",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)",
  marginBottom: "40px",
  border: "1px solid rgba(255,255,255,0.8)"
};

const input = {
  padding: "14px 18px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  flex: "1",
  minWidth: "220px",
  fontSize: "15px",
  outline: "none",
  background: "rgba(255,255,255,0.9)",
  transition: "all 0.3s ease",
  ":focus": { borderColor: "#3b82f6", boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)" }
};

const btn = {
  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  color: "white",
  border: "none",
  padding: "14px 28px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "15px",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 15px rgba(37,99,235,0.4)",
  textTransform: "uppercase",
  letterSpacing: "1px"
};

const studentGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "20px"
};

const studentCard = {
  background: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(10px)",
  padding: "25px",
  borderRadius: "20px",
  boxShadow: "0 10px 20px -5px rgba(0,0,0,0.05)",
  display: "flex",
  alignItems: "center",
  gap: "20px",
  transition: "all 0.3s ease",
  border: "1px solid rgba(255,255,255,0.5)",
  cursor: "pointer",
  ":hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    borderColor: "#bfdbfe"
  }
};

const studentAvatar = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
  color: "#1e40af",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
  fontWeight: "800",
  boxShadow: "inset 0 2px 4px rgba(255,255,255,0.5)"
};

const generateBtn = {
  background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
  color: "#1d4ed8",
  border: "1px solid #bfdbfe",
  padding: "10px 18px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "13px",
  transition: "all 0.2s ease",
  ":hover": {
    background: "#3b82f6",
    color: "white"
  }
};

/* --- REVIEW & MODAL STYLES --- */
const tableWrapper = {
  background: "white",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  overflow: "hidden"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const headRow = {
  background: "#f8fafc",
  color: "#475569"
};

const th = { padding: "12px 15px", textAlign: "left", fontSize: "14px", fontWeight: "600" };
const td = { padding: "15px", fontSize: "14px", color: "#334155" };

const editBtn = {
  padding: "6px 12px",
  background: "#f1f5f9",
  color: "#2563eb",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600"
};

const delBtn = {
  padding: "6px 12px",
  background: "#fef2f2",
  color: "#dc2626",
  border: "1px solid #fecaca",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600"
};

const modalOverlay = {
  position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
  background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
  display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
};

const modal = {
  background: "white", padding: "30px", borderRadius: "16px",
  width: "500px", maxWidth: "90%", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
};

const labelStyle = {
  display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "4px"
};

const inputFull = {
  width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1",
  fontSize: "14px", outline: "none", boxSizing: "border-box"
};

const cancelBtn = {
  padding: "10px 16px", background: "#f1f5f9", color: "#475569", border: "none",
  borderRadius: "8px", cursor: "pointer", fontWeight: "600"
};

const saveBtn = {
  padding: "10px 16px", background: "#2563eb", color: "white", border: "none",
  borderRadius: "8px", cursor: "pointer", fontWeight: "600"
};


/* --- PORTFOLIO STYLES --- */

const portfolioContainer = {
  maxWidth: "900px",
  margin: "0 auto"
};

const portfolioActions = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "20px"
};

const backBtn = {
  background: "white",
  color: "#475569",
  border: "1px solid #cbd5e1",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600"
};

const printBtn = {
  background: "#10b981",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  boxShadow: "0 4px 6px -1px rgba(16,185,129,0.3)"
};

const portfolioPaper = {
  background: "white",
  padding: "40px",
  borderRadius: "20px",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  color: "#1e293b"
};

const reportPaper = {
  background: "white",
  padding: "40px",
  color: "black",
  fontFamily: "'Times New Roman', serif"
};

const portfolioHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  borderBottom: "2px solid #f1f5f9",
  paddingBottom: "30px",
  marginBottom: "30px",
  flexWrap: "wrap",
  gap: "20px"
};

const headerLeft = {
  flex: "1 1 300px"
};

const portfolioName = {
  fontSize: "36px",
  fontWeight: "800",
  margin: "0 0 5px 0",
  letterSpacing: "-0.5px"
};

const portfolioTagline = {
  fontSize: "16px",
  color: "#3b82f6",
  fontWeight: "600",
  margin: 0
};

const headerRight = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px 20px",
  fontSize: "14px",
  color: "#475569",
  background: "#f8fafc",
  padding: "15px 20px",
  borderRadius: "12px",
  flex: "1 1 200px"
};

const contactItem = {
  whiteSpace: "nowrap"
};

const sectionBox = {
  marginBottom: "40px"
};

const sectionTitle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#0f172a",
  borderBottom: "1px solid #e2e8f0",
  paddingBottom: "10px",
  marginBottom: "20px",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const timeline = {
  borderLeft: "2px solid #e2e8f0",
  marginLeft: "10px",
  paddingLeft: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "25px"
};

const timelineItem = {
  position: "relative"
};

const timelineDot = {
  position: "absolute",
  left: "-27px",
  top: "5px",
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  background: "#3b82f6",
  border: "2px solid white"
};

const timelineContent = {
  background: "#f8fafc",
  padding: "15px 20px",
  borderRadius: "12px",
  border: "1px solid #f1f5f9"
};

const timelineHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "5px"
};

const itemTitle = {
  fontSize: "16px",
  fontWeight: "700",
  margin: 0,
  color: "#1e293b"
};

const itemDate = {
  fontSize: "12px",
  color: "#94a3b8",
  fontWeight: "600",
  background: "white",
  padding: "4px 8px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0"
};

const itemMeta = {
  fontSize: "13px",
  color: "#64748b",
  margin: "0 0 10px 0",
  fontWeight: "500"
};

const itemDesc = {
  fontSize: "14px",
  color: "#334155",
  margin: "0 0 12px 0",
  lineHeight: "1.5"
};

const gridActivities = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "20px"
};

const activityCard = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
};

const actCardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "8px"
};

const actTitle = {
  fontSize: "15px",
  fontWeight: "600",
  margin: 0,
  color: "#0f172a",
  lineHeight: "1.3"
};

const actMeta = {
  fontSize: "12px",
  color: "#64748b",
  margin: "0 0 8px 0"
};

const actDesc = {
  fontSize: "13px",
  color: "#475569",
  margin: "0 0 10px 0",
  lineHeight: "1.4"
};

const actOrganizer = {
  fontSize: "12px",
  color: "#64748b",
  margin: "0 0 8px 0"
};

const actRemarks = {
  fontSize: "12px",
  background: "#fef3c7",
  color: "#92400e",
  padding: "8px",
  borderRadius: "6px",
  marginTop: "10px"
};

const statusRow = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap"
};

const statusBadge = (status) => ({
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  background:
    status === "Approved" ? "#dcfce7" :
    status === "Pending" ? "#fef3c7" : "#fee2e2",
  color:
    status === "Approved" ? "#166534" :
    status === "Pending" ? "#92400e" : "#991b1b"
});

const remarksText = {
  fontSize: "12px",
  color: "#0f172a",
  background: "#f1f5f9",
  padding: "4px 10px",
  borderRadius: "12px"
};

const emptyText = {
  color: "#94a3b8",
  fontStyle: "italic",
  fontSize: "14px"
};

const portfolioFooter = {
  textAlign: "center",
  marginTop: "40px",
  paddingTop: "20px",
  borderTop: "1px dashed #cbd5e1",
  color: "#94a3b8",
  fontSize: "12px"
};