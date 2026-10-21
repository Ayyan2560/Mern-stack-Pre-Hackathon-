import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    resetPasswordToken: {
  type: String,
  default: undefined,
},

resetPasswordExpires: {
  type: Date,
  default: undefined,
},
isEmailVerified: {
  type: Boolean,
  default: false,
},

emailVerificationToken: {
  type: String,
  default: undefined,
},

emailVerificationExpires: {
  type: Date,
  default: undefined,
},

  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;