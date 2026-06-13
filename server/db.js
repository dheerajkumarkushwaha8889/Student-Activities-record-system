const mysql = require("mysql2");

// MySQL Connection Pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Root",
  database: "record_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;



