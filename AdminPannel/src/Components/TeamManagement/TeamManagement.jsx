import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  FiUsers,
  FiUserPlus,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiUploadCloud,
  FiGrid,
  FiList,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiLinkedin,
  FiInstagram,
  FiTwitter,
  FiFacebook,
  FiMail,
  FiPhone,
  FiLayers,
  FiCheck,
} from "react-icons/fi";
import API from "../../services/api";
import "./TeamManagement.css";

const DEPARTMENTS = [
  "All Departments",
  "Executive",
  "Operations",
  "Quality Assurance",
  "Customer Care",
  "Logistics",
  "Sales & Partnerships",
  "Marketing",
  "Technology",
];

// Helper to convert images to high-efficiency WebP in the browser before upload
const convertFileToWebP = (file, quality = 0.88) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const baseName = file.name.replace(/\.[^/.]+$/, "");
              const webpFile = new File([blob], `${baseName}.webp`, {
                type: "image/webp",
              });
              resolve(webpFile);
            } else {
              resolve(file);
            }
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

const emptyMemberForm = {
  name: "",
  role: "",
  department: "Operations",
  image: "",
  bio: "",
  experience: "",
  email: "",
  phone: "",
  socialLinks: {
    linkedin: "",
    instagram: "",
    twitter: "",
    facebook: "",
  },
  order: 0,
  status: "active",
};

