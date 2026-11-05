const Contact = require("../models/Contact");

// @desc    Submit a contact enquiry
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, interest, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required.",
      });
    }

    const contact = await Contact.create({
      name,
      email,
      phone: phone || "",
      subject: subject || "",
      interest: interest || "Water Delivery",
      message,
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your message has been received. Our team will contact you soon.",
      contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enquiries
// @route   GET /api/contact
// @access  Private/Admin
const getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContact,
  getContacts,
};

