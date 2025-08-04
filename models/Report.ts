import mongoose, { Schema, type Document } from "mongoose"

export interface IReport extends Document {
  reporter: mongoose.Types.ObjectId
  reportedItemType: "post" | "comment"
  reportedItemId: mongoose.Types.ObjectId
  reason: string
  status: "pending" | "resolved" | "dismissed"
  createdAt: Date
  updatedAt: Date
}

const ReportSchema = new Schema<IReport>(
  {
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reportedItemType: {
      type: String,
      enum: ["post", "comment"],
      required: true,
    },
    reportedItemId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient querying
ReportSchema.index({ status: 1, createdAt: -1 })

export default mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema)
