const request = require("supertest");
const express = require("express");
const app = express();
require("dotenv").config();
const bcrypt = require("bcryptjs");

// ✅ Mock authMiddleware
jest.mock("../middlewares/authMiddleware", () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 1, role: "employee" };
    next();
  },
  isAdmin: (req, res, next) => next(),
}));

const db = require("../config/db");
const logsRoutes = require("../features/logs/logs.routes");

app.use(express.json());
app.use("/api/logs", logsRoutes);

beforeAll(async () => {
  await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          name TEXT,
          employee_id TEXT,
          pin TEXT,
          role TEXT,
          email TEXT,
          contact_number TEXT
        )`
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY,
          user_id INTEGER,
          date TEXT,
          time_in TEXT,
          time_out TEXT,
          hours REAL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`
      );

      const hashed = bcrypt.hashSync("1234", 10);
      db.run(
        `INSERT OR IGNORE INTO users (id, name, employee_id, pin, role, email)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [1, "Log Tester", "loguser", hashed, "employee", "log@example.com"],
        (err) => (err ? reject(err) : resolve())
      );
    });
  });
});

afterAll(() => {
  return new Promise((resolve) => db.close(resolve));
});

describe("POST /api/logs/time-in", () => {
  it("should record a time in", async () => {
    const res = await request(app).post("/api/logs/time-in");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Time in recorded/);
  });
});

describe("POST /api/logs/time-out", () => {
  it("should record a time out", async () => {
    const res = await request(app).post("/api/logs/time-out");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Time out recorded/);
  });
});
