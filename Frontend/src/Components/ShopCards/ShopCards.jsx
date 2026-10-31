
import React, { useMemo, useState } from "react";
import {
  ShoppingCart,
  Copy,
  Heart,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  X,
  Check,
  SlidersHorizontal,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Star,
} from "lucide-react";

import "./ShopCards.css";

const productsData = [
  {
    id: 1,
    name: "Tristique Curabitur Vivamus",
    description: "Premium 20L water dispenser bottle with crystal-clear quality.",
    price: 1.89,
    oldPrice: 2.19,
    category: "Water Bottles",
    rating: 4.9,
    reviews: 124,
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 2,
    name: "Ultricies Rhoncus",
    description: "Durable reusable water container for everyday hydration.",
    price: 1.89,
    oldPrice: 2.19,
    category: "Water Bottles",
    rating: 4.8,
    reviews: 98,
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 3,
    name: "Massa Dictum",
    description: "Lightweight premium mineral water bottle for daily use.",
    price: 1.89,
    oldPrice: 2.19,
    category: "Mineral Water",
    rating: 4.7,
    reviews: 87,
    badge: "",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 4,
    name: "Aqua Pure Classic",
    description: "Fresh purified drinking water in a convenient bottle.",
    price: 2.49,
    oldPrice: 2.99,
    category: "Mineral Water",
    rating: 4.9,
    reviews: 156,
    badge: "New",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 5,
    name: "Crystal Blue Bottle",
    description: "Elegant reusable bottle with a premium transparent finish.",
    price: 3.49,
    oldPrice: 4.19,
    category: "Water Bottles",
    rating: 4.6,
    reviews: 76,
    badge: "",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 6,
    name: "Fresh Drop Water",
    description: "Pure refreshing water for home, travel and office.",
    price: 1.59,
    oldPrice: 1.99,
    category: "Mineral Water",
    rating: 4.8,
    reviews: 112,
    badge: "Sale",
    image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 7,
    name: "Premium Aqua Flask",
    description: "Modern hydration flask with a stylish, practical design.",
    price: 4.99,
    oldPrice: 5.99,
    category: "Accessories",
    rating: 4.9,
    reviews: 64,
    badge: "Premium",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 8,
    name: "Pure Life Container",
    description: "Large capacity water container for home and business.",
    price: 5.49,
    oldPrice: 6.49,
    category: "Accessories",
    rating: 4.7,
    reviews: 91,
    badge: "",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 9,
    name: "Ocean Fresh Bottle",
    description: "Everyday hydration with a clean and refreshing taste.",
    price: 2.29,
    oldPrice: 2.79,
    category: "Mineral Water",
    rating: 4.8,
    reviews: 103,
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 10,
    name: "Aqua Daily Pack",
    description: "Convenient hydration pack for everyday essentials.",
    price: 3.99,
    oldPrice: 4.49,
    category: "Accessories",
    rating: 4.5,
    reviews: 53,
    badge: "",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 11,
    name: "Clear Spring Water",
    description: "Refreshing spring water with a crisp and pure finish.",
    price: 1.79,
    oldPrice: 2.09,
    category: "Mineral Water",
    rating: 4.9,
    reviews: 145,
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=900&auto=format&fit=crop&q=85",
  },
  {
    id: 12,
    name: "Blue Wave Flask",
    description: "A practical premium bottle for your active lifestyle.",
    price: 5.99,
    oldPrice: 6.99,
    category: "Accessories",
    rating: 4.8,
    reviews: 78,
    badge: "New",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=85",
  },
];

const categories = [
  "All Products",
  "Water Bottles",
  "Mineral Water",
  "Accessories",
];

