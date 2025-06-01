import mongoose from "mongoose";

const escrowSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "disputed"],
      default: "pending",
    },
    employerConfirmed: { type: Boolean, default: false },
    freelancerConfirmed: { type: Boolean, default: false },
    transId: { type: String, required: true }, // Payment transaction ID
  },
  { timestamps: true }
);

export default mongoose.model("Escrow", escrowSchema);
