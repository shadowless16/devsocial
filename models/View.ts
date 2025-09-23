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

// Compound unique index to prevent duplicate views
// Use sparse index to handle null user values
ViewSchema.index(
  { post: 1, user: 1, ipAddress: 1 }, 
  { 
    unique: true,
    sparse: true,
    name: 'post_user_ip_unique'
  }
);

// Additional indexes for performance
ViewSchema.index({ post: 1 });
ViewSchema.index({ createdAt: -1 });
ViewSchema.index({ user: 1 }, { sparse: true });

export default models.View || model<IView>("View", ViewSchema);