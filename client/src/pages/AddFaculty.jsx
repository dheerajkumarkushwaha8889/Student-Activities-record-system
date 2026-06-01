import { useState, useEffect } from "react";

export default function AddFaculty() {
  const [activeTab, setActiveTab] = useState("add"); // "add" or "list"
  
  // ADD FACULTY STATE
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "Faculty", facultyId: "", branch: "", mobile: "",
  });
  const [message, setMessage] = useState("");

  // LIST & EDIT STATE
  const [faculties, setFaculties] = useState([]);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "", email: "", facultyId: "", branch: "", mobile: ""
  });

  // FETCH ALL FACULTIES
  const fetchFaculties = async () => {
    try {
      const res = await fetch("http://localhost:5000/all-faculties");
      const data = await res.json();
      setFaculties(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (activeTab === "list") {
      fetchFaculties();
    }
  }, [activeTab]);

  // HANDLERS FOR ADD
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData),
      });
      const data = await res.json();
      setMessage(data.message);
      if (data.message.includes("successful")) {
        setFormData({ name: "", email: "", password: "", role: "Faculty", facultyId: "", branch: "", mobile: "" });
      }
    } catch (err) {
      console.log(err);
      setMessage("Server error ❌");
    }
  };

  // HANDLERS FOR EDIT & DELETE
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });
  
  const openEditModal = (f) => {
    setEditingFaculty(f);
    setEditForm({ name: f.name, email: f.email, facultyId: f.facultyId, branch: f.branch, mobile: f.mobile });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/edit-faculty/${editingFaculty.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm),
      });
      const data = await res.json();
      alert(data.message);
      setEditingFaculty(null);
      fetchFaculties(); // Refresh list
    } catch (err) {
      console.log(err);
      alert("Error updating faculty");
    }
  };

  const deleteFaculty = async (id) => {
    if(!window.confirm("Are you sure you want to delete this faculty?")) return;
    try {
      const res = await fetch(`http://localhost:5000/delete-faculty/${id}`, { method: "DELETE" });
      const data = await res.json();
      alert(data.message);
      fetchFaculties();
    } catch (err) {
      console.log(err);
      alert("Error deleting faculty");
    }
  };

  return (
    <div style={container}>
      <div style={header}>
        <h1 style={{color: "#1e293b", margin: 0}}>👨‍🏫 Manage Faculty</h1>
        <div style={{display: "flex", gap: "10px", marginTop: "15px"}}>
          <button style={tabBtn(activeTab === "add")} onClick={() => setActiveTab("add")}>Add New Faculty</button>
          <button style={tabBtn(activeTab === "list")} onClick={() => setActiveTab("list")}>Show All Faculties</button>
        </div>
      </div>

      {activeTab === "add" && (
        <div style={card}>
          <h2 style={heading}>Add New Faculty</h2>
          {message && (
            <p style={{ textAlign: "center", marginBottom: "15px", color: message.includes("successful") ? "green" : "red" }}>
              {message}
            </p>
          )}
          <form onSubmit={handleSubmit} style={form}>
            <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={input} />
            <input name="email" placeholder="Email Address" type="email" value={formData.email} onChange={handleChange} required style={input} />
            <input name="facultyId" placeholder="Faculty ID" value={formData.facultyId} onChange={handleChange} required style={input} />
            <input name="branch" placeholder="Branch (e.g. CSE, IT, ME)" value={formData.branch} onChange={handleChange} required style={input} />
            <input name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} style={input} />
            <input name="password" placeholder="Temporary Password" type="password" value={formData.password} onChange={handleChange} required style={input} />
            <button type="submit" style={btn}>Add Faculty</button>
          </form>
        </div>
      )}

      {activeTab === "list" && (
        <div style={listCard}>
          <table style={table}>
            <thead>
              <tr style={headRow}>
                <th style={th}>Faculty Name & ID</th>
                <th style={th}>Contact</th>
                <th style={th}>Branch</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculties.map(f => (
                <tr key={f.id} style={{borderBottom: "1px solid #e2e8f0"}}>
                  <td style={td}><b>{f.name}</b><br/><small style={{color: "#64748b"}}>{f.facultyId}</small></td>
                  <td style={td}>{f.email}<br/><small style={{color: "#64748b"}}>{f.mobile}</small></td>
                  <td style={td}>{f.branch}</td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={editBtn} onClick={() => openEditModal(f)}>✏️ Edit</button>
                      <button style={delBtn} onClick={() => deleteFaculty(f.id)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {faculties.length === 0 && (
                <tr><td colSpan="4" style={{textAlign: "center", padding: "20px", color: "#94a3b8"}}>No faculties found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingFaculty && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{marginTop: 0, borderBottom: "1px solid #e2e8f0", paddingBottom: "15px"}}>Edit Faculty</h2>
            <form onSubmit={submitEdit} style={form}>
              <label style={label}>Name</label>
              <input name="name" value={editForm.name} onChange={handleEditChange} required style={input} />
              
              <label style={label}>Email</label>
              <input name="email" value={editForm.email} onChange={handleEditChange} required style={input} />
              
              <label style={label}>Faculty ID</label>
              <input name="facultyId" value={editForm.facultyId} onChange={handleEditChange} required style={input} />
              
              <label style={label}>Branch</label>
              <input name="branch" value={editForm.branch} onChange={handleEditChange} required style={input} />
              
              <label style={label}>Mobile</label>
              <input name="mobile" value={editForm.mobile} onChange={handleEditChange} style={input} />
              
              <div style={{display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px"}}>
                <button type="button" onClick={() => setEditingFaculty(null)} style={cancelBtn}>Cancel</button>
                <button type="submit" style={btn}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

/* ================= STYLES ================= */
const container = {
  padding: "30px",
  minHeight: "80vh",
};

const header = {
  marginBottom: "30px"
};

const tabBtn = (active) => ({
  padding: "10px 20px",
  background: active ? "#2563eb" : "white",
  color: active ? "white" : "#475569",
  border: active ? "1px solid #2563eb" : "1px solid #cbd5e1",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  boxShadow: active ? "0 4px 6px -1px rgba(37,99,235,0.2)" : "none"
});

const card = {
  background: "white",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  width: "100%",
  maxWidth: "500px",
};

const listCard = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  width: "100%",
  overflow: "hidden"
};

const heading = {
  textAlign: "center",
  marginBottom: "20px",
  color: "#1e293b",
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const label = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#475569",
  marginBottom: "-10px"
};

const input = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  outline: "none",
};

const btn = {
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};

const cancelBtn = {
  padding: "12px",
  background: "#f1f5f9",
  color: "#475569",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};

const table = { width: "100%", borderCollapse: "collapse" };
const headRow = { background: "#f8fafc", color: "#475569" };
const th = { padding: "12px 15px", textAlign: "left", fontSize: "14px", fontWeight: "600" };
const td = { padding: "15px", fontSize: "14px", color: "#334155" };

const editBtn = {
  padding: "6px 12px", background: "#f1f5f9", color: "#2563eb", border: "1px solid #cbd5e1",
  borderRadius: "6px", cursor: "pointer", fontWeight: "600"
};
const delBtn = {
  padding: "6px 12px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
  borderRadius: "6px", cursor: "pointer", fontWeight: "600"
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
