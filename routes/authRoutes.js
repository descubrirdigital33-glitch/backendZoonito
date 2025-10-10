const express = require("express");
const {
  register,
  login,
  verifyEmail,
  resendVerificationCode,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verifyEmail);
router.post("/resend", resendVerificationCode);

module.exports = router;
