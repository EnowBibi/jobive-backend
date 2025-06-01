import express from "express";
import {
  initiatePayment,
  checkPaymentStatus,
} from "../controllers/payment.controller.js";
import {protectRoutes} from "../middleware/auth.middleware.js"; // Include authentication middleware if needed

const router = express.Router();

// Route to initiate a payment
router.post("/initiate", initiatePayment);

// Route to check the payment status
router.get("/status/:transactionId", protectRoutes, checkPaymentStatus);

export default router;
