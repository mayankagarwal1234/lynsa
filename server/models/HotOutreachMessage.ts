import mongoose, { Schema, Document } from 'mongoose';

export interface IHotOutreachMessage extends Document {
  messageId: string;
  messageStatus: 'sent' | 'replied';
  senderName: string;
  receiverEmail: string;
  senderMessage: string;
  senderAttachment?: {
    fileName: string;
    fileUrl: string;
  }[];
  replyName?: string;
  replyContent?: string;
  replyAttachmentId?:string;
  paymentId: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const HotOutreachMessageSchema = new Schema<IHotOutreachMessage>({
  messageId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  messageStatus: {
    type: String,
    enum: ['sent', 'replied'],
    default: 'sent',
    required: true
  },
  senderName: { 
    type: String, 
    required: true 
  },
  receiverEmail: { 
    type: String, 
    required: true 
  },
  senderMessage: { 
    type: String, 
    required: true 
  },
  senderAttachment: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
      },
    ],
  replyName: { 
    type: String 
  },
  replyContent: { 
    type: String 
  },
  replyAttachmentId:{
    type:String
  },
  paymentId: { 
    type: String, 
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { 
  timestamps: true 
});

const HotOutreachMessage = mongoose.models.HotOutreachMessage || mongoose.model<IHotOutreachMessage>('HotOutreachMessage', HotOutreachMessageSchema);

export default HotOutreachMessage; 