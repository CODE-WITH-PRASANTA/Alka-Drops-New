const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title/name is required"],
      trim: true,
    },
    // name alias for frontend compatibility
    name: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      default: "Alkaline Water",
      trim: true,
    },
    liter: {
      type: String,
      default: "1 Litre",
      trim: true,
    },
    size: {
      type: String,
      default: "1 Litre",
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    badge: {
      type: String,
      default: "",
      trim: true,
    },
    quantity: {
      type: Number,
      default: 100,
      min: 0,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=700&auto=format&fit=crop&q=85",
    },
    images: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 24,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Keep name synced with title and size synced with liter
productSchema.pre("save", function (next) {
  if (!this.name && this.title) {
    this.name = this.title;
  } else if (!this.title && this.name) {
    this.title = this.name;
  }

  if (!this.size && this.liter) {
    this.size = this.liter;
  } else if (!this.liter && this.size) {
    this.liter = this.size;
  }

  if (this.oldPrice === 0 && this.discount > 0 && this.price > 0) {
    this.oldPrice = Math.round(this.price / (1 - this.discount / 100));
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);

