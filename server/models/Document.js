import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  employeeName: { type: String, required: true },
  employeeEmail: { type: String, required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ["nid", "certificate", "contract", "photo", "other"],
    default: "other"
  },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number },
  uploadedBy: { type: String },
}, { timestamps: true });

export default mongoose.model("Document", documentSchema);