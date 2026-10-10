import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    accountId: String,
    nickname: String,
    server: String,
    provider: String,
    result: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: ['success', 'error', 'pending'],
      default: 'pending'
    },
    errorMessage: String,
    ipAddress: String,
    userAgent: String
  },
  { timestamps: true }
);

historySchema.index({ userId: 1, createdAt: -1 });
historySchema.index({ createdAt: -1 });

export const CheckHistory = mongoose.model('CheckHistory', historySchema);
