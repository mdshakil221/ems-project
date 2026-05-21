import Attendance from "../models/Attendance.js";

export const getAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    // ✅ date না থাকলে সব attendance দেখাবে
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
    existing.status = status;
    existing.checkIn = checkIn;
    const updated = await existing.save();
    return res.json(updated);
  }
  const attendance = await Attendance.create({
    employeeId, employeeName, date, checkIn, status
  });
  res.status(201).json(attendance);
};

export const updateAttendance = async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  if (attendance) {
    attendance.status = req.body.status || attendance.status;
    attendance.checkIn = req.body.checkIn || attendance.checkIn;
    attendance.checkOut = req.body.checkOut || attendance.checkOut;
    const updated = await attendance.save();
    res.json(updated);
  } else {
    res.status(404).json({ message: "উপস্থিতি পাওয়া যায়নি!" });
  }
};