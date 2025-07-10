import { Request, Response } from 'express';
import HotOutreachMessage from '../models/HotOutreachMessage';
import { IUser } from '../models/User';

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Create a new HotOutreach message
export const createHotOutreachMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      messageId,
      senderName, 
      receiverEmail, 
      senderMessage, 
      paymentId, 
      userId 
    } = req.body;

    const fileHost = `${req.protocol}://${req.get("host")}`;

    let attachment;
    if (req.file) {
      attachment = {
        fileName: req.file.originalname,
        fileUrl: `${fileHost}/files/${req.file.filename}`
      };
    }

    const message = new HotOutreachMessage({
      messageId,
      senderName,
      receiverEmail,
      senderMessage,
      senderAttachment: attachment ? [attachment] : [],
      paymentId,
      userId
    });
    
    await message.save();
    res.status(201).json({ success: true, message: "Message created successfully" , messageId });
  } catch (error) {
    console.error("Error creating HotOutreach message:", error);
    res.status(500).json({ success: false, message: "Failed to create message" });
  }
};

export const getReplyAttachmentByMessageId = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: "messageId is required"
      });
    }

    const message = await HotOutreachMessage.findOne({ messageId }).lean();

    if (!message) {
      console.log(`✗ No message found for messageId: ${messageId}`);
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    console.log(`✓ Found message for ${messageId}, replyAttachmentId: ${message.replyAttachmentId}`);

    return res.json({
      success: true,
      replyAttachmentId: message.replyAttachmentId || ""
    });

  } catch (error) {
    console.error("Error fetching reply attachment by messageId:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reply attachment"
    });
  }
};


// Used directly by IMAP auto-checker
export const updateMessageWithReplyDirect = async ({
  messageId,
  replyName,
  replyContent
}: {
  messageId: string;
  replyName: string;
  replyContent: string;
}) => {
  try {
    const message = await HotOutreachMessage.findOne({ messageId });
    if (!message) {
      console.log(`✗ No message found in DB for ${messageId}`);
      return;
    }

    message.replyName = replyName;
    message.replyContent = replyContent;
    message.messageStatus = "replied";

    await message.save();
    console.log(`✓ Reply saved to DB for ${messageId}`);
  } catch (err) {
    console.error(`✗ Failed to update reply in DB for ${messageId}:`, err);
  }
};

// Get all messages for a user
export const getUserHotOutreachMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const messages = await HotOutreachMessage.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching user messages:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

// Get message by ID
export const getMessageById = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const message = await HotOutreachMessage.findOne({ messageId });
    
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }
    
    res.json({ success: true, message });
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({ success: false, message: "Failed to fetch message" });
  }
};
