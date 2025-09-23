const express = require("express");
const router = express.Router();
const {
  getProgress,
  getImprovement,
  getPerformance,
} = require("../controllers/analytics.controller");

const { validateSession } = require("../middlewares/auth.middleware");


router.use(validateSession);

// Define analytics routes
router.get("/progress", getProgress);
router.get("/improvement", getImprovement);
router.get("/performance", getPerformance);

module.exports = router;
