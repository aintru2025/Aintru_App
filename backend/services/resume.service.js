// services/resume.service.js
const pdfParse = require("pdf-parse");
const fs = require("fs-extra");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { exec } = require("child_process");
const PDFDocument = require("pdfkit");
const JobInterview = require("../models/JobInterview"); // ✅ Correct model for job interviews
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const TMP_DIR = path.join(__dirname, "../tmp_resume");
fs.ensureDirSync(TMP_DIR);

/**
 * High level function that:
 * - extracts text from uploaded pdf
 * - fetches user's completed job interview summaries
 * - asks Gemini to rewrite / produce LaTeX or directly PDF content
 * - compiles LaTeX -> PDF or generates PDF directly
 *
 * options: { userId, fileBuffer, originalName, mode: 'latex'|'direct' }
 * returns: { pdfBuffer, latexCode? }
 */
async function improveResumeFromPdf(options) {
  const { userId, fileBuffer, originalName, mode } = options;
  const runId = uuidv4();
  const tmpPdfPath = path.join(TMP_DIR, `${runId}_upload.pdf`);

  try {
    // save incoming buffer to disk temporarily
    await fs.writeFile(tmpPdfPath, fileBuffer);

    // extract text from PDF
    const pdfData = await pdfParse(fileBuffer);
    const resumeText = (pdfData.text || "").trim();
    if (!resumeText) {
      throw new Error(
        "Unable to extract text from PDF. Make sure the PDF contains selectable text (not only images)."
      );
    }

    // ✅ Gather user's completed job interview summaries only
    const sessions = await JobInterview.find({
      userId,
      isCompleted: true,
    }).lean();

    const summaries = sessions
      .map((s) =>
        s.summary
          ? `Company: ${s.company}\nRole: ${s.role}\nSummary: ${s.summary}`
          : null
      )
      .filter(Boolean)
      .join("\n\n");

    if (mode === "latex") {
      const prompt = `
You are an expert resume writer. Convert and improve the following resume into a clean LaTeX resume.
Rules:
- Use the resume content provided.
- Incorporate strengths and achievements emphasized by interview feedback (below).
- Output ONLY LaTeX code (no explanation).
- Use sections: Summary, Skills, Experience, Projects, Education, Certifications (include fields if present).
- Keep layout printable and ATS-friendly. Do not include images.
- When not sure of dates, keep placeholders like "<Year>".
----
Resume text:
${resumeText}
----
Interview summaries (user):
${summaries || "No interview summaries available."}
----
Return the complete LaTeX code only.
      `;

      const result = await model.generateContent(prompt);
      const latexCode = result.response.text().trim();

      const texPath = path.join(TMP_DIR, `${runId}.tex`);
      await fs.writeFile(texPath, latexCode, "utf8");

      await execPromise(
        `pdflatex -interaction=nonstopmode -halt-on-error -output-directory=${TMP_DIR} ${texPath}`
      );
      await execPromise(
        `pdflatex -interaction=nonstopmode -halt-on-error -output-directory=${TMP_DIR} ${texPath}`
      );

      const pdfGeneratedPath = path.join(TMP_DIR, `${runId}.pdf`);
      const pdfBuffer = await fs.readFile(pdfGeneratedPath);

      await cleanupRunFiles(runId, /* keepTex= */ false);

      return { pdfBuffer, latexCode };
    } else {
      const prompt = `
You are an expert resume writer. Improve and rewrite the following resume to be ATS-friendly and aligned with user's interview strengths.

Guidelines:
- Output a structured plain text resume with headings exactly: SUMMARY, SKILLS, EXPERIENCE, PROJECTS, EDUCATION, CERTIFICATIONS
- Use bullet style using "-" lines under headings.
- Avoid LaTeX or HTML. Output only plain text content.
Resume:
${resumeText}
Interview summaries:
${summaries || "No summaries available."}
Return only the improved plain text resume.
      `;

      const result = await model.generateContent(prompt);
      const improvedText = result.response.text().trim();

      const pdfBuffer = await generatePdfFromText(improvedText);

      await fs.remove(tmpPdfPath);

      return { pdfBuffer, latexCode: null };
    }
  } catch (err) {
    try {
      await fs.remove(tmpPdfPath);
    } catch (_) {}
    console.error("resume.service.improveResumeFromPdf error:", err);
    throw err;
  }
}

/* Helper: promisified exec */
function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(
      cmd,
      { cwd: TMP_DIR, maxBuffer: 1024 * 1024 * 10 },
      (err, stdout, stderr) => {
        if (err) {
          console.error("exec error:", err, stderr);
          return reject(new Error(stderr || err.message));
        }
        resolve({ stdout, stderr });
      }
    );
  });
}

/* Helper: generate PDF using pdfkit */
async function generatePdfFromText(text) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const lines = text.split("\n").map((l) => l.trim());
      doc.font("Helvetica");

      for (const line of lines) {
        if (!line) {
          doc.moveDown(0.4);
          continue;
        }
        if (/^[A-Z\s]+$/.test(line) && line.length < 40) {
          doc.fontSize(12).fillColor("#333").text(line);
          doc.moveDown(0.2);
          doc
            .moveTo(doc.x, doc.y)
            .lineTo(doc.page.width - doc.page.margins.right, doc.y)
            .strokeColor("#cccccc")
            .strokeOpacity(0.15)
            .stroke();
          doc.moveDown(0.6);
          doc.fontSize(10).fillColor("#000");
        } else if (line.startsWith("- ")) {
          doc
            .fontSize(10)
            .text("• " + line.slice(2), { indent: 20, paragraphGap: 2 });
        } else {
          doc.fontSize(10).text(line, { paragraphGap: 3 });
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/* Helper: cleanup generated files */
async function cleanupRunFiles(runId, keepTex = false) {
  const patterns = [
    path.join(TMP_DIR, `${runId}.aux`),
    path.join(TMP_DIR, `${runId}.log`),
    path.join(TMP_DIR, `${runId}.out`),
    path.join(TMP_DIR, `${runId}.toc`),
    path.join(TMP_DIR, `${runId}.pdf`),
    path.join(TMP_DIR, `${runId}_upload.pdf`),
  ];
  if (!keepTex) patterns.push(path.join(TMP_DIR, `${runId}.tex`));

  for (const p of patterns) {
    try {
      await fs.remove(p);
    } catch (e) {}
  }
}

module.exports = {
  improveResumeFromPdf,
};
