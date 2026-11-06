const Contact = require("../models/Contact");

// @desc    Submit a contact enquiry
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, interest, message } = req.body;

    if (!name || !name.trim() || !email || !email.trim() || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required.",
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Anti-duplication check: prevent identical submission within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existing = await Contact.findOne({
      email: email.trim().toLowerCase(),
      message: message.trim(),
      createdAt: { $gte: fiveMinutesAgo },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "We have already received your message recently. Our team will contact you shortly.",
      });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject && subject.trim() ? subject.trim() : (interest ? `${interest} Enquiry` : "General Inquiry"),
      interest: interest || "Water Delivery",
      message: message.trim(),
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your enquiry has been submitted successfully. Our team will contact you soon.",
      contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enquiries
// @route   GET /api/contact
// @access  Public / Admin
const getContacts = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = new RegExp(`^${status}$`, "i");
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
        { message: { $regex: q, $options: "i" } },
      ];
    }

    const contacts = await Contact.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update enquiry status
// @route   PATCH /api/contact/:id/status
// @access  Admin
const updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required." });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, message: "Enquiry not found." });
    }

    res.json({
      success: true,
      message: `Enquiry status updated to ${status}.`,
      contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to an enquiry
// @route   POST /api/contact/:id/reply
// @access  Admin
const replyContact = async (req, res, next) => {
  try {
    const { replyText } = req.body;
    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ success: false, message: "Reply message cannot be empty." });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        adminReply: replyText.trim(),
        repliedAt: new Date(),
        status: "Resolved",
      },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, message: "Enquiry not found." });
    }

    res.json({
      success: true,
      message: "Reply saved and enquiry marked as Resolved.",
      contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an enquiry
// @route   DELETE /api/contact/:id
// @access  Admin
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: "Enquiry not found." });
    }

    res.json({
      success: true,
      message: "Enquiry deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContact,
  getContacts,
  updateContactStatus,
  replyContact,
  deleteContact,
};
