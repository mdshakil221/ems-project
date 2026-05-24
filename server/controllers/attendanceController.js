import Attendance from "../models/Attendance.js";
import { createNotification } from "../controllers/notificationController.js";

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
  const { employeeId, employeeName, date, checkIn, status } = req.body;

  const existing = await Attendance.findOne({ employeeId, date });
  if (existing) {
    const prevStatus = existing.status;
    existing.status = status;
    existing.checkIn = checkIn;
    const updated = await existing.save();

    // ✅ Late notification — নতুন করে late mark হলে
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

  // ✅ Late notification — প্রথমবার late mark হলে
  if (status === "late") {
    await createNotification(
      `⏰ ${employeeName} আজ (${date}) দেরিতে এসেছে!`,
      "task"
    );
  }

  res.status(201).json(attendance);
};

export const updateAttendance = async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  if (attendance) {
    const prevStatus = attendance.status;
    attendance.status = req.body.status || attendance.status;
    attendance.checkIn = req.body.checkIn || attendance.checkIn;
    attendance.checkOut = req.body.checkOut || attendance.checkOut;
    const updated = await attendance.save();

    // ✅ Late notification — update করে late হলে
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
};

// ✅ Employee নিজের attendance দেখার জন্য
export const getMyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { employeeId: req.user._id };

    if (month && year) {
      // ওই মাসের সব attendance
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