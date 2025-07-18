const jwt = require("jsonwebtoken");
const User = require("../model/user");

// Generate JWT token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not configured. Check your .env file');
  }

  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

// Generate password reset token
const generateResetToken = () => {
  const crypto = require("crypto");
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  return { resetToken, hashedToken };
};

// Verify JWT token and attach user to request
const verifyToken = async (req, res, next) => {
  try {
    let token;
    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authentication token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    console.log("user found", user);
    
    if (!user) {
      console.log("user not found");
      return res.status(401).json({
        success: false,
        message: "Access denied. User no longer exists.",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Access denied. User account is deactivated.",
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired. Please log in again.",
      });
    }
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

// Role based access control middleware
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}.`,
      });
    }
    next();
  };
};

module.exports = {
  generateToken,
  generateResetToken,
  verifyToken,
  restrictTo,
};