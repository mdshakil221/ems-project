import Task from "../models/Task.js";
import { createNotification } from "./notificationController.js";

export const getTasks = async (req, res) => {
  const tasks = await Task.find({}).sort({ createdAt: -1 });
  res.json(tasks);
};

export const createTask = async (req, res) => {
  const { title, assignedTo, priority, status, dueDate } = req.body;
  const task = await Task.create({ title, assignedTo, priority, status, dueDate });
  await createNotification(
    `📋 নতুন কাজ "${title}" — ${assignedTo} কে assign করা হয়েছে`,
    "task"
  );
  res.status(201).json(task);
};

export const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (task) {
    const prevStatus = task.status;
    task.title = req.body.title || task.title;
    task.assignedTo = req.body.assignedTo || task.assignedTo;
    task.priority = req.body.priority || task.priority;
    task.status = req.body.status || task.status;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.note = req.body.note || task.note;
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
  } else {
    res.status(404).json({ message: "কাজ পাওয়া যায়নি!" });
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