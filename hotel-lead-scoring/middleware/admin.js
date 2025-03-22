const User = require("../models/User");

// Admin email allowed to access restricted routes
const ADMIN_EMAIL = "nishantkrishna2005@gmail.com";

/**
 * Middleware to check if the authenticated user is an admin
 * This middleware should be used after the auth middleware
 */
const admin = async (req, res, next) => {
  try {
    // Get the user from the database
    const user = await User.findById(req.user);
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if user email matches the admin email
    if (user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ 
        msg: "Access denied: Admin privileges required" 
      });
    }

    // User is admin, proceed
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

module.exports = admin; 