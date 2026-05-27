import Attendance from "../models/Attendance.js";
import { createNotification } from "./notificationController.js";
import { createLog } from "./activityLogController.js";

export const getAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = date ? { date } : {};
    const attendance = await Attendance.find(filter).sort({ createdAt: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const { employeeId, employeeName, date, checkIn, status } = req.body;

    const existing = await Attendance.findOne({ employeeId, date });
    if (existing) {
      const prevStatus = existing.status;
      existing.status = status;
      existing.checkIn = checkIn;
      const updated = await existing.save();

      // ✅ Log যোগ করো
      await createLog(
        req.user._id, req.user.name, req.user.role,
        `${employeeName} এর উপস্থিতি "${status}" এ update করেছে`,
        "attendance",
        `Date: ${date}, CheckIn: ${checkIn || "N/A"}`
      );

      // ✅ Late notification
      if (status === "late" && prevStatus !== "late") {
        await createNotification(
          `⏰ ${employeeName} আজ (${date}) দেরিতে এসেছে!`,
          "task"
        );
      }

      return res.json(updated);
    }

    const attendance = await Attendance.create({
      employeeId, employeeName, date, checkIn, status
    });

    // ✅ Log যোগ করো
    await createLog(
      req.user._id, req.user.name, req.user.role,
      `${employeeName} এর উপস্থিতি "${status}" চিহ্নিত করেছে`,
      "attendance",
      `Date: ${date}, CheckIn: ${checkIn || "N/A"}`
    );

    // ✅ Late notification
    if (status === "late") {
      await createNotification(
        `⏰ ${employeeName} আজ (${date}) দেরিতে এসেছে!`,
        "task"
      );
    }

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (attendance) {
      const prevStatus = attendance.status;
      attendance.status = req.body.status || attendance.status;
      attendance.checkIn = req.body.checkIn || attendance.checkIn;
      attendance.checkOut = req.body.checkOut || attendance.checkOut;
      const updated = await attendance.save();

      // ✅ Log যোগ করো
      await createLog(
        req.user._id, req.user.name, req.user.role,
        `${attendance.employeeName} এর উপস্থিতি "${req.body.status}" এ update করেছে`,
        "attendance",
        `Date: ${attendance.date}`
      );

      // ✅ Late notification
      if (req.body.status === "late" && prevStatus !== "late") {
        await createNotification(
          `⏰ ${attendance.employeeName} আজ (${attendance.date}) দেরিতে এসেছে!`,
          "task"
        );
      }

      res.json(updated);
    } else {
      res.status(404).json({ message: "উপস্থিতি পাওয়া যায়নি!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { employeeName: req.user.name };

    if (month && year) {
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(filter).sort({ date: 1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};