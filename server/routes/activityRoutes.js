import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getTicketActivities } from "../controllers/activityController.js";

const router = express.Router();

router.get(
  "/:ticketId",
  protect,
  getTicketActivities
);

export default router;