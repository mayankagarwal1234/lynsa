import { Request, Response } from "express";
import Payment from "../models/Payment";
import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/User";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// 1. Create Razorpay Order
export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { amount, description, prefill } = req.body;

    if (!amount || !description) {
      res
        .status(400)
        .json({
          success: false,
          message: "Amount and description are required",
        });
      return;
    }

    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
      notes: { description },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      options: {
        key: process.env.RAZORPAY_KEY_ID,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: "Lynsa Connect",
        description,
        prefill,
        theme: { color: "#3B82F6" },
      },
    });
  } catch (error: any) {
    console.error("Create order error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Verify Razorpay Signature
export const verifyPayment = (req: Request, res: Response): void => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (error: any) {
    console.error("Verify payment error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Create and Store Payment with Cloudinary Attachment
export const createPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, giantId, orderId, razorpayOrderId, invoiceId, note } =
      req.body;

    if (!userId || !giantId || !orderId || !razorpayOrderId || !invoiceId) {
      res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
      return;
    }

    const existing = await Payment.findOne({
      $or: [{ orderId }, { razorpayOrderId }],
    });

    if (existing) {
      res
        .status(409)
        .json({ success: false, message: "Payment already exists" });
      return;
    }

    // Inside createPayment in Controller.ts
    const fileHost = `${req.protocol}://${req.get("host")}`;

    let attachment;

    if (req.file) {
      attachment = {
        fileName: req.file.originalname,
        fileUrl: `${fileHost}/files/${req.file.filename}`, // Publicly accessible
      };
    }

    const payment = await Payment.create({
      userId,
      giantId,
      orderId,
      razorpayOrderId,
      invoiceId,
      note,
      attachments: attachment ? [attachment] : [],
      status: "paid",
    });

    res.status(201).json({ success: true, payment });
  } catch (error: any) {
    console.error("Create payment error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// 4. Update Payment Status
export const updatePaymentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { razorpayOrderId, status } = req.body;

    if (!razorpayOrderId || !status) {
      res.status(400).json({ success: false, message: "Missing fields" });
      return;
    }

    if (!["created", "paid", "failed"].includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status value" });
      return;
    }

    const updated = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { status },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: "Payment not found" });
      return;
    }

    res.json({ success: true, payment: updated });
  } catch (error: any) {
    console.error("Update payment status error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get payment to the giant

export const getUserPayments = async (
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

    if (currentUser.role !== "giant") {
      res.status(403).json({
        success: false,
        message: "Access denied. Only giants can view this.",
      });
      return;
    }

    // ✅ Fetch payments where giantId matches current user ID (i.e. payments *to* this giant)
    const payments = await Payment.find({ giantId: currentUserId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email profilePic") // optional: show user details who paid
      .lean();

    res.json({ success: true, payments });
  } catch (error: any) {
    console.error("Get giant payments error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
