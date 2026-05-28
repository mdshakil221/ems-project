import Message from "../models/Message.js";
import { cloudinary } from "../config/cloudinary.js";

// Private Messages দেখুন
export const getPrivateMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({

      isDeletedForEveryone: false,

      deletedFor: {
        $ne: req.user._id
      },

      type: "private",

      $or: [
        {
          senderId: req.user._id,
          receiverId: userId
        },
        {
          senderId: userId,
          receiverId: req.user._id
        }
      ]

    }).sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Team Messages দেখুন
export const getTeamMessages = async (req, res) => {
  try {
    const messages = await Message.find({

      type: "team",

      isDeletedForEveryone: false,

      deletedFor: {
        $ne: req.user._id
      }

    })
      .sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Message পাঠান (File সহ)
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, receiverName, message, type } = req.body;

    let attachment = null;

    // ✅ File আছে কিনা চেক
    if (req.file) {

      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

      const uploadResult = await cloudinary.uploader.upload(base64, {
        folder: "ems-chat-files",
        resource_type: "auto"
      });

      const isImage = req.file.mimetype.startsWith("image/");
      const isPdf = req.file.mimetype === "application/pdf";

      const isDoc =
        req.file.mimetype === "application/msword" ||
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      attachment = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        originalName: req.file.originalname,
        size: req.file.size,
        fileType: isImage
          ? "image"
          : isPdf
            ? "pdf"
            : isDoc
              ? "doc"
              : "other"
      };
    }

    const newMessage = await Message.create({
      senderId: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      receiverId: receiverId || null,
      receiverName: receiverName || null,
      message: message || "",
      type: type || "private",
      readBy: [req.user._id],
      attachment
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Message Read করুন
export const markMessagesRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await Message.updateMany(
      {
        senderId: userId,
        receiverId: req.user._id,
        readBy: { $ne: req.user._id }
      },
      { $push: { readBy: req.user._id } }
    );
    res.json({ message: "Read করা হয়েছে!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unread Count
export const getUnreadCount = async (req, res) => {
  try {
    const counts = await Message.aggregate([
      {
        $match: {
          receiverId: req.user._id,
          readBy: { $ne: req.user._id }
        }
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
          senderName: { $first: "$senderName" }
        }
      }
    ]);
    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessageForMe = async (req, res) => {
  try {

    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found"
      });
    }

    if (!message.deletedFor.includes(req.user._id)) {
      message.deletedFor.push(req.user._id);
    }

    await message.save();

    res.json({
      success: true,
      message: "Message deleted for you"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const deleteMessageForEveryone = async (req, res) => {
  try {

    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found"
      });
    }

    // ✅ Only sender can delete
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    // ✅ Delete Cloudinary file
    if (message.attachment?.publicId) {
      await cloudinary.uploader.destroy(
        message.attachment.publicId,
        {
          resource_type: "auto"
        }
      );
    }

    // ✅ Message hide
    message.message = "";
    message.attachment = null;
    message.isDeletedForEveryone = true;
    message.deletedAt = new Date();

    await message.save();

    res.json({
      success: true,
      message: "Message deleted for everyone"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};