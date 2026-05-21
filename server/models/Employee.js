import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  department: { type: String },
  position: { type: String },
  salary: { type: Number },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  joinDate: { type: String },
  avatar: { type: String },
  // ✅ Login তথ্য plain text এ store
  loginEmail: { type: String },
  loginPassword: { type: String },
}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);