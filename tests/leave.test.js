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
const leaveRoutes = require("../features/leave/leave.routes");

app.use(express.json());
app.use("/api/leave", leaveRoutes);

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
        `CREATE TABLE IF NOT EXISTS leave_requests (
          id INTEGER PRIMARY KEY,
          user_id INTEGER,
          reason TEXT NOT NULL,
          from_date TEXT NOT NULL,
          to_date TEXT,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`
      );

      const hashed = bcrypt.hashSync("1234", 10);
      db.run(
        `INSERT OR IGNORE INTO users (id, name, employee_id, pin, role, email)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [1, "Test User", "test01", hashed, "employee", "test@example.com"],
        (err) => (err ? reject(err) : resolve())
      );
    });
  });
});

afterAll(() => {
  return new Promise((resolve) => db.close(resolve));
});

describe("POST /api/leave", () => {
  it("should return 201 on valid leave request", async () => {
    const res = await request(app).post("/api/leave").send({
      reason: "Test Sick Leave",
      from_date: "2025-07-20",
      to_date: "2025-07-21",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/submitted/i);
  });

  it("should fail with 500 if missing reason", async () => {
    const res = await request(app).post("/api/leave").send({
      from_date: "2025-07-20",
    });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body.error).toBeDefined();
  });
});
