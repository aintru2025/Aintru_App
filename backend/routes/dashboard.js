const express = require("express");
const router = express.Router();
const { validateSession } = require("../middleware/authMiddleware");
const { getDashboardData } = require("../controllers/dashboardController");

// GET /api/dashboard/data
router.get("/data", validateSession, getDashboardData);

module.exports = router;
