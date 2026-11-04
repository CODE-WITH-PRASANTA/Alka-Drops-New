import React, { useState, useRef } from "react";
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
  Layers,
  IndianRupee,
  Package,
} from "lucide-react";
import "./AddStock.css";

const INITIAL_STOCKS = [
  {
    id: 1,
    title: "Alkaline Natural Spring Water",
    category: "Alkaline Water",
    liter: "1 Litre",
    price: 45,
    discount: 10,
    badge: "Best Seller",
    quantity: 120,
    description: "Premium natural pH 8.5+ mineral enriched drinking water.",
    image:
      "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&auto=format&fit=crop&q=80",
    createdAt: "2026-11-01",
  },
  {
    id: 2,
    title: "Copper Infused Ionized Water",
    category: "Ionized Water",
    liter: "500 ml",
    price: 35,
    discount: 5,
    badge: "Popular",
    quantity: 65,
    description: "Infused with pure copper ions for enhanced metabolism.",
    image:
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=300&auto=format&fit=crop&q=80",
    createdAt: "2026-11-02",
  },
  {
    id: 3,
    title: "Alka Drops Jumbo Canister",
    category: "Alkaline Water",
    liter: "20 Litre",
    price: 180,
    discount: 15,
    badge: "New",
    quantity: 40,
    description: "Household and enterprise pack with easy dispenser neck.",
    image:
      "https://images.unsplash.com/photo-1560023907-5f339617ea30?w=300&auto=format&fit=crop&q=80",
    createdAt: "2026-11-03",
  },
];

const CATEGORIES = [
  "Alkaline Water",
  "Ionized Water",
  "Mineral Water",
  "Sparkling Water",
  "Flavored Water",
];

const LITERS = [
  "250 ml",
  "500 ml",
  "750 ml",
  "1 Litre",
  "2 Litre",
  "5 Litre",
  "20 Litre",
];

const BADGES = ["None", "Best Seller", "Popular", "New"];

