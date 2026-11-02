import React, { useEffect, useMemo, useState } from "react";
import {
  Heart,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  X,
  Check,
  SlidersHorizontal,
  Star,
  Droplets,
  Truck,
  ShieldCheck,
} from "lucide-react";

import "./ShopCards.css";

/* ---------------------------------------------------------
   PRODUCTS  (prices in INR – replace images with your own
   Alka Drops product photos for the best result)
--------------------------------------------------------- */
const productsData = [
  {
    id: 1,
    name: "Alka Drops 20L Jar",
    description: "pH 8.5+ alkaline water in a sealed, food-grade 20 litre jar.",
    price: 70,
    oldPrice: 85,
    category: "Jars & Cans",
    size: "20 L",
    rating: 4.9,
    reviews: 124,
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 2,
    name: "Family Pack – 5 Jars",
    description: "Five sealed 20L jars delivered together for the whole family.",
    price: 330,
    oldPrice: 375,
    category: "Jars & Cans",
    size: "5 × 20 L",
    rating: 4.8,
    reviews: 98,
    badge: "Save 12%",
    image:
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 3,
    name: "Alka Drops 10L Can",
    description: "Compact 10 litre can that fits easily in small kitchens.",
    price: 45,
    oldPrice: 55,
    category: "Jars & Cans",
    size: "10 L",
    rating: 4.7,
    reviews: 87,
    badge: "",
    image:
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 4,
    name: "Alka Drops 5L Bottle",
    description: "Easy-to-carry 5 litre bottle for travel and daily use.",
    price: 35,
    oldPrice: 42,
    category: "Bottles",
    size: "5 L",
    rating: 4.9,
    reviews: 156,
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 5,
    name: "1L Bottle Case – 12 Pack",
    description: "Twelve 1 litre alkaline bottles, ideal for offices and shops.",
    price: 180,
    oldPrice: 215,
    category: "Bottles",
    size: "12 × 1 L",
    rating: 4.6,
    reviews: 76,
    badge: "",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 6,
    name: "500ml Bottle Case – 24 Pack",
    description: "Grab-and-go 500 ml bottles for meetings, events and trips.",
    price: 230,
    oldPrice: 270,
    category: "Bottles",
    size: "24 × 500 ml",
    rating: 4.8,
    reviews: 112,
    badge: "Popular",
    image:
      "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 7,
    name: "Top-Load Water Dispenser",
    description: "Hot and normal water dispenser that fits any 20L jar.",
    price: 6499,
    oldPrice: 7499,
    category: "Accessories",
    size: "Hot + Normal",
    rating: 4.9,
    reviews: 64,
    badge: "Premium",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 8,
    name: "Manual Jar Pump",
    description: "Hygienic hand pump that dispenses water straight from the jar.",
    price: 299,
    oldPrice: 399,
    category: "Accessories",
    size: "Fits 20 L",
    rating: 4.7,
    reviews: 91,
    badge: "",
    image:
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 9,
    name: "250ml Event Pack – 48",
    description: "Small 250 ml bottles perfect for weddings, parties and events.",
    price: 360,
    oldPrice: 420,
    category: "Bottles",
    size: "48 × 250 ml",
    rating: 4.8,
    reviews: 103,
    badge: "Popular",
    image:
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 10,
    name: "Jar Stand & Rack",
    description: "Sturdy stand that keeps your jar stable, clean and off the floor.",
    price: 549,
    oldPrice: 649,
    category: "Accessories",
    size: "Fits 20 L",
    rating: 4.5,
    reviews: 53,
    badge: "",
    image:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 11,
    name: "Alka Drops 2L Bottle – 6 Pack",
    description: "Six 2 litre bottles for daily family hydration at home.",
    price: 150,
    oldPrice: 180,
    category: "Bottles",
    size: "6 × 2 L",
    rating: 4.9,
    reviews: 145,
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 12,
    name: "Steel Hydration Bottle",
    description: "Insulated 1 litre steel bottle to carry your alkaline water.",
    price: 449,
    oldPrice: 599,
    category: "Accessories",
    size: "1 L",
    rating: 4.8,
    reviews: 78,
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=85",
  },
];

const categories = ["All Products", "Jars & Cans", "Bottles", "Accessories"];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&auto=format&fit=crop&q=85";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const discountPercent = (price, oldPrice) =>
  Math.round(((oldPrice - price) / oldPrice) * 100);

