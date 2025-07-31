const service = require("./user.service");
const db = require("../../config/db");

const UserController = {
  loginUser: async (req, res) => {
    try {
      const { token, user } = await service.login(req.body);
      res.json({ success: true, token, user });
    } catch (err) {
      res.status(401).json({ success: false, message: err.message });
    }
  },

  registerUser: async (req, res) => {
    try {
      const result = await service.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  getAllUsers: (_req, res) => {
    db.all(
      "SELECT id, name, employee_id, role, email FROM users",
      [],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  },

  deleteUser: (req, res) => {
    db.run("DELETE FROM users WHERE id = ?", [req.params.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    });
  },

  updateUser: (req, res) => {
    const { id } = req.params;
    const { name, employee_id, email, role } = req.body;

    if (!name || !employee_id || !role) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const query = `
      UPDATE users 
      SET name = ?, employee_id = ?, email = ?, role = ?
      WHERE id = ?
    `;

    db.run(query, [name, employee_id, email || null, role, id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    });
  },
};

module.exports = UserController;