const AddStock = () => {
  // Navigation View: 'form' | 'table'
  const [activeView, setActiveView] = useState("form");

  // Stock Items State
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
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
  const [imagePreview, setImagePreview] = useState(null);
  const editorRef = useRef(null);

  // Modal Dialogs
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Text Editor Toolbar Commands
  const executeEditorCommand = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  // Image Upload Handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Form Submit Handler
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.quantity) {
      showToast("Please complete all required fields.");
      return;
    }

    const newStockItem = {
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      liter: formData.liter,
      price: parseFloat(formData.price),
      discount: parseFloat(formData.discount) || 0,
      badge: formData.badge,
      quantity: parseInt(formData.quantity, 10),
      description: editorRef.current
        ? editorRef.current.innerHTML
        : formData.description,
      image:
        imagePreview ||
        "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setStocks([newStockItem, ...stocks]);
    setFormData(initialFormState);
    setImagePreview(null);
    if (editorRef.current) editorRef.current.innerHTML = "";
    showToast("Stock added to catalog successfully!");
    setActiveView("table");
  };

  // Edit Submission Handler
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setStocks(
      stocks.map((item) => (item.id === editItem.id ? { ...editItem } : item))
    );
    setEditItem(null);
    showToast("Stock details updated successfully.");
  };

  // Delete Confirmation Handler
  const confirmDelete = () => {
    setStocks(stocks.filter((item) => item.id !== deleteItem.id));
    setSelectedIds(selectedIds.filter((id) => id !== deleteItem.id));
    setDeleteItem(null);
    showToast("Product deleted from stock.");
  };

  // Selection Checkboxes
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredStocks.map((s) => s.id));
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
  const filteredStocks = stocks.filter(
    (stock) =>
      stock.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.liter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStocks = filteredStocks.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="AddStock">
      {/* Premium Integrated Header */}
      <div className="AddStock-topbar">
        <div className="AddStock-header-left">
          <div className="AddStock-header-icon-box">
            <Package size={22} />
          </div>
          <div>
            <h1 className="AddStock-header-title">Shop / Stock Management</h1>
            <p className="AddStock-header-desc">
              Manage alkaline bottles, volume tiers, pricing inventory, and live availability.
            </p>
          </div>
        </div>

        {/* View Switch Pill */}
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
            <TableIcon size={15} /> Stock Inventory Table
          </button>
        </div>
      </div>

      {/* Main Full-Size Workspace */}
      <div className="AddStock-container-full">
        {/* VIEW 1: PREMIUM FORM */}
        {activeView === "form" && (
          <div className="AddStock-card">
            <div className="AddStock-card-header">
              <div className="AddStock-card-title-group">
                <Sparkles size={18} className="AddStock-accent-icon" />
                <h2>Add New Bottle Stock</h2>
              </div>
              <span className="AddStock-live-pill">Live Database Sync</span>
            </div>

            <form onSubmit={handleFormSubmit} className="AddStock-form-full">
              <div className="AddStock-form-columns">
                {/* Left Column: Media & Specifications */}
                <div className="AddStock-col-left">
                  <div className="AddStock-form-group">
                    <label className="AddStock-label">
                      Bottle Image <span className="AddStock-required">*</span>
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
                            PNG, JPG, WEBP (High Resolution recommended)
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
                    <button type="submit" className="AddStock-save-btn">
                      <PlusCircle size={18} /> Confirm & Add to Inventory
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 2: FULL-WIDTH TABLE */}
        {activeView === "table" && (
          <div className="AddStock-card">
            <div className="AddStock-table-meta">
              <div>
                <h2 className="AddStock-table-title">Live Stock Catalog</h2>
                <span className="AddStock-table-sub">
                  Showing {paginatedStocks.length} of {filteredStocks.length} total inventory records
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
              <table className="AddStock-datatable">
                <thead>
                  <tr>
                    <th className="th-select">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          paginatedStocks.length > 0 &&
                          paginatedStocks.every((s) => selectedIds.includes(s.id))
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
                      const isSelected = selectedIds.includes(item.id);
                      return (
                        <tr
                          key={item.id}
                          className={isSelected ? "row-selected" : ""}
                        >
                          <td className="td-select">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectItem(item.id)}
                            />
                          </td>
                          <td className="td-index">
                            {startIndex + index + 1}
                          </td>
                          <td>
                            <div className="AddStock-bottle-group">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="AddStock-table-avatar"
                              />
                              <div className="AddStock-bottle-txt">
                                <span className="bottle-name">{item.title}</span>
                                <span className="bottle-id">
                                  ID: ALKA-{item.id.toString().slice(-4)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="pill-category">{item.category}</span>
                          </td>
                          <td>
                            <span className="pill-vol">{item.liter}</span>
                          </td>
                          <td className="td-price">₹{item.price}</td>
                          <td className="td-discount">
                            {item.discount > 0 ? `${item.discount}% OFF` : "—"}
                          </td>
                          <td>
                            <span
                              className={`pill-badge badge-${item.badge
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                            >
                              {item.badge}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`pill-stock ${
                                item.quantity <= 10
                                  ? "stock-critical"
                                  : item.quantity <= 50
                                  ? "stock-low"
                                  : "stock-good"
                              }`}
                            >
                              {item.quantity} units
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
            </div>

            {/* Pagination Controls */}
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
                <img src={viewItem.image} alt={viewItem.title} />
                <div className="AddStock-view-hero-txt">
                  <h4>{viewItem.title}</h4>
                  <div className="AddStock-view-pills">
                    <span className="pill-category">{viewItem.category}</span>
                    <span className="pill-vol">{viewItem.liter}</span>
                    <span className="pill-badge">{viewItem.badge}</span>
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
                  <label>Catalog Entry Date</label>
                  <span>{viewItem.createdAt}</span>
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
              <h3>Edit Stock Record</h3>
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
                  value={editItem.title}
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
                    value={editItem.category}
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
                    value={editItem.liter}
                    onChange={(e) =>
                      setEditItem({ ...editItem, liter: e.target.value })
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
                    className="AddStock-input"
                    value={editItem.discount}
                    onChange={(e) =>
                      setEditItem({ ...editItem, discount: e.target.value })
                    }
                  />
                </div>
                <div className="AddStock-form-group">
                  <label className="AddStock-label">Stock Qty</label>
                  <input
                    type="number"
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
                  value={editItem.badge}
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
                <button type="submit" className="AddStock-save-btn">
                  Update Stock Record
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
            <h3>Delete Stock Item?</h3>
            <p>
              Are you sure you want to permanently remove{" "}
              <strong>{deleteItem.title}</strong> from the catalog? This action
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
              >
                Yes, Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="AddStock-notification">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default AddStock;