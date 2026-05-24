import Task from "../models/Task.js";
import { createNotification } from "./notificationController.js";
import { v2 as cloudinary } from "cloudinary";

export const getTasks = async (req, res) => {
  const tasks = await Task.find({}).sort({ createdAt: -1 });
  res.json(tasks);
};

export const createTask = async (req, res) => {
  try {
    const { title, assignedTo, priority, status, dueDate, description } = req.body;

    const adminAttachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: file.path // ✅ Cloudinary URL
    })) : [];

    const task = await Task.create({
      title, assignedTo, priority, status,
      dueDate, description, adminAttachments
    });

    await createNotification(
      `📋 নতুন কাজ "${title}" — ${assignedTo} কে assign করা হয়েছে`,
      "task"
    );

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "কাজ পাওয়া যায়নি!" });
    }

    const prevStatus = task.status;
    task.title = req.body.title || task.title;
    task.assignedTo = req.body.assignedTo || task.assignedTo;
    task.priority = req.body.priority || task.priority;
    task.status = req.body.status || task.status;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.note = req.body.note || task.note;
    task.description = req.body.description || task.description;

    // ✅ Admin Attachments যোগ করুন
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: file.path // ✅ Cloudinary URL
      }));
      task.adminAttachments = [...(task.adminAttachments || []), ...newAttachments];
    }

    const updated = await task.save();

    if (prevStatus !== "completed" && req.body.status === "completed") {
      await createNotification(
        `✅ "${task.title}" — ${task.assignedTo} সম্পন্ন করেছে!`,
        "task_completed"
      );
    }
    if (prevStatus === "pending" && req.body.status === "in-progress") {
      await createNotification(
        `🚀 "${task.title}" — ${task.assignedTo} শুরু করেছে!`,
        "task"
      );
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Employee Attachment Submit
export const submitEmployeeAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "কাজ পাওয়া যায়নি!" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "ফাইল দিন!" });
    }

    const newAttachments = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: file.path // ✅ Cloudinary URL
    }));

    task.employeeAttachments = [...(task.employeeAttachments || []), ...newAttachments];

    if (req.body.note) {
      task.note = req.body.note;
    }

    const updated = await task.save();

    await createNotification(
      `📎 "${task.title}" — ${task.assignedTo} ফাইল submit করেছে!`,
      "task"
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Attachment Delete
export const deleteTaskAttachment = async (req, res) => {
  try {
    const { id, filename, type } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "কাজ পাওয়া যায়নি!" });
    }

    // ✅ Cloudinary থেকে delete করুন
    await cloudinary.uploader.destroy(`ems-tasks/${filename}`);

    if (type === "admin") {
      task.adminAttachments = task.adminAttachments.filter(a => a.filename !== filename);
    } else {
      task.employeeAttachments = task.employeeAttachments.filter(a => a.filename !== filename);
    }

    await task.save();
    res.json({ message: "ফাইল মুছে ফেলা হয়েছে!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (task) {
    await task.deleteOne();
    res.json({ message: "কাজ মুছে ফেলা হয়েছে!" });
  } else {
    res.status(404).json({ message: "কাজ পাওয়া যায়নি!" });
  }
};