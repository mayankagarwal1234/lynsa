import express, { Request, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import MeetingModel from '../models/Meeting';

const meetingRouter = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

// ---- 100ms Config ---- //
const HMS_API_BASE = 'https://api.100ms.live/v2';
const HMS_ACCESS_KEY = process.env.HMS_ACCESS_KEY!;
let HMS_SECRET = process.env.HMS_SECRET!;
if (!HMS_SECRET.endsWith('=')) HMS_SECRET += '=';

// ---- Async handler ---- //
const asyncHandler = (handler: any) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const generateRequestId = () => 'REQ_' + Date.now() + '_' + Math.random().toString(16).slice(2, 9);

const create100msMeeting = async (topic: string, startTime: Date, duration = 60) => {
  try {
    const managementToken = jwt.sign({
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

    const roomRes = await axios.post(`${HMS_API_BASE}/rooms`, roomData, {
      headers: { Authorization: `Bearer ${managementToken}` }
    });

    const roomId = roomRes.data.id;
    const roomCode = roomRes.data.room_code;
    const exp = Math.floor(startTime.getTime() / 1000) + (duration * 60);

    // Host & Guest Tokens
    const hostToken = jwt.sign({
      access_key: HMS_ACCESS_KEY,
      type: 'app',
      version: 2,
      room_id: roomId,
      user_id: 'host_user',
      role: 'host',
      iat: Math.floor(Date.now() / 1000),
      exp
    }, HMS_SECRET, { algorithm: 'HS256' });

    const guestToken = jwt.sign({
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

  } catch (err: any) {
    console.error("❌ 100ms create room failed:", err.response?.data || err.message);
    throw new Error(`100ms error: ${err.response?.data?.error || err.message}`);
  }
};

// ---------------------- ROUTES ----------------------

// 1️⃣ Create Meeting
meetingRouter.post('/meeting-request', asyncHandler(async (req, res) => {
  const { requesterName, requesterEmail, requesterUserId, recipientUserId, subject, message, selectDate, selectTime } = req.body;
  if (!requesterUserId) return res.status(400).json({ success: false, error: 'Missing requester user ID' });

  const requestId = generateRequestId();
  await MeetingModel.create({
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

  const razorpayOrder = await razorpay.orders.create({
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
}));

// 2️⃣ Verify Payment
meetingRouter.post('/verify-payment', asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, requestId } = req.body;
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Invalid signature' });
  }

  const meeting = await MeetingModel.findOneAndUpdate(
    { requestId },
    { status: 'pending_approval' },
    { new: true }
  );
  res.json({ success: true, data: meeting });
}));

// 3️⃣ Approve Meeting
meetingRouter.post('/meeting-request/:requestId/approve', asyncHandler(async (req, res) => {
  const { dateTime } = req.body;
  const { requestId } = req.params;

  const meeting = await MeetingModel.findOne({ requestId });
  if (!meeting) return res.status(404).json({ success: false, error: 'Not found' });

  const parsedDate = new Date(dateTime);
  const selectDate = parsedDate.toISOString().slice(0, 10); // e.g. 2025-07-03
  const selectTime = parsedDate.toTimeString().slice(0, 5); // e.g. 14:30

  const hms = await create100msMeeting(meeting.subject, parsedDate);

  meeting.status = 'approved';
  meeting.hmsRoomId = hms.roomId;
  meeting.hmsHostJoinUrl = hms.hostJoinUrl;
  meeting.hmsGuestJoinUrl = hms.guestJoinUrl;
  meeting.selectDate = selectDate;
  meeting.selectTime = selectTime;

  await meeting.save();

  res.json({ success: true, data: meeting });
}));

// 4️⃣ Reject Meeting
meetingRouter.post('/meeting-request/:requestId/reject', asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const { requestId } = req.params;

  const meeting = await MeetingModel.findOneAndUpdate(
    { requestId },
    { status: 'rejected', rejectmessage: reason },
    { new: true }
  );
  res.json({ success: true, data: meeting });
}));

// 5️⃣ Status & Listings
meetingRouter.get('/meeting-request/:requestId/status', asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const meeting = await MeetingModel.findOne({ requestId });
  if (!meeting) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: meeting });
}));

meetingRouter.get('/user/:userId/pending-requests', asyncHandler(async (req, res) => {
  const meetings = await MeetingModel.find({
    status: 'pending_approval',
    $or: [{ recipientUserId: req.params.userId }, { requesterUserId: req.params.userId }]
  }).sort({ createdAt: -1 });
  res.json({ success: true, data: meetings });
}));

meetingRouter.get('/user/:userId/approved-meetings', asyncHandler(async (req, res) => {
  const meetings = await MeetingModel.find({
    status: 'approved',
    $or: [{ recipientUserId: req.params.userId }, { requesterUserId: req.params.userId }]
  }).sort({ createdAt: -1 });
  res.json({ success: true, data: meetings });
}));

// 🔍 Debug listing
meetingRouter.get('/meeting-requests', asyncHandler(async (_req, res) => {
  const meetings = await MeetingModel.find().sort({ createdAt: -1 });
  res.json({ success: true, data: meetings });
}));

export default meetingRouter;
