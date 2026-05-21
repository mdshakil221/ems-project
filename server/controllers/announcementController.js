import Announcement from "../models/Announcement.js";
import { io } from "../server.js";

// সব Announcement দেখুন
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({})
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// নতুন Announcement তৈরি করুন
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, priority, targetRole } = req.body;
    const announcement = await Announcement.create({
      title, message, priority, targetRole,
      createdBy: req.user.name
    });

    // ✅ Real-time সব user কে পাঠাও
    io.emit("new_announcement", announcement);

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Announcement মুছুন
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement পাওয়া যায়নি!" });
    }
    await announcement.deleteOne();
    res.json({ message: "Announcement মুছে ফেলা হয়েছে!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Announcement পড়া হয়েছে চিহ্নিত করুন
export const markAnnouncementRead = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement পাওয়া যায়নি!" });
    }
    if (!announcement.readBy.includes(req.user.email)) {
      announcement.readBy.push(req.user.email);
      await announcement.save();
    }
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};