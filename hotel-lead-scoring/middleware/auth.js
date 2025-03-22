const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
  // Get token from Authorization header (Bearer token)
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Check if it's a Bearer token format
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ msg: "Invalid token format" });
  }

  const token = parts[1];
  
  // Check if JWT_SECRET is defined
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
    return res.status(500).json({ msg: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Set user ID in request object
    req.user = decoded.id;
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = auth;