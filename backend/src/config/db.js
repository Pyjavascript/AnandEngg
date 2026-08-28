// use ananddb;

// SHOW tables from ananddb;

// SELECT * FROM app_notifications;
// SELECT * FROM report_categories;
// SELECT * FROM report_parts;
// SELECT * FROM report_submissions;
// SELECT * FROM report_templates;
// SELECT * FROM reports;
// SELECT * FROM roles;
// SELECT * FROM submission_values;
// SELECT * FROM template_fields;
// SELECT * FROM user_push_tokens;
// SELECT * FROM users;


// module.exports = db;
// const mysql = require('mysql2/promise');

// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// module.exports = db;


const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;