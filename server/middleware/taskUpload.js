import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ems-tasks",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx", "xls", "xlsx"],
    resource_type: "auto", // ✅ সব ধরনের file support
  },
});

const taskUpload = multer({ storage });

export default taskUpload;