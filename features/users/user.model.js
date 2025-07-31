const db = require("../../config/db");

const createUserTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      employee_id TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL,
      role TEXT CHECK(role IN ('employee', 'intern', 'admin')) NOT NULL,
      email TEXT,
      contact_number TEXT
    )
  `);
};

module.exports = { createUserTable };
