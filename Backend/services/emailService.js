const { transporter } = require("../config/nodemailer");

/**
 * Core send mail helper
 */
const sendMail = async ({ to, subject, html, text }) => {
  try {
    const fromName = process.env.SMTP_FROM_NAME || "Art & Culture";
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ""),
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send a quick test email
 */
const sendTestEmail = async (recipientEmail) => {
  const to = recipientEmail || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const subject = "SMTP Mail Delivery Test - Alka Drops";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%); padding: 24px; color: #ffffff; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">Alka Drops Hydration</h1>
        <p style="margin: 6px 0 0; opacity: 0.9; font-size: 13px;">Nodemailer SMTP Integration Verified</p>
      </div>
      <div style="padding: 28px; color: #1e293b; line-height: 1.6;">
        <h2 style="margin: 0 0 12px; font-size: 18px; color: #0f172a;">SMTP Configuration Successful! 🎉</h2>
        <p style="margin: 0 0 16px; font-size: 14px;">This test message confirms that your Gmail SMTP server has been successfully integrated with Nodemailer in the Alka Drops application.</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; font-size: 12.5px; margin-bottom: 20px;">
          <div><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || "smtp.gmail.com"}</div>
          <div><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || "465"} (SSL/TLS)</div>
          <div><strong>Sender:</strong> ${process.env.SMTP_FROM_NAME || "Art & Culture"} &lt;${process.env.SMTP_FROM_EMAIL}&gt;</div>
          <div><strong>Timestamp:</strong> ${new Date().toLocaleString("en-IN")}</div>
        </div>
        <p style="margin: 0; font-size: 13px; color: #64748b;">Automated system message from Alka Drops operations backend.</p>
      </div>
    </div>
  `;

  return await sendMail({ to, subject, html });
};

/**
 * Send welcome email to newly registered customer
 */
const sendWelcomeEmail = async ({ name, email }) => {
  const subject = "Welcome to Alka Drops! Pure Hydration Awaits 💧";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%); padding: 28px; color: #ffffff; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Welcome to Alka Drops, ${name}!</h1>
        <p style="margin: 8px 0 0; opacity: 0.95; font-size: 14px;">Pure, Enriched Alkaline Water at Your Doorstep</p>
      </div>
      <div style="padding: 28px; color: #1e293b; line-height: 1.6;">
        <p style="margin: 0 0 16px; font-size: 14.5px;">Thank you for creating an account with <strong>Alka Drops</strong>. We are committed to delivering certified, mineral-enriched hydration directly to your family or workspace in Bhubaneswar.</p>
        <p style="margin: 0 0 20px; font-size: 14px; color: #475569;">You can now browse 20L jars, explore flexible monthly subscription plans, and manage delivery schedules seamlessly through your account portal.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/shop" style="background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%); color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">Explore Hydration Shop</a>
        </div>
        <p style="margin: 0; font-size: 12.5px; color: #94a3b8; text-align: center;">Need assistance? Reply directly to this email or reach our support team.</p>
      </div>
    </div>
  `;

  return await sendMail({ to: email, subject, html });
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmationEmail = async ({ order, customerEmail, customerName }) => {
  const to = customerEmail || order.shippingAddress?.email;
  if (!to) return { success: false, error: "Recipient email is missing." };

  const orderId = order.orderId || order._id?.toString().slice(-8).toUpperCase() || "ORD";
  const items = Array.isArray(order.items) ? order.items : [];
  const total = order.totalAmount || 0;

  const subject = `Order Confirmed #${orderId} - Alka Drops`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%); padding: 24px; color: #ffffff; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Order Confirmed!</h1>
        <p style="margin: 6px 0 0; opacity: 0.95; font-size: 13px;">Order #${orderId} has been placed successfully.</p>
      </div>
      <div style="padding: 24px; color: #1e293b;">
        <p style="margin: 0 0 16px; font-size: 14px;">Hello <strong>${customerName || "Valued Customer"}</strong>,</p>
        <p style="margin: 0 0 20px; font-size: 14px; color: #475569;">Thank you for your order with Alka Drops. Our dispatch hub in Bhubaneswar has received your request and is preparing your pure mineral water delivery.</p>

        <h3 style="margin: 20px 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
          ${items
            .map(
              (it) => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${it.name || "Alka Drops 20L Jar"} (x${it.quantity || 1})</td>
              <td style="padding: 10px 0; text-align: right; color: #0f172a; font-weight: 700;">₹${(Number(it.price) || 0) * (Number(it.quantity) || 1)}</td>
            </tr>
          `
            )
            .join("")}
          <tr>
            <td style="padding: 12px 0 0; font-weight: 800; font-size: 15px; color: #0f172a;">Total Amount</td>
            <td style="padding: 12px 0 0; text-align: right; font-weight: 800; font-size: 16px; color: #0d9488;">₹${total}</td>
          </tr>
        </table>

        ${
          order.shippingAddress?.street
            ? `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 12.5px; margin-bottom: 20px;">
            <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Delivery Address:</strong>
            ${order.shippingAddress.street}, ${order.shippingAddress.city || "Bhubaneswar"}, ${order.shippingAddress.state || "Odisha"} - ${order.shippingAddress.postalCode || ""}
          </div>
        `
            : ""
        }

        <p style="margin: 0; font-size: 12.5px; color: #94a3b8; text-align: center;">Our delivery executive will contact you prior to doorstep dispatch.</p>
      </div>
    </div>
  `;

  return await sendMail({ to, subject, html });
};

/**
 * Send credentials email to newly registered delivery partner
 */
const sendDeliveryAgentCredentialsEmail = async ({ agent, credentials }) => {
  const to = agent.email;
  const subject = "Your Delivery Partner Access Credentials - Alka Drops Fleet";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%); padding: 24px; color: #ffffff; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Welcome to the Delivery Fleet!</h1>
        <p style="margin: 6px 0 0; opacity: 0.95; font-size: 13px;">Partner ID: ${agent.partnerId || "ALK-DB"}</p>
      </div>
      <div style="padding: 24px; color: #1e293b;">
        <p style="margin: 0 0 16px; font-size: 14px;">Hello <strong>${agent.name}</strong>,</p>
        <p style="margin: 0 0 20px; font-size: 14px; color: #475569;">You have been officially onboarded into the Alka Drops hydration logistics fleet. Below are your system login credentials:</p>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; font-size: 13.5px; margin-bottom: 24px;">
          <div style="margin-bottom: 8px;"><strong>Partner ID:</strong> <span style="color: #0d9488;">${agent.partnerId}</span></div>
          <div style="margin-bottom: 8px;"><strong>Login Email:</strong> ${agent.email}</div>
          <div style="margin-bottom: 8px;"><strong>Initial Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${credentials.password || "Alka@2026"}</code></div>
          <div style="margin-bottom: 8px;"><strong>Assigned Route:</strong> ${agent.route || "Zone A"}</div>
          <div><strong>Vehicle:</strong> ${agent.vehicleNumber || "Assigned EV"}</div>
        </div>

        <p style="margin: 0; font-size: 12.5px; color: #64748b;">Please login to the companion delivery portal to update your duty status and manage your daily dispatches.</p>
      </div>
    </div>
  `;

  return await sendMail({ to, subject, html });
};

module.exports = {
  sendMail,
  sendTestEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendDeliveryAgentCredentialsEmail,
};

