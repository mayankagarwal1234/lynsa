"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const hotoutreachController_1 = require("../controllers/hotoutreachController");
const upload_1 = __importDefault(require("../middleware/upload"));
const hotoutreachRouter = express_1.default.Router();
// Create a new HotOutreach message
hotoutreachRouter.post('/create', upload_1.default.single("senderAttachment"), hotoutreachController_1.createHotOutreachMessage);
// Get replyAttachmentId by messageId
hotoutreachRouter.post('/getreplyId', hotoutreachController_1.getReplyAttachmentByMessageId);
// Get all messages for a user
hotoutreachRouter.get('/user/:userId', auth_1.protectRoute, hotoutreachController_1.getUserHotOutreachMessages);
// Get single message by ID
hotoutreachRouter.get('/message/:messageId', hotoutreachController_1.getMessageById);
exports.default = hotoutreachRouter;
