import express from "express";
import {
  getHolidays, createHoliday,
  updateHoliday, deleteHoliday
} from "../controllers/holidayController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getHolidays);
router.post("/", protect, adminOnly, createHoliday);
router.put("/:id", protect, adminOnly, updateHoliday);
router.delete("/:id", protect, adminOnly, deleteHoliday);

export default router;