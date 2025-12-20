import mongoose, { Schema, Document, models, model } from "mongoose";

export interface ITransaction extends Document {
  fromUserId: string;
  toUserId: string;
  amount: number;
  type: 'transfer' | 'reward' | 'system';
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  transactionHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    fromUserId: {
      type: String,
      required: true,
      index: true,
    },
    toUserId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    type: {
      type: String,
      enum: ['transfer', 'reward', 'system'],
      default: 'transfer',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    description: {
      type: String,
      maxlength: 200,
    },
    transactionHash: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Generate unique transaction hash
TransactionSchema.pre("save", function (next) {
  if (this.isNew && !this.transactionHash) {
    this.transactionHash = `demo_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
  next();
});

export default (models.Transaction || model<ITransaction>("Transaction", TransactionSchema)) as mongoose.Model<ITransaction>;