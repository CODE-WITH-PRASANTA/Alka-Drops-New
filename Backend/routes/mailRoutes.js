const express = require("express");
const router = express.Router();
const {
  getMailStatus,
  sendTestMail,
  sendCustomMail,
} = require("../controllers/mailController");

// SMTP Status
router.get("/status", getMailStatus);

// Send test email
router.post("/test", sendTestMail);

// Send custom email
router.post("/send", sendCustomMail);

module.exports = router;

