import express from "express"
import { protect } from "../middleware/auth.middleware.js"
import upload from "../middleware/upload.middleware.js"
import {
  createTraining,
  getAllTrainings,
  getInstructorTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
  enrollInTraining,
  completeChapter,
  rateTraining,
  getEnrolledTrainings,
  uploadTrainingFiles,
} from "../controllers/training.controller.js"

const router = express.Router()

// Public routes
router.get("/", getAllTrainings)
router.get("/:id", getTrainingById)
router.get("/instructor/:instructorId", getInstructorTrainings)

// Protected routes
router.post("/", protect, createTraining) // You can add instructorOnly if needed
router.put("/:id", protect, updateTraining)
router.delete("/:id", protect, deleteTraining)
router.post("/:id/enroll", protect, enrollInTraining)
router.post("/:id/complete/:chapterId", protect, completeChapter)
router.post("/:id/rate", protect, rateTraining)
router.get("/user/enrolled", protect, getEnrolledTrainings)

// File upload route
router.post("/:id/upload/:chapterId/:subchapterId", protect, upload.array("files", 10), uploadTrainingFiles)

export default router
