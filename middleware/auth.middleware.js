import { ENV_VARS } from "../config/envVars.js"
import User from "../models/user.model.js"
import jwt from "jsonwebtoken"

// Main authentication middleware (this is what we're importing as 'protect')
export const protect = async (req, res, next) => {
  try {
    let token

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }
    // Fallback to cookie token (for your existing implementation)
    else if (req.cookies.token) {
      token = req.cookies.token
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - no token provided",
      })
    }

    try {
      const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET)
      const user = await User.findById(decoded.id).select("-password")

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - user not found",
        })
      }

      req.user = user
      next()
    } catch (error) {
      console.error("Error in protect middleware: ", error.message)
      return res.status(401).json({
        success: false,
        message: "Unauthorized - token is invalid",
      })
    }
  } catch (error) {
    console.error("Error in protect middleware: ", error.message)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

// Keep your existing protectRoutes function for backward compatibility
export const protectRoutes = async (req, res, next) => {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - no token provided" })
  }
  try {
    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET)
    const user = await User.findById(decoded.id).select("-password")
    if (!user) return res.status(401).json({ message: "Unauthorized - user not found" })
    req.user = user
    next()
  } catch (error) {
    console.error("Error in protectRoutes: ", error.message)
    return res.status(401).json({ message: "Unauthorized - token is invalid" })
  }
}

// Optional: Admin middleware
export const adminOnly = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    return res.status(403).json({
      success: false,
      message: "Forbidden - admin access required",
    })
  }
}

// Optional: Instructor middleware (for training programs)
export const instructorOnly = async (req, res, next) => {
  if (req.user && (req.user.role === "instructor" || req.user.role === "admin")) {
    next()
  } else {
    return res.status(403).json({
      success: false,
      message: "Forbidden - instructor access required",
    })
  }
}
