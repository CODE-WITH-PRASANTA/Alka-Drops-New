const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Ensure environment variables are loaded
dotenv.config();

const port = parseInt(process.env.SMTP_PORT, 10) || 465;
const isSecure =
  process.env.SMTP_SECURE === "true" ||
  process.env.SMTP_SECURE === true ||
  port === 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: port,
  secure: isSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Helper to verify SMTP credentials and readiness
const verifySmtp = async () => {
  try {
    const success = await transporter.verify();
    console.log("✅ Nodemailer SMTP Connected & Ready to send emails.");
    return { success: true, message: "SMTP server is ready to send messages." };
  } catch (error) {
    console.error("❌ Nodemailer SMTP Connection Error:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  transporter,
  verifySmtp,
};

