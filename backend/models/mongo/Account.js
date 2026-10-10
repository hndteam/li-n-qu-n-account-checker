import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    accountId: String,
    nickname: String,
    server: String,
    level: Number,
    rank: String,
    winRate: Number,
    matches: Number,
    status: String,
    avatar: String,
    lastUpdated: Date,
    provider: String,
    rawData: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

accountSchema.index({ userId: 1, createdAt: -1 });

export const Account = mongoose.model('Account', accountSchema);
