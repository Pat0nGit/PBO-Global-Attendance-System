const express = require("express");
const router = express.Router();
const leaveController = require("./leave.controller");
const auth = require("../../middlewares/authMiddleware");

router.post("/", auth.verifyToken, leaveController.requestLeave);
router.get("/my", auth.verifyToken, leaveController.getMyLeaves);

router.patch(
  "/:id/status",
  auth.verifyToken,
  auth.isAdmin,
  leaveController.updateLeaveStatus
);
router.get(
  "/all",
  auth.verifyToken,
  auth.isAdmin,
  leaveController.getAllLeaves
);

router.get(
  "/:id",
  auth.verifyToken,
  auth.isAdmin,
  leaveController.getLeaveById
);

module.exports = router;
