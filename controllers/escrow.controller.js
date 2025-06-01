import Escrow from "../models/escrow.model.js";
import Job from "../models/job.model.js";
import { initiatePay, payout } from "../services/fapshiApi.js"; // Payment integration service

// Deposit money into escrow
export const depositEscrow = async (req, res) => {
  try {
    const { job, amount } = req.body;
    const jobDetails = await Job.findById(job);

    if (!jobDetails)
      return res.status(404).json({ success: false, message: "Job not found" });

    if (jobDetails.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the employer can deposit funds",
      });
    }

    // Initiate payment with Fapshi API
    const paymentResponse = await initiatePay({
      amount,
      email: req.user.email,
      userId: req.user.id,
      externalId: job,
      message: `Escrow payment for job: ${job}`,
    });

    if (
      !paymentResponse ||
      !paymentResponse.statusCode ||
      paymentResponse.statusCode !== 200
    ) {
      return res
        .status(500)
        .json({ success: false, message: "Payment initiation failed" });
    }

    // Store escrow transaction
    const escrow = new Escrow({
      job,
      employer: req.user.id,
      freelancer: jobDetails.freelancer,
      amount,
      transId: paymentResponse.transId,
    });

    await escrow.save();

    res
      .status(201)
      .json({ success: true, message: "Escrow deposit successful", escrow });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Confirm job completion
export const confirmCompletion = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const escrow = await Escrow.findById(escrowId);

    if (!escrow)
      return res
        .status(404)
        .json({ success: false, message: "Escrow record not found" });

    if (escrow.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Escrow is not in a pending state" });
    }

    // Mark confirmation
    if (req.user.id === escrow.employer.toString()) {
      escrow.employerConfirmed = true;
    } else if (req.user.id === escrow.freelancer.toString()) {
      escrow.freelancerConfirmed = true;
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action" });
    }

    await escrow.save();

    // Release payment if both parties confirm
    if (escrow.employerConfirmed && escrow.freelancerConfirmed) {
      const payoutResponse = await payout({
        amount: escrow.amount,
        phone: req.user.phone,
        userId: escrow.freelancer,
        externalId: escrow.job,
        message: `Payout for completed job: ${escrow.job}`,
      });

      if (
        !payoutResponse ||
        !payoutResponse.statusCode ||
        payoutResponse.statusCode !== 200
      ) {
        return res
          .status(500)
          .json({ success: false, message: "Payout failed" });
      }

      escrow.status = "completed";
      await escrow.save();

      return res
        .status(200)
        .json({ success: true, message: "Payment released to freelancer" });
    }

    res.status(200).json({
      success: true,
      message: "Completion confirmed. Awaiting other party.",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Handle disputes
export const disputeEscrow = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const escrow = await Escrow.findById(escrowId);

    if (!escrow)
      return res
        .status(404)
        .json({ success: false, message: "Escrow record not found" });

    if (escrow.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot dispute a completed escrow" });
    }

    escrow.status = "disputed";
    await escrow.save();

    res.status(200).json({
      success: true,
      message: "Escrow has been disputed. Admin intervention required.",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
