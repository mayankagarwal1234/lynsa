import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAttachment extends Document {
  filename: string;
  mimetype: string;
  data: Buffer;
}

const AttachmentSchema: Schema<IAttachment> = new Schema({
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  data: { type: Buffer, required: true },
});

export const AttachmentModel: Model<IAttachment> = mongoose.model<IAttachment>(
  "Attachment",
  AttachmentSchema
);
