import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiSearch,
  FiFilter,
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiPlus,
  FiLayers,
  FiEdit2,
  FiTrash2,
  FiTrendingUp,
  FiX,
  FiInbox,
  FiSlash,
  FiDollarSign,
} from "react-icons/fi";
import API from "../../services/api";
import "./ShopManage.css";

const ShopManage = () => {
  const navigate = useNavigate();

  // Live products loaded from MongoDB — zero mock / fallback items
  const [stockItems, setStockItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch real shop products from database
  const fetchStock = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await API.get("/products?limit=200");
      if (res.data?.products && Array.isArray(res.data.products)) {
        const mapped = res.data.products.map((p, index) => {
          const qty = Number(p.quantity ?? p.stock ?? 0);
          const minAlert = Math.max(10, Math.round(qty * 0.2));
          const capacity = Math.max(qty * 2, 100);
          const isOutOfStock = qty <= 0 || p.inStock === false;
          const isLowStock = !isOutOfStock && qty <= minAlert;
          const status = isOutOfStock
            ? "Out of Stock"
            : isLowStock
            ? "Low Stock"
            : "In Stock";

          const sku =
            p.sku ||
            `ALK-${(p.category || "PRD")
              .replace(/[^a-zA-Z]/g, "")
              .slice(0, 3)
              .toUpperCase()}-${String(p._id).slice(-4).toUpperCase()}`;

          return {
            id: p._id,
            _id: p._id,
            name: p.title || p.name || "Untitled Product",
            sku,
            category: p.category || "Alkaline Water",
            liter: p.liter || p.size || "",
            stock: qty,
            capacity,
            minAlert,
            status,
            price: Number(p.price || 0),
            discount: Number(p.discount || 0),
            oldPrice: p.oldPrice ? Number(p.oldPrice) : 0,
            image: p.image || "",
            badge: p.badge || "",
          };
        });
        setStockItems(mapped);
      } else {
        setStockItems([]);
      }
    } catch (err) {
      console.error("Failed to load products from database:", err);
      setError(
        err.response?.data?.message ||
          "Could not load shop products from server. Please check backend connection."
      );
      setStockItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // Delete product permanently
  const handleDeleteProduct = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete product "${name}" from inventory?`
      )
    ) {
      return;
    }

    setActionLoadingId(id);
    try {
      await API.delete(`/products/${id}`);
      setStockItems((prev) =>
        prev.filter((item) => item.id !== id && item._id !== id)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product from database.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Extract unique categories dynamically from real database items
  const uniqueCategories = useMemo(() => {
    const cats = new Set();
    stockItems.forEach((item) => {
      if (item.category && item.category.trim()) {
        cats.add(item.category.trim());
      }
    });
    return Array.from(cats);
  }, [stockItems]);

  // Filtered list
  const filteredItems = useMemo(() => {
    return stockItems.filter((item) => {
      const s = search.toLowerCase().trim();
      const matchSearch =
        !s ||
        item.name.toLowerCase().includes(s) ||
        item.sku.toLowerCase().includes(s) ||
        item.category.toLowerCase().includes(s) ||
        (item.liter || "").toLowerCase().includes(s);

      const matchCat =
        categoryFilter === "all" ||
        item.category.toLowerCase() === categoryFilter.toLowerCase();

      let matchStatus = true;
      if (statusFilter === "in stock") {
        matchStatus = item.status === "In Stock";
      } else if (statusFilter === "low") {
        matchStatus = item.status === "Low Stock";
      } else if (statusFilter === "out") {
        matchStatus = item.status === "Out of Stock";
      }

      return matchSearch && matchCat && matchStatus;
    });
  }, [stockItems, search, categoryFilter, statusFilter]);

  // Live Metric Stats
  const stats = useMemo(() => {
    const totalItems = stockItems.length;
    const totalUnits = stockItems.reduce(
      (acc, i) => acc + (Number(i.stock) || 0),
      0
    );
    const lowStockCount = stockItems.filter(
      (i) => i.status === "Low Stock" || i.status === "Out of Stock"
    ).length;
    const categoryCount = new Set(stockItems.map((i) => i.category)).size;
    return { totalItems, totalUnits, lowStockCount, categoryCount };
  }, [stockItems]);

  return (
    <div className="ShopManage">
      {/* Header */}
      <header className="ShopManage-header">
        <div className="ShopManage-heading">
          <div className="ShopManage-headingIcon">
            <FiPackage />
          </div>
          <div>
            <h1>Shop Inventory &amp; Stock Management</h1>
            <span className="ShopManage-subHeading">
              Real-time catalog and inventory from MongoDB
            </span>
          </div>
        </div>
        <div className="ShopManage-actions">
          <Link to="/admin/shop/add-stock" className="ShopManage-btn primary">
            <FiPlus /> <span>Add Product</span>
          </Link>
          <button
            type="button"
            className="ShopManage-btn secondary"
            onClick={fetchStock}
            disabled={isLoading}
            title="Refresh database records"
          >
            <FiRefreshCw className={isLoading ? "spin" : ""} /> <span>Sync</span>
          </button>
        </div>
      </header>

      {/* Metrics */}
      <div className="ShopManage-statsGrid">
        <div className="ShopManage-statCard">
          <div className="ShopManage-statIcon total">
            <FiPackage />
          </div>
          <div>
            <span className="ShopManage-statLabel">Tracked Products</span>
            <span className="ShopManage-statValue">{stats.totalItems}</span>
          </div>
        </div>

        <div className="ShopManage-statCard">
          <div className="ShopManage-statIcon units">
            <FiLayers />
          </div>
          <div>
            <span className="ShopManage-statLabel">Total Units in Stock</span>
            <span className="ShopManage-statValue">
              {stats.totalUnits.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="ShopManage-statCard">
          <div className="ShopManage-statIcon alert">
            <FiAlertTriangle />
          </div>
          <div>
            <span className="ShopManage-statLabel">Low / Out of Stock</span>
            <span className="ShopManage-statValue">{stats.lowStockCount}</span>
          </div>
        </div>

        <div className="ShopManage-statCard">
          <div className="ShopManage-statIcon warehouse">
            <FiTrendingUp />
          </div>
          <div>
            <span className="ShopManage-statLabel">Active Categories</span>
            <span className="ShopManage-statValue">{stats.categoryCount}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="ShopManage-controlBar">
        <div className="ShopManage-searchBox">
          <FiSearch className="ShopManage-searchIcon" />
          <input
            type="text"
            placeholder="Search SKU, product title, size, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="ShopManage-filterGroup">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories ({uniqueCategories.length})</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="ShopManage-statusTabs">
            <button
              type="button"
              className={statusFilter === "all" ? "active" : ""}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={statusFilter === "in stock" ? "active" : ""}
              onClick={() => setStatusFilter("in stock")}
            >
              In Stock
            </button>
            <button
              type="button"
              className={statusFilter === "low" ? "active" : ""}
              onClick={() => setStatusFilter("low")}
            >
              Low Stock
            </button>
            <button
              type="button"
              className={statusFilter === "out" ? "active" : ""}
              onClick={() => setStatusFilter("out")}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && <div className="ShopManage-alert error">{error}</div>}

      {/* Table Card */}
      <div className="ShopManage-tableCard">
        {isLoading ? (
          <div className="ShopManage-loadingState">
            <FiRefreshCw className="spin" />
            <span>Loading shop inventory from database...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="ShopManage-emptyState">
            <FiInbox size={44} />
            <h3>No Shop Products Found</h3>
            <p>
              {stockItems.length === 0
                ? "There are currently no products in the database. Use 'Add Product' to stock items in the shop."
                : "No products match your current search and filter selection."}
            </p>
            {stockItems.length === 0 && (
              <Link
                to="/admin/shop/add-stock"
                className="ShopManage-btn primary mt-3"
              >
                <FiPlus /> <span>Add First Product</span>
              </Link>
            )}
          </div>
        ) : (
          <table className="ShopManage-table">
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>Category</th>
                <th>Package Size</th>
                <th>Current Stock</th>
                <th>Unit Price</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isActing = actionLoadingId === item.id;

                return (
                  <tr key={item.id}>
                    <td>
                      <div className="ShopManage-productCell">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="ShopManage-thumb"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="ShopManage-thumbFallback">
                            <FiPackage />
                          </div>
                        )}
                        <div>
                          <strong>{item.name}</strong>
                          <span className="ShopManage-sku">{item.sku}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="ShopManage-badge">{item.category}</span>
                    </td>

                    <td>
                      <span className="ShopManage-sizeText">
                        {item.liter || "Standard"}
                      </span>
                    </td>

                    <td>
                      <div className="ShopManage-stockCell">
                        <strong>{item.stock.toLocaleString()} units</strong>
                        <div className="ShopManage-progressBar">
                          <div
                            className={`ShopManage-progressFill ${
                              item.stock <= 0
                                ? "danger"
                                : item.stock <= item.minAlert
                                ? "warning"
                                : ""
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  item.stock > 0 ? 8 : 0,
                                  (item.stock / item.capacity) * 100
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong>₹{item.price.toLocaleString()}</strong>
                      {item.discount > 0 && item.oldPrice > item.price && (
                        <span className="ShopManage-oldPrice">
                          ₹{item.oldPrice.toLocaleString()} (-{item.discount}%)
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`ShopManage-statusPill ${
                          item.status === "In Stock"
                            ? "in-stock"
                            : item.status === "Low Stock"
                            ? "low-stock"
                            : "out-stock"
                        }`}
                      >
                        {item.status === "In Stock" ? (
                          <FiCheckCircle />
                        ) : item.status === "Low Stock" ? (
                          <FiAlertTriangle />
                        ) : (
                          <FiSlash />
                        )}
                        {item.status}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className="ShopManage-rowActions">
                        <button
                          type="button"
                          className="ShopManage-iconBtn"
                          title="Edit product details in Add Stock"
                          onClick={() =>
                            navigate(`/admin/shop/add-stock?edit=${item.id}`)
                          }
                          disabled={isActing}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          type="button"
                          className="ShopManage-iconBtn delete"
                          title="Delete product"
                          onClick={() =>
                            handleDeleteProduct(item.id, item.name)
                          }
                          disabled={isActing}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ShopManage;
