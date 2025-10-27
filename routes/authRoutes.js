// const express = require("express");
// const {
//   register,
//   login,
//   verifyEmail,
//   resendVerificationCode,
// } = require("../controllers/authController");

// const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);
// router.post("/verify", verifyEmail);
// router.post("/resend", resendVerificationCode);

// module.exports = router;



const express = require("express");
const {
  register,
  login,
  verifyEmail,
  resendVerificationCode,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verifyEmail);
router.post("/resend", resendVerificationCode);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

module.exports = router;
