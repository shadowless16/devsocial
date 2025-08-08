import mongoose, { Schema, type Document } from "mongoose"

export interface ITag extends Document {
  name: string
  slug: string
  description?: string
  color: string
  usageCount: number
  isOfficial: boolean
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: 200,
    },
    color: {
      type: String,
      default: "#3b82f6",
    },
    usageCount: {
      type: Number,
      default: 0,
      index: true,
    },
    isOfficial: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
)

TagSchema.index({ name: "text" })
TagSchema.index({ usageCount: -1 })

export default mongoose.models.Tag || mongoose.model<ITag>("Tag", TagSchema)