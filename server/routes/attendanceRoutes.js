import express from "express";
import {
  getAttendance, markAttendance,
  updateAttendance, getMyAttendance
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getAttendance)
  .post(protect, markAttendance);

// ✅ Employee নিজের attendance
router.get("/my", protect, getMyAttendance);

router.route("/:id")
  .put(protect, updateAttendance);

export default router;