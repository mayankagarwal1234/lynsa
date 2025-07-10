import express from "express";
import {
  createOrder,
  verifyPayment,
  createPayment,
  updatePaymentStatus,
  getUserPayments
} from "../controllers/paymentController";

import upload from "../middleware/upload";
import { protectRoute } from "../middleware/auth";

const paymentRouter = express.Router();

paymentRouter.post("/create-order", createOrder);
paymentRouter.post("/verify-payment", verifyPayment);
paymentRouter.post("/create", upload.single("attachments"), createPayment);
paymentRouter.put("/update-status", updatePaymentStatus);
paymentRouter.get("/get",protectRoute,getUserPayments);

export default paymentRouter;
