const mongoose = require("mongoose");
const validator = require("validator"); // Add this line

// User model
const userSchema = new mongoose.Schema(
  {
    FullName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [20, "Name cannot exceed 20 characters"],
      validate: {
        validator: function (name) {
          return /^[a-zA-Z\s\-']+$/.test(name);
        },
        message:
          "Name can only contain letters, spaces, hyphens, and apostrophes",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email) {
          return validator.isEmail(email);
        },
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      validate: {
        validator: function (password) {
          // At least one uppercase, one lowercase, one number, one special character
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
            password
          );
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
      select: false,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["librarian", "member"],
        message: "Role must be either librarian, member",
      },
      default: "member",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      type: String,
      default: null,
      validate: {
        validator: function (url) {
          if (!url) return true;
          return validator.isURL(url, {
            protocols: ["http", "https"],
            require_protocol: true,
          });
        },
        message: "Profile image must be a valid URL",
      },
    },

    address: {
      type: new mongoose.Schema(
        {
          street: {
            type: String,
            trim: true,
            minlength: [2, "Street must be at least 2 characters long"],
            maxlength: [50, "Street cannot exceed 50 characters"],
            required: false,
            default: undefined,
          },
          city: {
            type: String,
            trim: true,
            minlength: [2, "City must be at least 2 characters long"],
            maxlength: [30, "City cannot exceed 30 characters"],
            required: false,
            default: undefined,
          },
          state: {
            type: String,
            trim: true,
            minlength: [2, "State must be at least 2 characters long"],
            maxlength: [30, "State cannot exceed 30 characters"],
            required: false,
            default: undefined,
          },
          postalCode: {
            type: String,
            trim: true,
            minlength: [5, "Postal code must be at least 5 characters long"],
            maxlength: [10, "Postal code cannot exceed 10 characters"],
            required: false,
            default: undefined,
          },
          country: {
            type: String,
            trim: true,
            minlength: [2, "Country must be at least 2 characters long"],
            maxlength: [30, "Country cannot exceed 30 characters"],
            required: false,
            default: undefined,
          },
        },
        { _id: false }
      ),
      required: false,
      default: undefined,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

module.exports = mongoose.model("User", userSchema);
