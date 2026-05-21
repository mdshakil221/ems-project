import express from "express";
import {
  getNotifications, markAsRead,
  markAllRead, deleteNotification, deleteAllNotifications
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getNotifications)
  .delete(protect, deleteAllNotifications);

router.route("/read-all")
  .put(protect, markAllRead);

router.route("/:id")
  .put(protect, markAsRead)
  .delete(protect, deleteNotification);

export default router;