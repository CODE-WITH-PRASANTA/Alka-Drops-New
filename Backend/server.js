const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(
  cors({
    origin: "*", // allow requests from frontend (5173) and admin panel (5174)
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Static folder for uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root route
app.get("/", (req, res) => {
  res.json({
    name: "Alka Drops API Server",
    status: "online",
    version: "1.0.0",
    docs: {
      health: "/api/health",
      auth: "/api/auth",
      products: "/api/products",
      blogs: "/api/blogs",
      orders: "/api/orders",
      contact: "/api/contact",
      upload: "/api/upload",
    },
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/team", require("./routes/teamRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/subscription-plans", require("./routes/subscriptionPlanRoutes"));

// Error handling middlewares
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
app.use(notFound);
app.use(errorHandler);

// Port setup
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Alka Drops Server is running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment:  ${process.env.NODE_ENV || "development"}`);
  console.log(`===============================================`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Keep server alive in development
});

