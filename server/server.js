const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Socket connection & active users map
const activeUsers = {}; // email -> socket.id

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("register", (email) => {
    if (email) {
      activeUsers[email] = socket.id;
      console.log(`Registered socket for ${email}: ${socket.id}`);
    }
  });

  socket.on("disconnect", () => {
    for (const email in activeUsers) {
      if (activeUsers[email] === socket.id) {
        delete activeUsers[email];
        console.log(`Unregistered socket for ${email}`);
        break;
      }
    }
  });
});

// Initialize database tables
const initDB = () => {
  const createNotificationsTable = `
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      recipientEmail VARCHAR(100) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) NOT NULL,
      isRead TINYINT(1) DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createNotificationsTable, (err) => {
    if (err) {
      console.error("Error creating notifications table:", err);
    } else {
      console.log("Notifications table verified/created ✅");
    }
  });
};
initDB();

// Helper to notify a user
const notifyUser = (recipientEmail, notificationData) => {
  const sql = "INSERT INTO notifications (recipientEmail, message, type) VALUES (?, ?, ?)";
  db.query(sql, [recipientEmail, notificationData.message, notificationData.type], (err, result) => {
    if (err) {
      console.error("Error saving notification to DB:", err);
      return;
    }

    const newNotification = {
      id: result.insertId,
      recipientEmail,
      message: notificationData.message,
      type: notificationData.type,
      isRead: 0,
      createdAt: new Date()
    };

    const socketId = activeUsers[recipientEmail];
    if (socketId) {
      io.to(socketId).emit("new_notification", newNotification);
      console.log(`Sent real-time notification to ${recipientEmail}`);
    }
  });
};

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

      if (err) {
        console.error("REGISTER CHECK ERROR:", err);
        return res.status(500).json({
          message: "Database error ❌",
          error: err.message
        });
      }

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
        (err2) => {

          if (err2) {
            console.error("REGISTER INSERT ERROR:", err2);
            return res.status(500).json({
              message: "Database error ❌",
              error: err2.message
            });
          }

          res.json({ message: "Registration successful ✅" });
        }
      );
    });

  } catch (err) {
    console.error("REGISTER SERVER ERROR:", err);
    res.status(500).json({
      message: "Server error ❌",
      error: err.message
    });
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

      // Notify faculty of the same branch
      const facultySql = "SELECT email FROM user WHERE role='faculty' AND branch=?";
      db.query(facultySql, [branch], (err2, faculties) => {
        if (!err2 && faculties) {
          faculties.forEach(fac => {
            notifyUser(fac.email, {
              message: `Student ${studentName} (${roll || "N/A"}) has submitted a new activity: "${title}"`,
              type: "activity_submitted"
            });
          });
        }
      });
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


/* ================= GET NOTIFICATIONS ================= */
app.get("/notifications", (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email required" });

  const sql = "SELECT * FROM notifications WHERE recipientEmail=? ORDER BY id DESC";
  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Database Error" });
    res.json(result);
  });
});

/* ================= MARK NOTIFICATION AS READ ================= */
app.put("/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE notifications SET isRead=1 WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: "Database Error" });
    res.json({ success: true, message: "Notification marked as read" });
  });
});

/* ================= MARK ALL NOTIFICATIONS AS READ ================= */
app.put("/notifications/read-all", (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email required" });

  const sql = "UPDATE notifications SET isRead=1 WHERE recipientEmail=?";
  db.query(sql, [email], (err) => {
    if (err) return res.status(500).json({ message: "Database Error" });
    res.json({ success: true, message: "All notifications marked as read" });
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

  db.query(sql, [status, remarks, id], (err) => {
    if (err) return res.json({ message: "Database Error ❌" });
    res.json({ message: "Status updated successfully ✅" });

    // Notify Student and Admin
    const getActivitySql = "SELECT studentName, studentEmail, roll, title FROM activities WHERE id=?";
    db.query(getActivitySql, [id], (err2, actResult) => {
      if (!err2 && actResult && actResult.length > 0) {
        const act = actResult[0];

        // 1. Notify Student
        notifyUser(act.studentEmail, {
          message: `Your activity "${act.title}" has been ${status.toLowerCase()} by the faculty.${remarks ? ' Remarks: ' + remarks : ''}`,
          type: "activity_verified"
        });

        // 2. Notify Admins
        const adminSql = "SELECT email FROM user WHERE role='admin'";
        db.query(adminSql, (err3, admins) => {
          if (!err3 && admins) {
            admins.forEach(admin => {
              notifyUser(admin.email, {
                message: `Faculty has ${status.toLowerCase()} the activity "${act.title}" submitted by ${act.studentName} (${act.roll || "N/A"}).`,
                type: "activity_verified"
              });
            });
          }
        });
      }
    });
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
app.put("/edit-activity/:id", upload.array("files", 10), (req, res) => {
  const { id } = req.params;
  const { title, type, description, date, organizer, mode, position, proofLink } = req.body;

  let finalProofLink = proofLink || "";
  if (req.files && req.files.length > 0) {
    const newFiles = req.files.map(f => f.filename).join(",");
    if (finalProofLink) {
      // Split and clean existing proof links to ensure no empty values
      const existing = finalProofLink.split(",").map(f => f.trim()).filter(Boolean);
      existing.push(...req.files.map(f => f.filename));
      finalProofLink = existing.join(",");
    } else {
      finalProofLink = newFiles;
    }
  }

  const sql = `
    UPDATE activities 
    SET title=?, type=?, description=?, date=?, organizer=?, mode=?, position=?, proofLink=?, status='Pending', remarks=''
    WHERE id=?
  `;

  db.query(sql, [title, type, description, date, organizer || null, mode || null, position || null, finalProofLink || null, id], (err) => {
    if (err) {
      console.log(err);
      return res.json({ message: "Database Error ❌" });
    }
    res.json({ message: "Activity updated successfully ✅" });

    // Fetch details to notify branch faculty
    const getActivitySql = "SELECT studentName, studentEmail, roll, branch, title FROM activities WHERE id=?";
    db.query(getActivitySql, [id], (err2, actResult) => {
      if (!err2 && actResult && actResult.length > 0) {
        const act = actResult[0];

        const facultySql = "SELECT email FROM user WHERE role='faculty' AND branch=?";
        db.query(facultySql, [act.branch], (err3, faculties) => {
          if (!err3 && faculties) {
            faculties.forEach(fac => {
              notifyUser(fac.email, {
                message: `Student ${act.studentName} (${act.roll || "N/A"}) has updated the activity: "${title || act.title}"`,
                type: "activity_updated"
              });
            });
          }
        });
      }
    });
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
  const sql = "SELECT id, name, email, facultyId, branch, mobile, signature FROM user WHERE role='Faculty'";
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

/* ================= UPLOAD FACULTY SIGNATURE ================= */
app.post("/upload-signature", upload.single("signature"), (req, res) => {
  const { email } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded ❌" });
  }

  const signaturePath = req.file.filename;
  const sql = "UPDATE user SET signature = ? WHERE email = ? AND role = 'faculty'";
  
  db.query(sql, [signaturePath, email], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database Error ❌" });
    }
    res.json({ message: "Signature uploaded successfully ✅", signature: signaturePath });
  });
});

/* ================= GET USER PROFILE ================= */
app.get("/user-profile", (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email required" });

  const sql = "SELECT id, name, email, role, branch, batch, mobile, facultyId, roll, semester, signature FROM user WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database Error" });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    
    res.json(results[0]);
  });
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
