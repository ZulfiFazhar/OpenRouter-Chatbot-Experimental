import mongoose, { Schema, type Document } from "mongoose";

export interface IFolderItem extends Document {
  id: string;
  title: string;
  url: string;
}

export interface IFolder extends Document {
  id: string;
  title: string;
  url: string;
  isActive?: boolean;
  items: IFolderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const FolderItemSchema = new Schema<IFolderItem>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
});

const FolderSchema = new Schema<IFolder>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  items: [FolderItemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field on save
FolderSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Folder ||
  mongoose.model<IFolder>("Folder", FolderSchema);
