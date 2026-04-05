import { useState } from "react";

export default function GeneratePortfolio() {
  const [filters, setFilters] = useState({
    name: "",
    branch: "",
    year: ""
  });

  const [preview, setPreview] = useState(null);

  const activities =
    JSON.parse(localStorage.getItem("activities")) || [];

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleGenerate = () => {
    const result = activities.filter((a) => {
      return (
        (!filters.name || a.studentEmail.includes(filters.name)) &&
        (!filters.branch || a.branch?.includes(filters.branch)) &&
        (!filters.year || a.batch?.includes(filters.year))
      );
    });

    setPreview(result);
  };

  return (
    <div style={{ padding: "20px" }}>

      <h2 style={{ marginBottom: "20px" }}>
        📁 Generate Portfolio
      </h2>

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
          placeholder="Branch"
          onChange={handleChange}
          style={input}
        />

        <input
          name="year"
          placeholder="Year / Batch"
          onChange={handleChange}
          style={input}
        />

        <button style={btn} onClick={handleGenerate}>
          Generate PDF
        </button>
      </div>

      {/* PREVIEW */}
      {preview && (
        <div style={previewBox}>
          <h3>📄 Portfolio Preview</h3>

          {preview.length > 0 ? (
            preview.map((a, i) => (
              <div key={i} style={card}>
                <p><strong>Student:</strong> {a.studentEmail}</p>
                <p><strong>Title:</strong> {a.title}</p>
                <p><strong>Type:</strong> {a.type}</p>
                <p><strong>Status:</strong> {a.status}</p>
              </div>
            ))
          ) : (
            <p>No records found</p>
          )}
        </div>
      )}

    </div>
  );
}

/* styles */
const filterBox = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
  flexWrap: "wrap",
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
};

const input = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

const btn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold"
};

const previewBox = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
};

const card = {
  border: "1px solid #eee",
  padding: "15px",
  marginTop: "10px",
  borderRadius: "8px"
};