import express from 'express';
import { protectRoute } from '../middleware/auth';
import {
  createHotOutreachMessage,
  getUserHotOutreachMessages,
  getMessageById,
  getReplyAttachmentByMessageId
} from '../controllers/hotoutreachController';
import upload from '../middleware/upload';

const hotoutreachRouter = express.Router();

// Create a new HotOutreach message
hotoutreachRouter.post('/create', upload.single("senderAttachment"), createHotOutreachMessage);

// Get replyAttachmentId by messageId
hotoutreachRouter.post('/getreplyId', getReplyAttachmentByMessageId);

// Get all messages for a user
hotoutreachRouter.get('/user/:userId', protectRoute, getUserHotOutreachMessages);

// Get single message by ID
hotoutreachRouter.get('/message/:messageId', getMessageById);

export default hotoutreachRouter;
