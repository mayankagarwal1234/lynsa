import mongoose, { Schema, model, Document } from "mongoose";

export interface Meeting extends Document {
  requestId: string;
  requesterName: string;
  requesterEmail: string;
  requesterUserId:string;
  recipientUserId:string;
  subject: string;
  message?: string;
  status: "pending_approval" | "approved" | "rejected";
  rejectmessage?: string;
  selectDate: Date;
  selectTime: string;
  hmsRoomId?: string;
  hmsHostJoinUrl?: string;
  hmsGuestJoinUrl?: string;
}

const MeetingSchema = new Schema<Meeting>(
  {
    requestId: { type: String, required: true, unique: true },
    requesterName: { type: String, required: true },
    requesterEmail: { type: String, required: true },
    requesterUserId: { type: String, required: true },
    recipientUserId: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String },
    status: {
      type: String,
      enum: ["pending_approval", "approved", "rejected"],
      default: "pending_approval",
    },
    rejectmessage: { type: String },
    selectDate: { type: Date, required: true },
    selectTime: { type: String, required: true },
    hmsRoomId: { type: String },
    hmsHostJoinUrl: { type: String },
    hmsGuestJoinUrl: { type: String },
  },
  { timestamps: true }
);

const MeetingModel = mongoose.models.Meeting || model<Meeting>("Meeting", MeetingSchema);
export default MeetingModel;
