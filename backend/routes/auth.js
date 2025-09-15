const express = require("express");
const passport = require("passport");
const router = express.Router();

const {
  testRoute,
  verifyCredentials,
  signup,
  login,
  logout,
  refreshSession,
  completeProfile,
  me,
  oauthCallback,
  validateToken,
} = require("../controllers/auth.controller");

const { validateSession } = require("../middlewares/auth.middleware");

// Routes
router.get("/test", testRoute);

router.post("/verify-credentials", verifyCredentials);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", validateSession, logout);
router.post("/refresh-session", validateSession, refreshSession);
router.post("/complete-profile", completeProfile);
router.get("/me", validateSession, me);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login?error=oauth_failed",
  }),
  oauthCallback
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "http://localhost:5173/login?error=oauth_failed",
  }),
  oauthCallback
);

router.get("/validate", validateSession, validateToken);

module.exports = router;
