export default function AllRecords() {
  const activities = JSON.parse(localStorage.getItem("activities")) || [];

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>All Records</h2>

      <table style={table}>
        <thead>
          <tr style={{ background: "#1d71c5", color: "white" }}>
            <th style={th}>Student</th>
            <th style={th}>Title</th>
            <th style={th}>Type</th>
            <th style={th}>Status</th>
          </tr>
        </thead>

        <tbody>
          {activities.map((a, i) => (
            <tr key={i} style={row}>
              <td style={td}>{a.studentEmail}</td>
              <td style={td}>{a.title}</td>
              <td style={td}>{a.type}</td>
              <td
                style={{
                  ...td,
                  fontWeight: "bold",
                  color:
                    a.status === "Approved"
                      ? "green"
                      : a.status === "Pending"
                      ? "orange"
                      : "red"
                }}
              >
                {a.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* 🔥 STYLES */
const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "white",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
};

const th = {
  padding: "12px",
  textAlign: "left"   // ✅ heading ke niche align fix
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  textAlign: "left"   // ✅ content same line me
};

const row = {
  transition: "0.2s"
};