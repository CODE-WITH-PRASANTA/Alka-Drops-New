import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  FiImage,
  FiPlus,
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
  FiEye,
  FiEyeOff,
  FiCheck,
  FiLayers,
} from "react-icons/fi";
import API from "../../services/api";
import "./GalleryManagement.css";

const DEFAULT_CATEGORIES = [
  "All Categories",
  "Alkaline Water",
  "Family",
  "Our Bottles",
  "Wellness",
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

const emptyItemForm = {
  title: "",
  image: "",
  category: "Alkaline Water",
  alt: "",
  order: 0,
  status: "active",
};

const GalleryManagement = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyItemForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");

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
     FETCH GALLERY ITEMS VIA AXIOS
  ===================================================== */
  const fetchGalleryItems = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/gallery");
      if (res.data?.success && Array.isArray(res.data.items)) {
        setItems(res.data.items);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Error fetching gallery items:", err);
      showToast("Failed to load gallery images from database.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  /* =====================================================
     IMAGE UPLOAD WITH AUTO WEBP CONVERSION
  ===================================================== */
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately with local Object URL
    const localPreviewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      image: localPreviewUrl,
    }));

    try {
      setIsUploadingImage(true);
      showToast("Converting image to WebP format...", "info");

      const webpFile = await convertFileToWebP(file);

      const uploadData = new FormData();
      uploadData.append("image", webpFile);

      const res = await API.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = res.data?.url || res.data?.fileUrl;

      if (res.data?.success && uploadedUrl) {
        setFormData((prev) => ({
          ...prev,
          image: uploadedUrl,
        }));
        showToast("WebP Image uploaded successfully!");
      } else {
        showToast(res.data?.message || "Failed to upload image.", "error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast(err.response?.data?.message || "Error uploading image.", "error");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* =====================================================
     MODAL CONTROLS
  ===================================================== */
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(emptyItemForm);
    setCustomCategoryInput("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title || "",
      image: item.image || "",
      category: item.category || "Alkaline Water",
      alt: item.alt || "",
      order: item.order ?? 0,
      status: item.status || "active",
    });
    setCustomCategoryInput("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(emptyItemForm);
    setCustomCategoryInput("");
  };

  /* =====================================================
     SAVE / UPDATE GALLERY ITEM
  ===================================================== */
  const handleSaveItem = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast("Please enter an image title.", "error");
      return;
    }
    if (!formData.image.trim()) {
      showToast("Please upload an image or provide an image URL.", "error");
      return;
    }

    try {
      setIsSaving(true);

      const chosenCategory = customCategoryInput.trim() || formData.category;

      const payload = {
        title: formData.title.trim(),
        image: formData.image.trim(),
        category: chosenCategory,
        alt: formData.alt.trim() || formData.title.trim(),
        order: Number(formData.order) || 0,
        status: formData.status,
      };

      if (editingId) {
        const res = await API.put(`/gallery/${editingId}`, payload);
        if (res.data?.success) {
          showToast(`Gallery item "${formData.title}" updated successfully!`);
          fetchGalleryItems();
          handleCloseModal();
        } else {
          showToast(res.data?.message || "Failed to update item.", "error");
        }
      } else {
        const res = await API.post("/gallery", payload);
        if (res.data?.success) {
          showToast(`Gallery item "${formData.title}" added to database!`);
          fetchGalleryItems();
          handleCloseModal();
        } else {
          showToast(res.data?.message || "Failed to create item.", "error");
        }
      }
    } catch (err) {
      console.error("Save gallery item error:", err);
      showToast(err.response?.data?.message || "Network error while saving.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  /* =====================================================
     INSTANT STATUS TOGGLE (ACTIVE <-> INACTIVE)
  ===================================================== */
  const handleToggleStatus = async (item) => {
    const newStatus = item.status === "active" ? "inactive" : "active";
    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, status: newStatus } : i))
    );

    try {
      const res = await API.patch(`/gallery/${item._id}/status`);
      if (res.data?.success) {
        showToast(
          `"${item.title}" is now ${newStatus === "active" ? "Visible on Frontend" : "Hidden"}.`
        );
      } else {
        fetchGalleryItems(); // Revert on failure
        showToast(res.data?.message || "Could not update status.", "error");
      }
    } catch (err) {
      fetchGalleryItems();
      showToast("Server error updating status.", "error");
    }
  };

  /* =====================================================
     DELETE ITEM
  ===================================================== */
  const handleDeleteItem = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const res = await API.delete(`/gallery/${deleteTarget._id}`);
      if (res.data?.success) {
        showToast(`Gallery item "${deleteTarget.title}" deleted.`);
        setItems((prev) => prev.filter((i) => i._id !== deleteTarget._id));
      } else {
        showToast(res.data?.message || "Could not delete item.", "error");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Server error while deleting gallery item.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  /* =====================================================
     CATEGORIES & FILTERED ITEMS
  ===================================================== */
  const categoriesList = useMemo(() => {
    const set = new Set(["All Categories", ...DEFAULT_CATEGORIES.slice(1)]);
    items.forEach((item) => {
      if (item.category?.trim()) set.add(item.category.trim());
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !search.trim() ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase()) ||
        item.alt?.toLowerCase().includes(search.toLowerCase());

      const matchCat =
        selectedCategory === "All Categories" ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.status === "active") ||
        (statusFilter === "inactive" && item.status === "inactive");

      return matchSearch && matchCat && matchStatus;
    });
  }, [items, search, selectedCategory, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.status === "active").length;
    const inactive = total - active;
    const categoriesCount = new Set(items.map((i) => i.category?.trim()).filter(Boolean)).size;
    return { total, active, inactive, categoriesCount };
  }, [items]);

  return (
    <div className="GalleryManagement">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`GalleryManagement-toast GalleryManagement-toast--${toast.type}`}>
          {toast.type === "error" ? <FiAlertCircle /> : <FiCheckCircle />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header - Single Line Design */}
      <header className="GalleryManagement-header">
        <div className="GalleryManagement-heading">
          <div className="GalleryManagement-headingIcon">
            <FiImage />
          </div>
          <h1>Gallery Management</h1>
        </div>

        <div className="GalleryManagement-headerActions">
          <button
            type="button"
            className="GalleryManagement-refreshButton"
            onClick={fetchGalleryItems}
            title="Refresh from Database"
          >
            <FiRefreshCw className={isLoading ? "spin" : ""} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            className="GalleryManagement-primaryButton"
            onClick={handleOpenAdd}
          >
            <FiPlus />
            <span>Add Gallery Image</span>
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="GalleryManagement-statsGrid">
        <div className="GalleryManagement-statCard">
          <div className="GalleryManagement-statIcon GalleryManagement-statIcon--total">
            <FiImage />
          </div>
          <div className="GalleryManagement-statContent">
            <span className="GalleryManagement-statLabel">Total Photos</span>
            <span className="GalleryManagement-statValue">{stats.total}</span>
          </div>
        </div>

        <div className="GalleryManagement-statCard">
          <div className="GalleryManagement-statIcon GalleryManagement-statIcon--active">
            <FiCheckCircle />
          </div>
          <div className="GalleryManagement-statContent">
            <span className="GalleryManagement-statLabel">Active on Website</span>
            <span className="GalleryManagement-statValue">{stats.active}</span>
          </div>
        </div>

        <div className="GalleryManagement-statCard">
          <div className="GalleryManagement-statIcon GalleryManagement-statIcon--inactive">
            <FiEyeOff />
          </div>
          <div className="GalleryManagement-statContent">
            <span className="GalleryManagement-statLabel">Hidden / Inactive</span>
            <span className="GalleryManagement-statValue">{stats.inactive}</span>
          </div>
        </div>

        <div className="GalleryManagement-statCard">
          <div className="GalleryManagement-statIcon GalleryManagement-statIcon--dept">
            <FiLayers />
          </div>
          <div className="GalleryManagement-statContent">
            <span className="GalleryManagement-statLabel">Categories</span>
            <span className="GalleryManagement-statValue">{stats.categoriesCount}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Category Filter, Status Filter, View Mode */}
      <div className="GalleryManagement-controlBar">
        <div className="GalleryManagement-searchBox">
          <FiSearch className="GalleryManagement-searchIcon" />
          <input
            type="text"
            placeholder="Search by title, category, or alt text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="GalleryManagement-clearSearch"
              onClick={() => setSearch("")}
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="GalleryManagement-filterGroup">
          <div className="GalleryManagement-selectWrapper">
            <FiFilter className="GalleryManagement-selectIcon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="GalleryManagement-statusTabs">
            <button
              type="button"
              className={`GalleryManagement-statusTab ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              className={`GalleryManagement-statusTab ${statusFilter === "active" ? "active" : ""}`}
              onClick={() => setStatusFilter("active")}
            >
              Active ({stats.active})
            </button>
            <button
              type="button"
              className={`GalleryManagement-statusTab ${statusFilter === "inactive" ? "active" : ""}`}
              onClick={() => setStatusFilter("inactive")}
            >
              Hidden ({stats.inactive})
            </button>
          </div>

          <div className="GalleryManagement-viewToggle">
            <button
              type="button"
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <FiGrid />
            </button>
            <button
              type="button"
              className={viewMode === "table" ? "active" : ""}
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
        <div className="GalleryManagement-loadingState">
          <FiRefreshCw className="spin" />
          <p>Loading gallery from database...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="GalleryManagement-emptyState">
          <div className="GalleryManagement-emptyIcon">
            <FiImage />
          </div>
          <h3>No gallery images found</h3>
          <p>
            {search || selectedCategory !== "All Categories" || statusFilter !== "all"
              ? "Try adjusting your search criteria or filters."
              : "Start by adding pure hydration and bottle photos to your gallery."}
          </p>
          {(search || selectedCategory !== "All Categories" || statusFilter !== "all") && (
            <button
              type="button"
              className="GalleryManagement-secondaryButton"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All Categories");
                setStatusFilter("all");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="GalleryManagement-grid">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className={`GalleryManagement-card ${
                item.status === "inactive" ? "GalleryManagement-card--inactive" : ""
              }`}
            >
              <div className="GalleryManagement-cardImgWrapper">
                <img
                  src={item.image}
                  alt={item.alt || item.title}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=80";
                  }}
                />
                <span className="GalleryManagement-cardCategoryBadge">
                  {item.category || "Alkaline Water"}
                </span>
                <span
                  className={`GalleryManagement-cardStatusBadge GalleryManagement-cardStatusBadge--${item.status}`}
                >
                  {item.status === "active" ? "Active" : "Hidden"}
                </span>
                <span className="GalleryManagement-cardOrderBadge" title="Display Order">
                  #{item.order ?? 0}
                </span>
              </div>

              <div className="GalleryManagement-cardBody">
                <h3 className="GalleryManagement-cardTitle">{item.title}</h3>
                {item.alt && (
                  <p className="GalleryManagement-cardAlt" title={item.alt}>
                    Alt: {item.alt}
                  </p>
                )}

                <div className="GalleryManagement-cardMeta">
                  <div className="GalleryManagement-toggleField">
                    <span className="GalleryManagement-toggleLabel">Website Visibility:</span>
                    <label className="GalleryManagement-switch" title="Toggle Live Visibility">
                      <input
                        type="checkbox"
                        checked={item.status === "active"}
                        onChange={() => handleToggleStatus(item)}
                      />
                      <span className="GalleryManagement-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="GalleryManagement-cardFooter">
                  <button
                    type="button"
                    className="GalleryManagement-actionBtn GalleryManagement-actionBtn--edit"
                    onClick={() => handleOpenEdit(item)}
                    title="Edit image details"
                  >
                    <FiEdit2 />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    className="GalleryManagement-actionBtn GalleryManagement-actionBtn--delete"
                    onClick={() => setDeleteTarget(item)}
                    title="Delete image"
                  >
                    <FiTrash2 />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="GalleryManagement-tableCard">
          <table className="GalleryManagement-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th style={{ width: "100px" }}>Order</th>
                <th style={{ width: "140px" }}>Visibility</th>
                <th style={{ width: "130px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className="GalleryManagement-tableThumb">
                      <img
                        src={item.image}
                        alt={item.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=200&q=80";
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="GalleryManagement-tableTitle">{item.title}</div>
                    {item.alt && (
                      <div className="GalleryManagement-tableSub">Alt: {item.alt}</div>
                    )}
                  </td>
                  <td>
                    <span className="GalleryManagement-categoryPill">
                      {item.category || "Alkaline Water"}
                    </span>
                  </td>
                  <td>
                    <span className="GalleryManagement-orderPill">#{item.order ?? 0}</span>
                  </td>
                  <td>
                    <label className="GalleryManagement-switch">
                      <input
                        type="checkbox"
                        checked={item.status === "active"}
                        onChange={() => handleToggleStatus(item)}
                      />
                      <span className="GalleryManagement-slider"></span>
                    </label>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="GalleryManagement-tableActions">
                      <button
                        type="button"
                        className="GalleryManagement-tableBtn edit"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit image"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        className="GalleryManagement-tableBtn delete"
                        onClick={() => setDeleteTarget(item)}
                        title="Delete image"
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

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="GalleryManagement-modalBackdrop" onClick={handleCloseModal}>
          <div
            className="GalleryManagement-modalContent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="GalleryManagement-modalHeader">
              <div className="GalleryManagement-modalHeaderTitle">
                <FiImage className="GalleryManagement-modalIcon" />
                <h2>{editingId ? "Edit Gallery Image" : "Add Gallery Image"}</h2>
              </div>
              <button
                type="button"
                className="GalleryManagement-modalClose"
                onClick={handleCloseModal}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="GalleryManagement-modalForm">
              {/* HIDDEN FILE INPUT - ALWAYS MOUNTED */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleImageUpload}
              />

              {/* IMAGE UPLOAD & PREVIEW */}
              <div className="GalleryManagement-formGroup">
                <label className="GalleryManagement-label">
                  Photo / Image <span className="req">*</span>
                  <span className="GalleryManagement-labelHint">
                    (Auto-converted to high-efficiency WebP)
                  </span>
                </label>

                {formData.image ? (
                  <div className="GalleryManagement-imagePreviewBox">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="GalleryManagement-previewImg"
                    />

                    {isUploadingImage && (
                      <div className="GalleryManagement-previewLoadingOverlay">
                        <FiRefreshCw className="spin" />
                        <span>Converting & Uploading WebP...</span>
                      </div>
                    )}

                    <div className="GalleryManagement-previewActions">
                      <button
                        type="button"
                        className="GalleryManagement-previewBtn change"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                      >
                        <FiUploadCloud /> {isUploadingImage ? "Uploading..." : "Change Image"}
                      </button>
                      <button
                        type="button"
                        className="GalleryManagement-previewBtn remove"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, image: "" }));
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        disabled={isUploadingImage}
                      >
                        <FiTrash2 /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="GalleryManagement-uploadDropzone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="GalleryManagement-dropzoneContent">
                      <div className="GalleryManagement-uploadIconBox">
                        {isUploadingImage ? (
                          <FiRefreshCw className="spin" />
                        ) : (
                          <FiUploadCloud />
                        )}
                      </div>
                      <p className="GalleryManagement-dropzoneTitle">
                        {isUploadingImage
                          ? "Converting & Uploading WebP..."
                          : "Click to upload an image"}
                      </p>
                      <p className="GalleryManagement-dropzoneSub">
                        PNG, JPG, JPEG, or WEBP. Auto-converted to WebP.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* TITLE */}
              <div className="GalleryManagement-formGroup">
                <label className="GalleryManagement-label">
                  Image Title <span className="req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pure Alkaline Hydration Drops"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>

              {/* CATEGORY & ORDER */}
              <div className="GalleryManagement-formRow">
                <div className="GalleryManagement-formGroup">
                  <label className="GalleryManagement-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, category: e.target.value }))
                    }
                  >
                    {categoriesList
                      .filter((c) => c !== "All Categories")
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    <option value="Custom">+ New Custom Category</option>
                  </select>

                  {formData.category === "Custom" && (
                    <input
                      type="text"
                      className="GalleryManagement-customCategoryInput"
                      placeholder="Type custom category name..."
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                    />
                  )}
                </div>

                <div className="GalleryManagement-formGroup">
                  <label className="GalleryManagement-label">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, order: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* ALT TEXT */}
              <div className="GalleryManagement-formGroup">
                <label className="GalleryManagement-label">
                  Alt Text (for SEO & Accessibility)
                </label>
                <input
                  type="text"
                  placeholder="Descriptive text for screen readers..."
                  value={formData.alt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, alt: e.target.value }))
                  }
                />
              </div>

              {/* STATUS TOGGLE */}
              <div className="GalleryManagement-formGroup GalleryManagement-toggleGroup">
                <div className="GalleryManagement-toggleInfo">
                  <span className="GalleryManagement-label">Live Visibility Status</span>
                  <p className="GalleryManagement-toggleDesc">
                    When active, this image will immediately appear on the frontend gallery.
                  </p>
                </div>
                <label className="GalleryManagement-switch">
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
                  <span className="GalleryManagement-slider"></span>
                </label>
              </div>

              {/* MODAL FOOTER */}
              <div className="GalleryManagement-modalFooter">
                <button
                  type="button"
                  className="GalleryManagement-cancelBtn"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="GalleryManagement-submitBtn"
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
                      <span>{editingId ? "Update Image" : "Save Image"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div
          className="GalleryManagement-modalBackdrop"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="GalleryManagement-confirmModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="GalleryManagement-confirmIcon">
              <FiTrash2 />
            </div>
            <h3>Delete Gallery Image?</h3>
            <p>
              Are you sure you want to permanently remove{" "}
              <strong>"{deleteTarget.title}"</strong> from the database? This action cannot
              be undone.
            </p>
            <div className="GalleryManagement-confirmActions">
              <button
                type="button"
                className="GalleryManagement-cancelBtn"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="GalleryManagement-deleteConfirmBtn"
                onClick={handleDeleteItem}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Image"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;

