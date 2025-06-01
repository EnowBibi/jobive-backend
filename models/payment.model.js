import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    externalId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
    paymentLink: {
      type: String,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
