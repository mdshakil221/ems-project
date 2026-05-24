import multer from "multer";

// ✅ Memory storage — file disk এ save হবে না
const taskUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg", "image/jpg", "image/png", "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("শুধুমাত্র JPG, PNG, PDF, DOC, DOCX, XLS, XLSX ফাইল!"), false);
    }
  }
});

export default taskUpload;