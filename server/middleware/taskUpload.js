import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isImage = ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.mimetype);
    return {
      folder: "ems-tasks",
      resource_type: isImage ? "image" : "raw", // ✅ PDF/DOC এর জন্য raw
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx", "xls", "xlsx"],
    };
  },
});

const taskUpload = multer({ storage });

export default taskUpload;