const bcrypt = require("bcrypt");
const User = require("../model/user");
const { generateToken } = require("../middleware/auth");

// register user
const register = async (req, res) => {
  try {
    const { FullName, email, password, role } = req.body;

    // to check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Build user data object
    const userData = {
      FullName,
      email,
      password: hashedPassword,
      role: role || "member",
    };

    // Only add profileImage if provided and not empty
    if (req.body.profileImage !== undefined && req.body.profileImage !== "") {
      userData.profileImage = req.body.profileImage;
    }

    const user = await User.create(userData);

    // Create a clean user object for response
    const userResponse = {
      _id: user._id,
      FullName: user.FullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      profileImage: user.profileImage,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Invalid user data",
        errors,
      });
    } else if (error.name === "MongoError" && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password"); // Explicitly select password field
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found, Please sign up" });
    }

    // Check if user.password exists and is a valid hash
    if (!user.password) {
      return res
        .status(500)
        .json({ success: false, message: "Authentication error" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Remove password before sending user data
    const userResponse = user.toObject();
    delete userResponse.password;

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  register,
  login,
};