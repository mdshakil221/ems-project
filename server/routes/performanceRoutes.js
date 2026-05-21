import express from "express";
import {
  getPerformances, generatePerformances,
  updatePerformance, getMyPerformance
} from "../controllers/performanceController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my", protect, getMyPerformance);
router.get("/", protect, adminOnly, getPerformances);
router.post("/generate", protect, adminOnly, generatePerformances);
router.put("/:id", protect, adminOnly, updatePerformance);

export default router;