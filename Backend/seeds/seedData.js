const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Product = require("../models/Product");
const Blog = require("../models/Blog");
const Category = require("../models/Category");

dotenv.config();

const initialCategories = [
  { name: "Hydration & Health", slug: "hydration-health", description: "Health benefits and wellness tips for alkaline hydration", status: "active", color: "#0ea5e9" },
  { name: "Water Quality & Purity", slug: "water-quality-purity", description: "Filtration standards, pH levels, and laboratory testing insights", status: "active", color: "#10b981" },
  { name: "Eco & Refills", slug: "eco-refills", description: "Eco-friendly bottle reuse and sustainability programs", status: "active", color: "#84cc16" },
  { name: "Delivery Updates", slug: "delivery-updates", description: "Home and office water subscription delivery news", status: "active", color: "#f59e0b" },
  { name: "Industry News", slug: "industry-news", description: "Water industry and mineral balance technology updates", status: "active", color: "#6366f1" },
];

const initialProducts = [
  {
    title: "Alka Drops 20L Jar",
    name: "Alka Drops 20L Jar",
    category: "Jars & Cans",
    liter: "20 Litre",
    size: "20 L",
    price: 70,
    oldPrice: 85,
    discount: 18,
    badge: "Best Seller",
    quantity: 120,
    description: "pH 8.5+ alkaline water in a sealed, food-grade 20 litre jar.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&auto=format&fit=crop&q=85",
    rating: 4.9,
    reviews: 124,
  },
  {
    title: "Family Pack - 5 Jars",
    name: "Family Pack - 5 Jars",
    category: "Jars & Cans",
    liter: "5 x 20 Litre",
    size: "5 x 20 L",
    price: 330,
    oldPrice: 375,
    discount: 12,
    badge: "Save 12%",
    quantity: 60,
    description: "Five sealed 20L jars delivered together for the whole family.",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=900&auto=format&fit=crop&q=85",
    rating: 4.8,
    reviews: 98,
  },
  {
    title: "Monthly Supply - 10 Jars",
    name: "Monthly Supply - 10 Jars",
    category: "Subscriptions",
    liter: "10 x 20 Litre",
    size: "10 x 20 L",
    price: 640,
    oldPrice: 750,
    discount: 15,
    badge: "Best Value",
    quantity: 45,
    description: "Convenient scheduled deliveries all month. Free empty jar returns.",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=900&auto=format&fit=crop&q=85",
    rating: 5.0,
    reviews: 152,
  },
  {
    title: "Alka Drops 1L Bottle (Box of 12)",
    name: "Alka Drops 1L Bottle (Box of 12)",
    category: "Bottles",
    liter: "12 x 1 Litre",
    size: "12 x 1 L",
    price: 240,
    oldPrice: 280,
    discount: 14,
    badge: "New",
    quantity: 90,
    description: "Pure pH 8.5+ hydration on the go, BPA-free eco-friendly recyclable bottles.",
    image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=900&auto=format&fit=crop&q=85",
    rating: 4.7,
    reviews: 64,
  },
];

const initialBlogs = [
  {
    title: "10 Reasons Why Switching to Alkaline Water Enhances Your Daily Energy",
    slug: "10-reasons-why-switching-to-alkaline-water-enhances-daily-energy",
    category: "Hydration & Health",
    author: "Dr. Aarti Sharma",
    authorRole: "Chief Nutritionist",
    readTime: "5 min read",
    tags: ["Alkaline Water", "Health Tips", "Immunity"],
    excerpt: "Discover how optimum mineral balance and pH 8.5+ alkaline hydration neutralize daily acidity, elevate cellular recovery, and keep you energized.",
    content: "<p>Water is the foundation of life, but not all water is created equal. Alkaline water, enriched with natural essential minerals like Calcium, Magnesium, and Potassium, supports better cellular hydration and helps neutralize excess dietary acidity.</p><h3>The Power of pH 8.5+</h3><p>By consuming micro-clustered alkaline water, your body absorbs water molecules faster and more efficiently than regular tap or RO filtered water.</p>",
    coverImage: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=1200&q=80",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=1200&q=80",
    status: "published",
  },
  {
    title: "How Pure Water Quality Testing Ensures Safety for Your Entire Family",
    slug: "how-pure-water-quality-testing-ensures-safety-family",
    category: "Purity Standards",
    author: "Rahul Verma",
    authorRole: "Quality Assurance Lead",
    readTime: "4 min read",
    tags: ["Quality Control", "Water Safety"],
    excerpt: "Learn how Alka Drops conducts 7-stage filtration and rigorous lab testing to deliver spotless, chemical-free drinking water every day.",
    content: "<p>At Alka Drops, purity is our hallmark. Every jar passes through rigorous filtration, UV sterilization, and mineral fortification before reaching your doorstep.</p>",
    coverImage: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80",
    status: "published",
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/alka_drops");
    console.log("[Seeder] Connected to MongoDB.");

    // Clean existing products and blogs (optional, or insert if empty)
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(initialProducts);
      console.log(`[Seeder] Seeded ${initialProducts.length} initial products.`);
    } else {
      console.log(`[Seeder] Products already exist (${productCount} found).`);
    }

    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      await Blog.insertMany(initialBlogs);
      console.log(`[Seeder] Seeded ${initialBlogs.length} initial blogs.`);
    } else {
      console.log(`[Seeder] Blogs already exist (${blogCount} found).`);
    }

    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      await Category.insertMany(initialCategories);
      console.log(`[Seeder] Seeded ${initialCategories.length} initial categories.`);
    } else {
      console.log(`[Seeder] Categories already exist (${categoryCount} found).`);
    }

    // Create Admin User if doesn't exist
    const adminExists = await User.findOne({ email: "admin@alkadrops.com" });
    if (!adminExists) {
      await User.create({
        name: "Alka Admin",
        email: "admin@alkadrops.com",
        password: "admin123", // Pre-save hook hashes this
        phone: "917327092477",
        role: "admin",
      });
      console.log("[Seeder] Created default admin user: admin@alkadrops.com / admin123");
    } else {
      console.log("[Seeder] Admin user already exists.");
    }

    console.log("[Seeder] Data seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[Seeder Error]:", error);
    process.exit(1);
  }
};

seedData();

