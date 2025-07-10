"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const outreachController_1 = require("../controllers/outreachController");
// Use multer for file upload
const upload = (0, multer_1.default)({ dest: "uploads/" });
const outreachRouter = express_1.default.Router();
// Send a message (with optional file)
outreachRouter.post("/send", upload.single("file"), outreachController_1.handleSendMessage);
// Get message status
outreachRouter.get("/status/:messageId", outreachController_1.getMessageStatus);
// Razorpay: create order
outreachRouter.post("/create-order", outreachController_1.createOrder);
// Razorpay: verify payment
outreachRouter.post("/verify", outreachController_1.verifyPayment);
exports.default = outreachRouter;
