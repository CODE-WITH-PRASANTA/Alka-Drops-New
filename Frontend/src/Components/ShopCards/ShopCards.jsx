import React, { useEffect, useMemo, useState } from "react";
import {
  Heart,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  X,
  SlidersHorizontal,
  Star,
  Droplets,
  Truck,
  ShieldCheck,
  Loader2,
  RefreshCw,
  ShoppingCart,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import API from "../../services/api";
import { useShop } from "../../context/ShopContext";
import "./ShopCards.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&auto=format&fit=crop&q=85";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);

const discountPercent = (price, oldPrice) => {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

const ShopCards = () => {
  const {
    addToCart,
    isInCart,
    getItemQty,
    updateQuantity,
    toggleWishlist,
    isInWishlist,
  } = useShop();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Products");
  const [sort, setSort] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [showTop, setShowTop] = useState(false);

  const itemsPerPage = 6;

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const res = await API.get("/products?limit=150");
      if (res.data?.success && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching shop products:", err);
      setLoadError("Unable to load shop products from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------- back to top visibility ---------- */
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- dynamic categories from database products ---------- */
  const categories = useMemo(() => {
    const base = ["All Products", "Alkaline Water", "Jars & Cans", "Bottles", "Accessories"];
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...base, ...fromProducts]));
  }, [products]);

  /* ---------- filter + sort ---------- */
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const name = (product.name || product.title || "").toLowerCase();
      const desc = (product.description || "").toLowerCase();
      const cat = (product.category || "").toLowerCase();

      const matchesSearch =
        !query || name.includes(query) || desc.includes(query) || cat.includes(query);

      const matchesCategory =
        category === "All Products" ||
        cat === category.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    if (sort === "low") result.sort((a, b) => a.price - b.price);
    else if (sort === "high") result.sort((a, b) => b.price - a.price);
    else if (sort === "name") {
      result.sort((a, b) =>
        (a.name || a.title || "").localeCompare(b.name || b.title || "")
      );
    } else if (sort === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [products, search, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ---------- navigation ---------- */
  const goToPage = (page) => {
    const next = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(next);
    const target = document.getElementById("ShopCards-products");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const changeCategory = (value) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleImageError = (e) => {
    if (e.currentTarget.src !== FALLBACK_IMAGE) {
      e.currentTarget.src = FALLBACK_IMAGE;
    }
  };

  const openQuickView = (product) => {
    setSelectedProduct(product);
    setModalQty(1);
  };

  return (
    <section className="ShopCards">
      <div className="ShopCards-container">
        {/* ================= TOOLBAR ================= */}
        <div className="ShopCards-toolbar">
          <div className="ShopCards-categories">
            {categories.map((item) => (
              <button
                key={item}
                className={`ShopCards-category ${category === item ? "active" : ""}`}
                onClick={() => changeCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="ShopCards-toolbarRight">
            <div className="ShopCards-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search jars, bottles, alkaline..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => handleSearch("")} aria-label="Clear search">
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="ShopCards-sort">
              <SlidersHorizontal size={17} />
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="default">Default sorting</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="name">Name: A to Z</option>
                <option value="rating">Top rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= RESULTS INFO ================= */}
        <div className="ShopCards-resultsInfo" id="ShopCards-products">
          <p>
            Showing{" "}
            <strong>
              {filteredProducts.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}
              –{Math.min(currentPage * itemsPerPage, filteredProducts.length)}
            </strong>{" "}
            of <strong>{filteredProducts.length}</strong> products
          </p>

          <span>
            <span className="ShopCards-liveDot"></span>
            Free delivery on every order
          </span>
        </div>

        {/* ================= LOADING & ERROR STATES ================= */}
        {isLoading ? (
          <div
            style={{
              padding: "90px 20px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              color: "#0a53c1",
            }}
          >
            <Loader2 size={36} className="spin" style={{ animation: "spin 1s linear infinite" }} />
            <h4 style={{ fontWeight: 600, fontSize: "17px" }}>Loading products from catalog...</h4>
          </div>
        ) : loadError ? (
          <div className="ShopCards-empty">
            <div className="ShopCards-emptyIcon">
              <RefreshCw size={34} />
            </div>
            <h3>{loadError}</h3>
            <p>Please check your connection and try again.</p>
            <button onClick={fetchProducts}>Retry Loading</button>
          </div>
        ) : currentProducts.length > 0 ? (
          /* ================= PRODUCT GRID ================= */
          <div className="ShopCards-grid">
            {currentProducts.map((product) => {
              const pId = String(product._id || product.id);
              const pName = product.name || product.title;
              const pImage = product.image || FALLBACK_IMAGE;
              const pSize = product.size || product.liter || "1 Litre";
              const pOldPrice =
                product.oldPrice ||
                (product.discount > 0
                  ? Math.round(product.price / (1 - product.discount / 100))
                  : 0);
              const pDiscount =
                product.discount || discountPercent(product.price, pOldPrice);

              const inWishlist = isInWishlist(pId);
              const inCart = isInCart(pId);
              const itemQty = getItemQty(pId);

              return (
                <article className="ShopCards-card" key={pId}>
                  <div className="ShopCards-imageWrapper">
                    <img
                      className="ShopCards-productImage"
                      src={pImage}
                      alt={pName}
                      loading="lazy"
                      onError={handleImageError}
                    />

                    {product.badge && (
                      <span className="ShopCards-productBadge">{product.badge}</span>
                    )}

                    <span className="ShopCards-phChip">
                      <Droplets size={12} /> pH 8.5+
                    </span>

                    <div className="ShopCards-quickActions">
                      <button
                        type="button"
                        className={`ShopCards-iconButton ${inWishlist ? "selected in-wishlist" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                        aria-label="Wishlist"
                      >
                        <Heart
                          size={17}
                          fill={inWishlist ? "#ef4444" : "none"}
                          color={inWishlist ? "#ef4444" : "currentColor"}
                        />
                      </button>

                      <button
                        className="ShopCards-iconButton"
                        onClick={() => openQuickView(product)}
                        title="Quick view"
                        aria-label="Quick view"
                      >
                        <Eye size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="ShopCards-productContent">
                    <div className="ShopCards-metaRow">
                      <span className="ShopCards-productCategory">{product.category}</span>
                      <span className="ShopCards-sizeTag">{pSize}</span>
                    </div>

                    <button
                      className="ShopCards-productName"
                      onClick={() => openQuickView(product)}
                    >
                      {pName}
                    </button>

                    <p className="ShopCards-productDescription">
                      {product.description
                        ? product.description.replace(/<[^>]*>?/gm, "")
                        : "Premium pH 8.5+ natural alkaline drinking water for optimal vitality."}
                    </p>

                    <div className="ShopCards-rating">
                      <Star size={14} fill="#FFB800" color="#FFB800" />
                      <strong>{product.rating || 4.8}</strong>
                      <span>({product.reviews || 24} reviews)</span>
                    </div>

                    <div className="ShopCards-priceRow">
                      <div className="ShopCards-prices">
                        <span className="ShopCards-currentPrice">
                          {formatPrice(product.price)}
                        </span>
                        {pOldPrice > product.price && (
                          <del className="ShopCards-oldPrice">
                            {formatPrice(pOldPrice)}
                          </del>
                        )}
                        {pDiscount > 0 && (
                          <span className="ShopCards-save">
                            {pDiscount}% off
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart or Interactive Increment/Decrement Stepper */}
                    {itemQty > 0 ? (
                      <div className="ShopCards-qtyControls">
                        <button
                          type="button"
                          className="ShopCards-qtyBtn minus"
                          onClick={() => updateQuantity(pId, -1)}
                          title={itemQty === 1 ? "Remove from cart" : "Decrease quantity (-1)"}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={15} />
                        </button>
                        <span className="ShopCards-qtyValue">
                          {itemQty}
                        </span>
                        <button
                          type="button"
                          className="ShopCards-qtyBtn plus"
                          onClick={() => updateQuantity(pId, 1)}
                          title="Increase quantity (+1)"
                          aria-label="Increase quantity"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="ShopCards-addButton"
                        onClick={() => addToCart(product, 1)}
                      >
                        <ShoppingCart size={17} />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="ShopCards-empty">
            <div className="ShopCards-emptyIcon">
              <Search size={34} />
            </div>
            <h3>No products found</h3>
            <p>Try a different search or choose another category.</p>
            <button
              onClick={() => {
                handleSearch("");
                changeCategory("All Products");
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div className="ShopCards-pagination">
            <button
              className="ShopCards-pageArrow"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={19} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`ShopCards-pageNumber ${currentPage === page ? "active" : ""}`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="ShopCards-pageArrow"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        )}

        {/* ================= TRUST STRIP ================= */}
        <div className="ShopCards-trust">
          <div className="ShopCards-trustItem">
            <span className="ShopCards-trustIcon">
              <Droplets size={22} />
            </span>
            <div>
              <h4>pH 8.5+ alkaline</h4>
              <p>Smooth, refreshing taste in every sip.</p>
            </div>
          </div>

          <div className="ShopCards-trustItem">
            <span className="ShopCards-trustIcon">
              <ShieldCheck size={22} />
            </span>
            <div>
              <h4>Sealed &amp; safe</h4>
              <p>Hygienic packing from our plant to your door.</p>
            </div>
          </div>

          <div className="ShopCards-trustItem">
            <span className="ShopCards-trustIcon ShopCards-trustIconGold">
              <Truck size={22} />
            </span>
            <div>
              <h4>Free home delivery</h4>
              <p>Fast, reliable and on time, every time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= QUICK VIEW MODAL ================= */}
      {selectedProduct && (
        <div className="ShopCards-modalOverlay" onClick={() => setSelectedProduct(null)}>
          <div className="ShopCards-quickModal" onClick={(e) => e.stopPropagation()}>
            <button
              className="ShopCards-modalClose"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close"
            >
              <X size={21} />
            </button>

            <div className="ShopCards-modalImage">
              <img
                src={selectedProduct.image || FALLBACK_IMAGE}
                alt={selectedProduct.name || selectedProduct.title}
                onError={handleImageError}
              />
              <span className="ShopCards-phChip">
                <Droplets size={12} /> pH 8.5+
              </span>
            </div>

            <div className="ShopCards-modalContent">
              <span className="ShopCards-modalCategory">
                {selectedProduct.category} · {selectedProduct.size || selectedProduct.liter || "1 Litre"}
              </span>

              <h2>{selectedProduct.name || selectedProduct.title}</h2>

              <div className="ShopCards-rating ShopCards-modalRating">
                <Star size={16} fill="#FFB800" color="#FFB800" />
                <strong>{selectedProduct.rating || 4.8}</strong>
                <span>({selectedProduct.reviews || 24} reviews)</span>
              </div>

              <div
                style={{ fontSize: "14px", color: "var(--muted)", margin: "10px 0" }}
                dangerouslySetInnerHTML={{
                  __html:
                    selectedProduct.description ||
                    "Premium bottled alkaline water enriched with essential minerals.",
                }}
              />

              <ul className="ShopCards-modalPerks">
                <li>
                  <Check size={15} /> Free home delivery
                </li>
                <li>
                  <Check size={15} /> Sealed, hygienic packing
                </li>
              </ul>

              <div className="ShopCards-modalPrice">
                {formatPrice(selectedProduct.price * modalQty)}
                {selectedProduct.oldPrice > selectedProduct.price && (
                  <del>{formatPrice(selectedProduct.oldPrice * modalQty)}</del>
                )}
                {selectedProduct.discount > 0 && (
                  <span className="ShopCards-save">
                    {selectedProduct.discount}% off
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  margin: "14px 0",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--muted)" }}>
                  Quantity:
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid var(--line)",
                    borderRadius: "10px",
                    overflow: "hidden",
                    background: "#ffffff",
                  }}
                >
                  <button
                    type="button"
                    style={{
                      padding: "8px 14px",
                      border: "none",
                      background: "#f8fafc",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <span
                    style={{
                      padding: "8px 16px",
                      fontWeight: "700",
                      minWidth: "32px",
                      textAlign: "center",
                      fontSize: "14px",
                    }}
                  >
                    {modalQty}
                  </span>
                  <button
                    type="button"
                    style={{
                      padding: "8px 14px",
                      border: "none",
                      background: "#f8fafc",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onClick={() => setModalQty((q) => q + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* Add to Cart in Modal */}
              <button
                type="button"
                className="ShopCards-modalAdd"
                onClick={() => {
                  addToCart(selectedProduct, modalQty);
                  setSelectedProduct(null);
                }}
              >
                <ShoppingCart size={19} />
                Add to Cart ({formatPrice(selectedProduct.price * modalQty)})
              </button>

              {/* Wishlist in Modal */}
              <button
                type="button"
                className={`ShopCards-modalWishlist ${
                  isInWishlist(selectedProduct._id || selectedProduct.id)
                    ? "in-wishlist"
                    : ""
                }`}
                onClick={() => toggleWishlist(selectedProduct)}
              >
                <Heart
                  size={18}
                  fill={
                    isInWishlist(selectedProduct._id || selectedProduct.id)
                      ? "#ef4444"
                      : "none"
                  }
                  color={
                    isInWishlist(selectedProduct._id || selectedProduct.id)
                      ? "#ef4444"
                      : "currentColor"
                  }
                />
                {isInWishlist(selectedProduct._id || selectedProduct.id)
                  ? "Saved in Wishlist"
                  : "Add to Wishlist"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BACK TO TOP ================= */}
      {showTop && (
        <button
          className="ShopCards-backToTop"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <ArrowUp size={22} />
        </button>
      )}
    </section>
  );
};

export default ShopCards;
