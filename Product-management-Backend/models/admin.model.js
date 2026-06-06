const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
     
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    firstName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    companyName: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    domain: {
      type: String,
      required: [true, "Domain is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9.-]+\.[a-z]{2,}$/, "Please enter a valid domain"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: [6, "Password must be at least 6 characters"],
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

adminSchema.pre("save", function () {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }

  if (this.domain) {
    this.domain = this.domain.toLowerCase();
  }
});

module.exports = mongoose.model("Admin", adminSchema);
