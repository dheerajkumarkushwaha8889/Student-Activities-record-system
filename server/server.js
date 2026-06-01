const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// Multer Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

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
    adminCode,
    semester
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
        (name, roll, email, password, role, branch, batch, mobile, facultyId, adminCode, semester) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          adminCode || null,
          semester || null
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
app.post("/submit-activity", upload.single("file"), (req, res) => {

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

  let finalProofLink = proofLink || null;
  if (req.file) {
    finalProofLink = req.file.filename;
  }

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
      finalProofLink
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
  const { branch } = req.query;

  let sql = "SELECT * FROM activities";
  let params = [];

  if (branch) {
    sql += " WHERE branch = ?";
    params.push(branch);
  }

  sql += " ORDER BY id DESC";

  db.query(sql, params, (err, result) => {
    if (err) return res.json({ message: "Database Error" });
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


/* ================= EDIT ACTIVITY ================= */
app.put("/edit-activity/:id", (req, res) => {
  const { id } = req.params;
  const { title, type, description, date, organizer, mode, position } = req.body;

  const sql = `
    UPDATE activities 
    SET title=?, type=?, description=?, date=?, organizer=?, mode=?, position=?
    WHERE id=?
  `;

  db.query(sql, [title, type, description, date, organizer || null, mode || null, position || null, id], (err) => {
    if (err) {
      console.log(err);
      return res.json({ message: "Database Error ❌" });
    }
    res.json({ message: "Activity updated successfully ✅" });
  });
});


/* ================= GET ALL STUDENTS ================= */
app.get("/all-students", (req, res) => {
  const sql = "SELECT name, email, roll, branch, batch, mobile, semester FROM user WHERE role='Student'";
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ message: "Database Error ❌" });
    }
    res.json(result);
  });
});

/* ================= EDIT STUDENT PROFILE ================= */
app.put("/edit-student/:email", (req, res) => {
  const { email } = req.params;
  const { name, roll, branch, batch, mobile, semester } = req.body;
  const sql = "UPDATE user SET name=?, roll=?, branch=?, batch=?, mobile=?, semester=? WHERE email=? AND role='student'";
  db.query(sql, [name, roll, branch, batch, mobile, semester, email], (err) => {
    if (err) {
      console.log(err);
      return res.json({ message: "Database Error ❌" });
    }
    res.json({ message: "Profile updated successfully ✅" });
  });
});

/* ================= GET ALL FACULTIES ================= */
app.get("/all-faculties", (req, res) => {
  const sql = "SELECT id, name, email, facultyId, branch, mobile FROM user WHERE role='Faculty'";
  db.query(sql, (err, result) => {
    if (err) return res.json({ message: "Database Error ❌" });
    res.json(result);
  });
});

/* ================= EDIT FACULTY ================= */
app.put("/edit-faculty/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, facultyId, branch, mobile } = req.body;
  const sql = "UPDATE user SET name=?, email=?, facultyId=?, branch=?, mobile=? WHERE id=? AND role='Faculty'";
  db.query(sql, [name, email, facultyId, branch, mobile, id], (err) => {
    if (err) return res.json({ message: "Database Error ❌" });
    res.json({ message: "Faculty updated successfully ✅" });
  });
});

/* ================= DELETE FACULTY ================= */
app.delete("/delete-faculty/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM user WHERE id=? AND role='Faculty'";
  db.query(sql, [id], (err) => {
    if (err) return res.json({ message: "Database Error ❌" });
    res.json({ message: "Faculty deleted successfully ✅" });
  });
});

/* ================= VERIFY PORTFOLIO ================= */
app.get("/verify-portfolio/:token", (req, res) => {
  const { token } = req.params;
  
  try {
    // Decode base64 email
    const email = Buffer.from(token, 'base64').toString('utf-8');

    // Fetch user details
    const userSql = "SELECT name, email, roll, branch, batch, mobile, semester FROM user WHERE email = ? AND role = 'Student'";
    db.query(userSql, [email], (err, userResult) => {
      if (err) return res.json({ success: false, message: "Database Error" });
      
      if (userResult.length === 0) {
        return res.json({ success: false, message: "Student not found" });
      }

      const student = userResult[0];

      // Fetch ONLY Approved activities
      const activitiesSql = "SELECT * FROM activities WHERE studentEmail = ? AND status = 'Approved' ORDER BY date DESC";
      db.query(activitiesSql, [email], (err, activitiesResult) => {
        if (err) return res.json({ success: false, message: "Database Error" });

        res.json({
          success: true,
          student: student,
          activities: activitiesResult
        });
      });
    });

  } catch (error) {
    res.json({ success: false, message: "Invalid Verification Token" });
  }
});

/* ================= SERVER ================= */
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});