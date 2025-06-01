import Payment from "../models/payment.model.js";
import {directPay, paymentStatus} from "../services/fapshiApi.js"; // Import the Fapshi API service

// Initiate payment
export const initiatePayment = async (req, res) => {
  try {
    const { amount, email, userId, externalId, redirectUrl, message, phone, medium, name } = req.body;

    // Validate input data
    if (!amount || !email || !userId || !externalId || !redirectUrl || !phone) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Ensure amount is integer
    const intAmount = parseInt(amount, 10);
    if (isNaN(intAmount)) {
      return res.status(400).json({ success: false, message: "Amount must be a number" });
    }

    // Prepare payment data
    const paymentData = {
      amount: intAmount,
      phone: phone.trim(),
      medium: medium || "MOBILE_MONEY", // or any default value
      name: name || "Unknown User",
      email,
      userId,
      externalId,
      message: message || "Payment initiated from app",
    };

    console.log('Calling directPay with:', paymentData);

    // Call Fapshi API to initiate payment
    const response = await directPay(paymentData);

    if (response.statusCode === 200) {
      const newPayment = new Payment({
        amount: intAmount,
        email,
        userId,
        externalId,
        status: "pending",
        paymentLink: response.paymentUrl,
      });
      const payment = await newPayment.save();

      return res.status(201).json({
        success: true,
        message: "Payment initiated successfully",
        paymentLink: response.paymentUrl,
        paymentId: payment._id,
      });
    } else {
      return res.status(response.statusCode).json({
        success: false,
        message: response.message || "Payment initiation failed",
      });
    }
  } catch (error) {
    console.error('Error in initiatePayment:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};


// Check payment status
export const checkPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Validate input
    if (!transactionId) {
      return res
        .status(400)
        .json({ success: false, message: "Transaction ID required" });
    }

    // Call Fapshi API to check payment status
    const statusResponse = await paymentStatus(transactionId);

    if (statusResponse.statusCode === 200) {
      res.status(200).json({
        success: true,
        status: statusResponse.status,
        message: "Payment status retrieved successfully",
      });
    } else {
      res.status(statusResponse.statusCode).json({
        success: false,
        message: statusResponse.message || "Payment status check failed",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
