const express = require("express");
const router = express.Router();
const {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  toggleTeamMemberStatus,
} = require("../controllers/teamController");

// Public endpoints
router.get("/", getTeamMembers);
router.get("/:id", getTeamMemberById);

// Admin endpoints
router.post("/", createTeamMember);
router.put("/:id", updateTeamMember);
router.delete("/:id", deleteTeamMember);
router.patch("/:id/status", toggleTeamMemberStatus);

module.exports = router;

