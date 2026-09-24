import express from "express";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/protected",
  protect,
  (req, res) => {
    res.json({
      message: "You accessed a protected route",
      user: req.user
    });
  }
);

router.get(
  "/admin",
  protect,
  authorize("admin"),
  (req, res) => {
    res.json({
      message: "Welcome Admin"
    });
  }
);

router.get(
  "/engineer",
  protect,
  authorize("engineer", "admin"),
  (req, res) => {
    res.json({
      message: "Welcome Engineer"
    });
  }
);

export default router;