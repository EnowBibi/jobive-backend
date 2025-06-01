import express from "express";
import {
  depositEscrow,
  confirmCompletion,
  disputeEscrow,
} from "../controllers/escrow.controller.js";
import {protectRoutes} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoutes, depositEscrow);
router.put("/confirm/:escrowId", protectRoutes, confirmCompletion);
router.put("/dispute/:escrowId", protectRoutes, disputeEscrow);

export default router;
