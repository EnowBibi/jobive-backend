import express from "express";
import { protectRoutes } from "../middleware/auth.middleware.js";
import { getUserProfile, updateUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", protectRoutes, getUserProfile);
router.put("/profile/:id", updateUserProfile);

export default router;
