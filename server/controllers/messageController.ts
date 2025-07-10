import { Request, Response } from "express";
import Message, { IMessage } from "../models/Message";
import User from "../models/User";
import cloudinary from "../lib/cloudinary";
import { io, userSocketMap } from "../index";
import Payment from "../models/Payment";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// all giants

export const getAllGiants = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = (req.user as { _id: mongoose.Types.ObjectId })?._id;

    if (!currentUserId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const query =
      currentUser.role === "giant"
        ? { role: "giant", _id: { $ne: currentUserId } }
        : { role: "giant" };

    const giants = await User.find(query).select("-password");

    res.status(200).json({ success: true, giants });
  } catch (error: any) {
    console.error("Get giants error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getUserForSidebar = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const myId = (req.user as { _id: mongoose.Types.ObjectId })?._id;
    if (!myId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const payments = await Payment.find({
      $or: [
        {
          userId: myId,
          $or: [
            { note: { $exists: true, $ne: "" } },
            { attachments: { $exists: true, $not: { $size: 0 } } },
          ],
        },
        {
          giantId: myId,
          $or: [
            { note: { $exists: true, $ne: "" } },
            { attachments: { $exists: true, $not: { $size: 0 } } },
          ],
        },
      ],
    });

    if (payments.length === 0) {
      res.status(200).json({ success: true, users: [], unseenMessages: {} });
      return;
    }

    const isGiant = payments.some((p) => p.giantId.equals(myId));

    const sidebarUserIds = [
      ...new Set(
        payments
          .filter((p) =>
            isGiant
              ? p.userId && p.userId.toString() !== myId.toString()
              : p.giantId && p.giantId.toString() !== myId.toString()
          )
          .map((p) => (isGiant ? p.userId.toString() : p.giantId.toString()))
      ),
    ];

    if (sidebarUserIds.length === 0) {
      res.status(200).json({ success: true, users: [], unseenMessages: {} });
      return;
    }

    const users = await User.find({ _id: { $in: sidebarUserIds } }).select(
      "-password"
    );

    const unseenMessages: Record<string, number> = {};

    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const partnerId = user._id;

        const [unseenCount, lastMessage] = await Promise.all([
          Message.countDocuments({
            senderId: partnerId,
            receiverId: myId,
            seen: false,
          }),
          Message.findOne({
            senderId: partnerId,
            receiverId: myId,
          })
            .sort({ createdAt: -1 })
            .select("text createdAt"), // Add 'text' here (or 'message' if that's the field name)
        ]);

        if (unseenCount > 0) {
          unseenMessages[partnerId.toString()] = unseenCount;
        }

        const isOnline = Boolean(userSocketMap[partnerId.toString()]);

        return {
          ...user.toObject(),
          lastMessageTime: lastMessage?.createdAt || null,
          lastMessageText: lastMessage?.text || "", // Or .message if your schema uses that
          isOnline,
        };
      })
    );

    enrichedUsers.sort((a, b) => {
      const timeA = a.lastMessageTime
        ? new Date(a.lastMessageTime).getTime()
        : 0;
      const timeB = b.lastMessageTime
        ? new Date(b.lastMessageTime).getTime()
        : 0;
      return timeB - timeA;
    });

    res.status(200).json({
      success: true,
      users: enrichedUsers,
      unseenMessages,
    });
  } catch (error: any) {
    console.error("Error in getUserForSidebar:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to load sidebar users",
      error: error.message,
    });
  }
};

export const getMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = (req.user as { _id: mongoose.Types.ObjectId })._id;

    // Ensure both IDs are ObjectIds
    const myObjectId = new mongoose.Types.ObjectId(myId);
    const selectedObjectId = new mongoose.Types.ObjectId(selectedUserId);

    // 1. Look for a payment note between users (in either direction)
    const payment = await Payment.findOne({
      $or: [
        { userId: selectedObjectId, giantId: myObjectId },
        { userId: myObjectId, giantId: selectedObjectId },
      ],
     $or: [
        { note: { $exists: true, $ne: "" } },
        { attachments: { $exists: true, $not: { $size: 0 } } },
      ],
    }).sort({ createdAt: 1 });

    let paymentNoteMessage = null;

    if (payment) {
      // Decide who sent the payment note
      const isSenderMe = payment.userId.equals(myObjectId);
      paymentNoteMessage = {
        _id: `payment_${payment._id}`,
        senderId: isSenderMe ? myObjectId : selectedObjectId,
        receiverId: isSenderMe ? selectedObjectId : myObjectId,
        text: payment.note,
        files: payment.attachments || [],
        seen: true,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        isPaymentNote: true,
        type: "payment-note",
      };
    }

    // 2. Get all chat messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: myObjectId, receiverId: selectedObjectId },
        { senderId: selectedObjectId, receiverId: myObjectId },
      ],
    }).sort({ createdAt: 1 });

    // 3. Mark all incoming messages to me as seen
    await Message.updateMany(
      { senderId: selectedObjectId, receiverId: myObjectId, seen: false },
      { $set: { seen: true } }
    );

    // 4. Combine payment note and messages
    const combinedMessages = paymentNoteMessage
      ? [paymentNoteMessage, ...messages]
      : messages;

    res.status(200).json({ success: true, messages: combinedMessages });
  } catch (error: any) {
    console.error("Get messages error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark message as seen using message ID
export const markMessagesAsSeen = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Mark as seen error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

//Send messsages
export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      text,
      image,
      files,
    }: {
      text?: string;
      image?: string;
      files?: { data: string; fileName: string; fileType: string }[];
    } = req.body;
    const receiverId = req.params.id;
    const senderId = (req.user as { _id: mongoose.Types.ObjectId })._id;

    // Upload image (if present)
    let imageUrl: string | undefined;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chat/images",
        resource_type: "image",
      });
      imageUrl = uploadResponse.secure_url;
    }

    // Upload other files (self-hosted)
    let uploadedFiles: IMessage["files"] = [];
    if (files && files.length > 0) {
      const uploadDir = path.join(__dirname, "..", "uploads");
      fs.mkdirSync(uploadDir, { recursive: true });

      const fileHost = `${req.protocol}://${req.get("host")}`;

      for (const file of files) {
        const fileExt = path.extname(file.fileName);
        const filename = `${uuidv4()}${fileExt}`;
        const filePath = path.join(uploadDir, filename);
        const base64Data = file.data.split(";base64,").pop();

        if (!base64Data) continue;

        fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

        uploadedFiles.push({
          fileName: file.fileName,
          fileType: file.fileType,
          fileUrl: `${fileHost}/files/${filename}`,
        });
      }
    }


    const newMessage: IMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      files: uploadedFiles,
    });

    // Emit message via socket to receiver
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error: any) {
    console.error("Send message error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
