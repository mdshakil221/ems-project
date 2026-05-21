import Document from "../models/Document.js";
import fs from "fs";

// সব Document দেখুন (Admin)
export const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find({}).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Employee নিজের Document দেখুন
export const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      employeeEmail: req.user.email
    }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Document Upload
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "ফাইল দিন!" });
    }
    const { title, type, employeeName, employeeEmail, employeeId } = req.body;
    const document = await Document.create({
      employeeId: employeeId || null,
      employeeName: employeeName || req.user.name,
      employeeEmail: employeeEmail || req.user.email,
      title,
      type: type || "other",
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      uploadedBy: req.user.name
    });
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Document Download
export const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document পাওয়া যায়নি!" });
    }
    const filePath = `uploads/documents/${document.filename}`;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "ফাইল পাওয়া যায়নি!" });
    }
    res.download(filePath, document.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Document মুছুন
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document পাওয়া যায়নি!" });
    }
    const filePath = `uploads/documents/${document.filename}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await document.deleteOne();
    res.json({ message: "Document মুছে ফেলা হয়েছে!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};