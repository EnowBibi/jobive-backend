import validator from "validator";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import {ENV_VARS} from "../config/envVars.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
export const signup = async (req, res) => {
  try {
    const {name,skills,role,email, password,location} =
      req.body;
    if (!name || !email || !password || !role || !location) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    if (role === "freelancer" && (!skills)) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    if (validator.isEmail(email) === false) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "user already exists" });

    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    )
      return res.status(400).json({
        message:
          "Password should be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number and one symbol",
      });

    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      skills,
      location,
    });
    await newUser.save();

    //generate token and set cookie
    generateTokenAndSetCookie(newUser._id, res);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    console.log("Error in signup: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

      const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, ENV_VARS.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const { password: _, ...userWithoutPassword } = user._doc;

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: userWithoutPassword
    });
    console.log("Login:successful");
  } catch (error) {
    console.error("Error in login:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.log("Error in logout: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
