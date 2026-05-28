import express from "express";
import {
  getPrivateMessages, getTeamMessages,
  sendMessage, markMessagesRead, getUnreadCount, deleteMessageForMe,
  deleteMessageForEveryone
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";


const router = express.Router();

router.get("/private/:userId", protect, getPrivateMessages);
router.get("/team", protect, getTeamMessages);
router.post(
  "/send",
  protect,
  upload.single("file"),
  sendMessage
);
router.put("/read/:userId", protect, markMessagesRead);
router.get("/unread", protect, getUnreadCount);
router.put(
  "/delete-for-me/:messageId",
  protect,
  deleteMessageForMe
);

router.put(
  "/delete-for-everyone/:messageId",
  protect,
  deleteMessageForEveryone
);

export default router;