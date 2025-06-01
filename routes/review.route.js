import express from "express";
import {
  addReview,
  getFreelancerReviews,
  deleteReview,
} from "../controllers/review.controller.js";
import {protectRoutes} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoutes, addReview);
router.get("/:freelancerId", getFreelancerReviews);
router.delete("/:reviewId", protectRoutes, deleteReview);

export default router;
