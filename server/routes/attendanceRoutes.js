import express from "express";
import {
  getAttendance, markAttendance,
  updateAttendance, getMyAttendance,
  checkIn, checkOut, getTodayAttendance
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getAttendance)
  .post(protect, markAttendance);

// ✅ Employee নিজের attendance
router.get("/my", protect, getMyAttendance);
router.get("/today", protect, getTodayAttendance);

// ✅ Employee Check In/Out
router.post("/checkin", protect, checkIn);
router.post("/checkout", protect, checkOut);

router.route("/:id")
  .put(protect, updateAttendance);

export default router;