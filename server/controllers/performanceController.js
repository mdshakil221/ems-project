import Performance from "../models/Performance.js";
import Task from "../models/Task.js";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import { createNotification } from "./notificationController.js";

// সব Performance দেখুন
export const getPerformances = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (month) filter.month = month;
    if (year) filter.year = year;
    const performances = await Performance.find(filter).sort({ rating: -1 });
    res.json(performances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Performance Generate করুন
export const generatePerformances = async (req, res) => {
  try {
    const { month, year } = req.body;
    const employees = await Employee.find({ status: "active" });
    const generated = [];

    for (const emp of employees) {
      const existing = await Performance.findOne({
        employeeId: emp._id, month, year
      });
      if (existing) continue;

      // Task count
      const tasks = await Task.find({ assignedTo: emp.name });
      const completedTasks = tasks.filter(t => t.status === "completed").length;

      // Attendance count
      const attendance = await Attendance.find({ employeeId: emp._id });
      const presentCount = attendance.filter(a => a.status === "present").length;

      const performance = await Performance.create({
        employeeId: emp._id,
        employeeName: emp.name,
        month,
        year,
        taskCompleted: completedTasks,
        taskTotal: tasks.length,
        attendancePresent: presentCount,
        attendanceTotal: attendance.length,
        rating: 3,
        comment: ""
      });
      generated.push(performance);
    }
    res.status(201).json({
      message: `${generated.length} জন কর্মীর Performance তৈরি হয়েছে!`,
      performances: generated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Performance আপডেট করুন
export const updatePerformance = async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id);
    if (!performance) {
      return res.status(404).json({ message: "Performance পাওয়া যায়নি!" });
    }
    performance.rating = req.body.rating || performance.rating;
    performance.comment = req.body.comment || performance.comment;
    const updated = await performance.save();

    await createNotification(
      `⭐ ${performance.employeeName} এর ${performance.month}/${performance.year} Performance Rating: ${performance.rating}/5`,
      "performance"
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Employee নিজের Performance দেখুন
export const getMyPerformance = async (req, res) => {
  try {
    const performances = await Performance.find({
      employeeName: req.user.name
    }).sort({ createdAt: -1 });
    res.json(performances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};