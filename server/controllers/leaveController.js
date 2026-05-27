import Leave from "../models/Leave.js";
import Notification from "../models/Notification.js";
import { createLog } from "./activityLogController.js";

export const getLeaves = async (req, res) => {
  const leaves = await Leave.find({}).sort({ createdAt: -1 });
  res.json(leaves);
};

export const createLeave = async (req, res) => {
  const { employeeName, type, from, to, days, reason } = req.body;
  const leave = await Leave.create({
    employeeName, type, from, to, days, reason
  });
  await createLog(
    req.user._id, req.user.name, req.user.role,
    `ছুটির আবেদন করেছে`,
    "leave",
    `Type: ${type}, From: ${from}, To: ${to}`
  );
  await Notification.create({
    message: `${employeeName} ছুটির আবেদন করেছে`,
    type: "leave"
  });
  res.status(201).json(leave);
};

export const updateLeaveStatus = async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  await createLog(
    req.user._id, req.user.name, req.user.role,
    `${leave.employeeName} এর ছুটি ${req.body.status === "approved" ? "অনুমোদন" : "প্রত্যাখ্যান"} করেছে`,
    "leave",
    `Type: ${leave.type}, Days: ${leave.days}`
  );
  if (leave) {
    leave.status = req.body.status || leave.status;
    const updated = await leave.save();
    res.json(updated);
  } else {
    res.status(404).json({ message: "আবেদন পাওয়া যায়নি!" });
  }
};

export const deleteLeave = async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (leave) {
    await leave.deleteOne();
    res.json({ message: "আবেদন মুছে ফেলা হয়েছে!" });
  } else {
    res.status(404).json({ message: "আবেদন পাওয়া যায়নি!" });
  }
};