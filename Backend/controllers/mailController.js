const { verifySmtp } = require("../config/nodemailer");
const { sendTestEmail, sendMail } = require("../services/emailService");

// @desc    Check SMTP configuration status
// @route   GET /api/mail/status
// @access  Public / Admin
const getMailStatus = async (req, res) => {
  try {
    const smtpCheck = await verifySmtp();
    res.json({
      success: smtpCheck.success,
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || "465",
      senderName: process.env.SMTP_FROM_NAME || "Art & Culture",
      senderEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      status: smtpCheck.success ? "connected" : "error",
      message: smtpCheck.message || smtpCheck.error,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "error",
      message: error.message,
    });
  }
};

// @desc    Send test email via SMTP
// @route   POST /api/mail/test
// @access  Public / Admin
const sendTestMail = async (req, res) => {
  try {
    const { to } = req.body;
    const recipient = to || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    const result = await sendTestEmail(recipient);

    if (result.success) {
      res.json({
        success: true,
        message: `Test email successfully sent to ${recipient}!`,
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test email.",
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to dispatch test email.",
    });
  }
};

// @desc    Send custom email
// @route   POST /api/mail/send
// @access  Public / Admin
const sendCustomMail = async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        message: "Both 'to' and 'subject' fields are required.",
      });
    }

    const result = await sendMail({ to, subject, html: html || text, text });
    if (result.success) {
      res.json({
        success: true,
        message: `Email successfully sent to ${to}!`,
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send email.",
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to dispatch email.",
    });
  }
};

module.exports = {
  getMailStatus,
  sendTestMail,
  sendCustomMail,
};

