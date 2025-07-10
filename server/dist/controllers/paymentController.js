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
exports.getUserPayments = exports.updatePaymentStatus = exports.createPayment = exports.verifyPayment = exports.createOrder = void 0;
const Payment_1 = __importDefault(require("../models/Payment"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
// Initialize Razorpay instance
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// 1. Create Razorpay Order
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const order = yield razorpay.orders.create(options);
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
    }
    catch (error) {
        console.error("Create order error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.createOrder = createOrder;
// 2. Verify Razorpay Signature
const verifyPayment = (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");
        if (expectedSignature === razorpay_signature) {
            res.json({ success: true });
        }
        else {
            res.status(400).json({ success: false, error: "Invalid signature" });
        }
    }
    catch (error) {
        console.error("Verify payment error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.verifyPayment = verifyPayment;
// 3. Create and Store Payment with Cloudinary Attachment
const createPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, giantId, orderId, razorpayOrderId, invoiceId, note } = req.body;
        if (!userId || !giantId || !orderId || !razorpayOrderId || !invoiceId) {
            res
                .status(400)
                .json({ success: false, message: "Missing required fields" });
            return;
        }
        const existing = yield Payment_1.default.findOne({
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
        const payment = yield Payment_1.default.create({
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
    }
    catch (error) {
        console.error("Create payment error:", error.message);
        res
            .status(500)
            .json({ success: false, message: "Server error", error: error.message });
    }
});
exports.createPayment = createPayment;
// 4. Update Payment Status
const updatePaymentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const updated = yield Payment_1.default.findOneAndUpdate({ razorpayOrderId }, { status }, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "Payment not found" });
            return;
        }
        res.json({ success: true, payment: updated });
    }
    catch (error) {
        console.error("Update payment status error:", error.message);
        res
            .status(500)
            .json({ success: false, message: "Server error", error: error.message });
    }
});
exports.updatePaymentStatus = updatePaymentStatus;
// Get payment to the giant
const getUserPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (currentUser.role !== "giant") {
            res.status(403).json({
                success: false,
                message: "Access denied. Only giants can view this.",
            });
            return;
        }
        // ✅ Fetch payments where giantId matches current user ID (i.e. payments *to* this giant)
        const payments = yield Payment_1.default.find({ giantId: currentUserId })
            .sort({ createdAt: -1 })
            .populate("userId", "name email profilePic") // optional: show user details who paid
            .lean();
        res.json({ success: true, payments });
    }
    catch (error) {
        console.error("Get giant payments error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
});
exports.getUserPayments = getUserPayments;
