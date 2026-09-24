import express from "express";
import {
  analyzeTicket,
  generateAIResponse
} from "../controllers/aiController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/analyze/:ticketId",
  protect,
  authorize("engineer", "admin"),
  analyzeTicket
);

router.post(
  "/response/:ticketId",
  protect,
  authorize("engineer", "admin"),
  generateAIResponse
);

export default router;