const ShopCards = () => {
  const [products] = useState(productsData);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Products");
  const [sort, setSort] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  const [wishlist, setWishlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [notification, setNotification] = useState("");
  const [showTop, setShowTop] = useState(false);

  const itemsPerPage = 6;

  /* ---------- back to top visibility ---------- */
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- toast ---------- */
  useEffect(() => {
    if (!notification) return undefined;
    const timer = window.setTimeout(() => setNotification(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const showMessage = (message) => setNotification(message);

  /* ---------- filter + sort ---------- */
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

      const matchesCategory =
        category === "All Products" || product.category === category;

      return matchesSearch && matchesCategory;
    });

    if (sort === "low") result.sort((a, b) => a.price - b.price);
    else if (sort === "high") result.sort((a, b) => b.price - a.price);
    else if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "rating") result.sort((a, b) => b.rating - a.rating);

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

  /* ---------- wishlist ---------- */
  const toggleWishlist = (product) => {
    const exists = wishlist.includes(product.id);
    setWishlist((previous) =>
      exists ? previous.filter((id) => id !== product.id) : [...previous, product.id]
    );
    showMessage(exists ? "Removed from wishlist" : "Saved to wishlist");
  };

  const handleImageError = (e) => {
    if (e.currentTarget.src !== FALLBACK_IMAGE) {
      e.currentTarget.src = FALLBACK_IMAGE;
    }
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
                placeholder="Search jars, bottles..."
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

        {/* ================= PRODUCT GRID ================= */}
        {currentProducts.length > 0 ? (
          <div className="ShopCards-grid">
            {currentProducts.map((product) => (
              <article className="ShopCards-card" key={product.id}>
                <div className="ShopCards-imageWrapper">
                  <img
                    className="ShopCards-productImage"
                    src={product.image}
                    alt={product.name}
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
                      className={`ShopCards-iconButton ${
                        wishlist.includes(product.id) ? "selected" : ""
                      }`}
                      onClick={() => toggleWishlist(product)}
                      title="Add to wishlist"
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={17}
                        fill={wishlist.includes(product.id) ? "currentColor" : "none"}
                      />
                    </button>

                    <button
                      className="ShopCards-iconButton"
                      onClick={() => setSelectedProduct(product)}
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
                    <span className="ShopCards-sizeTag">{product.size}</span>
                  </div>

                  <button
                    className="ShopCards-productName"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.name}
                  </button>

                  <p className="ShopCards-productDescription">{product.description}</p>

                  <div className="ShopCards-rating">
                    <Star size={14} fill="#FFB800" color="#FFB800" />
                    <strong>{product.rating}</strong>
                    <span>({product.reviews} reviews)</span>
                  </div>

                  <div className="ShopCards-priceRow">
                    <div className="ShopCards-prices">
                      <span className="ShopCards-currentPrice">
                        {formatPrice(product.price)}
                      </span>
                      <del className="ShopCards-oldPrice">
                        {formatPrice(product.oldPrice)}
                      </del>
                      <span className="ShopCards-save">
                        {discountPercent(product.price, product.oldPrice)}% off
                      </span>
                    </div>
                  </div>

                  <a className="ShopCards-addButton" href="/contact">
                    <Truck size={17} />
                    Order Now
                  </a>
                </div>
              </article>
            ))}
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

      {/* ================= TOAST ================= */}
      {notification && (
        <div className="ShopCards-toast" role="status">
          <Check size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* ================= QUICK VIEW ================= */}
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
                src={selectedProduct.image}
                alt={selectedProduct.name}
                onError={handleImageError}
              />
              <span className="ShopCards-phChip">
                <Droplets size={12} /> pH 8.5+
              </span>
            </div>

            <div className="ShopCards-modalContent">
              <span className="ShopCards-modalCategory">
                {selectedProduct.category} · {selectedProduct.size}
              </span>

              <h2>{selectedProduct.name}</h2>

              <div className="ShopCards-rating ShopCards-modalRating">
                <Star size={16} fill="#FFB800" color="#FFB800" />
                <strong>{selectedProduct.rating}</strong>
                <span>({selectedProduct.reviews} reviews)</span>
              </div>

              <p>{selectedProduct.description}</p>

              <ul className="ShopCards-modalPerks">
                <li>
                  <Check size={15} /> Free home delivery
                </li>
                <li>
                  <Check size={15} /> Sealed, hygienic packing
                </li>
              </ul>

              <div className="ShopCards-modalPrice">
                {formatPrice(selectedProduct.price)}
                <del>{formatPrice(selectedProduct.oldPrice)}</del>
                <span className="ShopCards-save">
                  {discountPercent(selectedProduct.price, selectedProduct.oldPrice)}% off
                </span>
              </div>

              <a className="ShopCards-modalAdd" href="/contact">
                <Truck size={19} />
                Order Now
              </a>

              <button
                className="ShopCards-modalWishlist"
                onClick={() => toggleWishlist(selectedProduct)}
              >
                <Heart
                  size={18}
                  fill={wishlist.includes(selectedProduct.id) ? "currentColor" : "none"}
                />
                {wishlist.includes(selectedProduct.id)
                  ? "Remove from wishlist"
                  : "Add to wishlist"}
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