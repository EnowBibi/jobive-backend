import express from "express";
import { createJob, getJobs, applyToJob } from "../controllers/job.controller.js";
import {protectRoutes} from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/", protectRoutes, createJob);
router.get("/", getJobs);
router.post("/:jobId/apply", protectRoutes, applyToJob);

export default router;
