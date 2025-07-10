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
exports.sendMessage = exports.markMessagesAsSeen = exports.getMessages = exports.getUserForSidebar = exports.getAllGiants = void 0;
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
const cloudinary_1 = __importDefault(require("../lib/cloudinary"));
const index_1 = require("../index");
const Payment_1 = __importDefault(require("../models/Payment"));
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
// all giants
const getAllGiants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const currentUser = yield User_1.default.findById(currentUserId);
        if (!currentUser) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        const query = currentUser.role === "giant"
            ? { role: "giant", _id: { $ne: currentUserId } }
            : { role: "giant" };
        const giants = yield User_1.default.find(query).select("-password");
        res.status(200).json({ success: true, giants });
    }
    catch (error) {
        console.error("Get giants error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getAllGiants = getAllGiants;
const getUserForSidebar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const myId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!myId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const payments = yield Payment_1.default.find({
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
            ...new Set(payments
                .filter((p) => isGiant
                ? p.userId && p.userId.toString() !== myId.toString()
                : p.giantId && p.giantId.toString() !== myId.toString())
                .map((p) => (isGiant ? p.userId.toString() : p.giantId.toString()))),
        ];
        if (sidebarUserIds.length === 0) {
            res.status(200).json({ success: true, users: [], unseenMessages: {} });
            return;
        }
        const users = yield User_1.default.find({ _id: { $in: sidebarUserIds } }).select("-password");
        const unseenMessages = {};
        const enrichedUsers = yield Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            const partnerId = user._id;
            const [unseenCount, lastMessage] = yield Promise.all([
                Message_1.default.countDocuments({
                    senderId: partnerId,
                    receiverId: myId,
                    seen: false,
                }),
                Message_1.default.findOne({
                    senderId: partnerId,
                    receiverId: myId,
                })
                    .sort({ createdAt: -1 })
                    .select("text createdAt"), // Add 'text' here (or 'message' if that's the field name)
            ]);
            if (unseenCount > 0) {
                unseenMessages[partnerId.toString()] = unseenCount;
            }
            const isOnline = Boolean(index_1.userSocketMap[partnerId.toString()]);
            return Object.assign(Object.assign({}, user.toObject()), { lastMessageTime: (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.createdAt) || null, lastMessageText: (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.text) || "", // Or .message if your schema uses that
                isOnline });
        })));
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
    }
    catch (error) {
        console.error("Error in getUserForSidebar:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to load sidebar users",
            error: error.message,
        });
    }
});
exports.getUserForSidebar = getUserForSidebar;
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;
        // Ensure both IDs are ObjectIds
        const myObjectId = new mongoose_1.default.Types.ObjectId(myId);
        const selectedObjectId = new mongoose_1.default.Types.ObjectId(selectedUserId);
        // 1. Look for a payment note between users (in either direction)
        const payment = yield Payment_1.default.findOne({
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
        const messages = yield Message_1.default.find({
            $or: [
                { senderId: myObjectId, receiverId: selectedObjectId },
                { senderId: selectedObjectId, receiverId: myObjectId },
            ],
        }).sort({ createdAt: 1 });
        // 3. Mark all incoming messages to me as seen
        yield Message_1.default.updateMany({ senderId: selectedObjectId, receiverId: myObjectId, seen: false }, { $set: { seen: true } });
        // 4. Combine payment note and messages
        const combinedMessages = paymentNoteMessage
            ? [paymentNoteMessage, ...messages]
            : messages;
        res.status(200).json({ success: true, messages: combinedMessages });
    }
    catch (error) {
        console.error("Get messages error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getMessages = getMessages;
// Mark message as seen using message ID
const markMessagesAsSeen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield Message_1.default.findByIdAndUpdate(id, { seen: true });
        res.json({ success: true });
    }
    catch (error) {
        console.error("Mark as seen error:", error.message);
        res.json({ success: false, message: error.message });
    }
});
exports.markMessagesAsSeen = markMessagesAsSeen;
//Send messsages
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text, image, files, } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;
        // Upload image (if present)
        let imageUrl;
        if (image) {
            const uploadResponse = yield cloudinary_1.default.uploader.upload(image, {
                folder: "chat/images",
                resource_type: "image",
            });
            imageUrl = uploadResponse.secure_url;
        }
        // Upload other files (self-hosted)
        let uploadedFiles = [];
        if (files && files.length > 0) {
            const uploadDir = path_1.default.join(__dirname, "..", "uploads");
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
            const fileHost = `${req.protocol}://${req.get("host")}`;
            for (const file of files) {
                const fileExt = path_1.default.extname(file.fileName);
                const filename = `${(0, uuid_1.v4)()}${fileExt}`;
                const filePath = path_1.default.join(uploadDir, filename);
                const base64Data = file.data.split(";base64,").pop();
                if (!base64Data)
                    continue;
                fs_1.default.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
                uploadedFiles.push({
                    fileName: file.fileName,
                    fileType: file.fileType,
                    fileUrl: `${fileHost}/files/${filename}`,
                });
            }
        }
        const newMessage = yield Message_1.default.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            files: uploadedFiles,
        });
        // Emit message via socket to receiver
        const receiverSocketId = index_1.userSocketMap[receiverId];
        if (receiverSocketId) {
            index_1.io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        res.json({ success: true, newMessage });
    }
    catch (error) {
        console.error("Send message error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.sendMessage = sendMessage;