const TeamManagement = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyMemberForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const fileInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  /* =====================================================
     FETCH TEAM MEMBERS FROM BACKEND VIA AXIOS
  ===================================================== */
  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/team");
      if (res.data?.success && Array.isArray(res.data.members)) {
        setMembers(res.data.members);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error("Error fetching team members:", err);
      showToast("Failed to load team members from database.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  /* =====================================================
     IMAGE UPLOAD WITH AUTO WEBP CONVERSION
  ===================================================== */
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      showToast("Optimizing and converting image to WebP...", "info");

      // Convert to WebP
      const webpFile = await convertFileToWebP(file);

      // Upload via Axios
      const uploadData = new FormData();
      uploadData.append("image", webpFile);

      const res = await API.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data.url) {
        setFormData((prev) => ({ ...prev, image: res.data.url }));
        showToast("Profile image uploaded and optimized successfully!");
      } else {
        showToast(res.data?.message || "Image upload failed.", "error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast("Error uploading image. Is backend running?", "error");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  /* =====================================================
     OPEN ADD / EDIT MODAL
  ===================================================== */
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ...emptyMemberForm,
      order: members.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setEditingId(member._id);
    setFormData({
      name: member.name || "",
      role: member.role || "",
      department: member.department || "Operations",
      image: member.image || "",
      bio: member.bio || "",
      experience: member.experience || "",
      email: member.email || "",
      phone: member.phone || "",
      socialLinks: {
        linkedin: member.socialLinks?.linkedin || "",
        instagram: member.socialLinks?.instagram || "",
        twitter: member.socialLinks?.twitter || "",
        facebook: member.socialLinks?.facebook || "",
      },
      order: member.order !== undefined ? member.order : 0,
      status: member.status || "active",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(emptyMemberForm);
  };

  /* =====================================================
     SAVE TEAM MEMBER (CREATE OR UPDATE)
  ===================================================== */
  const handleSaveMember = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Please provide the team member's name.", "error");
      return;
    }

    if (!formData.role.trim()) {
      showToast("Please provide the role or designation.", "error");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        name: formData.name.trim(),
        role: formData.role.trim(),
        department: formData.department.trim(),
        image: formData.image || "",
        bio: formData.bio.trim(),
        experience: formData.experience.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        socialLinks: {
          linkedin: formData.socialLinks.linkedin.trim(),
          instagram: formData.socialLinks.instagram.trim(),
          twitter: formData.socialLinks.twitter.trim(),
          facebook: formData.socialLinks.facebook.trim(),
        },
        order: Number(formData.order) || 0,
        status: formData.status || "active",
      };

      if (editingId) {
        const res = await API.put(`/team/${editingId}`, payload);
        if (res.data?.success) {
          showToast(`Team member "${formData.name}" updated successfully!`);
          fetchTeamMembers();
          handleCloseModal();
        } else {
          showToast(res.data?.message || "Failed to update team member.", "error");
        }
      } else {
        const res = await API.post("/team", payload);
        if (res.data?.success) {
          showToast(`Team member "${formData.name}" added to database!`);
          fetchTeamMembers();
          handleCloseModal();
        } else {
          showToast(res.data?.message || "Failed to create team member.", "error");
        }
      }
    } catch (err) {
      console.error("Save member error:", err);
      showToast(err.response?.data?.message || "Network error while saving.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  /* =====================================================
     INSTANT STATUS TOGGLE (ACTIVE <-> INACTIVE)
  ===================================================== */
  const handleToggleStatus = async (member) => {
    const newStatus = member.status === "active" ? "inactive" : "active";
    // Optimistic UI update
    setMembers((prev) =>
      prev.map((m) => (m._id === member._id ? { ...m, status: newStatus } : m))
    );

    try {
      const res = await API.patch(`/team/${member._id}/status`);
      if (res.data?.success) {
        showToast(
          `"${member.name}" is now ${newStatus === "active" ? "Visible on Frontend" : "Hidden"}.`
        );
      } else {
        fetchTeamMembers(); // Revert on failure
        showToast(res.data?.message || "Could not update status.", "error");
      }
    } catch (err) {
      fetchTeamMembers();
      showToast("Server error updating status.", "error");
    }
  };

  /* =====================================================
     DELETE MEMBER
  ===================================================== */
  const handleDeleteMember = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const res = await API.delete(`/team/${deleteTarget._id}`);
      if (res.data?.success) {
        showToast(`Team member "${deleteTarget.name}" deleted.`);
        setMembers((prev) => prev.filter((m) => m._id !== deleteTarget._id));
      } else {
        showToast(res.data?.message || "Could not delete team member.", "error");
      }
    } catch (err) {
      showToast("Error communicating with server.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  /* =====================================================
     FILTERED & SEARCHED MEMBERS
  ===================================================== */
  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return members.filter((m) => {
      const matchSearch =
        !q ||
        m.name?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q) ||
        m.department?.toLowerCase().includes(q) ||
        m.bio?.toLowerCase().includes(q);

      const matchDept =
        selectedDept === "All Departments" ||
        m.department?.toLowerCase() === selectedDept.toLowerCase();

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && m.status === "active") ||
        (statusFilter === "inactive" && m.status === "inactive");

      return matchSearch && matchDept && matchStatus;
    });
  }, [members, search, selectedDept, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.status === "active").length;
    const inactive = total - active;
    const depts = new Set(members.map((m) => m.department?.trim()).filter(Boolean)).size;
    return { total, active, inactive, depts };
  }, [members]);

  return (
    <div className="TeamManagement">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`TeamManagement-toast TeamManagement-toast--${toast.type}`}>
          {toast.type === "error" ? <FiAlertCircle /> : <FiCheckCircle />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="TeamManagement-header">
        <div className="TeamManagement-heading">
          <div className="TeamManagement-headingIcon">
            <FiUsers />
          </div>
          <h1>Team Management</h1>
        </div>

        <div className="TeamManagement-headerActions">
          <button
            type="button"
            className="TeamManagement-refreshButton"
            onClick={fetchTeamMembers}
            title="Refresh from Database"
          >
            <FiRefreshCw className={isLoading ? "spin" : ""} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            className="TeamManagement-primaryButton"
            onClick={handleOpenAdd}
          >
            <FiUserPlus />
            <span>Add Team Member</span>
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="TeamManagement-statsGrid">
        <div className="TeamManagement-statCard">
          <div className="TeamManagement-statIcon TeamManagement-statIcon--total">
            <FiUsers />
          </div>
          <div className="TeamManagement-statInfo">
            <span className="TeamManagement-statValue">{stats.total}</span>
            <span className="TeamManagement-statLabel">Total Members</span>
          </div>
        </div>

        <div className="TeamManagement-statCard">
          <div className="TeamManagement-statIcon TeamManagement-statIcon--active">
            <FiCheckCircle />
          </div>
          <div className="TeamManagement-statInfo">
            <span className="TeamManagement-statValue">{stats.active}</span>
            <span className="TeamManagement-statLabel">Active on Website</span>
          </div>
        </div>

        <div className="TeamManagement-statCard">
          <div className="TeamManagement-statIcon TeamManagement-statIcon--inactive">
            <FiXCircle />
          </div>
          <div className="TeamManagement-statInfo">
            <span className="TeamManagement-statValue">{stats.inactive}</span>
            <span className="TeamManagement-statLabel">Hidden / Inactive</span>
          </div>
        </div>

        <div className="TeamManagement-statCard">
          <div className="TeamManagement-statIcon TeamManagement-statIcon--depts">
            <FiLayers />
          </div>
          <div className="TeamManagement-statInfo">
            <span className="TeamManagement-statValue">{stats.depts}</span>
            <span className="TeamManagement-statLabel">Departments</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="TeamManagement-toolbar">
        <div className="TeamManagement-searchWrap">
          <FiSearch className="TeamManagement-searchIcon" />
          <input
            type="text"
            className="TeamManagement-searchInput"
            placeholder="Search by name, role, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="TeamManagement-clearSearch"
              onClick={() => setSearch("")}
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="TeamManagement-filters">
          <div className="TeamManagement-selectWrap">
            <FiFilter className="TeamManagement-filterIcon" />
            <select
              className="TeamManagement-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="TeamManagement-statusPills">
            <button
              type="button"
              className={`TeamManagement-pill ${statusFilter === "all" ? "is-active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`TeamManagement-pill ${statusFilter === "active" ? "is-active" : ""}`}
              onClick={() => setStatusFilter("active")}
            >
              Active
            </button>
            <button
              type="button"
              className={`TeamManagement-pill ${statusFilter === "inactive" ? "is-active" : ""}`}
              onClick={() => setStatusFilter("inactive")}
            >
              Inactive
            </button>
          </div>

          <div className="TeamManagement-viewToggle">
            <button
              type="button"
              className={`TeamManagement-viewBtn ${viewMode === "grid" ? "is-active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <FiGrid />
            </button>
            <button
              type="button"
              className={`TeamManagement-viewBtn ${viewMode === "table" ? "is-active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <FiList />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="TeamManagement-loadingState">
          <div className="TeamManagement-spinner" />
          <p>Loading team members from database...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="TeamManagement-emptyState">
          <div className="TeamManagement-emptyIcon">
            <FiUsers />
          </div>
          <h3>No team members found</h3>
          <p>
            {search || selectedDept !== "All Departments" || statusFilter !== "all"
              ? "No team members matched your filter criteria. Try adjusting your search."
              : "No team members exist in the database yet. Click below to add your first member."}
          </p>
          {(search || selectedDept !== "All Departments" || statusFilter !== "all") ? (
            <button
              type="button"
              className="TeamManagement-secondaryButton"
              onClick={() => {
                setSearch("");
                setSelectedDept("All Departments");
                setStatusFilter("all");
              }}
            >
              Reset Filters
            </button>
          ) : (
            <button
              type="button"
              className="TeamManagement-primaryButton"
              onClick={handleOpenAdd}
            >
              <FiUserPlus />
              <span>Add First Team Member</span>
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="TeamManagement-grid">
          {filteredMembers.map((member) => (
            <div
              key={member._id}
              className={`TeamManagement-card ${member.status === "inactive" ? "is-inactive" : ""}`}
            >
              <div className="TeamManagement-cardTop">
                <span className="TeamManagement-badgeDept">
                  {member.department || "Operations"}
                </span>

                <div className="TeamManagement-statusToggleWrap">
                  <label className="TeamManagement-switch" title={`Toggle status: ${member.status}`}>
                    <input
                      type="checkbox"
                      checked={member.status === "active"}
                      onChange={() => handleToggleStatus(member)}
                    />
                    <span className="TeamManagement-slider" />
                  </label>
                  <span className={`TeamManagement-statusLabel ${member.status}`}>
                    {member.status === "active" ? "Active" : "Hidden"}
                  </span>
                </div>
              </div>

              <div className="TeamManagement-avatarWrapper">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="TeamManagement-avatar"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="TeamManagement-avatarFallback">
                    {(member.name || "A").charAt(0).toUpperCase()}
                  </div>
                )}
                {member.order !== undefined && (
                  <span className="TeamManagement-orderBadge" title="Display Order">
                    #{member.order}
                  </span>
                )}
              </div>

              <div className="TeamManagement-cardBody">
                <h3 className="TeamManagement-memberName">{member.name}</h3>
                <span className="TeamManagement-memberRole">{member.role}</span>

                {member.experience && (
                  <span className="TeamManagement-memberExp">
                    ⭐ {member.experience}
                  </span>
                )}

                {member.bio && (
                  <p className="TeamManagement-memberBio">
                    {member.bio}
                  </p>
                )}

                {/* Social Icons */}
                <div className="TeamManagement-socialRow">
                  {member.socialLinks?.linkedin && (
                    <a
                      href={member.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn Profile"
                      className="TeamManagement-socialLink"
                    >
                      <FiLinkedin />
                    </a>
                  )}
                  {member.socialLinks?.instagram && (
                    <a
                      href={member.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Instagram"
                      className="TeamManagement-socialLink"
                    >
                      <FiInstagram />
                    </a>
                  )}
                  {member.socialLinks?.twitter && (
                    <a
                      href={member.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Twitter / X"
                      className="TeamManagement-socialLink"
                    >
                      <FiTwitter />
                    </a>
                  )}
                  {member.socialLinks?.facebook && (
                    <a
                      href={member.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Facebook"
                      className="TeamManagement-socialLink"
                    >
                      <FiFacebook />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      title={member.email}
                      className="TeamManagement-socialLink"
                    >
                      <FiMail />
                    </a>
                  )}
                </div>
              </div>

              <div className="TeamManagement-cardActions">
                <button
                  type="button"
                  className="TeamManagement-btnEdit"
                  onClick={() => handleOpenEdit(member)}
                >
                  <FiEdit2 />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="TeamManagement-btnDelete"
                  onClick={() => setDeleteTarget(member)}
                >
                  <FiTrash2 />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="TeamManagement-tableCard">
          <table className="TeamManagement-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role &amp; Department</th>
                <th>Experience</th>
                <th>Order</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member._id}>
                  <td>
                    <div className="TeamManagement-tableUser">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="TeamManagement-tableAvatar"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="TeamManagement-tableAvatarFallback">
                          {(member.name || "A").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <strong>{member.name}</strong>
                        {member.email && <small>{member.email}</small>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span className="TeamManagement-tableRole">{member.role}</span>
                      <span className="TeamManagement-tableDept">
                        {member.department || "Operations"}
                      </span>
                    </div>
                  </td>
                  <td>{member.experience || "—"}</td>
                  <td>
                    <span className="TeamManagement-tableOrder">
                      #{member.order || 0}
                    </span>
                  </td>
                  <td>
                    <div className="TeamManagement-statusToggleWrap">
                      <label className="TeamManagement-switch">
                        <input
                          type="checkbox"
                          checked={member.status === "active"}
                          onChange={() => handleToggleStatus(member)}
                        />
                        <span className="TeamManagement-slider" />
                      </label>
                      <span className={`TeamManagement-statusLabel ${member.status}`}>
                        {member.status === "active" ? "Active" : "Hidden"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="TeamManagement-tableActions">
                      <button
                        type="button"
                        className="TeamManagement-tableBtn TeamManagement-tableBtn--edit"
                        onClick={() => handleOpenEdit(member)}
                        title="Edit Member"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        className="TeamManagement-tableBtn TeamManagement-tableBtn--delete"
                        onClick={() => setDeleteTarget(member)}
                        title="Delete Member"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =====================================================
          ADD / EDIT MODAL DIALOG
      ===================================================== */}
      {isModalOpen && (
        <div className="TeamManagement-modalOverlay" onClick={handleCloseModal}>
          <div
            className="TeamManagement-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="TeamManagement-modalHeader">
              <div>
                <h2>{editingId ? "Edit Team Member" : "Add New Team Member"}</h2>
                <p>
                  {editingId
                    ? "Update team member profile details, photo, and social links."
                    : "Fill in the details to add a new team member to Alka Drops."}
                </p>
              </div>
              <button
                type="button"
                className="TeamManagement-modalClose"
                onClick={handleCloseModal}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="TeamManagement-modalForm">
              {/* Image Upload Row */}
              <div className="TeamManagement-formSection">
                <label className="TeamManagement-label">Profile Photo (Auto WebP)</label>
                <div className="TeamManagement-imageUploader">
                  {formData.image ? (
                    <div className="TeamManagement-previewWrapper">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="TeamManagement-previewImg"
                      />
                      <div className="TeamManagement-previewActions">
                        <button
                          type="button"
                          className="TeamManagement-btnChangeImg"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                        >
                          <FiUploadCloud /> Change
                        </button>
                        <button
                          type="button"
                          className="TeamManagement-btnRemoveImg"
                          onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                          disabled={isUploadingImage}
                        >
                          <FiTrash2 /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="TeamManagement-dropzone"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FiUploadCloud className="TeamManagement-dropzoneIcon" />
                      <div>
                        <strong>Click to upload photo</strong>
                        <p>JPG, PNG, or WebP. Automatically converted to high-efficiency WebP.</p>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />

                  {isUploadingImage && (
                    <span className="TeamManagement-uploadingStatus">
                      <FiRefreshCw className="spin" /> Converting to WebP and uploading...
                    </span>
                  )}
                </div>
              </div>

              {/* Basic Info (2 columns) */}
              <div className="TeamManagement-formGrid">
                <div className="TeamManagement-formGroup">
                  <label className="TeamManagement-label">
                    Full Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="TeamManagement-input"
                    placeholder="e.g. Doris Jordan"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>

                <div className="TeamManagement-formGroup">
                  <label className="TeamManagement-label">
                    Role / Designation <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="TeamManagement-input"
                    placeholder="e.g. Operations Manager"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, role: e.target.value }))
                    }
                  />
                </div>

                <div className="TeamManagement-formGroup">
                  <label className="TeamManagement-label">Department</label>
                  <select
                    className="TeamManagement-input"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, department: e.target.value }))
                    }
                  >
                    {DEPARTMENTS.filter((d) => d !== "All Departments").map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="TeamManagement-formGroup">
                  <label className="TeamManagement-label">Experience</label>
                  <input
                    type="text"
                    className="TeamManagement-input"
                    placeholder="e.g. 8+ Years"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, experience: e.target.value }))
                    }
                  />
                </div>

                <div className="TeamManagement-formGroup">
                  <label className="TeamManagement-label">Email Address</label>
                  <input
                    type="email"
                    className="TeamManagement-input"
                    placeholder="e.g. name@alkadrops.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>

                <div className="TeamManagement-formGroup">
                  <label className="TeamManagement-label">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    className="TeamManagement-input"
                    placeholder="e.g. 1 (lower numbers appear first)"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, order: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Bio / Description */}
              <div className="TeamManagement-formGroup">
                <label className="TeamManagement-label">Bio / Profile Summary</label>
                <textarea
                  rows="3"
                  className="TeamManagement-textarea"
                  placeholder="Brief summary of responsibilities, hydration expertise, or leadership background..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                />
              </div>

              {/* Social Links */}
              <div className="TeamManagement-formSection">
                <label className="TeamManagement-label">Social Media Profiles</label>
                <div className="TeamManagement-formGrid">
                  <div className="TeamManagement-inputIconWrap">
                    <FiLinkedin className="TeamManagement-inputIcon" />
                    <input
                      type="url"
                      className="TeamManagement-inputWithIcon"
                      placeholder="LinkedIn URL (https://...)"
                      value={formData.socialLinks.linkedin}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, linkedin: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="TeamManagement-inputIconWrap">
                    <FiInstagram className="TeamManagement-inputIcon" />
                    <input
                      type="url"
                      className="TeamManagement-inputWithIcon"
                      placeholder="Instagram URL (https://...)"
                      value={formData.socialLinks.instagram}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, instagram: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="TeamManagement-inputIconWrap">
                    <FiTwitter className="TeamManagement-inputIcon" />
                    <input
                      type="url"
                      className="TeamManagement-inputWithIcon"
                      placeholder="Twitter / X URL (https://...)"
                      value={formData.socialLinks.twitter}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, twitter: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="TeamManagement-inputIconWrap">
                    <FiFacebook className="TeamManagement-inputIcon" />
                    <input
                      type="url"
                      className="TeamManagement-inputWithIcon"
                      placeholder="Facebook URL (https://...)"
                      value={formData.socialLinks.facebook}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, facebook: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Status Toggle in Modal */}
              <div className="TeamManagement-modalStatusRow">
                <div>
                  <strong>Visibility Status</strong>
                  <p>When active, this team member will be displayed on the frontend /team page.</p>
                </div>
                <div className="TeamManagement-statusToggleWrap">
                  <label className="TeamManagement-switch">
                    <input
                      type="checkbox"
                      checked={formData.status === "active"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.checked ? "active" : "inactive",
                        }))
                      }
                    />
                    <span className="TeamManagement-slider" />
                  </label>
                  <span className={`TeamManagement-statusLabel ${formData.status}`}>
                    {formData.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="TeamManagement-modalActions">
                <button
                  type="button"
                  className="TeamManagement-secondaryButton"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="TeamManagement-primaryButton"
                  disabled={isSaving || isUploadingImage}
                >
                  {isSaving ? (
                    <>
                      <FiRefreshCw className="spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      <span>{editingId ? "Update Member" : "Save Member"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}
      {deleteTarget && (
        <div className="TeamManagement-modalOverlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="TeamManagement-confirmDialog"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
          >
            <div className="TeamManagement-confirmIcon">
              <FiTrash2 />
            </div>
            <h3>Remove Team Member?</h3>
            <p>
              Are you sure you want to remove <strong>"{deleteTarget.name}"</strong>?
              This will permanently delete the member from the database and remove them from the website.
            </p>

            <div className="TeamManagement-confirmActions">
              <button
                type="button"
                className="TeamManagement-secondaryButton"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="TeamManagement-deleteConfirmButton"
                onClick={handleDeleteMember}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;

