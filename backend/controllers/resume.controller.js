const resumeService = require("../services/resume.service");

async function improveResume(req, res) {
  try {
    const userId = req.userId; // assume auth middleware sets req.userId
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // optional: exam/job mode - default job
    const mode = (req.query.mode || "latex").toLowerCase(); // 'latex' or 'direct'
    if (!["latex", "direct"].includes(mode)) {
      return res
        .status(400)
        .json({ error: 'mode must be "latex" or "direct"' });
    }

    // Multer gave us file buffer in req.file
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Resume PDF file is required (field name: resume)" });
    }

    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname || "resume.pdf";

    // Call service
    const result = await resumeService.improveResumeFromPdf({
      userId,
      fileBuffer,
      originalName,
      mode,
    });

    // result: { pdfBuffer, latexCode? }
    // send as file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="improved_resume.pdf"`
    );
    // optional include latex in json if caller expects JSON (but we are streaming pdf)
    // We'll send multipart-like JSON when caller requests text response. However frontend likely expects file.
    // To keep things simple, if client asked for JSON (Accept: application/json), we'll base64 the PDF and return latex.
    const acceptJson =
      req.headers.accept && req.headers.accept.includes("application/json");
    if (acceptJson) {
      return res.json({
        success: true,
        latexCode: result.latexCode || null,
        pdfBase64: result.pdfBuffer.toString("base64"),
      });
    }

    // otherwise pipe PDF buffer
    return res.send(result.pdfBuffer);
  } catch (err) {
    console.error("❌ Error improving resume:", err);
    return res.status(500).json({ error: "Failed to improve resume" });
  }
}

module.exports = {
  improveResume,
};
