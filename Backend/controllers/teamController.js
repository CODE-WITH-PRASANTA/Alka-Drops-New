const Team = require("../models/Team");

// @desc    Get all team members (with filtering & search)
// @route   GET /api/team
// @access  Public
const getTeamMembers = async (req, res, next) => {
  try {
    const { status, department, search, sort } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.status = status.toLowerCase();
    }

    if (department && department !== "all") {
      query.department = new RegExp(`^${department.trim()}$`, "i");
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { role: searchRegex },
        { department: searchRegex },
        { bio: searchRegex },
      ];
    }

    let sortOptions = { order: 1, createdAt: -1 };
    if (sort === "name_asc") sortOptions = { name: 1 };
    if (sort === "name_desc") sortOptions = { name: -1 };
    if (sort === "newest") sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };

    const members = await Team.find(query).sort(sortOptions);

    res.json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single team member by ID
// @route   GET /api/team/:id
// @access  Public
const getTeamMemberById = async (req, res, next) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    res.json({
      success: true,
      member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new team member
// @route   POST /api/team
// @access  Admin
const createTeamMember = async (req, res, next) => {
  try {
    const {
      name,
      role,
      department,
      image,
      bio,
      experience,
      email,
      phone,
      socialLinks,
      order,
      status,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Team member name is required.",
      });
    }

    if (!role || !role.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role / designation is required.",
      });
    }

    const member = await Team.create({
      name: name.trim(),
      role: role.trim(),
      department: department?.trim() || "Operations",
      image: image || "",
      bio: bio?.trim() || "",
      experience: experience?.trim() || "",
      email: email?.trim() || "",
      phone: phone?.trim() || "",
      socialLinks: {
        facebook: socialLinks?.facebook?.trim() || "",
        instagram: socialLinks?.instagram?.trim() || "",
        linkedin: socialLinks?.linkedin?.trim() || "",
        twitter: socialLinks?.twitter?.trim() || "",
      },
      order: Number(order) || 0,
      status: status?.toLowerCase() === "inactive" ? "inactive" : "active",
    });

    res.status(201).json({
      success: true,
      message: "Team member created successfully.",
      member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a team member
// @route   PUT /api/team/:id
// @access  Admin
const updateTeamMember = async (req, res, next) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    const {
      name,
      role,
      department,
      image,
      bio,
      experience,
      email,
      phone,
      socialLinks,
      order,
      status,
    } = req.body;

    if (name !== undefined) member.name = name.trim();
    if (role !== undefined) member.role = role.trim();
    if (department !== undefined) member.department = department.trim();
    if (image !== undefined) member.image = image;
    if (bio !== undefined) member.bio = bio.trim();
    if (experience !== undefined) member.experience = experience.trim();
    if (email !== undefined) member.email = email.trim();
    if (phone !== undefined) member.phone = phone.trim();

    if (socialLinks !== undefined) {
      member.socialLinks = {
        facebook: socialLinks?.facebook !== undefined ? socialLinks.facebook.trim() : member.socialLinks.facebook,
        instagram: socialLinks?.instagram !== undefined ? socialLinks.instagram.trim() : member.socialLinks.instagram,
        linkedin: socialLinks?.linkedin !== undefined ? socialLinks.linkedin.trim() : member.socialLinks.linkedin,
        twitter: socialLinks?.twitter !== undefined ? socialLinks.twitter.trim() : member.socialLinks.twitter,
      };
    }

    if (order !== undefined) member.order = Number(order) || 0;
    if (status !== undefined) {
      member.status = status.toLowerCase() === "inactive" ? "inactive" : "active";
    }

    const updated = await member.save();

    res.json({
      success: true,
      message: "Team member updated successfully.",
      member: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a team member
// @route   DELETE /api/team/:id
// @access  Admin
const deleteTeamMember = async (req, res, next) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    await Team.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Team member "${member.name}" removed successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle team member active/inactive status
// @route   PATCH /api/team/:id/status
// @access  Admin
const toggleTeamMemberStatus = async (req, res, next) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    member.status = member.status === "active" ? "inactive" : "active";
    await member.save();

    res.json({
      success: true,
      message: `Team member status changed to ${member.status}.`,
      status: member.status,
      member,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  toggleTeamMemberStatus,
};

