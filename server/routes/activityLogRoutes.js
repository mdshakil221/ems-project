import express from "express";
import { getLogs, clearLogs } from "../controllers/activityLogController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, getLogs);
router.delete("/", protect, adminOnly, clearLogs);

export default router;
