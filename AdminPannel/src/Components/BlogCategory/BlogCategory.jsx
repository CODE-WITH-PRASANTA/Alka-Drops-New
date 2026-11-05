import React, { useEffect, useState } from "react";
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderPlus,
  Layers,
  FileText,
  X,
} from "lucide-react";
import API from "../../services/api";
import "./BlogCategory.css";

const API_BASE_URL = "http://localhost:5000/api/categories";

const BlogCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState({ show: false, category: null });

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "active",
  });

  // Fetch Categories from Backend Database via Axios
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get("/categories");
      const data = res.data;
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        showAlert("error", data.message || "Failed to load categories.");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      showAlert("error", "Cannot connect to server at http://localhost:5000. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert({ type: "", message: "" });
    }, 4000);
  };

  // Form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: editingId ? prev.slug : generatedSlug,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      status: "active",
    });
  };

  // Handle Form Submission (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showAlert("error", "Please enter a category name.");
      return;
    }

    try {
      setIsSaving(true);
      const res = editingId
        ? await API.put(`/categories/${editingId}`, formData)
        : await API.post("/categories", formData);

      const data = res.data;

      if (data.success) {
        showAlert(
          "success",
          editingId
            ? `Category "${data.category.name}" updated successfully!`
            : `Category "${data.category.name}" saved to database!`
        );
        resetForm();
        fetchCategories();
      } else {
        showAlert("error", data.message || "Failed to save category.");
      }
    } catch (err) {
      console.error("Save error:", err);
      showAlert("error", "Network error. Please ensure the backend server is running.");
    } finally {
      setIsSaving(false);
    }
  };

  // Start Editing
  const handleEdit = (category) => {
    setEditingId(category._id);
    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      status: category.status || "active",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Instant Toggle Status (Active / Inactive) directly from table or form via Axios
  const handleToggleStatus = async (cat) => {
    const newStatus = cat.status === "active" ? "inactive" : "active";
    try {
      // Optimistic update
      setCategories((prev) =>
        prev.map((c) => (c._id === cat._id ? { ...c, status: newStatus } : c))
      );

      const res = await API.put(`/categories/${cat._id}`, { status: newStatus });
      const data = res.data;
      if (!data.success) {
        fetchCategories(); // revert
        showAlert("error", data.message || "Could not update status.");
      } else {
        showAlert("success", `Category "${cat.name}" is now ${newStatus}.`);
      }
    } catch (err) {
      fetchCategories();
      showAlert("error", "Server communication error.");
    }
  };

  // Delete Category via Axios
  const confirmDelete = async () => {
    if (!deleteModal.category) return;
    try {
      const res = await API.delete(`/categories/${deleteModal.category._id}`);
      const data = res.data;
      if (data.success) {
        showAlert("success", `Category "${deleteModal.category.name}" deleted.`);
        if (editingId === deleteModal.category._id) {
          resetForm();
        }
        fetchCategories();
      } else {
        showAlert("error", data.message || "Could not delete category.");
      }
    } catch (err) {
      showAlert("error", "Server communication error during delete.");
    } finally {
      setDeleteModal({ show: false, category: null });
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalActive = categories.filter((c) => c.status === "active").length;
  const totalPosts = categories.reduce((sum, c) => sum + (c.postCount || 0), 0);

  return (
    <div className="BlogCategory">
      {/* Top Header */}
      <div className="BlogCategory-topbar">
        <div className="BlogCategory-header-left">
          <h1>Blog Categories</h1>
          <p>Manage dynamic categories for blog articles</p>
        </div>

        <button
          type="button"
          onClick={fetchCategories}
          disabled={loading}
          className="BlogCategory-refresh-btn"
          title="Refresh Categories"
        >
          <RefreshCw size={15} className={loading ? "spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Alert Banner */}
      {alert.message && (
        <div className={`BlogCategory-alert ${alert.type === "success" ? "alert-success" : "alert-error"}`}>
          {alert.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alert.message}</span>
          <button type="button" onClick={() => setAlert({ type: "", message: "" })}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="BlogCategory-stats-grid">
        <div className="BlogCategory-stat-card">
          <div className="stat-icon teal-bg">
            <Layers size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Categories</span>
            <span className="stat-value">{categories.length}</span>
          </div>
        </div>

        <div className="BlogCategory-stat-card">
          <div className="stat-icon green-bg">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active</span>
            <span className="stat-value">{totalActive}</span>
          </div>
        </div>

        <div className="BlogCategory-stat-card">
          <div className="stat-icon blue-bg">
            <FileText size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Linked Articles</span>
            <span className="stat-value">{totalPosts}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="BlogCategory-main-layout">
        {/* Left Side: Create / Edit Form */}
        <div className="BlogCategory-form-panel">
          <div className="panel-header">
            <div className="panel-title-wrapper">
              <div className="panel-icon">
                {editingId ? <Edit2 size={16} /> : <FolderPlus size={16} />}
              </div>
              <div>
                <h2>{editingId ? "Edit Category" : "Add Category"}</h2>
              </div>
            </div>

            {editingId && (
              <button type="button" onClick={resetForm} className="cancel-edit-btn">
                <X size={14} />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="BlogCategory-form">
            {/* Category Name */}
            <div className="form-group">
              <label htmlFor="cat-name">
                Category Name <span className="required">*</span>
              </label>
              <input
                id="cat-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Alkaline Benefits"
                className="form-input"
                required
              />
            </div>

            {/* Slug */}
            <div className="form-group">
              <label htmlFor="cat-slug">Slug</label>
              <input
                id="cat-slug"
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="alkaline-benefits"
                className="form-input slug-input-clean"
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="cat-desc">Description</label>
              <textarea
                id="cat-desc"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Category summary (optional)..."
                className="form-textarea"
              />
            </div>

            {/* Status Toggle (Switch) */}
            <div className="form-group">
              <label>Status</label>
              <div className="status-toggle-container">
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.status === "active"}
                  className={`toggle-switch ${formData.status === "active" ? "is-active" : ""}`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      status: prev.status === "active" ? "inactive" : "active",
                    }))
                  }
                >
                  <span className="toggle-slider" />
                </button>
                <span className={`status-toggle-text ${formData.status === "active" ? "text-active" : "text-inactive"}`}>
                  {formData.status === "active" ? "Active (Visible in Dropdown)" : "Inactive (Hidden)"}
                </span>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="submit"
                disabled={isSaving}
                className={`submit-btn ${editingId ? "update-mode" : ""}`}
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={15} className="spin" />
                    <span>Saving...</span>
                  </>
                ) : editingId ? (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Update Category</span>
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    <span>Save Category</span>
                  </>
                )}
              </button>

              {editingId && (
                <button type="button" onClick={resetForm} className="reset-btn">
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Side: Category List Table */}
        <div className="BlogCategory-list-panel">
          <div className="list-controls-bar">
            {/* Search */}
            <div className="search-box">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm("")} className="clear-btn">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="status-tabs">
              <button
                type="button"
                className={`tab-btn ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All ({categories.length})
              </button>
              <button
                type="button"
                className={`tab-btn ${statusFilter === "active" ? "active" : ""}`}
                onClick={() => setStatusFilter("active")}
              >
                Active ({totalActive})
              </button>
              <button
                type="button"
                className={`tab-btn ${statusFilter === "inactive" ? "active" : ""}`}
                onClick={() => setStatusFilter("inactive")}
              >
                Inactive ({categories.length - totalActive})
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="table-responsive">
            <table className="BlogCategory-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Articles</th>
                  <th>Status (Toggle)</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="table-loading">
                      <RefreshCw size={20} className="spin" />
                      <span>Loading categories...</span>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      <Tag size={32} />
                      <h3>No categories found</h3>
                      <p>
                        {searchTerm
                          ? `No category matches "${searchTerm}".`
                          : "No categories added yet."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const isActive = cat.status === "active";
                    return (
                      <tr
                        key={cat._id}
                        className={editingId === cat._id ? "row-highlighted" : ""}
                      >
                        <td>
                          <span className="category-name-text">{cat.name}</span>
                        </td>
                        <td>
                          <span className="slug-badge">{cat.slug}</span>
                        </td>
                        <td className="desc-cell">
                          {cat.description ? (
                            <span title={cat.description}>{cat.description}</span>
                          ) : (
                            <em className="text-muted">-</em>
                          )}
                        </td>
                        <td>
                          <span className="post-count-badge">
                            <FileText size={12} />
                            <span>{cat.postCount || 0}</span>
                          </span>
                        </td>
                        <td>
                          {/* Interactive Toggle Switch in Table */}
                          <div className="table-toggle-wrapper">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isActive}
                              className={`toggle-switch-sm ${isActive ? "is-active" : ""}`}
                              onClick={() => handleToggleStatus(cat)}
                              title={`Click to ${isActive ? "deactivate" : "activate"}`}
                            >
                              <span className="toggle-slider-sm" />
                            </button>
                            <span className={`status-pill ${isActive ? "pill-active" : "pill-inactive"}`}>
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="action-buttons">
                            <button
                              type="button"
                              onClick={() => handleEdit(cat)}
                              className="action-btn edit-btn"
                              title="Edit Category"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteModal({ show: true, category: cat })}
                              className="action-btn delete-btn"
                              title="Delete Category"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.category && (
        <div className="modal-backdrop" onClick={() => setDeleteModal({ show: false, category: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon warning-bg">
              <AlertCircle size={26} />
            </div>
            <h3>Delete Category</h3>
            <p>
              Are you sure you want to delete <strong>"{deleteModal.category.name}"</strong>?
              {deleteModal.category.postCount > 0 && (
                <span className="modal-warning-text">
                  <br />
                  Note: {deleteModal.category.postCount} articles use this category.
                </span>
              )}
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setDeleteModal({ show: false, category: null })}
              >
                Cancel
              </button>
              <button type="button" className="modal-delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogCategory;
