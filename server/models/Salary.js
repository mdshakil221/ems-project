import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  employeeName: { type: String, required: true },
  basicSalary: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
  deduction: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  month: { type: String, required: true },
  year: { type: String, required: true },
  status: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
  paidAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model("Salary", salarySchema);