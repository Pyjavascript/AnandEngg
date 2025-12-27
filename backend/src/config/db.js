const mysql = require('mysql2');


const db = mysql.createPool({
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || DB_PASS,
  database: process.env.MYSQLDATABASE || DB_NAME,
  port: process.env.MYSQLPORT || 3306;
});
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL Database");
});

module.exports = db;