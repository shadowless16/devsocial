import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IView extends Document {
  post: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  ipAddress: string;
  userAgent?: string;
  createdAt: Date;
}

const ViewSchema = new Schema<IView>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
ViewSchema.index({ post: 1, user: 1 });
ViewSchema.index({ post: 1, ipAddress: 1 });
ViewSchema.index({ createdAt: -1 });

export default models.View || model<IView>("View", ViewSchema);