const ShopCards = () => {
  const [products] = useState(productsData);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Products");
  const [sort, setSort] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  const [wishlist, setWishlist] = useState([]);
  const [compare, setCompare] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showCart, setShowCart] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [notification, setNotification] = useState("");

  const itemsPerPage = 6;

  const showMessage = (message) => {
    setNotification(message);
    window.clearTimeout(showMessage.timer);
    showMessage.timer = window.setTimeout(() => {
      setNotification("");
    }, 2200);
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All Products" || product.category === category;

      return matchesSearch && matchesCategory;
    });

    if (sort === "low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, search, category, sort]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const changeCategory = (value) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const addToCart = (product) => {
    setCart((previous) => {
      const existing = previous.find((item) => item.id === product.id);

      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previous, { ...product, quantity: 1 }];
    });

    showMessage(`${product.name} added to cart!`);
  };

  const updateQuantity = (id, amount) => {
    setCart((previous) =>
      previous
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((previous) => previous.filter((item) => item.id !== id));
    showMessage("Product removed from cart");
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.includes(product.id);

    setWishlist((previous) =>
      exists
        ? previous.filter((id) => id !== product.id)
        : [...previous, product.id]
    );

    showMessage(
      exists ? "Removed from wishlist" : "Added to wishlist!"
    );
  };

  const toggleCompare = (product) => {
    const exists = compare.includes(product.id);

    if (!exists && compare.length >= 3) {
      showMessage("You can compare up to 3 products");
      return;
    }

    setCompare((previous) =>
      exists
        ? previous.filter((id) => id !== product.id)
        : [...previous, product.id]
    );

    showMessage(
      exists ? "Removed from comparison" : "Added to comparison!"
    );
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};
  return (
    <section className="ShopCards">
      <div className="ShopCards-container">

        {/* SHOP HEADER */}
        <div className="ShopCards-header">
          <div className="ShopCards-heading">
            <span className="ShopCards-eyebrow">
              <span className="ShopCards-eyebrowDot"></span>
              OUR COLLECTION
            </span>

            <h2>
              Explore Our <span>Products.</span>
            </h2>

            <p>
              Discover our carefully selected collection of premium
              products, designed to bring quality and convenience
              to your everyday life.
            </p>
          </div>

          <div className="ShopCards-headerActions">
            <button
              className="ShopCards-headerButton"
              onClick={() => setShowCompare(true)}
              title="Compare products"
            >
              <Copy size={18} />
              <span>Compare</span>
              {compare.length > 0 && (
                <span className="ShopCards-actionCount">
                  {compare.length}
                </span>
              )}
            </button>

            <button
              className="ShopCards-headerButton"
              onClick={() => setShowCart(true)}
              title="Shopping cart"
            >
              <ShoppingBag size={19} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="ShopCards-actionCount">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* FILTER TOOLBAR */}
        <div className="ShopCards-toolbar">
          <div className="ShopCards-categories">
            {categories.map((item) => (
              <button
                key={item}
                className={`ShopCards-category ${
                  category === item ? "active" : ""
                }`}
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
                placeholder="Search products..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => handleSearch("")}
                  aria-label="Clear search"
                >
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
                <option value="default">Default Sorting</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="ShopCards-resultsInfo" id="ShopCards-products">
          <p>
            Showing{" "}
            <strong>
              {filteredProducts.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}
              –
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
            </strong>{" "}
            of <strong>{filteredProducts.length}</strong> products
          </p>

          <span>
            <span className="ShopCards-liveDot"></span>
            Quality products, better choices
          </span>
        </div>

        {/* PRODUCT GRID */}
        {currentProducts.length > 0 ? (
          <div className="ShopCards-grid">
            {currentProducts.map((product) => (
              <article
                className="ShopCards-card"
                key={product.id}
              >
                <div className="ShopCards-imageWrapper">
                  <img
                    className="ShopCards-productImage"
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&auto=format&fit=crop&q=85";
                    }}
                  />

                  {product.badge && (
                    <span className="ShopCards-productBadge">
                      {product.badge}
                    </span>
                  )}

                  <div className="ShopCards-quickActions">
                    <button
                      className={`ShopCards-iconButton ${
                        wishlist.includes(product.id) ? "selected" : ""
                      }`}
                      onClick={() => toggleWishlist(product)}
                      title="Add to wishlist"
                    >
                      <Heart
                        size={18}
                        fill={
                          wishlist.includes(product.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                    <button
                      className={`ShopCards-iconButton ${
                        compare.includes(product.id) ? "selected" : ""
                      }`}
                      onClick={() => toggleCompare(product)}
                      title="Compare"
                    >
                      <Copy size={17} />
                    </button>

                    <button
                      className="ShopCards-iconButton"
                      onClick={() => setSelectedProduct(product)}
                      title="Quick view"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      className="ShopCards-iconButton ShopCards-cartIcon"
                      onClick={() => addToCart(product)}
                      title="Add to cart"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>

                  <button
                    className="ShopCards-imageCartButton"
                    onClick={() => addToCart(product)}
                  >
                    <Plus size={16} />
                    Add to Cart
                  </button>
                </div>

                <div className="ShopCards-productContent">
                  <div className="ShopCards-productCategory">
                    {product.category}
                  </div>

                  <button
                    className="ShopCards-productName"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.name}
                  </button>

                  <p className="ShopCards-productDescription">
                    {product.description}
                  </p>

                  <div className="ShopCards-rating">
                    <Star size={14} fill="#F5A623" color="#F5A623" />
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
                    </div>

                    <button
                      className="ShopCards-addButton"
                      onClick={() => addToCart(product)}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="ShopCards-empty">
            <div className="ShopCards-emptyIcon">
              <Search size={35} />
            </div>
            <h3>No products found</h3>
            <p>Try another search or select a different category.</p>
            <button
              onClick={() => {
                handleSearch("");
                changeCategory("All Products");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* PAGINATION */}
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

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  className={`ShopCards-pageNumber ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              )
            )}

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

        {/* BOTTOM SHOP NOTE */}
        <div className="ShopCards-bottomNote">
          <div className="ShopCards-bottomIcon">
            <ShoppingBag size={22} />
          </div>
          <div>
            <h4>Quality You Can Trust</h4>
            <p>Explore our collection and find the perfect product for you.</p>
          </div>
        </div>
      </div>

      {/* NOTIFICATION */}
      {notification && (
        <div className="ShopCards-toast">
          <Check size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* QUICK VIEW MODAL */}
      {selectedProduct && (
        <div
          className="ShopCards-modalOverlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="ShopCards-quickModal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="ShopCards-modalClose"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close"
            >
              <X size={22} />
            </button>

            <div className="ShopCards-modalImage">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
              />
            </div>

            <div className="ShopCards-modalContent">
              <span className="ShopCards-modalCategory">
                {selectedProduct.category}
              </span>

              <h2>{selectedProduct.name}</h2>

              <div className="ShopCards-rating ShopCards-modalRating">
                <Star size={16} fill="#F5A623" color="#F5A623" />
                <strong>{selectedProduct.rating}</strong>
                <span>({selectedProduct.reviews} reviews)</span>
              </div>

              <p>{selectedProduct.description}</p>

              <div className="ShopCards-modalPrice">
                {formatPrice(selectedProduct.price)}
                <del>{formatPrice(selectedProduct.oldPrice)}</del>
              </div>

              <button
                className="ShopCards-modalAdd"
                onClick={() => addToCart(selectedProduct)}
              >
                <ShoppingCart size={19} />
                Add to Cart
              </button>

              <button
                className="ShopCards-modalWishlist"
                onClick={() => toggleWishlist(selectedProduct)}
              >
                <Heart size={18} />
                {wishlist.includes(selectedProduct.id)
                  ? "Remove from Wishlist"
                  : "Add to Wishlist"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART SIDEBAR */}
      {showCart && (
        <div
          className="ShopCards-modalOverlay ShopCards-cartOverlay"
          onClick={() => setShowCart(false)}
        >
          <div
            className="ShopCards-cartDrawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ShopCards-cartHeader">
              <div>
                <h3>Shopping Cart</h3>
                <span>{cartCount} items in your cart</span>
              </div>

              <button
                onClick={() => setShowCart(false)}
                aria-label="Close cart"
              >
                <X size={23} />
              </button>
            </div>

            <div className="ShopCards-cartItems">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div className="ShopCards-cartItem" key={item.id}>
                    <img src={item.image} alt={item.name} />

                    <div className="ShopCards-cartItemInfo">
                      <h4>{item.name}</h4>
                      <strong>{formatPrice(item.price)}</strong>

                      <div className="ShopCards-quantity">
                        <button onClick={() => updateQuantity(item.id, -1)}>
                          <Minus size={13} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}>
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>

                    <button
                      className="ShopCards-removeCart"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="ShopCards-cartEmpty">
                  <ShoppingBag size={45} />
                  <h3>Your cart is empty</h3>
                  <p>Add some products to get started.</p>
                  <button onClick={() => setShowCart(false)}>
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="ShopCards-cartFooter">
                <div className="ShopCards-cartSubtotal">
                  <span>Subtotal</span>
                  <strong>{formatPrice(cartTotal)}</strong>
                </div>
                <p>Shipping and taxes calculated at checkout.</p>
                <button
                  className="ShopCards-checkoutButton"
                  onClick={() =>
                    showMessage("Connect your checkout API to place orders.")
                  }
                >
                  Proceed to Checkout
                </button>
                <button
                  className="ShopCards-clearCart"
                  onClick={() => {
                    setCart([]);
                    showMessage("Cart cleared");
                  }}
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPARE MODAL */}
      {showCompare && (
        <div
          className="ShopCards-modalOverlay"
          onClick={() => setShowCompare(false)}
        >
          <div
            className="ShopCards-compareModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ShopCards-compareHeader">
              <div>
                <h3>Compare Products</h3>
                <p>Compare your selected products side by side.</p>
              </div>
              <button onClick={() => setShowCompare(false)}>
                <X size={22} />
              </button>
            </div>

            {compare.length > 0 ? (
              <div className="ShopCards-compareList">
                {products
                  .filter((item) => compare.includes(item.id))
                  .map((item) => (
                    <div className="ShopCards-compareItem" key={item.id}>
                      <img src={item.image} alt={item.name} />
                      <h4>{item.name}</h4>
                      <strong>{formatPrice(item.price)}</strong>
                      <span>Rating: {item.rating}/5</span>
                      <span>{item.category}</span>
                      <button onClick={() => toggleCompare(item)}>
                        <X size={15} /> Remove
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="ShopCards-compareEmpty">
                <Copy size={35} />
                <p>No products selected for comparison.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BACK TO TOP */}
     
    </section>
  );
};

export default ShopCards;
