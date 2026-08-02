import mongoose from 'mongoose';

const emailVerificationTokenSchema = new mongoose.Schema(
  {
    accountRole: {
      type: String,
      enum: ['user', 'owner'],
      required: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'accountModel',
    },
    accountModel: {
      type: String,
      required: true,
      enum: ['User', 'Owner'],
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

emailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerificationToken = mongoose.model('EmailVerificationToken', emailVerificationTokenSchema);

export default EmailVerificationToken;
