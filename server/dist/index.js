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
exports.userSocketMap = exports.io = exports.razorpay = void 0;
exports.sendInitialMessage = sendInitialMessage;
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const imap_1 = __importDefault(require("imap"));
const mailparser_1 = require("mailparser");
const nodemailer_1 = __importDefault(require("nodemailer"));
const razorpay_1 = __importDefault(require("razorpay"));
const multer_1 = __importDefault(require("multer"));
const socket_io_1 = require("socket.io");
const db_1 = require("./lib/db");
const mongoose_1 = __importDefault(require("mongoose"));
const HotOutreachMessage_1 = __importDefault(require("./models/HotOutreachMessage"));
const Attachment_1 = require("./models/Attachment");
// Routes
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const meetingController_1 = __importDefault(require("./controllers/meetingController"));
const hotoutreachRoutes_1 = __importDefault(require("./routes/hotoutreachRoutes"));
const hotoutreachController_1 = require("./controllers/hotoutreachController");
// ==== Server Setup ====
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 5000;
// ==== Razorpay Setup ====
exports.razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// ==== Socket.IO ====
exports.io = new socket_io_1.Server(server, {
    cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
});
exports.userSocketMap = {};
exports.io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        console.log(`✅ User Connected: ${userId}`);
        exports.userSocketMap[userId] = socket.id;
        exports.io.emit("getOnlineUsers", Object.keys(exports.userSocketMap));
    }
    socket.on("disconnect", () => {
        if (userId) {
            console.log(`❌ User Disconnected: ${userId}`);
            delete exports.userSocketMap[userId];
            exports.io.emit("getOnlineUsers", Object.keys(exports.userSocketMap));
        }
    });
});
// ==== Email & Message Status Logic ====
const messageStatus = new Map();
const readEmailUids = new Set();
const MESSAGE_STATUS_FILE = path_1.default.join(__dirname, "messageStatus.json");
const emailConfig = {
    imap: {
        user: process.env.GMAIL_USER,
        password: process.env.GMAIL_PASSWORD,
        host: "imap.gmail.com",
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
    },
    smtp: {
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
        },
    },
};
const transporter = nodemailer_1.default.createTransport(emailConfig.smtp);
const emailTemplates = {
    initialMessage: (name, message, paymentId, messageId) => ({
        subject: `${name} is inviting you to connect and has sent you Rs. 1 via Lynsa, Connect to Claim [ID:${messageId}]`,
        html: `
      <p>${message}</p>
      <br>
      <p>**This message is sent via Lynsa. You can reply to this email to connect with ${name}</p>
      <p>Login to Lynsa at www.lynsa.in to continue.</p>
      <p>Payment ID: ${paymentId}</p>
      <p>Message ID: ${messageId}</p>`,
    }),
};
function loadMessageStatus() {
    try {
        if (fs_1.default.existsSync(MESSAGE_STATUS_FILE)) {
            const data = JSON.parse(fs_1.default.readFileSync(MESSAGE_STATUS_FILE, "utf8"));
            messageStatus.clear();
            Object.entries(data).forEach(([key, value]) => {
                messageStatus.set(key, value);
            });
            console.log("✓ Loaded message status from file");
        }
        else {
            fs_1.default.writeFileSync(MESSAGE_STATUS_FILE, "{}");
        }
    }
    catch (error) {
        console.error("✗ Error loading message status:", error);
    }
}
function saveMessageStatus() {
    try {
        const data = {};
        messageStatus.forEach((value, key) => {
            data[key] = value;
        });
        fs_1.default.writeFileSync(MESSAGE_STATUS_FILE, JSON.stringify(data, null, 2));
        console.log("✓ Saved message status");
    }
    catch (error) {
        console.error("✗ Error saving message status:", error);
    }
}
// Load and periodically save message status
loadMessageStatus();
setInterval(saveMessageStatus, 60000);
// ==== Multer File Upload ====
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_req, _file, cb) => {
            const dir = path_1.default.join(__dirname, "uploads");
            fs_1.default.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (_req, file, cb) => {
            cb(null, `${file.fieldname}-${Date.now()}${path_1.default.extname(file.originalname)}`);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        cb(null, allowed.includes(file.mimetype));
    },
});
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "5mb" }));
app.use("/files", express_1.default.static(path_1.default.join(__dirname, "uploads")));
function sendInitialMessage(name_1, email_1, message_1, paymentId_1) {
    return __awaiter(this, arguments, void 0, function* (name, email, message, paymentId, attachment = null, userId) {
        const messageId = crypto_1.default.randomBytes(3).toString("hex").slice(0, 6);
        const messageIdWithSuffix = `<${messageId}@lynsa.com>`;
        // Save locally for lightweight status
        const messageData = {
            sender: name,
            recipient: email,
            status: "sent",
            paymentId,
            timestamp: new Date(),
            replies: [],
        };
        messageStatus.set(messageIdWithSuffix, messageData);
        saveMessageStatus();
        if (userId) {
            console.log("Skipping DB save in sendInitialMessage - handled by /api/hot-outreach/create");
        }
        // Prepare email
        const { subject, html } = emailTemplates.initialMessage(name, message, paymentId, messageId);
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject,
            html,
            messageId: messageIdWithSuffix,
            inReplyTo: messageIdWithSuffix,
        };
        if (attachment) {
            mailOptions.attachments = [
                { filename: attachment.originalname, path: attachment.path },
            ];
        }
        const info = yield transporter.sendMail(mailOptions);
        console.log("✓ Email sent:", info.messageId);
        return { success: true, messageId: messageIdWithSuffix, info };
    });
}
function checkForReplies() {
    const imap = new imap_1.default(emailConfig.imap);
    imap.once("ready", () => {
        imap.openBox("INBOX", false, (err, box) => {
            if (err)
                return console.error("✗ Inbox error:", err);
            imap.search(["UNSEEN"], (err, results) => {
                if (err)
                    return console.error("✗ Search error:", err);
                const newResults = results.filter((uid) => !readEmailUids.has(uid));
                if (newResults.length === 0)
                    return imap.end();
                const fetch = imap.fetch(newResults, { bodies: "" });
                fetch.on("message", (msg) => {
                    let uid;
                    msg.on("attributes", (attrs) => {
                        uid = attrs.uid;
                    });
                    msg.on("body", (stream) => {
                        (0, mailparser_1.simpleParser)(stream, (err, parsed) => __awaiter(this, void 0, void 0, function* () {
                            var _a, _b, _c, _d;
                            if (err)
                                return console.error("✗ Parse error:", err);
                            const subjectMatch = /\[ID:([a-f0-9]{6})\]/i.exec(parsed.subject || "");
                            const subjectId = subjectMatch === null || subjectMatch === void 0 ? void 0 : subjectMatch[1];
                            const replyId = (_a = parsed.inReplyTo) === null || _a === void 0 ? void 0 : _a.replace(/[<>]/g, "").split("@")[0];
                            const ids = [
                                subjectId && `<${subjectId}@lynsa.com>`,
                                replyId && `<${replyId}@lynsa.com>`,
                            ].filter(Boolean);
                            const matchingId = ids.find((id) => messageStatus.has(id));
                            if (matchingId) {
                                const msgRecord = messageStatus.get(matchingId);
                                // Trim reply content after <lynsanetwork@gmail.com>
                                let replyContent = parsed.text || "";
                                const lynsaIndex = replyContent.indexOf("<lynsanetwork@gmail.com>");
                                if (lynsaIndex !== -1) {
                                    replyContent = replyContent.substring(0, lynsaIndex).trim();
                                }
                                msgRecord.replies.push({
                                    from: (_b = parsed.from) === null || _b === void 0 ? void 0 : _b.text,
                                    content: replyContent,
                                    timestamp: new Date(),
                                    subject: parsed.subject,
                                    attachments: parsed.attachments || [],
                                });
                                msgRecord.status = "replied";
                                messageStatus.set(matchingId, msgRecord);
                                saveMessageStatus();
                                console.log(`✓ Reply stored for ${matchingId}`);
                                const dbMessage = yield HotOutreachMessage_1.default.findOne({
                                    messageId: matchingId,
                                });
                                if (dbMessage) {
                                    // Only if replyAttachmentId is NOT already set
                                    if (!dbMessage.replyAttachmentId) {
                                        const attachment = (_c = parsed.attachments) === null || _c === void 0 ? void 0 : _c[0];
                                        if (attachment) {
                                            const dbAttachment = new Attachment_1.AttachmentModel({
                                                filename: attachment.filename,
                                                mimetype: attachment.contentType,
                                                data: attachment.content,
                                            });
                                            yield dbAttachment.save();
                                            dbMessage.replyAttachmentId = dbAttachment._id;
                                            yield dbMessage.save();
                                            console.log(`✓ Saved attachment for ${matchingId}`);
                                        }
                                    }
                                    else {
                                        console.log(`↪️ Attachment already saved for ${matchingId}`);
                                    }
                                    // ✅ Use your shared controller to update DB
                                    yield (0, hotoutreachController_1.updateMessageWithReplyDirect)({
                                        messageId: matchingId,
                                        replyName: ((_d = parsed.from) === null || _d === void 0 ? void 0 : _d.text) || "Unknown",
                                        replyContent: replyContent,
                                    });
                                }
                                else {
                                    console.log(`✗ No DB message found for ${matchingId}`);
                                }
                            }
                            else {
                                console.log("✗ No match found for reply ID");
                            }
                            if (uid)
                                imap.addFlags(uid, "\\Seen", () => readEmailUids.add(uid));
                        }));
                    });
                });
                fetch.once("end", () => {
                    imap.end();
                });
            });
        });
    });
    imap.once("error", (err) => console.error("✗ IMAP error:", err));
    imap.connect();
}
checkForReplies();
setInterval(checkForReplies, 1200000);
app.get("/files/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const attachment = yield Attachment_1.AttachmentModel.findById(req.params.id);
        if (!attachment) {
            return res.status(404).send("Attachment not found");
        }
        res.set({
            "Content-Type": attachment.mimetype,
            "Content-Disposition": `inline; filename="${attachment.filename}"`,
        });
        res.send(attachment.data);
    }
    catch (err) {
        console.error("Error fetching attachment:", err);
        res.status(500).send("Server error");
    }
}));
app.post("/create-order", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield exports.razorpay.orders.create({
            amount: 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1,
        });
        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create order" });
    }
}));
app.post("/convert", (req, res) => {
    const { input } = req.body;
    if (!input || typeof input !== "string") {
        return res
            .status(400)
            .json({ success: false, message: "Input string required" });
    }
    // Create a random ObjectId
    const objectId = new mongoose_1.default.Types.ObjectId();
    return res
        .status(200)
        .json({ success: true, objectId: objectId.toHexString() });
});
app.post("/send-message", upload.single("attachments"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, email, message, razorpayPaymentId, razorpayOrderId, razorpaySignature, userId, } = req.body;
        if (!name ||
            !email ||
            !message ||
            !razorpayPaymentId ||
            !razorpayOrderId ||
            !razorpaySignature) {
            return res
                .status(400)
                .json({ success: false, message: "Missing required fields" });
        }
        const expectedSignature = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");
        if (expectedSignature !== razorpaySignature) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid Razorpay signature" });
        }
        const result = yield sendInitialMessage(name, email, message, razorpayPaymentId, req.file, userId);
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path)
            try {
                fs_1.default.unlinkSync(req.file.path);
            }
            catch (e) { }
        res.json({ success: true, messageId: result.messageId });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.get("/message-status/:messageId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messageId = `<${req.params.messageId.replace(/[<>]/g, "").split("@")[0]}@lynsa.com>`;
    // First check local storage
    const status = messageStatus.get(messageId);
    if (status) {
        res.json({ success: true, status });
        return;
    }
    // If not found locally, check database
    try {
        const dbMessage = yield HotOutreachMessage_1.default.findOne({ messageId });
        if (dbMessage) {
            const dbStatus = {
                sender: dbMessage.senderName,
                recipient: dbMessage.receiverEmail,
                status: dbMessage.messageStatus,
                paymentId: dbMessage.paymentId,
                timestamp: dbMessage.createdAt,
                replies: dbMessage.replyContent
                    ? [
                        {
                            from: dbMessage.replyName,
                            content: dbMessage.replyContent,
                            timestamp: dbMessage.updatedAt,
                            attachments: dbMessage.replyAttachment
                                ? [dbMessage.replyAttachment]
                                : [],
                        },
                    ]
                    : [],
            };
            res.json({ success: true, status: dbStatus });
        }
        else {
            res.status(404).json({ success: false, message: "Message not found" });
        }
    }
    catch (error) {
        console.error("Error fetching message from database:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
app.post("/verify-payment", (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const generatedSignature = crypto_1.default
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");
    res.json({ verified: generatedSignature === razorpaySignature });
});
// ==== Routes ====
app.get("/api/status", (_req, res) => {
    res.status(200).send("✅ Server is live and working");
});
app.use("/api/auth", userRoutes_1.default);
app.use("/api/payments", paymentRoutes_1.default);
app.use("/api/messages", messageRoutes_1.default);
app.use("/api/meetings", meetingController_1.default);
app.use("/api/hot-outreach", hotoutreachRoutes_1.default);
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - body:`, 
    // In production, only log non-sensitive request data
    process.env.NODE_ENV === "development" ? req.body : "[REDACTED]");
    next();
});
app.use((err, req, res, next) => {
    // Log error details for debugging
    console.error({
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        error: {
            name: err.name,
            message: err.message,
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        },
    });
    // Determine appropriate status code
    const statusCode = err.statusCode || 500;
    // Prepare error response
    const errorResponse = Object.assign({ success: false, error: "An unexpected error occurred" }, (process.env.NODE_ENV === "development" && Object.assign({ message: err.message }, (err.details && { details: err.details }))));
    // Send error response
    res.status(statusCode).json(errorResponse);
});
// ==== DB & Server Startup ====
(0, db_1.connectDB)();
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
