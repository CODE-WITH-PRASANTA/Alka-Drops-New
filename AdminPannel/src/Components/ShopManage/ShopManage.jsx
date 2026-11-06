import React, { useState, useEffect, useMemo } from "react";
import {
  FiPackage,
  FiSearch,
  FiFilter,
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiPlus,
  FiArrowUpRight,
  FiLayers,
  FiEdit2,
  FiTrash2,
  FiTrendingUp,
} from "react-icons/fi";
import API from "../../services/api";
import "./ShopManage.css";

const initialStock = [
  { id: 1, name: "Alka Drops 20L Premium Jar", sku: "ALK-JAR-20L", category: "Jars & Cans", stock: 1450, capacity: 2000, minAlert: 300, status: "In Stock", price: "₹95", warehouse: "Central Hub 1" },
  { id: 2, name: "Alka Drops 1L Portable Bottles (Box of 12)", sku: "ALK-BOX-1L", category: "Packaged Bottles", stock: 120, capacity: 500, minAlert: 150, status: "Low Stock", price: "₹240", warehouse: "North Depot" },
  { id: 3, name: "Alka Drops 500ml On-The-Go (Box of 24)", sku: "ALK-BOX-500M", category: "Packaged Bottles", stock: 450, capacity: 800, minAlert: 200, status: "In Stock", price: "₹360", warehouse: "Central Hub 1" },
  { id: 4, name: "Alka Smart Water Dispenser Base", sku: "ALK-DISP-01", category: "Accessories", stock: 18, capacity: 100, minAlert: 25, status: "Low Stock", price: "₹1,250", warehouse: "Central Hub 2" },
  { id: 5, name: "Manual Water Hand Pump Kit", sku: "ALK-PUMP-02", category: "Accessories", stock: 320, capacity: 400, minAlert: 50, status: "In Stock", price: "₹280", warehouse: "South Depot" },
  { id: 6, name: "20L Empty Refill Return Jar", sku: "ALK-RETURN-20L", category: "Returnable Assets", stock: 2100, capacity: 3000, minAlert: 500, status: "In Stock", price: "₹0", warehouse: "Central Hub 1" },
];

