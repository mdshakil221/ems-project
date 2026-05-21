import express from "express";
import {
  registerUser, loginUser, getProfile,
  uploadProfileImage, updateProfile,
  getAllUsers, toggleUserStatus,
  resetUserPassword, deleteUser,
  getUserByEmail // ✅ যোগ করুন
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/profile/image", protect, upload.single("profileImage"), uploadProfileImage);

// ✅ Admin Routes
router.get("/users", protect, adminOnly, getAllUsers);
router.put("/users/:id/toggle", protect, adminOnly, toggleUserStatus);
router.put("/users/:id/reset-password", protect, adminOnly, resetUserPassword);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.get("/users/email/:email", protect, adminOnly, getUserByEmail);

export default router;