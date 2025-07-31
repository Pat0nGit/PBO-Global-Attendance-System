const express = require("express");
const router = express.Router();

const userController = require("./user.controller");
const auth = require("../../middlewares/authMiddleware");
const rateLimiter = require("../../middlewares/rateLimiter");

// Public login route
router.post("/login", rateLimiter, userController.loginUser);

// Admin-only routes
router.post(
  "/register",
  auth.verifyToken,
  auth.isAdmin,
  userController.registerUser
);

router.get("/", auth.verifyToken, auth.isAdmin, userController.getAllUsers);

router.delete(
  "/:id",
  auth.verifyToken,
  auth.isAdmin,
  userController.deleteUser
);

router.patch("/:id", auth.verifyToken, auth.isAdmin, userController.updateUser);

module.exports = router;
