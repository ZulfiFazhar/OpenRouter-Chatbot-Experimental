import mongoose, { Schema, type Document } from "mongoose";

export interface IMessage extends Document {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  modelId?: string; // Tambahkan field untuk menyimpan ID model
}

export interface IChat extends Document {
  id: string;
  title: string;
  messages: IMessage[];
  folderId?: string;
  folderSlug?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  id: { type: String, required: true },
  content: { type: String, required: true },
  role: { type: String, required: true, enum: ["user", "assistant"] },
  timestamp: { type: Date, default: Date.now },
  modelId: { type: String }, // Tambahkan field untuk menyimpan ID model
});

const ChatSchema = new Schema<IChat>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  messages: [MessageSchema],
  folderId: { type: String },
  folderSlug: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field on save
ChatSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Chat ||
  mongoose.model<IChat>("Chat", ChatSchema);
