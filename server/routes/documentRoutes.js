import express from "express";
import {
  getAllDocuments, getMyDocuments,
  uploadDocument, downloadDocument, deleteDocument
} from "../controllers/documentController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import documentUpload from "../middleware/documentUpload.js";

const router = express.Router();

router.get("/my", protect, getMyDocuments);
router.get("/", protect, adminOnly, getAllDocuments);
router.post("/upload", protect, documentUpload.single("document"), uploadDocument);
router.get("/download/:id", protect, downloadDocument);
router.delete("/:id", protect, deleteDocument);

export default router;