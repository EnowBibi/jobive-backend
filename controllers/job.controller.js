import Job from "../models/job.model.js";

export const createJob = async (req, res) => {
    const {title, description, budget, deadline, image} = req.body;
    try {

        const newJob = new Job({...req.body, employer: req.user.id});
        const job = await newJob.save();
        res.status(201).json({success: true, message: "Job created", job});
    } catch (error) {
        res.status(500).json({success: false, error: error.message});
    }
};

export const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate("jobProvider", "name email");
        res.status(200).json({success: true, jobs});
    } catch (error) {
        res.status(500).json({success: false, error: error.message});
    }
};

export const applyToJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({success: false, message: "Job not found"});
        }
        if (!job.applicants.includes(req.user.id)) {
            job.applicants.push(req.user.id);
            await job.save();
        }
        res.status(200).json({success: true, message: "Applied to job", job});
    } catch (error) {
        res.status(500).json({success: false, error: error.message});
    }
};
