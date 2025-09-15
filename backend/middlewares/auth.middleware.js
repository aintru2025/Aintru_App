const jwt = require("jsonwebtoken");

// Session timeout validation middleware
const validateSession = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, error: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    req.userId = decoded.userId;

    // Check session timeout (2 hours)
    const now = Date.now();
    const tokenIssuedAt = decoded.iat * 1000;
    const sessionTimeout = 2 * 60 * 60 * 1000;

    if (now - tokenIssuedAt > sessionTimeout) {
      return res.status(401).json({
        success: false,
        error: "Session expired. Please login again.",
        code: "SESSION_EXPIRED",
      });
    }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Session expired. Please login again.",
        code: "SESSION_EXPIRED",
      });
    }
    return res.status(401).json({ success: false, error: "Invalid token." });
  }
};

module.exports = { validateSession };
