import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  type: {
    type: String,
    enum: ["public", "optional", "restricted"],
    default: "public"
  },
  description: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Holiday", holidaySchema);