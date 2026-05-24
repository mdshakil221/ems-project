import express from "express";
import {
  getTasks, createTask, updateTask, deleteTask,
  submitEmployeeAttachment, deleteTaskAttachment
} from "../controllers/taskController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import taskUpload from "../middleware/taskUpload.js";

const router = express.Router();

router.get("/", protect, getTasks);
router.post("/", protect, adminOnly, taskUpload.array("attachments", 5), createTask);
router.put("/:id", protect, taskUpload.array("attachments", 5), updateTask);
router.delete("/:id", protect, adminOnly, deleteTask);

// ✅ Employee Attachment Submit
router.post("/:id/submit", protect, taskUpload.array("files", 5), submitEmployeeAttachment);

// Delete Attachment
router.delete("/:id/attachment/:filename/:type", protect, deleteTaskAttachment);

export default router;