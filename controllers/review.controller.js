import Review from "../models/review.model.js";
import Job from "../models/job.model.js";

export const addReview = async (req, res) => {
  try {
    const { freelancer, job, rating, comment } = req.body;

    // Check if job exists
    const existingJob = await Job.findById(job);
    if (!existingJob) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Ensure reviewer is the job provider
    if (existingJob.jobProvider.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You can only review freelancers for jobs you posted",
        });
    }

    // Create and save review
    const review = new Review({
      reviewer: req.user.id,
      freelancer,
      job,
      rating,
      comment,
    });
    await review.save();

    res
      .status(201)
      .json({ success: true, message: "Review added successfully", review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFreelancerReviews = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const reviews = await Review.find({ freelancer: freelancerId }).populate(
      "reviewer",
      "name email"
    );

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    // Only the reviewer can delete the review
    if (review.reviewer.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You can only delete your own reviews",
        });
    }

    await review.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
