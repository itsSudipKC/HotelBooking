import mongoose from 'mongoose';

const passwordResetTokenSchema = new mongoose.Schema(
  {
    accountRole: {
      type: String,
      enum: ['user', 'owner', 'admin'],
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
      enum: ['User', 'Owner', 'Admin'],
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

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

export default PasswordResetToken;
