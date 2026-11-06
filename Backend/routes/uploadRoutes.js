const express = require("express");
const router = express.Router();
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// @desc    Upload single image & convert to WebP
// @route   POST /api/upload
// @access  Public / Admin
router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please choose an image file to upload.",
      });
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `blog-${uniqueSuffix}.webp`;
    const outputPath = path.join(uploadDir, filename);

    // Convert incoming image to modern webp
    await sharp(req.file.buffer)
      .webp({ quality: 85 })
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;

    res.status(201).json({
      success: true,
      message: "Image uploaded and converted to WebP successfully!",
      url: fileUrl,
      fileUrl: fileUrl,
      filename,
      mimetype: "image/webp",
      size: stats.size,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
