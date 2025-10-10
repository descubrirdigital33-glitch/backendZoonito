const express = require("express");
const router = express.Router();
const { updateProfile } = require("../controllers/userController");
const { uploadImage } = require("../middleware/upload");
const { authMiddleware } = require("../controllers/authController"); // ✅

router.put("/profile", authMiddleware, uploadImage.single("avatar"), updateProfile);

module.exports = router;
