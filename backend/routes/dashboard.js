const express = require("express");
const router = express.Router();
const { validateSession } = require("../middlewares/auth.middleware");
const { getDashboardData } = require("../controllers/dashboard.controller");

// GET /api/dashboard/data
router.get("/data", validateSession, getDashboardData);

module.exports = router;
