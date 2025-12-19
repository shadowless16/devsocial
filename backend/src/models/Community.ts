import mongoose, { Schema, Document } from "mongoose";

export interface ICommunity extends Document {
  name: string;
  slug: string;
  description: string;
  avatar?: string;
  banner?: string;
  category: string;
  tags: string[];
  creator: mongoose.Types.ObjectId;
  moderators: mongoose.Types.ObjectId[];
  members: mongoose.Types.ObjectId[];
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  rules: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CommunitySchema = new Schema<ICommunity>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    avatar: {
      type: String,
      default: null,
    },
    banner: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      required: true,
      enum: ["frontend", "backend", "mobile", "devops", "data", "ai", "blockchain", "general"],
    },
    tags: [{
      type: String,
      trim: true,
    }],
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moderators: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    members: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    memberCount: {
      type: Number,
      default: 0,
    },
    postCount: {
      type: Number,
      default: 0,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    rules: [{
      type: String,
      maxlength: 200,
    }],
  },
  { timestamps: true }
);

CommunitySchema.index({ category: 1 });
CommunitySchema.index({ memberCount: -1 });
CommunitySchema.index({ createdAt: -1 });

const Community: mongoose.Model<ICommunity> = mongoose.models.Community || mongoose.model<ICommunity>("Community", CommunitySchema)

export default Community
