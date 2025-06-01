import express from "express";
import {
  sendMessage,
  deleteMessage,
  getMessages,
} from "../controllers/message.controller.js";
import {protectRoutes} from "../middleware/auth.middleware.js"; // Ensure user is authenticated

const router = express.Router();

// Send a message
router.post("/send", protectRoutes, sendMessage);

// Delete a message
router.delete("/delete/:messageId", protectRoutes, deleteMessage);

// Get old messages (conversation history)
router.get("/history", protectRoutes, getMessages);

export default router;
