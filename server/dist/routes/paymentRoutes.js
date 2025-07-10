"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const upload_1 = __importDefault(require("../middleware/upload"));
const auth_1 = require("../middleware/auth");
const paymentRouter = express_1.default.Router();
paymentRouter.post("/create-order", paymentController_1.createOrder);
paymentRouter.post("/verify-payment", paymentController_1.verifyPayment);
paymentRouter.post("/create", upload_1.default.single("attachments"), paymentController_1.createPayment);
paymentRouter.put("/update-status", paymentController_1.updatePaymentStatus);
paymentRouter.get("/get", auth_1.protectRoute, paymentController_1.getUserPayments);
exports.default = paymentRouter;
