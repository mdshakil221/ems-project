import express from "express";
import {
  getAnnouncements, createAnnouncement,
  deleteAnnouncement, markAnnouncementRead
} from "../controllers/announcementController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAnnouncements);
router.post("/", protect, adminOnly, createAnnouncement);
router.delete("/:id", protect, adminOnly, deleteAnnouncement);
router.put("/:id/read", protect, markAnnouncementRead);

export default router;