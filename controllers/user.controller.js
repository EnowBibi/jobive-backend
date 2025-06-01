import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    console.log(token)
    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.log("Error in getUserProfile: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
     console.log(userId);
    const updates = req.body; 

    // Prevent updating restricted fields
    const restrictedFields = ["email", "password"];
    restrictedFields.forEach((field) => delete updates[field]);

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};