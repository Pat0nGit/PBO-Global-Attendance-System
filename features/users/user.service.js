const db = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = ({ employee_id, pin }) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM users WHERE employee_id = ?",
      [employee_id],
      (err, user) => {
        if (err) return reject(err);
        if (!user) return reject(new Error("User not found"));

        const isMatch = bcrypt.compareSync(pin, user.pin);
        if (!isMatch) return reject(new Error("Invalid PIN"));

        const token = jwt.sign(
          {
            id: user.id,
            role: user.role,
            name: user.name,
            employee_id: user.employee_id,
          },
          process.env.JWT_SECRET,
          { expiresIn: "8h" }
        );

        const { pin: _hashedPin, ...userSafe } = user;
        resolve({ token, user: userSafe });
      }
    );
  });
};

const register = ({ name, employee_id, pin, role, email }) => {
  return new Promise((resolve, reject) => {
    const hashed = bcrypt.hashSync(pin, 10);
    const sql = `
      INSERT INTO users (name, employee_id, pin, role, email)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.run(sql, [name, employee_id, hashed, role, email], function (err) {
      if (err) return reject(err);
      resolve({ userId: this.lastID });
    });
  });
};

module.exports = { login, register };
