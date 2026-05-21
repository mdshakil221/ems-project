import express from "express";
import { getLeaves, createLeave, updateLeaveStatus, deleteLeave } from "../controllers/leaveController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getLeaves)
  .post(protect, createLeave);

router.route("/:id")
  .put(protect, adminOnly, updateLeaveStatus)
  .delete(protect, adminOnly, deleteLeave);

export default router;