const ShopManage = () => {
  const [stockItems, setStockItems] = useState(initialStock);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const fetchStock = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/products?limit=100");
      if (res.data?.products && res.data.products.length > 0) {
        const mapped = res.data.products.map((p, index) => {
          const qty = p.quantity ?? p.stock ?? 50;
          const minAlert = Math.max(10, Math.round(qty * 0.2));
          const capacity = Math.max(qty * 2, 200);
          return {
            id: p._id || index,
            name: p.title || p.name,
            sku: `ALK-${(p.category || "PROD").slice(0, 3).toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
            category: p.category || "Alkaline Water",
            stock: qty,
            capacity,
            minAlert,
            status: qty <= minAlert ? "Low Stock" : "In Stock",
            price: `₹${p.price}`,
            warehouse: "Central Hub 1",
          };
        });
        setStockItems(mapped);
      }
    } catch (err) {
      console.log("Using default stock list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filteredItems = useMemo(() => {
    return stockItems.filter((item) => {
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.warehouse.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "all" || item.category === categoryFilter;
      const matchStatus = statusFilter === "all" || item.status.toLowerCase().includes(statusFilter.toLowerCase());
      return matchSearch && matchCat && matchStatus;
    });
  }, [stockItems, search, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalUnits = stockItems.reduce((acc, i) => acc + i.stock, 0);
    const lowStockCount = stockItems.filter((i) => i.stock <= i.minAlert).length;
    const warehouseCount = new Set(stockItems.map((i) => i.warehouse)).size;
    return { totalItems: stockItems.length, totalUnits, lowStockCount, warehouseCount };
  }, [stockItems]);

  return (
    <div className="ShopManage">
      {/* Header */}
      <header className="ShopManage-header">
        <div className="ShopManage-heading">
          <div className="ShopManage-headingIcon">
            <FiPackage />
          </div>
          <h1>Shop Inventory & Stock Management</h1>
        </div>
        <div className="ShopManage-actions">
          <button type="button" className="ShopManage-btn secondary" onClick={fetchStock}>
            <FiRefreshCw className={isLoading ? "spin" : ""} /> <span>Sync</span>
          </button>
        </div>
      </header>

      {/* Metrics */}
      <div className="ShopManage-statsGrid">
        <div className="ShopManage-statCard">
          <div className="ShopManage-statIcon total"><FiPackage /></div>
          <div><span className="ShopManage-statLabel">Tracked SKUs</span><span className="ShopManage-statValue">{stats.totalItems}</span></div>
        </div>
        <div className="ShopManage-statCard">
          <div className="ShopManage-statIcon units"><FiLayers /></div>
          <div><span className="ShopManage-statLabel">Total Units in Stock</span><span className="ShopManage-statValue">{stats.totalUnits.toLocaleString()}</span></div>
        </div>
        <div className="ShopManage-statCard">
          <div className="ShopManage-statIcon alert"><FiAlertTriangle /></div>
          <div><span className="ShopManage-statLabel">Low Stock Alerts</span><span className="ShopManage-statValue">{stats.lowStockCount}</span></div>
        </div>
        <div className="ShopManage-statCard">
          <div className="ShopManage-statIcon warehouse"><FiTrendingUp /></div>
          <div><span className="ShopManage-statLabel">Active Hubs</span><span className="ShopManage-statValue">{stats.warehouseCount} Depots</span></div>
        </div>
      </div>

      {/* Controls */}
      <div className="ShopManage-controlBar">
        <div className="ShopManage-searchBox">
          <FiSearch className="ShopManage-searchIcon" />
          <input
            type="text"
            placeholder="Search SKU, product name, or warehouse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ShopManage-filterGroup">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="Jars & Cans">Jars & Cans</option>
            <option value="Packaged Bottles">Packaged Bottles</option>
            <option value="Accessories">Accessories</option>
            <option value="Returnable Assets">Returnable Assets</option>
          </select>
          <div className="ShopManage-statusTabs">
            <button type="button" className={statusFilter === "all" ? "active" : ""} onClick={() => setStatusFilter("all")}>All</button>
            <button type="button" className={statusFilter === "in stock" ? "active" : ""} onClick={() => setStatusFilter("in stock")}>In Stock</button>
            <button type="button" className={statusFilter === "low" ? "active" : ""} onClick={() => setStatusFilter("low")}>Low Alerts</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="ShopManage-tableCard">
        <table className="ShopManage-table">
          <thead>
            <tr>
              <th>SKU / Product</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Threshold Alert</th>
              <th>Warehouse</th>
              <th>Price</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  <span className="ShopManage-sku">{item.sku}</span>
                </td>
                <td><span className="ShopManage-badge">{item.category}</span></td>
                <td>
                  <strong>{item.stock.toLocaleString()}</strong>
                  <div className="ShopManage-progressBar">
                    <div
                      className={`ShopManage-progressFill ${item.stock <= item.minAlert ? "danger" : ""}`}
                      style={{ width: `${Math.min(100, (item.stock / item.capacity) * 100)}%` }}
                    />
                  </div>
                </td>
                <td><span className="ShopManage-minText">&lt; {item.minAlert}</span></td>
                <td>{item.warehouse}</td>
                <td><strong>{item.price}</strong></td>
                <td>
                  <span className={`ShopManage-statusPill ${item.status === "In Stock" ? "in-stock" : "low-stock"}`}>
                    {item.status === "In Stock" ? <FiCheckCircle /> : <FiAlertTriangle />} {item.status}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button type="button" className="ShopManage-iconBtn" title="Quick edit"><FiEdit2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShopManage;

