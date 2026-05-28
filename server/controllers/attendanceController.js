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

      await createLog(
        req.user._id, req.user.name, req.user.role,
        `${employeeName} এর উপস্থিতি "${status}" এ update করেছে`,
        "attendance",
        `Date: ${date}, CheckIn: ${checkIn || "N/A"}`
      );

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

    await createLog(
      req.user._id, req.user.name, req.user.role,
      `${employeeName} এর উপস্থিতি "${status}" চিহ্নিত করেছে`,
      "attendance",
      `Date: ${date}, CheckIn: ${checkIn || "N/A"}`
    );

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

      await createLog(
        req.user._id, req.user.name, req.user.role,
        `${attendance.employeeName} এর উপস্থিতি "${req.body.status}" এ update করেছে`,
        "attendance",
        `Date: ${attendance.date}`
      );

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
    const filter = { employeeId: req.user._id };

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

// ✅ Employee নিজে Check In
export const checkIn = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    const existing = await Attendance.findOne({
      employeeId: req.user._id,
      date: today
    });

    if (existing) {
      return res.status(400).json({ message: "আজ ইতিমধ্যে Check In করা হয়েছে!" });
    }

    // ✅ Late detection — সকাল ৯টার পরে হলে Late
    const checkInHour = now.getHours();
    const checkInMinute = now.getMinutes();
    const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0);
    const status = isLate ? "late" : "present";

    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: false
    });

    const attendance = await Attendance.create({
      employeeId: req.user._id,
      employeeName: req.user.name,
      date: today,
      checkIn: timeStr,
      status
    });

    await createLog(
      req.user._id, req.user.name, req.user.role,
      `নিজে Check In করেছে (${status})`,
      "attendance",
      `Date: ${today}, Time: ${timeStr}`
    );

    if (isLate) {
      await createNotification(
        `⏰ ${req.user.name} আজ (${today}) দেরিতে Check In করেছে! সময়: ${timeStr}`,
        "task"
      );
    }

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Employee নিজে Check Out
export const checkOut = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    const attendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: today
    });

    if (!attendance) {
      return res.status(400).json({ message: "আজ Check In করা হয়নি!" });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: "আজ ইতিমধ্যে Check Out করা হয়েছে!" });
    }

    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: false
    });

    attendance.checkOut = timeStr;
    const updated = await attendance.save();

    await createLog(
      req.user._id, req.user.name, req.user.role,
      `নিজে Check Out করেছে`,
      "attendance",
      `Date: ${today}, Time: ${timeStr}`
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ আজকের নিজের attendance status
export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const attendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: today
    });
    res.json(attendance || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};