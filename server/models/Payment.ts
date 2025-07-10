import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;        // User making the payment
  giantId: mongoose.Types.ObjectId;       // Giant receiving the payment
  orderId: string;                        // Unique order ID
  razorpayOrderId: string;                // Razorpay order ID
  status: "created" | "paid" | "failed";  // Payment status
  note?: string;                          // Optional note or message
  attachments?: {
    fileName: string;
    fileUrl: string;
  }[];
  invoiceId: string;                      // Invoice ID
  timestamp?: Date;                       // Automatically set by schema
}

const PaymentSchema: Schema<IPayment> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    giantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, required: true, unique: true },
    razorpayOrderId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
      required: true,
    },
    note: { type: String }, // Renamed from 'text' to 'note' for clarity
    attachments: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
      },
    ],
    invoiceId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;
