const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {

  const {
    name,
    email,
    password,
    role,
    branch,
    batch,
    mobile,
    roll,
    facultyId,
    adminCode
  } = req.body;

  if (!name || !email || !password || !role) {
    return res.json({ message: "All required fields must be filled ❌" });
  }

  try {
    const checkSql = "SELECT * FROM user WHERE email=?";

    db.query(checkSql, [email], async (err, data) => {

      if (err) return res.json({ message: "Database error ❌" });

      if (data.length > 0) {
        return res.json({ message: "Email already exists ❌" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertSql = `
        INSERT INTO user 
        (name, roll, email, password, role, branch, batch, mobile, facultyId, adminCode) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          name,
          roll || null,
          email,
          hashedPassword,
          role,
          branch || null,
          batch || null,
          mobile || null,
          facultyId || null,
          adminCode || null
        ],
        () => res.json({ message: "Registration successful ✅" })
      );
    });

  } catch {
    res.json({ message: "Server error ❌" });
  }
});


/* ================= LOGIN ================= */
app.post("/login", (req, res) => {

  const { email, password } = req.body;

  const sql = "SELECT * FROM user WHERE email=?";

  db.query(sql, [email], async (err, result) => {

    if (result.length === 0) {
      return res.json({ message: "Invalid Email or Password ❌" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ message: "Invalid Email or Password ❌" });
    }

    res.json({
      message: "Login successful ✅",
      user: user
    });
  });
});


/* ================= RESET PASSWORD ================= */
app.post("/reset-password", async (req, res) => {

  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.json({ message: "All fields required ❌" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  const sql = "UPDATE user SET password=? WHERE email=?";

  db.query(sql, [hashed, email], () => {
    res.json({ message: "Password updated successfully ✅" });
  });
});


/* ================= SUBMIT ACTIVITY (UPDATED 🔥) ================= */
app.post("/submit-activity", (req, res) => {

  const {
    studentEmail,
    studentName,
    roll,
    branch,
    batch,
    title,
    type,
    description,
    date,
    organizer,
    mode,
    position,
    proofLink
  } = req.body;

  const sql = `
    INSERT INTO activities 
    (
      studentEmail,
      studentName,
      roll,
      branch,
      batch,
      title,
      type,
      description,
      date,
      organizer,
      mode,
      position,
      proofLink,
      status,
      remarks
    )
    VALUES (?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', '')
  `;

  db.query(
    sql,
    [
      studentEmail,
      studentName,
      roll,
      branch,
      batch,
      title,
      type,
      description,
      date,
      organizer || null,
      mode || null,
      position || null,
      proofLink || null
    ],
    (err) => {
      if (err) {
        console.log(err);
        return res.json({ message: "Database Error ❌" });
      }

      res.json({ message: "Activity Submitted Successfully ✅" });
    }
  );
});


/* ================= GET MY ACTIVITIES ================= */
app.get("/my-activities", (req, res) => {

  const { email } = req.query;

  const sql = "SELECT * FROM activities WHERE studentEmail=? ORDER BY id DESC";

  db.query(sql, [email], (err, result) => {
    res.json(result);
  });
});


/* ================= GET ALL ACTIVITIES ================= */
app.get("/all-activities", (req, res) => {

  const sql = "SELECT * FROM activities ORDER BY id DESC";

  db.query(sql, (err, result) => {
    res.json(result);
  });
});


/* ================= UPDATE STATUS ================= */
app.put("/update-status/:id", (req, res) => {

  const { id } = req.params;
  const { status, remarks } = req.body;

  const sql = `
    UPDATE activities 
    SET status=?, remarks=? 
    WHERE id=?
  `;

  db.query(sql, [status, remarks, id], () => {
    res.json({ message: "Status updated successfully ✅" });
  });
});


/* ================= DELETE ================= */
app.delete("/delete-activity/:id", (req, res) => {

  const { id } = req.params;

  const sql = "DELETE FROM activities WHERE id=?";

  db.query(sql, [id], () => {
    res.json({ message: "Deleted successfully ✅" });
  });
});


/* ================= SERVER ================= */
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});