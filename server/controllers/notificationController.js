import Notification from "../models/Notification.js";
import { io } from "../server.js";

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({}).sort({ createdAt: -1 });
  res.json(notifications);
};

export const createNotification = async (message, type) => {
  const notification = await Notification.create({ message, type });
  // ✅ Real-time — সব admin কে পাঠাও
  io.emit("new_notification", notification);
  return notification;
};

export const markAsRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (notification) {
    notification.read = true;
    await notification.save();
    res.json(notification);
  } else {
    res.status(404).json({ message: "নোটিফিকেশন পাওয়া যায়নি!" });
  }
};

export const markAllRead = async (req, res) => {
  await Notification.updateMany({ read: false }, { read: true });
  res.json({ message: "সব নোটিফিকেশন পড়া হয়েছে!" });
};

export const deleteNotification = async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (notification) {
    await notification.deleteOne();
    res.json({ message: "নোটিফিকেশন মুছে ফেলা হয়েছে!" });
  } else {
    res.status(404).json({ message: "নোটিফিকেশন পাওয়া যায়নি!" });
  }
};

export const deleteAllNotifications = async (req, res) => {
  await Notification.deleteMany({});
  res.json({ message: "সব নোটিফিকেশন মুছে ফেলা হয়েছে!" });
};