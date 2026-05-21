import express from "express";
import {
  getSalaries, generateSalaries,
  updateSalary, paySalary, getMySalaries
} from "../controllers/salaryController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ /my আগে রাখতে হবে — নাহলে /:id এর সাথে conflict হয়
router.get("/my", protect, getMySalaries);

router.get("/", protect, adminOnly, getSalaries);
router.post("/generate", protect, adminOnly, generateSalaries);
router.put("/:id", protect, adminOnly, updateSalary);
router.put("/:id/pay", protect, adminOnly, paySalary);

export default router;