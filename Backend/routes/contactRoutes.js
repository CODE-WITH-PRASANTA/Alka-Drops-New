const express = require("express");
const router = express.Router();
const {
  submitContact,
  getContacts,
  updateContactStatus,
  replyContact,
  deleteContact,
} = require("../controllers/contactController");

router.post("/", submitContact);
router.get("/", getContacts);
router.patch("/:id/status", updateContactStatus);
router.post("/:id/reply", replyContact);
router.delete("/:id", deleteContact);

module.exports = router;
