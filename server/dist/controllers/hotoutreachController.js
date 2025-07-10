"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessageById = exports.getUserHotOutreachMessages = exports.updateMessageWithReplyDirect = exports.getReplyAttachmentByMessageId = exports.createHotOutreachMessage = void 0;
const HotOutreachMessage_1 = __importDefault(require("../models/HotOutreachMessage"));
// Create a new HotOutreach message
const createHotOutreachMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageId, senderName, receiverEmail, senderMessage, paymentId, userId } = req.body;
        const fileHost = `${req.protocol}://${req.get("host")}`;
        let attachment;
        if (req.file) {
            attachment = {
                fileName: req.file.originalname,
                fileUrl: `${fileHost}/files/${req.file.filename}`
            };
        }
        const message = new HotOutreachMessage_1.default({
            messageId,
            senderName,
            receiverEmail,
            senderMessage,
            senderAttachment: attachment ? [attachment] : [],
            paymentId,
            userId
        });
        yield message.save();
        res.status(201).json({ success: true, message: "Message created successfully", messageId });
    }
    catch (error) {
        console.error("Error creating HotOutreach message:", error);
        res.status(500).json({ success: false, message: "Failed to create message" });
    }
});
exports.createHotOutreachMessage = createHotOutreachMessage;
const getReplyAttachmentByMessageId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageId } = req.body;
        if (!messageId) {
            return res.status(400).json({
                success: false,
                message: "messageId is required"
            });
        }
        const message = yield HotOutreachMessage_1.default.findOne({ messageId }).lean();
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
    }
    catch (error) {
        console.error("Error fetching reply attachment by messageId:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch reply attachment"
        });
    }
});
exports.getReplyAttachmentByMessageId = getReplyAttachmentByMessageId;
// Used directly by IMAP auto-checker
const updateMessageWithReplyDirect = (_a) => __awaiter(void 0, [_a], void 0, function* ({ messageId, replyName, replyContent }) {
    try {
        const message = yield HotOutreachMessage_1.default.findOne({ messageId });
        if (!message) {
            console.log(`✗ No message found in DB for ${messageId}`);
            return;
        }
        message.replyName = replyName;
        message.replyContent = replyContent;
        message.messageStatus = "replied";
        yield message.save();
        console.log(`✓ Reply saved to DB for ${messageId}`);
    }
    catch (err) {
        console.error(`✗ Failed to update reply in DB for ${messageId}:`, err);
    }
});
exports.updateMessageWithReplyDirect = updateMessageWithReplyDirect;
// Get all messages for a user
const getUserHotOutreachMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const messages = yield HotOutreachMessage_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, messages });
    }
    catch (error) {
        console.error("Error fetching user messages:", error);
        res.status(500).json({ success: false, message: "Failed to fetch messages" });
    }
});
exports.getUserHotOutreachMessages = getUserHotOutreachMessages;
// Get message by ID
const getMessageById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageId } = req.params;
        const message = yield HotOutreachMessage_1.default.findOne({ messageId });
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }
        res.json({ success: true, message });
    }
    catch (error) {
        console.error("Error fetching message:", error);
        res.status(500).json({ success: false, message: "Failed to fetch message" });
    }
});
exports.getMessageById = getMessageById;
