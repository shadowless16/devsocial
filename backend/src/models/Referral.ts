import mongoose, { Schema, type Document } from "mongoose"

export interface IReferral extends Document {
  referrer: mongoose.Types.ObjectId
  referred: mongoose.Types.ObjectId
  referralCode: string
  status: "pending" | "completed" | "expired"
  completedAt?: Date
  expiresAt: Date
  rewardsClaimed: boolean
  referrerReward: number
  referredReward: number
  createdAt: Date
  updatedAt: Date
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referred: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "expired"],
      default: "pending",
      index: true,
    },
    completedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    rewardsClaimed: {
      type: Boolean,
      default: false,
    },
    referrerReward: {
      type: Number,
      default: 25,
    },
    referredReward: {
      type: Number,
      default: 15,
    },
  },
  {
    timestamps: true,
  },
)

// Compound indexes for efficient queries
ReferralSchema.index({ referrer: 1, status: 1 })
ReferralSchema.index({ referred: 1, status: 1 })
ReferralSchema.index({ referralCode: 1, status: 1 })

const Referral: mongoose.Model<IReferral> = mongoose.models.Referral || mongoose.model<IReferral>("Referral", ReferralSchema)

export default Referral

