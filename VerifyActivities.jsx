import { useEffect, useState } from "react";

export default function VerifyActivities() {

  const [activities, setActivities] = useState([]);

  // ✅ FETCH FROM DATABASE
  useEffect(() => {
    fetch("http://localhost:5000/all-activities")
      .then(res => res.json())
      .then(data => {
        setActivities(data);
      })
      .catch(err => console.log(err));
  }, []);

  // ✅ APPROVE / REJECT
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

        // ✅ UPDATE UI WITHOUT RELOAD
        setActivities(prev =>
          prev.map(a =>
            a.id === id ? { ...a, status, remarks } : a
          )
        );
      })
      .catch(err => console.log(err));
  };

  return (
    <div>
      <h2>Verify Activities</h2>

      <table style={table}>
        <thead>
          <tr style={{ background: "#1d71c5", color: "white" }}>
            <th style={th}>Student</th>
            <th style={th}>Title</th>
            <th style={th}>Type</th>
            <th style={th}>Status</th>
            <th style={th}>Action</th>
          </tr>
        </thead>

        <tbody>
          {activities.length > 0 ? (
            activities.map((a) => (
              <tr key={a.id}>
                <td style={td}>{a.studentEmail}</td>
                <td style={td}>{a.title}</td>
                <td style={td}>{a.type}</td>

                <td style={td}>
                  <span style={statusStyle(a.status)}>
                    {a.status}
                  </span>
                </td>

                <td style={td}>
                  {a.status === "Pending" ? (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        style={approveBtn}
                        onClick={() => handleAction(a.id, "Approved")}
                      >
                        Approve
                      </button>

                      <button
                        style={rejectBtn}
                        onClick={() => handleAction(a.id, "Rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    "Done"
                  )}
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

/* styles */
const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const th = {
  borderBottom: "1px solid #ccc",
  padding: "10px",
  textAlign: "left"
};

const td = {
  padding: "10px",
  textAlign: "left",
  borderBottom: "1px solid #eee"
};

const approveBtn = {
  background: "green",
  color: "white",
  padding: "5px 10px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

const rejectBtn = {
  background: "red",
  color: "white",
  padding: "5px 10px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

const statusStyle = (status) => ({
  padding: "5px 10px",
  borderRadius: "20px",
  color: "white",
  fontSize: "12px",
  background:
    status === "Approved"
      ? "green"
      : status === "Pending"
      ? "orange"
      : "red"
});