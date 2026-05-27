import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/Notification.js";
import Employee from "../models/Employee.js";
import { createLog } from "./activityLogController.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "এই Email আগে থেকে আছে!" });
  }
  const user = await User.create({ name, email, password, role });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "ব্যবহারকারী তৈরি ব্যর্থ!" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Email বা Password ভুল!" });
  }

  // ✅ Account active কিনা চেক
  if (!user.isActive) {
    return res.status(403).json({
      message: "আপনার Account নিষ্ক্রিয় করা হয়েছে! Admin এর সাথে যোগাযোগ করুন।"
    });
  }

  if (user.role !== role) {
    return res.status(403).json({
      message: role === "admin"
        ? "আপনি Admin নন! Employee Login ব্যবহার করুন।"
        : "আপনি Employee নন! Admin Login ব্যবহার করুন।"
    });
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Email বা Password ভুল!" });
  }
  // ✅ Login log
  await createLog(
    user._id, user.name, user.role,
    "Login করেছে",
    "auth",
    `${user.email} — ${user.role} login`
  );
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    token: generateToken(user._id),
  });
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "ব্যবহারকারী পাওয়া যায়নি!" });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    console.log("=== UPLOAD START ===");
    console.log("req.file:", req.file);
    console.log("req.user:", req.user?._id);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "ব্যবহারকারী পাওয়া যায়নি!" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "ফাইল পাওয়া যায়নি!" });
    }

    if (user.profileImage) {
      try {
        const publicId = user.profileImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`ems-profiles/${publicId}`);
      } catch (e) {
        console.log("Delete old image:", e.message);
      }
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "ems-profiles", resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    user.profileImage = result.secure_url;
    await user.save();

    res.json({
      message: "Profile ছবি আপডেট হয়েছে!",
      profileImage: result.secure_url
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "ব্যবহারকারী পাওয়া যায়নি!" });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    if (req.body.password) {
      // ✅ Password change log
      await createLog(
        user._id, user.name, user.role,
        "Password পরিবর্তন করেছে",
        "auth",
        `${user.email} তার password পরিবর্তন করেছে`
      );

      // ✅ Employee model এও নতুন password store করুন
      await Employee.findOneAndUpdate(
        { email: user.email },
        { loginPassword: req.body.password }
      );

      await Notification.create({
        message: `🔑 ${user.name} (${user.email}) তার Password পরিবর্তন করেছে।`,
        type: "password_change"
      });
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      profileImage: updated.profileImage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Admin — সব Employee User দেখুন
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "employee" }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Admin — Employee এর Account Deactivate/Activate করুন
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "ব্যবহারকারী পাওয়া যায়নি!" });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({
      message: user.isActive ? "Account সক্রিয় করা হয়েছে!" : "Account নিষ্ক্রিয় করা হয়েছে!",
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Admin — Employee এর Password Reset করুন
export const resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "ব্যবহারকারী পাওয়া যায়নি!" });
    }

    // ✅ User model এ hashed password
    user.password = req.body.newPassword;
    await user.save();

    // ✅ Employee model এ plain text password store
    await Employee.findOneAndUpdate(
      { email: user.email },
      { loginPassword: req.body.newPassword }
    );

    await Notification.create({
      message: `🔑 Admin, ${user.name} (${user.email}) এর Password Reset করেছে।`,
      type: "password_change"
    });

    res.json({ message: "Password reset সফল হয়েছে!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Admin — Employee Account মুছুন
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "ব্যবহারকারী পাওয়া যায়নি!" });
    }

    // ✅ Cloudinary থেকে image delete করুন
    if (user.profileImage) {
      const publicId = user.profileImage.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`ems-profiles/${publicId}`);
    }

    await user.deleteOne();
    res.json({ message: "Account মুছে ফেলা হয়েছে!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Admin — একজন Employee এর পূর্ণ profile দেখুন
export const getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "ব্যবহারকারী পাওয়া যায়নি!" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};