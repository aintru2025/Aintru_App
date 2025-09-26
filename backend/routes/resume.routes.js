const express = require('express');
const router = express.Router();
const multer = require('multer');
const resumeController = require('../controllers/resume.controller');
const {validateSession } = require('../middlewares/auth.middleware');

const upload = multer({ storage: multer.memoryStorage() }); // keep in memory for processing

// POST /api/resume/improve?mode=latex|direct
// Accepts single file field named "resume"
router.post('/improve',validateSession, upload.single('resume'), resumeController.improveResume);

module.exports = router;
