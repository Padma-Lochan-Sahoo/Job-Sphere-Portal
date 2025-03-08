import jwt from "jsonwebtoken";
import Company from "../models/Company.models.js";
import User from "../models/User.models.js";

// Recruiter Authentication
export const protectCompany = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized, token missing or invalid format",
      });
    }

    // Extract the actual token
    const token = authHeader.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the company without the password
    req.company = await Company.findById(decoded.id).select("-password");
    
    if (!req.company) {
      return res.status(404).json({
        success: false,
        message: "Company not found, please login again",
      });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired, please login again",
      });
    }
    res.status(401).json({
      success: false,
      message: "Invalid token, please login again",
    });
  }
};

// User Authentication
export const protectUser = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized, please log in",
      });
    }

    // Get the actual token
    const token = authHeader.split(" ")[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded); // Debugging
    } catch (error) {
      console.error("JWT Verification Error:", error.message); // Debugging

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ success: false, message: "Invalid token" });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Token expired, please login again" });
      }
      return res.status(401).json({ success: false, message: "Authentication failed" });
    }


    // Fetch user from database (excluding password)
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    next(); // Proceed to the next middleware or route
  } catch (error) {

    res.status(500).json({ success: false, message: "Server error" });
  }
};
