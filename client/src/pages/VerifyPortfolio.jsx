import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function VerifyPortfolio() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/verify-portfolio/${token}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        } else {
          setError(resData.message || "Invalid verification link.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError("Network error. Please try again later.");
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loaderStyle}>Validating Official Record...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorCard}>
          <h2>❌ Verification Failed</h2>
          <p>{error}</p>
          <Link to="/" style={linkStyle}>Return Home</Link>
        </div>
      </div>
    );
  }

  const { student, activities } = data;

  const achievements = activities.filter(
    (a) =>
      a.type === "Hackathon" ||
      a.type === "Certification Course" ||
      a.type === "Workshop / Training" ||
      a.type === "Sports" ||
      a.type === "Internship" ||
      (a.position && a.position.trim() !== "")
  );

  const regularActivities = activities.filter((a) => !achievements.includes(a));

  return (
    <div style={containerStyle}>
      <div style={portfolioPaper}>
        {/* OFFICIAL BADGE */}
        <div style={verifiedBadgeContainer}>
          <span style={verifiedBadge}>
            ✅ VERIFIED OFFICIAL RECORD
          </span>
          <p style={verifiedText}>
            This document and its contents have been digitally verified and approved by the Institution.
          </p>
        </div>

        {/* 1. STUDENT DETAILS HEADER */}
        <div style={portfolioHeader}>
          <div style={headerLeft}>
            <h1 style={portfolioName}>{student.name}</h1>
            <p style={portfolioTagline}>Student Portfolio • {student.branch}</p>
          </div>
          <div style={headerRight}>
            <div style={contactItem}>
              <b>Roll No:</b> {student.roll || "N/A"}
            </div>
            <div style={contactItem}>
              <b>Batch:</b> {student.batch || "N/A"}
            </div>
            <div style={contactItem}>
              <b>Mobile:</b> {student.mobile || "N/A"}
            </div>
            <div style={contactItem}>
              <b>Email:</b> {student.email}
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
                    {ach.remarks && (
                      <span style={remarksText}>Faculty Remark: {ach.remarks}</span>
                    )}
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
          <p>This is a system-generated verified document.</p>
          <p>Generated by Student Activity Record System on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const containerStyle = {
  padding: "30px",
  background: "#f8fafc",
  minHeight: "100vh",
  fontFamily: "'Inter', sans-serif",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start"
};

const loaderStyle = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#3b82f6",
  marginTop: "20vh"
};

const errorCard = {
  background: "white",
  padding: "40px",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  textAlign: "center",
  marginTop: "15vh"
};

const linkStyle = {
  display: "inline-block",
  marginTop: "20px",
  padding: "10px 20px",
  background: "#2563eb",
  color: "white",
  textDecoration: "none",
  borderRadius: "8px",
  fontWeight: "bold"
};

const portfolioPaper = {
  background: "white",
  padding: "50px",
  borderRadius: "20px",
  boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
  color: "#1e293b",
  width: "100%",
  maxWidth: "900px"
};

const verifiedBadgeContainer = {
  textAlign: "center",
  marginBottom: "40px",
  padding: "20px",
  background: "#ecfdf5",
  border: "2px solid #10b981",
  borderRadius: "12px"
};

const verifiedBadge = {
  fontSize: "24px",
  fontWeight: "900",
  color: "#059669",
  letterSpacing: "1px"
};

const verifiedText = {
  color: "#047857",
  marginTop: "10px",
  fontWeight: "500"
};

/* --- SHARED PORTFOLIO STYLES (Similar to GeneratePortfolio.jsx) --- */

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

const remarksText = {
  fontSize: "12px",
  color: "#0f172a",
  background: "#e2e8f0",
  padding: "4px 10px",
  borderRadius: "12px",
  display: "inline-block",
  marginTop: "5px"
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
  fontSize: "12px",
  fontWeight: "500"
};
