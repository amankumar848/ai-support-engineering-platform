import express from "express";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  assignTicketToMe,
  getTicketAnalytics,
  getEngineerAnalytics
} from "../controllers/ticketController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("customer"),
  createTicket
);
router.get("/", protect, getTickets);
router.get(
  "/analytics",
  protect,
  authorize("admin"),
  getTicketAnalytics
);
router.get(
  "/analytics/engineers",
  protect,
  authorize("admin"),
  getEngineerAnalytics
);  
router.put("/:id/assign", protect, assignTicketToMe);
router.get("/:id", protect, getTicketById);
router.put("/:id", protect, updateTicket);

export default router;