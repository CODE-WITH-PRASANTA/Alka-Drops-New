import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Table as TableIcon,
  UploadCloud,
  Eye,
  Edit2,
  Trash2,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Package,
  Loader2,
  RefreshCw,
} from "lucide-react";
import API from "../../services/api";
import "./AddStock.css";

const CATEGORIES = [
  "Alkaline Water",
  "Ionized Water",
  "Mineral Water",
  "Sparkling Water",
  "Flavored Water",
  "Jars & Cans",
  "Bottles",
  "Accessories",
];

const LITERS = [
  "250 ml",
  "500 ml",
  "750 ml",
  "1 Litre",
  "2 Litre",
  "5 Litre",
  "10 Litre",
  "20 Litre",
];

const BADGES = ["None", "Best Seller", "Popular", "New", "Save 12%", "Premium"];

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=700&auto=format&fit=crop&q=85";

const AddStock = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("edit") || searchParams.get("id");
  const [isFetchingEdit, setIsFetchingEdit] = useState(false);

  // Navigation View: 'form' | 'table'
  const [activeView, setActiveView] = useState("form");

  // Stock Items State from MongoDB
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Form State
  const initialFormState = {
    title: "",
    category: "Alkaline Water",
    liter: "1 Litre",
    price: "",
    discount: "0",
    badge: "Best Seller",
    quantity: "",
    description: "",
    image: null,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const editorRef = useRef(null);

  // Modal Dialogs
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 3500);
  };

  // Fetch all products from MongoDB
  const fetchStocks = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/products?limit=200");
      if (res.data?.success && Array.isArray(res.data.products)) {
        setStocks(res.data.products);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      showToast(
        err.response?.data?.message || "Failed to load stocks from server.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // Fetch specific product data when opened with ?edit=<id>
  useEffect(() => {
    if (editId) {
      setActiveView("form");
      const loadProductForEdit = async () => {
        try {
          setIsFetchingEdit(true);
          const res = await API.get(`/products/${editId}`);
          if (res.data?.success && res.data?.product) {
            const p = res.data.product;
            setFormData({
              title: p.title || p.name || "",
              category: p.category || "Alkaline Water",
              liter: p.liter || p.size || "1 Litre",
              price: p.price !== undefined ? String(p.price) : "",
              discount: String(p.discount || "0"),
              badge: p.badge || "None",
              quantity: p.quantity !== undefined ? String(p.quantity) : "",
              description: p.description || "",
              image: p.image || null,
            });
            setImagePreview(p.image || null);
            setSelectedFile(null);
            if (editorRef.current) {
              editorRef.current.innerHTML = p.description || "";
            }
          } else {
            showToast("Product not found in database.", "error");
          }
        } catch (err) {
          console.error("Failed to load product details for edit:", err);
          showToast(
            err.response?.data?.message || "Failed to load product for editing.",
            "error"
          );
        } finally {
          setIsFetchingEdit(false);
        }
      };
      loadProductForEdit();
    }
  }, [editId]);

  // Keep editor content in sync when editorRef mounts
  useEffect(() => {
    if (editorRef.current && formData.description && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = formData.description;
    }
  }, [formData.description, activeView]);

  // Text Editor Toolbar Commands
  const executeEditorCommand = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  // Image File Selection Handler
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("Please choose an image file (PNG, JPG, WEBP).", "error");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form Submit Handler (Dynamically save to database)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast("Please enter a bottle title.", "error");
      return;
    }
    if (formData.price === "" || isNaN(Number(formData.price))) {
      showToast("Please enter a valid price.", "error");
      return;
    }
    if (formData.quantity === "" || isNaN(Number(formData.quantity))) {
      showToast("Please enter a valid stock quantity.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      let uploadedImageUrl = formData.image;

      // Upload image to server if file selected
      if (selectedFile) {
        try {
          const uploadData = new FormData();
          uploadData.append("image", selectedFile);
          const uploadRes = await API.post("/upload", uploadData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (uploadRes.data?.success && uploadRes.data?.url) {
            uploadedImageUrl = uploadRes.data.url;
          }
        } catch (uploadErr) {
          console.warn("Image upload failed, using fallback:", uploadErr);
        }
      }

      const descriptionContent = editorRef.current
        ? editorRef.current.innerHTML
        : formData.description;

      const payload = {
        title: formData.title.trim(),
        name: formData.title.trim(),
        category: formData.category,
        liter: formData.liter,
        size: formData.liter,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        badge: formData.badge === "None" ? "" : formData.badge,
        quantity: parseInt(formData.quantity, 10),
        description: descriptionContent || "",
        image: uploadedImageUrl || DEFAULT_IMAGE,
      };

      if (editId) {
        const res = await API.put(`/products/${editId}`, payload);

        if (res.data?.success) {
          showToast(`Product "${payload.title}" updated successfully in database!`);
          setFormData(initialFormState);
          setSelectedFile(null);
          setImagePreview(null);
          if (editorRef.current) editorRef.current.innerHTML = "";
          await fetchStocks();
          setTimeout(() => {
            navigate("/admin/shop/manage");
          }, 1100);
        } else {
          showToast(res.data?.message || "Failed to update product.", "error");
        }
        return;
      }

      const res = await API.post("/products", payload);

      if (res.data?.success) {
        showToast("Stock added to catalog & saved to database successfully!");
        setFormData(initialFormState);
        setSelectedFile(null);
        setImagePreview(null);
        if (editorRef.current) editorRef.current.innerHTML = "";
        await fetchStocks();
        setActiveView("table");
      } else {
        showToast(res.data?.message || "Failed to create product.", "error");
      }
    } catch (err) {
      console.error("Error creating product:", err);
      showToast(
        err.response?.data?.message || "Network error: Failed to save product.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel edit mode and navigate back to shop manage
  const handleCancelEdit = () => {
    setFormData(initialFormState);
    setSelectedFile(null);
    setImagePreview(null);
    if (editorRef.current) editorRef.current.innerHTML = "";
    navigate("/admin/shop/manage");
  };

  // Edit Submission Handler (PUT /api/products/:id)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editItem) return;

    try {
      setIsUpdating(true);
      const id = editItem._id || editItem.id;

      const payload = {
        title: editItem.title.trim(),
        name: editItem.title.trim(),
        category: editItem.category,
        liter: editItem.liter,
        size: editItem.liter,
        price: parseFloat(editItem.price),
        discount: parseFloat(editItem.discount) || 0,
        quantity: parseInt(editItem.quantity, 10),
        badge: editItem.badge === "None" ? "" : editItem.badge,
        description: editItem.description || "",
      };

      const res = await API.put(`/products/${id}`, payload);

      if (res.data?.success) {
        showToast("Stock details updated successfully in database!");
        setEditItem(null);
        await fetchStocks();
      } else {
        showToast(res.data?.message || "Failed to update stock.", "error");
      }
    } catch (err) {
      console.error("Error updating product:", err);
      showToast(
        err.response?.data?.message || "Network error updating stock record.",
        "error"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Confirmation Handler (DELETE /api/products/:id)
  const confirmDelete = async () => {
    if (!deleteItem) return;

    try {
      setIsDeleting(true);
      const id = deleteItem._id || deleteItem.id;
      const res = await API.delete(`/products/${id}`);

      if (res.data?.success) {
        showToast("Product deleted from stock and database!");
        setSelectedIds((prev) => prev.filter((itemKey) => itemKey !== id));
        setDeleteItem(null);
        await fetchStocks();
      } else {
        showToast(res.data?.message || "Failed to delete product.", "error");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      showToast(
        err.response?.data?.message || "Network error deleting product.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Selection Checkboxes
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredStocks.map((s) => s._id || s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Search Filter & Pagination Logic
  const filteredStocks = stocks.filter((stock) => {
    const sTerm = searchTerm.toLowerCase();
    const title = (stock.title || stock.name || "").toLowerCase();
    const cat = (stock.category || "").toLowerCase();
    const vol = (stock.liter || stock.size || "").toLowerCase();
    return title.includes(sTerm) || cat.includes(sTerm) || vol.includes(sTerm);
  });

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStocks = filteredStocks.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="AddStock">
      {/* Topbar */}
      <div className="AddStock-topbar">
        <div className="AddStock-header-left">
          <div className="AddStock-header-icon-box">
            <Package size={22} />
          </div>
          <div>
            <h1 className="AddStock-header-title">Shop / Stock Management</h1>
            <p className="AddStock-header-desc">
              Manage alkaline bottles, volume tiers, pricing inventory, and live database availability.
            </p>
          </div>
        </div>

        {/* View Switch Pills & Refresh */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="AddStock-tab-btn"
            style={{ background: "#ffffff", border: "1px solid var(--alka-border)", borderRadius: "8px" }}
            onClick={fetchStocks}
            disabled={isLoading}
            title="Refresh database records"
          >
            <RefreshCw size={14} className={isLoading ? "spin" : ""} /> Refresh
          </button>

          <div className="AddStock-tab-pills">
            <button
              type="button"
              className={`AddStock-tab-btn ${activeView === "form" ? "active" : ""}`}
              onClick={() => setActiveView("form")}
            >
              <PlusCircle size={15} /> Add Stock Form
            </button>
            <button
              type="button"
              className={`AddStock-tab-btn ${activeView === "table" ? "active" : ""}`}
              onClick={() => setActiveView("table")}
            >
              <TableIcon size={15} /> Stock Inventory Table ({stocks.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Full-Size Workspace */}
      <div className="AddStock-container-full">
        {/* VIEW 1: PREMIUM FORM */}
        {activeView === "form" && (
          <div className="AddStock-card">
            <div className="AddStock-card-header">
              <div className="AddStock-card-title-group">
                {editId ? (
                  <Edit2 size={18} className="AddStock-accent-icon edit" />
                ) : (
                  <Sparkles size={18} className="AddStock-accent-icon" />
                )}
                <div>
                  <h2>{editId ? "Edit Product & Stock" : "Add New Bottle Stock"}</h2>
                  {editId && (
                    <span className="AddStock-editing-sub">
                      Editing database record ID: <code>{editId}</code>
                    </span>
                  )}
                </div>
              </div>

              <div className="AddStock-header-badges">
                <span className={`AddStock-live-pill ${editId ? "edit-mode" : ""}`}>
                  {editId ? "Edit Mode (Live Sync)" : "Live Database Sync"}
                </span>
                {editId && (
                  <button
                    type="button"
                    className="AddStock-cancel-edit-btn"
                    onClick={handleCancelEdit}
                    title="Cancel edit and return to shop inventory"
                  >
                    <X size={14} /> <span>Cancel Edit</span>
                  </button>
                )}
              </div>
            </div>

            {isFetchingEdit ? (
              <div className="AddStock-edit-loading">
                <Loader2 size={32} className="spin" />
                <span>Fetching product details from MongoDB...</span>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="AddStock-form-full">
              <div className="AddStock-form-columns">
                {/* Left Column: Media & Specifications */}
                <div className="AddStock-col-left">
                  <div className="AddStock-form-group">
                    <label className="AddStock-label">
                      Bottle Image
                    </label>
                    <div className="AddStock-uploader-area">
                      {imagePreview ? (
                        <div className="AddStock-preview-card">
                          <img
                            src={imagePreview}
                            alt="Bottle Preview"
                            className="AddStock-preview-image"
                          />
                          <button
                            type="button"
                            className="AddStock-preview-remove"
                            onClick={() => {
                              setImagePreview(null);
                              setSelectedFile(null);
                              setFormData({ ...formData, image: null });
                            }}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <label className="AddStock-dropzone">
                          <div className="AddStock-dropzone-icon">
                            <UploadCloud size={32} />
                          </div>
                          <span className="AddStock-dropzone-title">
                            Click or drag bottle photo here
                          </span>
                          <span className="AddStock-dropzone-sub">
                            PNG, JPG, WEBP (Uploaded directly to server)
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="AddStock-hidden-file"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="AddStock-row-2col">
                    <div className="AddStock-form-group">
                      <label className="AddStock-label">Water Category</label>
                      <select
                        className="AddStock-select"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="AddStock-form-group">
                      <label className="AddStock-label">Volume (Liters)</label>
                      <select
                        className="AddStock-select"
                        value={formData.liter}
                        onChange={(e) =>
                          setFormData({ ...formData, liter: e.target.value })
                        }
                      >
                        {LITERS.map((lit) => (
                          <option key={lit} value={lit}>
                            {lit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="AddStock-form-group">
                    <label className="AddStock-label">Product Tag / Badge</label>
                    <div className="AddStock-tag-selection">
                      {BADGES.map((b) => (
                        <label
                          key={b}
                          className={`AddStock-tag-chip ${
                            formData.badge === b ? "active" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="badge"
                            value={b}
                            checked={formData.badge === b}
                            onChange={() =>
                              setFormData({ ...formData, badge: b })
                            }
                          />
                          {b}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Commercials & Details */}
                <div className="AddStock-col-right">
                  <div className="AddStock-form-group">
                    <label className="AddStock-label">
                      Bottle Product Title{" "}
                      <span className="AddStock-required">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alka Drops 1L Ionized Alkaline Bottle"
                      className="AddStock-input"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="AddStock-pricing-row">
                    <div className="AddStock-form-group">
                      <label className="AddStock-label">
                        Price (₹) <span className="AddStock-required">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        placeholder="45"
                        className="AddStock-input"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                      />
                    </div>

                    <div className="AddStock-form-group">
                      <label className="AddStock-label">Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="10"
                        className="AddStock-input"
                        value={formData.discount}
                        onChange={(e) =>
                          setFormData({ ...formData, discount: e.target.value })
                        }
                      />
                    </div>

                    <div className="AddStock-form-group">
                      <label className="AddStock-label">
                        Stock Quantity{" "}
                        <span className="AddStock-required">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="120"
                        className="AddStock-input"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Rich Text Editor */}
                  <div className="AddStock-form-group">
                    <label className="AddStock-label">
                      Description & Specifications
                    </label>
                    <div className="AddStock-editor">
                      <div className="AddStock-editor-bar">
                        <button
                          type="button"
                          className="AddStock-bar-btn"
                          onClick={() => executeEditorCommand("bold")}
                          title="Bold"
                        >
                          <Bold size={14} />
                        </button>
                        <button
                          type="button"
                          className="AddStock-bar-btn"
                          onClick={() => executeEditorCommand("italic")}
                          title="Italic"
                        >
                          <Italic size={14} />
                        </button>
                        <button
                          type="button"
                          className="AddStock-bar-btn"
                          onClick={() => executeEditorCommand("underline")}
                          title="Underline"
                        >
                          <Underline size={14} />
                        </button>
                        <div className="AddStock-bar-sep" />
                        <button
                          type="button"
                          className="AddStock-bar-btn"
                          onClick={() =>
                            executeEditorCommand("insertUnorderedList")
                          }
                          title="Bullet List"
                        >
                          <List size={14} />
                        </button>
                        <button
                          type="button"
                          className="AddStock-bar-btn"
                          onClick={() => executeEditorCommand("justifyLeft")}
                          title="Align Left"
                        >
                          <AlignLeft size={14} />
                        </button>
                      </div>
                      <div
                        ref={editorRef}
                        className="AddStock-editor-input"
                        contentEditable
                        placeholder="Write mineral content, health benefits, pH value, and bottle specs..."
                      />
                    </div>
                  </div>

                  <div className="AddStock-submit-wrap">
                    {editId && (
                      <button
                        type="button"
                        className="AddStock-cancel-btn"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className={`AddStock-save-btn ${editId ? "edit-mode" : ""}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="spin" />{" "}
                          <span>
                            {editId
                              ? "Updating in Database..."
                              : "Saving to Database..."}
                          </span>
                        </>
                      ) : editId ? (
                        <>
                          <Edit2 size={18} />{" "}
                          <span>Update Product in Database</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle size={18} />{" "}
                          <span>Confirm &amp; Add to Inventory</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
            )}
          </div>
        )}

        {/* VIEW 2: FULL-WIDTH TABLE */}
        {activeView === "table" && (
          <div className="AddStock-card">
            <div className="AddStock-table-meta">
              <div>
                <h2 className="AddStock-table-title">Live Stock Catalog</h2>
                <span className="AddStock-table-sub">
                  Showing {paginatedStocks.length} of {filteredStocks.length} total inventory records from database
                </span>
              </div>

              {/* Search Bar */}
              <div className="AddStock-search-box">
                <Search size={16} className="AddStock-search-glass" />
                <input
                  type="text"
                  placeholder="Search by bottle name, category, or volume..."
                  className="AddStock-search-field"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Table Container */}
            <div className="AddStock-table-wrapper">
              {isLoading ? (
                <div className="AddStock-loading-state">
                  <Loader2 size={24} className="spin" /> Loading stock records from database...
                </div>
              ) : (
                <table className="AddStock-datatable">
                  <thead>
                    <tr>
                      <th className="th-select">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={
                            paginatedStocks.length > 0 &&
                            paginatedStocks.every((s) =>
                              selectedIds.includes(s._id || s.id)
                            )
                          }
                        />
                      </th>
                      <th>#</th>
                      <th>Bottle Product</th>
                      <th>Category</th>
                      <th>Volume</th>
                      <th>Price</th>
                      <th>Discount</th>
                      <th>Tag</th>
                      <th>Stock</th>
                      <th className="th-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStocks.length > 0 ? (
                      paginatedStocks.map((item, index) => {
                        const itemId = item._id || item.id;
                        const isSelected = selectedIds.includes(itemId);
                        const itemTitle = item.title || item.name;
                        const itemVol = item.liter || item.size || "1 Litre";
                        const itemImg = item.image || DEFAULT_IMAGE;

                        return (
                          <tr
                            key={itemId}
                            className={isSelected ? "row-selected" : ""}
                          >
                            <td className="td-select">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectItem(itemId)}
                              />
                            </td>
                            <td className="td-index">
                              {startIndex + index + 1}
                            </td>
                            <td>
                              <div className="AddStock-bottle-group">
                                <img
                                  src={itemImg}
                                  alt={itemTitle}
                                  className="AddStock-table-avatar"
                                  onError={(e) => {
                                    e.currentTarget.src = DEFAULT_IMAGE;
                                  }}
                                />
                                <div className="AddStock-bottle-txt">
                                  <span className="bottle-name">{itemTitle}</span>
                                  <span className="bottle-id">
                                    ID: ALKA-{String(itemId).slice(-4).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="pill-category">{item.category}</span>
                            </td>
                            <td>
                              <span className="pill-vol">{itemVol}</span>
                            </td>
                            <td className="td-price">₹{item.price}</td>
                            <td className="td-discount">
                              {item.discount > 0 ? `${item.discount}% OFF` : "—"}
                            </td>
                            <td>
                              {item.badge ? (
                                <span
                                  className={`pill-badge badge-${item.badge
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")}`}
                                >
                                  {item.badge}
                                </span>
                              ) : (
                                <span style={{ color: "#9ca3af", fontSize: "12px" }}>—</span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`pill-stock ${
                                  (item.quantity ?? 0) <= 10
                                    ? "stock-critical"
                                    : (item.quantity ?? 0) <= 50
                                    ? "stock-low"
                                    : "stock-good"
                                }`}
                              >
                                {item.quantity ?? 0} units
                              </span>
                            </td>
                            <td>
                              <div className="AddStock-action-row">
                                <button
                                  type="button"
                                  className="btn-action view"
                                  title="View Details"
                                  onClick={() => setViewItem(item)}
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  type="button"
                                  className="btn-action edit"
                                  title="Edit Product"
                                  onClick={() => setEditItem({ ...item })}
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  type="button"
                                  className="btn-action delete"
                                  title="Remove Stock"
                                  onClick={() => setDeleteItem(item)}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="10" className="AddStock-zero-data">
                          No bottle inventory records found matching your query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="AddStock-pagination">
                <span className="AddStock-page-stat">
                  Page <strong>{currentPage}</strong> of{" "}
                  <strong>{totalPages}</strong>
                </span>
                <div className="AddStock-pager-btns">
                  <button
                    type="button"
                    className="btn-pager"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      className={`btn-pager-num ${
                        pg === currentPage ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(pg)}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="btn-pager"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* POPUP: VIEW MODAL */}
      {viewItem && (
        <div
          className="AddStock-dialog-backdrop"
          onClick={() => setViewItem(null)}
        >
          <div
            className="AddStock-dialog-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="AddStock-dialog-head">
              <h3>Bottle Specifications</h3>
              <button
                type="button"
                className="AddStock-dialog-close"
                onClick={() => setViewItem(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="AddStock-dialog-body">
              <div className="AddStock-view-hero">
                <img
                  src={viewItem.image || DEFAULT_IMAGE}
                  alt={viewItem.title || viewItem.name}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_IMAGE;
                  }}
                />
                <div className="AddStock-view-hero-txt">
                  <h4>{viewItem.title || viewItem.name}</h4>
                  <div className="AddStock-view-pills">
                    <span className="pill-category">{viewItem.category}</span>
                    <span className="pill-vol">{viewItem.liter || viewItem.size}</span>
                    {viewItem.badge && (
                      <span className="pill-badge">{viewItem.badge}</span>
                    )}
                  </div>
                  <div className="AddStock-view-price-tag">
                    <span className="price-num">₹{viewItem.price}</span>
                    {viewItem.discount > 0 && (
                      <span className="disc-num">
                        ({viewItem.discount}% OFF applied)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="AddStock-view-matrix">
                <div>
                  <label>Available Stock</label>
                  <span>{viewItem.quantity} units</span>
                </div>
                <div>
                  <label>Database Record ID</label>
                  <span style={{ fontFamily: "monospace", fontSize: "12px" }}>
                    {viewItem._id || viewItem.id}
                  </span>
                </div>
              </div>

              <div className="AddStock-view-desc">
                <h5>Product Details & Mineral Profile</h5>
                <div
                  className="desc-box"
                  dangerouslySetInnerHTML={{
                    __html:
                      viewItem.description ||
                      "<em>No description entered for this stock item.</em>",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP: EDIT MODAL */}
      {editItem && (
        <div
          className="AddStock-dialog-backdrop"
          onClick={() => setEditItem(null)}
        >
          <div
            className="AddStock-dialog-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="AddStock-dialog-head">
              <h3>Edit Stock Record (Database Sync)</h3>
              <button
                type="button"
                className="AddStock-dialog-close"
                onClick={() => setEditItem(null)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="AddStock-dialog-body">
              <div className="AddStock-form-group">
                <label className="AddStock-label">Bottle Title</label>
                <input
                  type="text"
                  required
                  className="AddStock-input"
                  value={editItem.title || editItem.name || ""}
                  onChange={(e) =>
                    setEditItem({ ...editItem, title: e.target.value })
                  }
                />
              </div>

              <div className="AddStock-row-2col">
                <div className="AddStock-form-group">
                  <label className="AddStock-label">Category</label>
                  <select
                    className="AddStock-select"
                    value={editItem.category || "Alkaline Water"}
                    onChange={(e) =>
                      setEditItem({ ...editItem, category: e.target.value })
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="AddStock-form-group">
                  <label className="AddStock-label">Volume</label>
                  <select
                    className="AddStock-select"
                    value={editItem.liter || editItem.size || "1 Litre"}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        liter: e.target.value,
                        size: e.target.value,
                      })
                    }
                  >
                    {LITERS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="AddStock-pricing-row">
                <div className="AddStock-form-group">
                  <label className="AddStock-label">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="AddStock-input"
                    value={editItem.price}
                    onChange={(e) =>
                      setEditItem({ ...editItem, price: e.target.value })
                    }
                  />
                </div>
                <div className="AddStock-form-group">
                  <label className="AddStock-label">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="AddStock-input"
                    value={editItem.discount || 0}
                    onChange={(e) =>
                      setEditItem({ ...editItem, discount: e.target.value })
                    }
                  />
                </div>
                <div className="AddStock-form-group">
                  <label className="AddStock-label">Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="AddStock-input"
                    value={editItem.quantity}
                    onChange={(e) =>
                      setEditItem({ ...editItem, quantity: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="AddStock-form-group">
                <label className="AddStock-label">Tag / Badge</label>
                <select
                  className="AddStock-select"
                  value={editItem.badge || "None"}
                  onChange={(e) =>
                    setEditItem({ ...editItem, badge: e.target.value })
                  }
                >
                  {BADGES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="AddStock-dialog-foot">
                <button
                  type="button"
                  className="btn-dialog-cancel"
                  onClick={() => setEditItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="AddStock-save-btn"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={16} className="spin" /> Updating...
                    </>
                  ) : (
                    "Update Stock Record"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP: DELETE CONFIRMATION */}
      {deleteItem && (
        <div
          className="AddStock-dialog-backdrop"
          onClick={() => setDeleteItem(null)}
        >
          <div
            className="AddStock-dialog-panel delete-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="AddStock-delete-icon">
              <AlertTriangle size={32} />
            </div>
            <h3>Delete Stock Item from Database?</h3>
            <p>
              Are you sure you want to permanently delete{" "}
              <strong>{deleteItem.title || deleteItem.name}</strong> from the database? This action
              cannot be undone.
            </p>
            <div className="AddStock-delete-actions">
              <button
                type="button"
                className="btn-dialog-cancel"
                onClick={() => setDeleteItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-dialog-delete"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toast.message && (
        <div className={`AddStock-notification ${toast.type === "error" ? "error" : ""}`}>
          {toast.type === "error" ? (
            <AlertTriangle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default AddStock;
