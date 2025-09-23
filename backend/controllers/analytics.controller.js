const ExamInterview = require("../models/ExamInterview");
const JobInterview = require("../models/JobInterview");

const getProgress = async (req, res) => {
  try {
    const { userId } = req.user; 

    const exams = await ExamInterview.find({ userId });
    const jobs = await JobInterview.find({ userId });

    const totalExams = exams.length;
    const totalJobs = jobs.length;

    // Count monthly progression (last 6 months)
    const monthlyData = {};
    [...exams, ...jobs].forEach((item) => {
      const month = new Date(item.createdAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    res.json({
      progress: {
        totalExams,
        totalJobs,
        monthlyData,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching progress analytics", error });
  }
};


const getImprovement = async (req, res) => {
  try {
    const { userId } = req.user;

    const jobs = await JobInterview.find({ userId }).sort({ createdAt: 1 });

    if (!jobs.length)
      return res.json({ improvement: { trend: [], message: "No data yet" } });

    // Example: average score trend per job
    const trend = jobs.map((job) => {
      const allScores = job.rounds.flatMap((r) =>
        r.questions.map((q) => q.score || 0)
      );
      const avgScore =
        allScores.reduce((a, b) => a + b, 0) / (allScores.length || 1);

      return {
        jobId: job._id,
        company: job.company,
        date: job.createdAt,
        avgScore: Number(avgScore.toFixed(2)),
      };
    });

    res.json({ improvement: { trend } });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching improvement analytics", error });
  }
};

const getPerformance = async (req, res) => {
  try {
    const { userId } = req.user;

    const latestJob = await JobInterview.findOne({ userId }).sort({
      createdAt: -1,
    });

    if (!latestJob)
      return res.json({
        performance: { message: "No interviews completed yet" },
      });

    // Avg score in latest job
    const allScores = latestJob.rounds.flatMap((r) =>
      r.questions.map((q) => q.score || 0)
    );
    const avgScore =
      allScores.reduce((a, b) => a + b, 0) / (allScores.length || 1);

    // Emotion breakdown
    const emotions = latestJob.behavioralMetrics?.avgEmotions || {
      happy: 0,
      sad: 0,
      neutral: 0,
      angry: 0,
    };

    res.json({
      performance: {
        company: latestJob.company,
        role: latestJob.role,
        avgScore: Number(avgScore.toFixed(2)),
        emotions,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching performance analytics", error });
  }
};

module.exports = {
  getProgress,
  getImprovement,
  getPerformance,
};
