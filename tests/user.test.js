const request = require("supertest");
const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
require("dotenv").config();

//  Mock auth
jest.mock("../middlewares/authMiddleware", () => ({
  verifyToken: (req, res, next) => next(),
  isAdmin: (req, res, next) => next(),
}));

const db = require("../config/db");
const userRoutes = require("../features/users/user.routes");

app.use(express.json());
app.use("/api/users", userRoutes);

beforeAll(() => {
  const hashed = bcrypt.hashSync("1234", 10); //  hash the expected pin

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`DELETE FROM users WHERE employee_id = ?`, ["test123"]);
      db.run(
        `INSERT INTO users (name, employee_id, pin, role, email)
         VALUES (?, ?, ?, ?, ?)`,
        ["Test User", "test123", hashed, "employee", "test@example.com"],
        (err) => (err ? reject(err) : resolve())
      );
    });
  });
});

afterAll(() => {
  return new Promise((resolve) => db.close(resolve));
});

describe("POST /api/users/login", () => {
  it("should return a JWT on correct login", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ employee_id: "test123", pin: "1234" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it("should fail with wrong pin", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ employee_id: "test123", pin: "wrong" });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
