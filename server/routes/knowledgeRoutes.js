import express from "express";

import {
  createKnowledgeDocument
} from "../controllers/knowledgeController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";
import { searchKnowledgeDocuments 
 } from "../controllers/knowledgeController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("admin"),
  createKnowledgeDocument
);
router.post(
  "/search",
  protect,
  authorize("customer", "engineer", "admin"),
  searchKnowledgeDocuments
);

export default router;