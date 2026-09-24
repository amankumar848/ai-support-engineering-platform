import express from "express";

import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  uploadAttachment,
  getTicketAttachments
} from "../controllers/attachmentController.js";

const router = express.Router();

router.post(
  "/:ticketId",
  protect,
  upload.single("file"),
  uploadAttachment
);

router.get(
  "/:ticketId",
  protect,
  getTicketAttachments
);

export default router;