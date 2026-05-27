import ActivityLog from "../models/ActivityLog.js";

// ✅ Log তৈরি করার helper function
export const createLog = async (userId, userName, userRole, action, category, details = "") => {
  try {
    await ActivityLog.create({
      userId, userName, userRole, action, category, details
    });
  } catch (error) {
    console.error("Log error:", error.message);
  }
};

// ✅ সব Log দেখুন
export const getLogs = async (req, res) => {
  try {
    const { category, userId, startDate, endDate, limit = 100 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (userId) filter.userId = userId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate + "T23:59:59");
    }

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Log মুছুন
export const clearLogs = async (req, res) => {
  try {
    await ActivityLog.deleteMany({});
    res.json({ message: "সব Log মুছে ফেলা হয়েছে!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};