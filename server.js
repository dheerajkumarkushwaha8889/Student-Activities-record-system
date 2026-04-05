const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {

  console.log("Register API HIT 🔥");
  console.log(req.body);

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

  const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!emailPattern.test(email)) {
    return res.json({ message: "Invalid Email ❌" });
  }

  const validRoles = ["student", "faculty", "admin"];
  if (!validRoles.includes(role)) {
    return res.json({ message: "Invalid role ❌" });
  }

  try {
    const checkSql = "SELECT * FROM user WHERE email=?";

    db.query(checkSql, [email], async (err, data) => {

      if (err) {
        console.log(err);
        return res.json({ message: "Database error ❌" });
      }

      if (data.length > 0) {
        return res.json({ message: "Email already exists ❌" });
      }

      if (role === "student") {
        if (!roll || !branch || !batch) {
          return res.json({ message: "Student fields required ❌" });
        }
      }

      if (role === "faculty") {
        if (!facultyId || !branch) {
          return res.json({ message: "Faculty fields required ❌" });
        }
      }

      if (role === "admin") {
        if (!adminCode) {
          return res.json({ message: "Admin code required ❌" });
        }
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
        (err) => {

          if (err) {
            console.log(err);
            return res.json({ message: err.message });
          }

          return res.json({ message: "Registration successful ✅" });
        }
      );

    });

  } catch (error) {
    console.log(error);
    return res.json({ message: "Server error ❌" });
  }
});


/* ================= LOGIN ================= */
app.post("/login", (req, res) => {

  console.log("Login API HIT 🔥");
  console.log(req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ message: "Email and password required ❌" });
  }

  const sql = "SELECT * FROM user WHERE email=?";

  db.query(sql, [email], async (err, result) => {

    if (err) {
      console.log(err);
      return res.json({ message: "Database error ❌" });
    }

    if (result.length === 0) {
      return res.json({ message: "Invalid Email or Password ❌" });
    }

    const user = result[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.json({ message: "Invalid Email or Password ❌" });
      }

      return res.json({
        message: "Login successful ✅",
        user: user
      });

    } catch (err) {
      console.log(err);
      return res.json({ message: "Error comparing password ❌" });
    }

  });

});


/* ================= FORGOT PASSWORD ================= */
app.post("/forgot-password", (req, res) => {

  const { email } = req.body;

  if (!email) {
    return res.json({ message: "Email required ❌" });
  }

  const sql = "SELECT * FROM user WHERE email=?";

  db.query(sql, [email], (err, result) => {

    if (err) {
      console.log(err);
      return res.json({ message: "Database error ❌" });
    }

    if (result.length === 0) {
      return res.json({ message: "Email not found ❌" });
    }

    res.json({ message: "User found ✅" });

  });

});


/* ================= RESET PASSWORD ================= */
app.post("/reset-password", async (req, res) => {

  console.log("RESET API HIT 🔥");
  console.log(req.body);

  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.json({ message: "All fields required ❌" });
  }

  try {
    const checkSql = "SELECT * FROM user WHERE email=?";

    db.query(checkSql, [email], async (err, result) => {

      if (err) {
        console.log(err);
        return res.json({ message: "Database error ❌" });
      }

      if (result.length === 0) {
        return res.json({ message: "User not found ❌" });
      }

      const hashed = await bcrypt.hash(newPassword, 10);

      const updateSql = "UPDATE user SET password=? WHERE email=?";

      db.query(updateSql, [hashed, email], (err) => {

        if (err) {
          console.log(err);
          return res.json({ message: "Update failed ❌" });
        }

        return res.json({ message: "Password updated successfully ✅" });

      });

    });

  } catch (error) {
    console.log(error);
    return res.json({ message: "Server error ❌" });
  }

});


/* ================= SUBMIT ACTIVITY ================= */
app.post("/submit-activity", (req, res) => {

  const {
    studentEmail,
    studentName,
    branch,
    batch,
    title,
    type,
    description,
    date
  } = req.body;

  const sql = `
    INSERT INTO activities 
    (studentEmail, studentName, branch, batch, title, type, description, date, status, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', '')
  `;

  db.query(
    sql,
    [studentEmail, studentName, branch, batch, title, type, description, date],
    (err) => {
      if (err) {
        console.log(err);
        return res.json({ message: "Database Error ❌" });
      }

      res.json({ message: "Activity Saved in DB ✅" });
    }
  );

});


/* ================= GET MY ACTIVITIES ================= */
app.get("/my-activities", (req, res) => {

  const { email } = req.query;

  const sql = "SELECT * FROM activities WHERE studentEmail=? ORDER BY id DESC";

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.log(err);
      return res.json([]);
    }

    res.json(result);
  });

});


/* ================= GET ALL ACTIVITIES ================= */
app.get("/all-activities", (req, res) => {

  const sql = "SELECT * FROM activities ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.json([]);
    }

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

  db.query(sql, [status, remarks, id], (err) => {

    if (err) {
      console.log(err);
      return res.json({ message: "Update failed ❌" });
    }

    res.json({ message: "Status updated successfully ✅" });

  });

});


/* ================= DELETE ================= */
app.delete("/delete-activity/:id", (req, res) => {

  const { id } = req.params;

  const sql = "DELETE FROM activities WHERE id=?";

  db.query(sql, [id], (err) => {

    if (err) {
      console.log(err);
      return res.json({ message: "Delete failed ❌" });
    }

    res.json({ message: "Deleted successfully ✅" });

  });

});


/* ================= SERVER ================= */
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});