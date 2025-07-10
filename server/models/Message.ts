import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  text?: string;
  image?: string;
  files?: {
    fileName: string;
    fileType: string;
    fileUrl: string;
  }[];
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    image: { type: String },
    files: [
      {
        fileName: { type: String, required: true },
        fileType: { type: String, required: true },
        fileUrl: { type: String, required: true },  
      }
    ],
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
export default Message;
