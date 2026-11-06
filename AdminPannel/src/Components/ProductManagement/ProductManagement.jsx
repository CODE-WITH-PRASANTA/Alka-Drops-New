import React, { useEffect, useState, useMemo } from "react";
import {
  FiPackage,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiRefreshCw,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiLayers,
  FiDollarSign,
  FiEye,
} from "react-icons/fi";
import API from "../../services/api";
import "./ProductManagement.css";

const defaultMockProducts = [
  { _id: "prod-1", title: "Alka Drops 20L Premium Jar", name: "Alka Drops 20L Premium Jar", category: "Jars & Cans", liter: "20 Litre", price: 95, originalPrice: 120, stock: 1450, status: "active", image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600" },
  { _id: "prod-2", title: "Alka Drops 10L Dispenser Jar", name: "Alka Drops 10L Dispenser Jar", category: "Jars & Cans", liter: "10 Litre", price: 65, originalPrice: 85, stock: 680, status: "active", image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600" },
  { _id: "prod-3", title: "Alka Drops 1L Bottled Water (Pack of 12)", name: "Alka Drops 1L Bottled Water (Pack of 12)", category: "Packaged Bottles", liter: "1 Litre x 12", price: 240, originalPrice: 280, stock: 320, status: "active", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600" },
  { _id: "prod-4", title: "Alka Drops 500ml Bottled Water (Pack of 24)", name: "Alka Drops 500ml Bottled Water (Pack of 24)", category: "Packaged Bottles", liter: "500ml x 24", price: 360, originalPrice: 420, stock: 450, status: "active", image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600" },
];

const ProductManagement = () => {
  const [products, setProducts] = useState(defaultMockProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/products");
      if (res.data?.products && res.data.products.length > 0) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.log("Using default product list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        (p.title || p.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  const categories = useMemo(() => {
    return ["all", ...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  const stats = useMemo(() => {
    const total = products.length;
    const totalInventory = products.reduce((acc, p) => acc + (p.quantity ?? p.stock ?? 0), 0);
    const avgPrice = Math.round(products.reduce((acc, p) => acc + (p.price || 0), 0) / (total || 1));
    return { total, totalInventory, avgPrice, categoriesCount: categories.length - 1 };
  }, [products, categories]);

  return (
    <div className="ProductManagement">
      {/* Header */}
      <header className="ProductManagement-header">
        <div className="ProductManagement-heading">
          <div className="ProductManagement-headingIcon">
            <FiPackage />
          </div>
          <h1>Product Management</h1>
        </div>
        <div className="ProductManagement-actions">
          <button type="button" className="ProductManagement-btn secondary" onClick={fetchProducts}>
            <FiRefreshCw className={isLoading ? "spin" : ""} /> <span>Sync</span>
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="ProductManagement-statsGrid">
        <div className="ProductManagement-statCard">
          <div className="ProductManagement-statIcon total"><FiPackage /></div>
          <div><span className="ProductManagement-statLabel">Total Products</span><span className="ProductManagement-statValue">{stats.total}</span></div>
        </div>
        <div className="ProductManagement-statCard">
          <div className="ProductManagement-statIcon stock"><FiLayers /></div>
          <div><span className="ProductManagement-statLabel">Stock on Hand</span><span className="ProductManagement-statValue">{stats.totalInventory.toLocaleString()} units</span></div>
        </div>
        <div className="ProductManagement-statCard">
          <div className="ProductManagement-statIcon price"><FiDollarSign /></div>
          <div><span className="ProductManagement-statLabel">Average Price</span><span className="ProductManagement-statValue">₹{stats.avgPrice}</span></div>
        </div>
        <div className="ProductManagement-statCard">
          <div className="ProductManagement-statIcon cat"><FiCheckCircle /></div>
          <div><span className="ProductManagement-statLabel">Categories</span><span className="ProductManagement-statValue">{stats.categoriesCount} Active</span></div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="ProductManagement-controlBar">
        <div className="ProductManagement-searchBox">
          <FiSearch className="ProductManagement-searchIcon" />
          <input
            type="text"
            placeholder="Search products by title, size, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ProductManagement-filterGroup">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="ProductManagement-grid">
        {filteredProducts.map((p) => (
          <div key={p._id} className="ProductManagement-card">
            <div className="ProductManagement-imgBox">
              <img
                src={p.image || p.coverImage || "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400"}
                alt={p.title || p.name}
              />
              <span className="ProductManagement-catBadge">{p.category || "Water"}</span>
              <span className="ProductManagement-sizeBadge">{p.liter || "Standard"}</span>
            </div>
            <div className="ProductManagement-body">
              <h3 className="ProductManagement-title">{p.title || p.name}</h3>
              <div className="ProductManagement-meta">
                <span className="ProductManagement-price">₹{p.price}</span>
                {(p.oldPrice || p.originalPrice) && (
                  <span className="ProductManagement-oldPrice">₹{p.oldPrice || p.originalPrice}</span>
                )}
                <span className="ProductManagement-stock">Stock: {p.quantity ?? p.stock ?? 0}</span>
              </div>
              <div className="ProductManagement-footer">
                <span className="ProductManagement-statusPill active"><FiCheckCircle /> Active</span>
                <div className="ProductManagement-btnGroup">
                  <button type="button" className="ProductManagement-iconBtn" title="Edit"><FiEdit2 /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManagement;

