import express from "express";

import {
  addComment,
  getComments
} from "../controllers/commentController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:ticketId", protect, addComment);

router.get("/:ticketId", protect, getComments);

export default router;