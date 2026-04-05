import { useState, useEffect } from "react";

export default function MyActivities() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [filter, setFilter] = useState("All");
  const [activities, setActivities] = useState([]);

  // ✅ FETCH FROM DB
  useEffect(() => {
    fetch(`http://localhost:5000/my-activities?email=${user.email}`)
      .then((res) => res.json())
      .then((data) => {
        setActivities(data);
      })
      .catch((err) => {
        console.log(err);
        alert("Error loading activities ❌");
      });
  }, [user.email]);

  // ✅ FILTER
  const filtered = activities.filter(
    (a) => filter === "All" || a.status === filter
  );

  // ✅ DELETE FROM DB
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;

    try {
      const res = await fetch(`http://localhost:5000/delete-activity/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();
      alert(data.message);

      // UI update without reload
      setActivities(activities.filter((a) => a.id !== id));

    } catch (err) {
      console.log(err);
      alert("Delete failed ❌");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      
      <h2 style={{ marginBottom: "15px" }}>📄 My Activities</h2>

      {/* FILTER */}
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          marginBottom: "10px",
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #ccc"
        }}
      >
        <option value="All">All</option>
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
      </select>

      {/* TABLE */}
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "white",
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        borderRadius: "10px",
        overflow: "hidden"
      }}>
        <thead style={{ background: "#2563eb", color: "white" }}>
          <tr>
            <th style={th}>Activity Name</th>
            <th style={th}>Type</th>
            <th style={th}>Status</th>
            <th style={th}>Remarks</th>
            <th style={th}>Action</th>
          </tr>
        </thead>

        <tbody>
          {filtered.length > 0 ? (
            filtered.map((a) => (
              <tr key={a.id}>
                
                <td style={td}>{a.title}</td>
                <td style={td}>{a.type}</td>

                <td style={{
                  ...td,
                  fontWeight: "bold",
                  color:
                    a.status === "Approved"
                      ? "green"
                      : a.status === "Pending"
                      ? "orange"
                      : "red"
                }}>
                  {a.status}
                </td>

                <td style={td}>{a.remarks || "-"}</td>

                <td style={td}>
                  <button
                    onClick={() => handleDelete(a.id)}
                    style={deleteBtn}
                  >
                    🗑 Delete
                  </button>
                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                No Activities Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* STYLES */
const th = { padding: "12px", textAlign: "left" };
const td = { padding: "12px", borderBottom: "1px solid #ddd" };

const deleteBtn = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "6px",
  borderRadius: "6px",
  cursor: "pointer",
  width: "100px"
};