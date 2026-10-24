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

emailVerificationOTP: {
  type: String,
  default: undefined,
},

emailVerificationOTPExpires: {
  type: Date,
  default: undefined,
},

profilePicture: {
  url: {
    type: String,
    default: '',
  },
  publicId: {
    type: String,
    default: '',
  },
},

bookmarks: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  },
],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;