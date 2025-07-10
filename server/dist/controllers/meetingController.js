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
const express_1 = __importDefault(require("express"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const Meeting_1 = __importDefault(require("../models/Meeting"));
const meetingRouter = express_1.default.Router();
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});
// ---- 100ms Config ---- //
const HMS_API_BASE = 'https://api.100ms.live/v2';
const HMS_ACCESS_KEY = process.env.HMS_ACCESS_KEY;
let HMS_SECRET = process.env.HMS_SECRET;
if (!HMS_SECRET.endsWith('='))
    HMS_SECRET += '=';
// ---- Async handler ---- //
const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const generateRequestId = () => 'REQ_' + Date.now() + '_' + Math.random().toString(16).slice(2, 9);
const create100msMeeting = (topic_1, startTime_1, ...args_1) => __awaiter(void 0, [topic_1, startTime_1, ...args_1], void 0, function* (topic, startTime, duration = 60) {
    var _a, _b, _c;
    try {
        const managementToken = jsonwebtoken_1.default.sign({
            access_key: HMS_ACCESS_KEY,
            type: 'management',
            version: 2,
            iat: Math.floor(Date.now() / 1000),
            nbf: Math.floor(Date.now() / 1000),
            jti: generateRequestId() // 👈 ADD THIS
        }, HMS_SECRET, {
            algorithm: 'HS256',
            expiresIn: '24h'
        });
        // Create Room
        const roomData = {
            name: topic,
            description: `Meeting: ${topic}`,
            template_id: process.env.HMS_TEMPLATE_ID,
            region: 'in'
        };
        const roomRes = yield axios_1.default.post(`${HMS_API_BASE}/rooms`, roomData, {
            headers: { Authorization: `Bearer ${managementToken}` }
        });
        const roomId = roomRes.data.id;
        const roomCode = roomRes.data.room_code;
        const exp = Math.floor(startTime.getTime() / 1000) + (duration * 60);
        // Host & Guest Tokens
        const hostToken = jsonwebtoken_1.default.sign({
            access_key: HMS_ACCESS_KEY,
            type: 'app',
            version: 2,
            room_id: roomId,
            user_id: 'host_user',
            role: 'host',
            iat: Math.floor(Date.now() / 1000),
            exp
        }, HMS_SECRET, { algorithm: 'HS256' });
        const guestToken = jsonwebtoken_1.default.sign({
            access_key: HMS_ACCESS_KEY,
            type: 'app',
            version: 2,
            room_id: roomId,
            user_id: 'guest_user',
            role: 'guest',
            iat: Math.floor(Date.now() / 1000),
            exp
        }, HMS_SECRET, { algorithm: 'HS256' });
        const baseUrl = process.env.FRONTEND_URL || 'https://your-app.com/meeting';
        return {
            roomId,
            roomCode,
            hostJoinUrl: `${baseUrl}?token=${hostToken}&room=${roomCode}`,
            guestJoinUrl: `${baseUrl}?token=${guestToken}&room=${roomCode}`
        };
    }
    catch (err) {
        console.error("❌ 100ms create room failed:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
        throw new Error(`100ms error: ${((_c = (_b = err.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || err.message}`);
    }
});
// ---------------------- ROUTES ----------------------
// 1️⃣ Create Meeting
meetingRouter.post('/meeting-request', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requesterName, requesterEmail, requesterUserId, recipientUserId, subject, message, selectDate, selectTime } = req.body;
    if (!requesterUserId)
        return res.status(400).json({ success: false, error: 'Missing requester user ID' });
    const requestId = generateRequestId();
    yield Meeting_1.default.create({
        requestId,
        requesterName,
        requesterEmail,
        requesterUserId,
        recipientUserId,
        subject,
        message,
        selectDate,
        selectTime
    });
    const razorpayOrder = yield razorpay.orders.create({
        amount: 100,
        currency: 'INR',
        receipt: requestId
    });
    res.json({
        success: true,
        data: {
            requestId,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        }
    });
})));
// 2️⃣ Verify Payment
meetingRouter.post('/verify-payment', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, requestId } = req.body;
    const expectedSignature = crypto_1.default.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Invalid signature' });
    }
    const meeting = yield Meeting_1.default.findOneAndUpdate({ requestId }, { status: 'pending_approval' }, { new: true });
    res.json({ success: true, data: meeting });
})));
// 3️⃣ Approve Meeting
meetingRouter.post('/meeting-request/:requestId/approve', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dateTime } = req.body;
    const { requestId } = req.params;
    const meeting = yield Meeting_1.default.findOne({ requestId });
    if (!meeting)
        return res.status(404).json({ success: false, error: 'Not found' });
    const parsedDate = new Date(dateTime);
    const selectDate = parsedDate.toISOString().slice(0, 10); // e.g. 2025-07-03
    const selectTime = parsedDate.toTimeString().slice(0, 5); // e.g. 14:30
    const hms = yield create100msMeeting(meeting.subject, parsedDate);
    meeting.status = 'approved';
    meeting.hmsRoomId = hms.roomId;
    meeting.hmsHostJoinUrl = hms.hostJoinUrl;
    meeting.hmsGuestJoinUrl = hms.guestJoinUrl;
    meeting.selectDate = selectDate;
    meeting.selectTime = selectTime;
    yield meeting.save();
    res.json({ success: true, data: meeting });
})));
// 4️⃣ Reject Meeting
meetingRouter.post('/meeting-request/:requestId/reject', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reason } = req.body;
    const { requestId } = req.params;
    const meeting = yield Meeting_1.default.findOneAndUpdate({ requestId }, { status: 'rejected', rejectmessage: reason }, { new: true });
    res.json({ success: true, data: meeting });
})));
// 5️⃣ Status & Listings
meetingRouter.get('/meeting-request/:requestId/status', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestId } = req.params;
    const meeting = yield Meeting_1.default.findOne({ requestId });
    if (!meeting)
        return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: meeting });
})));
meetingRouter.get('/user/:userId/pending-requests', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const meetings = yield Meeting_1.default.find({
        status: 'pending_approval',
        $or: [{ recipientUserId: req.params.userId }, { requesterUserId: req.params.userId }]
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: meetings });
})));
meetingRouter.get('/user/:userId/approved-meetings', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const meetings = yield Meeting_1.default.find({
        status: 'approved',
        $or: [{ recipientUserId: req.params.userId }, { requesterUserId: req.params.userId }]
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: meetings });
})));
// 🔍 Debug listing
meetingRouter.get('/meeting-requests', asyncHandler((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const meetings = yield Meeting_1.default.find().sort({ createdAt: -1 });
    res.json({ success: true, data: meetings });
})));
exports.default = meetingRouter;
