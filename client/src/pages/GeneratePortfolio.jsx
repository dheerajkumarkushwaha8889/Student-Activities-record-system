import { useEffect, useState } from "react";

export default function GeneratePortfolio() {

  const [filters, setFilters] = useState({
    name: "",
    branch: "",
    year: ""
  });

  const [data, setData] = useState([]);
  const [preview, setPreview] = useState(null);

  // ✅ FETCH FROM DATABASE
  useEffect(() => {
    fetch("http://localhost:5000/all-activities")
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.log(err));
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // ✅ GENERATE FILTERED DATA
  const handleGenerate = () => {
    const result = data.filter((a) => {
      return (
        (!filters.name ||
          a.studentName?.toLowerCase().includes(filters.name.toLowerCase()) ||
          a.studentEmail?.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.branch || a.branch?.toLowerCase().includes(filters.branch.toLowerCase())) &&
        (!filters.year || a.batch?.toLowerCase().includes(filters.year.toLowerCase()))
      );
    });

    setPreview(result);
  };

  return (
    <div style={container}>

      <h1 style={heading}>📁 Portfolio Generator</h1>
      <p style={subHeading}>Generate student activity portfolio</p>

      {/* FILTER BOX */}
      <div style={filterBox}>

        <input
          name="name"
          placeholder="Student Name / Email"
          onChange={handleChange}
          style={input}
        />

        <input
          name="branch"
          placeholder="Branch (CSE, IT...)"
          onChange={handleChange}
          style={input}
        />

        <input
          name="year"
          placeholder="Batch / Year"
          onChange={handleChange}
          style={input}
        />

        <button style={btn} onClick={handleGenerate}>
          Generate Portfolio
        </button>

      </div>

      {/* PREVIEW */}
      {preview && (
        <div style={previewBox}>

          <h2 style={{ marginBottom: "10px" }}>
            📄 Portfolio Preview ({preview.length})
          </h2>

          {preview.length > 0 ? (
            preview.map((a) => (
              <div key={a.id} style={card}>

                {/* STUDENT */}
                <div style={topRow}>
                  <div>
                    <h3 style={{ margin: 0 }}>{a.studentName}</h3>
                    <p style={small}>
                      {a.studentEmail} • {a.branch} ({a.batch})
                    </p>
                  </div>

                  <span style={statusStyle(a.status)}>
                    {a.status}
                  </span>
                </div>

                {/* ACTIVITY */}
                <div style={{ marginTop: "10px" }}>
                  <b>{a.title}</b>
                  <p style={small}>{a.type} • {a.date}</p>
                  <p style={{ color: "#555" }}>{a.description}</p>
                </div>

              </div>
            ))
          ) : (
            <p>No records found 🚫</p>
          )}

        </div>
      )}

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
  fontSize: "28px",
  fontWeight: "bold",
  color: "#1e293b"
};

const subHeading = {
  color: "#6b7280",
  marginBottom: "20px"
};

const filterBox = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
  marginBottom: "20px"
};

const input = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  flex: "1"
};

const btn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
};

const previewBox = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 10px 20px rgba(0,0,0,0.08)"
};

const card = {
  border: "1px solid #eee",
  padding: "15px",
  marginTop: "15px",
  borderRadius: "10px",
  transition: "0.3s"
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const small = {
  fontSize: "12px",
  color: "#6b7280"
};

const statusStyle = (status) => ({
  padding: "5px 10px",
  borderRadius: "20px",
  color: "white",
  fontSize: "12px",
  background:
    status === "Approved"
      ? "#16a34a"
      : status === "Pending"
      ? "#f59e0b"
      : "#dc2626"
});