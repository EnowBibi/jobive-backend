import express from "express"
import { protect } from "../middleware/auth.middleware.js"
import upload from "../middleware/upload.middleware.js"
import {
  createPost,
  getAllPosts,
  getUserPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
} from "../controllers/post.controller.js"

const router = express.Router()

// Public routes
router.get("/", getAllPosts)
router.get("/:id", getPostById)
router.get("/user/:userId", getUserPosts)

// Protected routes
router.post("/", protect, upload.array("images", 5), createPost)
router.put("/:id", protect, upload.array("images", 5), updatePost)
router.delete("/:id", protect, deletePost)
router.post("/:id/like", protect, likePost)
router.post("/:id/comments", protect, addComment)
router.delete("/:id/comments/:commentId", protect, deleteComment)

export default router
