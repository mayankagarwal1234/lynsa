import express, { Express, NextFunction, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import Imap from "imap";
import { simpleParser } from "mailparser";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";
import multer from "multer";
import { Server } from "socket.io";
import { connectDB } from "./lib/db";
import mongoose from "mongoose";
import HotOutreachMessage from "./models/HotOutreachMessage";
import { AttachmentModel, IAttachment } from "./models/Attachment";

// Routes
import userRouter from "./routes/userRoutes";
import paymentRouter from "./routes/paymentRoutes";
import messageRouter from "./routes/messageRoutes";
import meetingRouter from "./controllers/meetingController";
import hotoutreachRouter from "./routes/hotoutreachRoutes";
import {
  updateMessageWithReply,
  updateMessageWithReplyDirect,
} from "./controllers/hotoutreachController";

// ==== Server Setup ====
const app: Express = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ==== Razorpay Setup ====
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ==== Socket.IO ====
export const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
});
export const userSocketMap: Record<string, string> = {};
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;
  if (userId) {
    console.log(`✅ User Connected: ${userId}`);
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }
  socket.on("disconnect", () => {
    if (userId) {
      console.log(`❌ User Disconnected: ${userId}`);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

// ==== Email & Message Status Logic ====
const messageStatus = new Map<string, any>();
const readEmailUids = new Set<number>();
const MESSAGE_STATUS_FILE = path.join(__dirname, "messageStatus.json");

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

const transporter = nodemailer.createTransport(emailConfig.smtp);

const emailTemplates = {
  initialMessage: (
    name: string,
    message: string,
    paymentId: string,
    messageId: string
  ) => ({
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
    if (fs.existsSync(MESSAGE_STATUS_FILE)) {
      const data = JSON.parse(fs.readFileSync(MESSAGE_STATUS_FILE, "utf8"));
      messageStatus.clear();
      Object.entries(data).forEach(([key, value]) => {
        messageStatus.set(key, value);
      });
      console.log("✓ Loaded message status from file");
    } else {
      fs.writeFileSync(MESSAGE_STATUS_FILE, "{}");
    }
  } catch (error) {
    console.error("✗ Error loading message status:", error);
  }
}

function saveMessageStatus() {
  try {
    const data: Record<string, any> = {};
    messageStatus.forEach((value, key) => {
      data[key] = value;
    });
    fs.writeFileSync(MESSAGE_STATUS_FILE, JSON.stringify(data, null, 2));
    console.log("✓ Saved message status");
  } catch (error) {
    console.error("✗ Error saving message status:", error);
  }
}

// Load and periodically save message status
loadMessageStatus();
setInterval(saveMessageStatus, 60000);

// ==== Multer File Upload ====
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(__dirname, "uploads");
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      cb(
        null,
        `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
      );
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

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use("/files", express.static(path.join(__dirname, "uploads")));

export async function sendInitialMessage(
  name: string,
  email: string,
  message: string,
  paymentId: string,
  attachment: Express.Multer.File | null = null,
  userId?: string
) {
  const messageId = crypto.randomBytes(3).toString("hex").slice(0, 6);
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
    console.log(
      "Skipping DB save in sendInitialMessage - handled by /api/hot-outreach/create"
    );
  }

  // Prepare email
  const { subject, html } = emailTemplates.initialMessage(
    name,
    message,
    paymentId,
    messageId
  );

  const mailOptions: any = {
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

  const info = await transporter.sendMail(mailOptions);
  console.log("✓ Email sent:", info.messageId);
  return { success: true, messageId: messageIdWithSuffix, info };
}

function checkForReplies() {
  const imap = new Imap(emailConfig.imap);
  imap.once("ready", () => {
    imap.openBox("INBOX", false, (err, box) => {
      if (err) return console.error("✗ Inbox error:", err);
      imap.search(["UNSEEN"], (err, results) => {
        if (err) return console.error("✗ Search error:", err);
        const newResults = results.filter((uid) => !readEmailUids.has(uid));
        if (newResults.length === 0) return imap.end();

        const fetch = imap.fetch(newResults, { bodies: "" });
        fetch.on("message", (msg) => {
          let uid: number | undefined;
          msg.on("attributes", (attrs) => {
            uid = attrs.uid;
          });
          msg.on("body", (stream) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) return console.error("✗ Parse error:", err);
              const subjectMatch = /\[ID:([a-f0-9]{6})\]/i.exec(
                parsed.subject || ""
              );
              const subjectId = subjectMatch?.[1];
              const replyId = parsed.inReplyTo
                ?.replace(/[<>]/g, "")
                .split("@")[0];
              const ids = [
                subjectId && `<${subjectId}@lynsa.com>`,
                replyId && `<${replyId}@lynsa.com>`,
              ].filter(Boolean) as string[];
              const matchingId = ids.find((id) => messageStatus.has(id));
              if (matchingId) {
                const msgRecord = messageStatus.get(matchingId);

                // Trim reply content after <lynsanetwork@gmail.com>
                let replyContent = parsed.text || "";
                const lynsaIndex = replyContent.indexOf(
                  "<lynsanetwork@gmail.com>"
                );
                if (lynsaIndex !== -1) {
                  replyContent = replyContent.substring(0, lynsaIndex).trim();
                }

                msgRecord.replies.push({
                  from: parsed.from?.text,
                  content: replyContent,
                  timestamp: new Date(),
                  subject: parsed.subject,
                  attachments: parsed.attachments || [],
                });
                msgRecord.status = "replied";
                messageStatus.set(matchingId, msgRecord);
                saveMessageStatus();
                console.log(`✓ Reply stored for ${matchingId}`);

                const dbMessage = await HotOutreachMessage.findOne({
                  messageId: matchingId,
                });
                if (dbMessage) {
                  // Only if replyAttachmentId is NOT already set
                  if (!dbMessage.replyAttachmentId) {
                    const attachment = parsed.attachments?.[0];
                    if (attachment) {
                      const dbAttachment = new AttachmentModel({
                        filename: attachment.filename,
                        mimetype: attachment.contentType,
                        data: attachment.content,
                      });
                      await dbAttachment.save();

                      dbMessage.replyAttachmentId = dbAttachment._id;
                      await dbMessage.save();
                      console.log(`✓ Saved attachment for ${matchingId}`);
                    }
                  } else {
                    console.log(
                      `↪️ Attachment already saved for ${matchingId}`
                    );
                  }

                  // ✅ Use your shared controller to update DB
                  await updateMessageWithReplyDirect({
                    messageId: matchingId,
                    replyName: parsed.from?.text || "Unknown",
                    replyContent: replyContent,
                  });
                } else {
                  console.log(`✗ No DB message found for ${matchingId}`);
                }
              } 
               else {
                console.log("✗ No match found for reply ID");
              }
              if (uid)
                imap.addFlags(uid, "\\Seen", () => readEmailUids.add(uid));
            });
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

app.get("/files/:id", async (req, res) => {
  try {
    const attachment = await AttachmentModel.findById(req.params.id);
    if (!attachment) {
      return res.status(404).send("Attachment not found");
    }

    res.set({
      "Content-Type": attachment.mimetype,
      "Content-Disposition": `inline; filename="${attachment.filename}"`,
    });

    res.send(attachment.data);
  } catch (err) {
    console.error("Error fetching attachment:", err);
    res.status(500).send("Server error");
  }
});

app.post("/create-order", async (_req, res) => {
  try {
    const order = await razorpay.orders.create({
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
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.post("/convert", (req: Request, res: Response) => {
  const { input } = req.body;

  if (!input || typeof input !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Input string required" });
  }

  // Create a random ObjectId
  const objectId = new mongoose.Types.ObjectId();

  return res
    .status(200)
    .json({ success: true, objectId: objectId.toHexString() });
});

app.post("/send-message", upload.single("attachments"), async (req, res) => {
  try {
    const {
      name,
      email,
      message,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      userId,
    } = req.body;
    if (
      !name ||
      !email ||
      !message ||
      !razorpayPaymentId ||
      !razorpayOrderId ||
      !razorpaySignature
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    if (expectedSignature !== razorpaySignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Razorpay signature" });
    }
    const result = await sendInitialMessage(
      name,
      email,
      message,
      razorpayPaymentId,
      req.file,
      userId
    );
    if (req.file?.path)
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

app.get("/message-status/:messageId", async (req: Request, res: Response) => {
  const messageId = `<${
    req.params.messageId.replace(/[<>]/g, "").split("@")[0]
  }@lynsa.com>`;

  // First check local storage
  const status = messageStatus.get(messageId);
  if (status) {
    res.json({ success: true, status });
    return;
  }

  // If not found locally, check database
  try {
    const dbMessage = await HotOutreachMessage.findOne({ messageId });
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
    } else {
      res.status(404).json({ success: false, message: "Message not found" });
    }
  } catch (error) {
    console.error("Error fetching message from database:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/verify-payment", (req: Request, res: Response) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  res.json({ verified: generatedSignature === razorpaySignature });
});

// ==== Routes ====
app.get("/api/status", (_req: Request, res: Response) => {
  res.status(200).send("✅ Server is live and working");
});
app.use("/api/auth", userRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/messages", messageRouter);
app.use("/api/meetings", meetingRouter);
app.use("/api/hot-outreach", hotoutreachRouter);

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} - body:`,
    // In production, only log non-sensitive request data
    process.env.NODE_ENV === "development" ? req.body : "[REDACTED]"
  );
  next();
});
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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
  const errorResponse: ApiResponse = {
    success: false,
    error: "An unexpected error occurred",
    // Only include detailed error info in development
    ...(process.env.NODE_ENV === "development" && {
      message: err.message,
      ...(err.details && { details: err.details }),
    }),
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
});

// ==== DB & Server Startup ====
connectDB();
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
