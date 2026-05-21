import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  employeeName: { type: String, required: true },
  month: { type: String, required: true },
  year: { type: String, required: true },
  taskCompleted: { type: Number, default: 0 },
  taskTotal: { type: Number, default: 0 },
  attendancePresent: { type: Number, default: 0 },
  attendanceTotal: { type: Number, default: 0 },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  comment: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Performance", performanceSchema);