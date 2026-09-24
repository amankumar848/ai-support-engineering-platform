import express from "express";
import { getEngineers } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/engineers",
  protect,
  authorize("admin"),
  getEngineers
);

export default router;