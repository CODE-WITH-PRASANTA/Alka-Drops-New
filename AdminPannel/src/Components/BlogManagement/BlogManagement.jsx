
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiGrid,
  FiList,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiMoreVertical,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiUser,
  FiPlus,
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiX,
  FiImage,
  FiMapPin,
  FiTag,
  FiFolder,
  FiFile,
  FiMessageSquare,
} from "react-icons/fi";

import "./BlogManagement.css";

/* =========================================================
   LOCAL STORAGE CONFIGURATION
   Must match BlogPosting.jsx
========================================================= */

const STORAGE_KEY = "rhino_blog_posts";

const categories = [
  "Industry News",
  "Machinery & Equipment",
  "Construction",
  "Technology",
  "Product Updates",
  "Company News",
  "Guides & Tutorials",
  "Other",
];

const statusOptions = [
  "Published",
  "Draft",
  "Scheduled",
];

/* =========================================================
   DUMMY BLOG DATA
   Used only when localStorage is empty.
========================================================= */

const initialBlogs = [
  {
    id: 1001,
    code: "BLOG-0001",
    title: "Modern Construction Equipment Transforming Industries",

    category: "Machinery & Equipment",

    postedBy: "Admin",
    authorName: "Admin",

    location: "Bhubaneswar, Odisha",

    description: `
      <h2>The Future of Construction Equipment</h2>
      <p>Modern construction equipment plays an important role in completing projects efficiently and safely. From advanced excavators to heavy-duty cranes, technology is transforming the construction industry.</p>
      <h3>Why Modern Machinery Matters</h3>
      <ul>
        <li>Improved construction productivity.</li>
        <li>Better operational efficiency.</li>
        <li>Reduced manual effort.</li>
        <li>Enhanced workplace safety.</li>
      </ul>
      <p>Choosing the right equipment can make a significant difference in project performance.</p>
    `,

    excerpt:
      "Discover how modern construction equipment and advanced machinery are transforming the construction industry.",

    quote:
      "The right machinery turns challenging projects into achievable results.",

    tags: "Construction, Heavy Equipment, Machinery, Technology",

    seoTitle:
      "Modern Construction Equipment | Rhino's Equipment",

    seoDescription:
      "Explore modern construction machinery, heavy equipment and innovative solutions for better construction productivity.",

    featuredImage: {
      name: "construction-equipment.jpg",
      data:
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85",
    },

    otherImages: [],
    documents: [],

    status: "Published",
    views: 1250,

    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },

  {
    id: 1002,
    code: "BLOG-0002",
    title: "How to Choose the Right Excavator for Your Project",

    category: "Guides & Tutorials",

    postedBy: "Technical Team",
    authorName: "Technical Team",

    location: "Cuttack, Odisha",

    description: `
      <h2>Choosing the Right Excavator</h2>
      <p>Selecting the correct excavator is essential for successful construction operations. Every project has different requirements based on site conditions, working depth and material handling.</p>
      <h3>Things to Consider</h3>
      <ol>
        <li>Project size and requirements.</li>
        <li>Operating weight and machine capacity.</li>
        <li>Fuel efficiency and maintenance.</li>
        <li>Availability of spare parts.</li>
      </ol>
      <p>Always evaluate the equipment specifications before making a decision.</p>
    `,

    excerpt:
      "Learn the important factors to consider before selecting an excavator for your construction project.",

    quote:
      "Choosing the right machine is the first step toward efficient construction.",

    tags: "Excavator, Construction, Equipment Guide",

    seoTitle:
      "How to Choose an Excavator | Rhino's Equipment",

    seoDescription:
      "A practical guide to choosing the right excavator based on project size, machine capacity and construction requirements.",

    featuredImage: {
      name: "excavator-guide.jpg",
      data:
        "https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=1200&q=85",
    },

    otherImages: [],
    documents: [],

    status: "Published",
    views: 845,

    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-10-25T10:00:00.000Z",
  },

  {
    id: 1003,
    code: "BLOG-0003",
    title: "The Importance of Regular Machinery Maintenance",

    category: "Guides & Tutorials",

    postedBy: "Maintenance Team",
    authorName: "Maintenance Team",

    location: "Odisha, India",

    description: `
      <h2>Keep Your Equipment Running Efficiently</h2>
      <p>Regular maintenance helps construction machinery perform reliably while reducing unexpected breakdowns.</p>
      <h3>Essential Maintenance Practices</h3>
      <ul>
        <li>Inspect engine oil regularly.</li>
        <li>Check hydraulic systems.</li>
        <li>Monitor tire and track conditions.</li>
        <li>Schedule regular servicing.</li>
      </ul>
      <p>Preventive maintenance improves equipment life and operational reliability.</p>
    `,

    excerpt:
      "Understand why regular servicing and preventive maintenance are important for heavy machinery.",

    quote:
      "Well-maintained machinery delivers dependable performance.",

    tags: "Maintenance, Heavy Machinery, Equipment Care",

    seoTitle:
      "Heavy Machinery Maintenance Guide | Rhino's Equipment",

    seoDescription:
      "Learn essential machinery maintenance practices to improve equipment performance and reduce unexpected breakdowns.",

    featuredImage: {
      name: "machinery-maintenance.jpg",
      data:
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85",
    },

    otherImages: [],
    documents: [],

    status: "Draft",
    views: 0,

    createdAt: "2026-10-22T10:00:00.000Z",
    updatedAt: "2026-10-22T10:00:00.000Z",
  },

  {
    id: 1004,
    code: "BLOG-0004",
    title: "Why Material Handling Equipment Matters",

    category: "Machinery & Equipment",

    postedBy: "Rhino Editorial Team",
    authorName: "Rhino Editorial Team",

    location: "Bhubaneswar, Odisha",

    description: `
      <h2>Improving Material Handling Operations</h2>
      <p>Material handling equipment supports the movement, storage and management of materials across industrial and construction sites.</p>
      <h3>Major Benefits</h3>
      <ul>
        <li>Improved workflow.</li>
        <li>Reduced handling time.</li>
        <li>Better material organization.</li>
        <li>Increased workplace efficiency.</li>
      </ul>
    `,

    excerpt:
      "Explore the role of material handling equipment in improving industrial and construction operations.",

    quote:
      "Efficiency begins with smarter material movement.",

    tags: "Material Handling, Industrial Equipment, Productivity",

    seoTitle:
      "Material Handling Equipment | Rhino's Equipment",

    seoDescription:
      "Discover the importance of material handling equipment for industrial productivity and construction operations.",

    featuredImage: {
      name: "material-handling.jpg",
      data:
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=85",
    },

    otherImages: [],
    documents: [],

    status: "Published",
    views: 642,

    createdAt: "2026-10-19T10:00:00.000Z",
    updatedAt: "2026-10-19T10:00:00.000Z",
  },

  {
    id: 1005,
    code: "BLOG-0005",
    title: "Technology and Innovation in Heavy Equipment",

    category: "Technology",

    postedBy: "Technical Team",
    authorName: "Technical Team",

    location: "India",

    description: `
      <h2>Technology Is Changing Heavy Equipment</h2>
      <p>Modern machinery increasingly uses advanced monitoring systems, automation and digital technologies to improve performance.</p>
      <h3>Emerging Developments</h3>
      <ul>
        <li>Smart equipment monitoring.</li>
        <li>Automated machine controls.</li>
        <li>Advanced safety systems.</li>
        <li>Digital maintenance planning.</li>
      </ul>
    `,

    excerpt:
      "Discover how technology, automation and smart monitoring are shaping the future of heavy equipment.",

    quote:
      "Innovation makes powerful machinery even smarter.",

    tags: "Innovation, Technology, Automation, Machinery",

    seoTitle:
      "Heavy Equipment Technology and Innovation",

    seoDescription:
      "Explore modern technology, automation and smart monitoring in the heavy equipment industry.",

    featuredImage: {
      name: "equipment-technology.jpg",
      data:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
    },

    otherImages: [],
    documents: [],

    status: "Published",
    views: 1890,

    createdAt: "2026-10-15T10:00:00.000Z",
    updatedAt: "2026-10-15T10:00:00.000Z",
  },

  {
    id: 1006,
    code: "BLOG-0006",
    title: "Safety Tips for Operating Heavy Machinery",

    category: "Industry News",

    postedBy: "Safety Team",
    authorName: "Safety Team",

    location: "Odisha, India",

    description: `
      <h2>Safety First on Every Worksite</h2>
      <p>Safe equipment operation is essential for protecting workers and maintaining efficient project operations.</p>
      <h3>Important Safety Practices</h3>
      <ol>
        <li>Inspect machinery before operation.</li>
        <li>Use appropriate protective equipment.</li>
        <li>Follow manufacturer instructions.</li>
        <li>Ensure operators are properly trained.</li>
      </ol>
    `,

    excerpt:
      "Important safety practices that help operators work responsibly with heavy construction machinery.",

    quote:
      "A safe worksite is a productive worksite.",

    tags: "Safety, Heavy Machinery, Construction",

    seoTitle:
      "Heavy Machinery Safety Tips | Rhino's Equipment",

    seoDescription:
      "Learn essential safety practices for operating heavy machinery and maintaining a safer construction site.",

    featuredImage: {
      name: "machinery-safety.jpg",
      data:
        "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85",
    },

    otherImages: [],
    documents: [],

    status: "Scheduled",
    views: 0,

    createdAt: "2026-11-02T10:00:00.000Z",
    updatedAt: "2026-11-02T10:00:00.000Z",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const getTags = (tags) => {
  if (Array.isArray(tags)) return tags;

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const getImage = (blog) => {
  const image = blog.featuredImage || blog.mainImage || blog.image;

  if (!image) return "";

  if (typeof image === "string") return image;

  return image.data || image.preview || image.url || "";
};

const getAuthor = (blog) =>
  blog.postedBy || blog.authorName || blog.author || "Admin";

const getDescription = (blog) => {
  const description = blog.description || blog.excerpt || "";

  return description
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);
};

const getDate = (blog) =>
  blog.createdAt || blog.publishDate || blog.date || "";

const formatDate = (date) => {
  if (!date) return "—";

  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(date);
  }
};

const getInitialBlogs = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialBlogs)
    );

    return initialBlogs;
  } catch (error) {
    console.error("Unable to initialize blog data:", error);
    return initialBlogs;
  }
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const BlogManagement = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState(getInitialBlogs);

  const [viewMode, setViewMode] = useState("grid");

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [sortBy, setSortBy] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);

  const [openMenu, setOpenMenu] = useState(null);

  const [selectedBlog, setSelectedBlog] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  const [notice, setNotice] = useState("");

  const itemsPerPage = 6;

  /* =====================================================
     SAVE DATA LOCALLY
  ===================================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(blogs)
      );
    } catch (error) {
      console.error("Local storage error:", error);
      setNotice(
        "Browser storage is full. Reduce the size of uploaded files."
      );
    }
  }, [blogs]);

  /* =====================================================
     CREATE BLOG
  ===================================================== */

  const handleCreate = () => {
    setOpenMenu(null);

    navigate("/blog/blog-posting");
  };

  /* =====================================================
     EDIT BLOG
  ===================================================== */

  const handleEdit = (blog) => {
    setOpenMenu(null);
    setSelectedBlog(null);

    navigate("/blog/blog-posting", {
      state: {
        blog,
        isEditing: true,
      },
    });
  };

  /* =====================================================
     CATEGORY FILTERS
  ===================================================== */

  const availableCategories = useMemo(
    () => [
      "All Categories",
      ...new Set(
        blogs
          .map((blog) => blog.category)
          .filter(Boolean)
      ),
    ],
    [blogs]
  );

  /* =====================================================
     FILTER AND SORT
  ===================================================== */

  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return blogs
      .filter((blog) => {
        const tags = getTags(blog.tags);

        const matchesSearch =
          !query ||
          (blog.title || "").toLowerCase().includes(query) ||
          getAuthor(blog).toLowerCase().includes(query) ||
          (blog.category || "").toLowerCase().includes(query) ||
          (blog.code || blog.blogCode || "")
            .toLowerCase()
            .includes(query) ||
          (blog.location || "").toLowerCase().includes(query) ||
          tags.some((tag) =>
            tag.toLowerCase().includes(query)
          );

        const matchesCategory =
          categoryFilter === "All Categories" ||
          blog.category === categoryFilter;

        const matchesStatus =
          statusFilter === "All Status" ||
          (blog.status || "Published") === statusFilter;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus
        );
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return (
            new Date(getDate(a)) -
            new Date(getDate(b))
          );
        }

        if (sortBy === "title") {
          return (a.title || "").localeCompare(
            b.title || ""
          );
        }

        if (sortBy === "mostViewed") {
          return (b.views || 0) - (a.views || 0);
        }

        return (
          new Date(getDate(b)) -
          new Date(getDate(a))
        );
      });
  }, [
    blogs,
    search,
    categoryFilter,
    statusFilter,
    sortBy,
  ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBlogs.length / itemsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * itemsPerPage;

  const visibleBlogs = filteredBlogs.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /* =====================================================
     STATISTICS
  ===================================================== */

  const publishedCount = blogs.filter(
    (blog) => blog.status === "Published"
  ).length;

  const draftCount = blogs.filter(
    (blog) => blog.status === "Draft"
  ).length;

  const scheduledCount = blogs.filter(
    (blog) => blog.status === "Scheduled"
  ).length;

  const totalViews = blogs.reduce(
    (sum, blog) => sum + (Number(blog.views) || 0),
    0
  );

  /* =====================================================
     FILTER HANDLERS
  ===================================================== */

  const changeFilter = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("All Categories");
    setStatusFilter("All Status");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const showNotice = (message) => {
    setNotice(message);
    setOpenMenu(null);
  };

  /* =====================================================
     DELETE BLOG - LOCAL ONLY
  ===================================================== */

  const handleDelete = () => {
    if (deleteId === null) return;

    setBlogs((previous) =>
      previous.filter(
        (blog) => blog.id !== deleteId
      )
    );

    if (selectedBlog?.id === deleteId) {
      setSelectedBlog(null);
    }

    setDeleteId(null);

    showNotice("Blog post deleted successfully.");
  };

  /* =====================================================
     CHANGE STATUS - LOCAL ONLY
  ===================================================== */

  const handleStatusChange = (blog) => {
    const nextStatus =
      blog.status === "Published"
        ? "Draft"
        : "Published";

    setBlogs((previous) =>
      previous.map((item) =>
        item.id === blog.id
          ? {
              ...item,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    if (selectedBlog?.id === blog.id) {
      setSelectedBlog((previous) => ({
        ...previous,
        status: nextStatus,
      }));
    }

    showNotice(`Blog status changed to ${nextStatus}.`);
  };

  /* =====================================================
     STATUS COMPONENT
  ===================================================== */

  const renderStatus = (status = "Published") => (
    <span
      className={`BlogManagement-status BlogManagement-status--${status.toLowerCase()}`}
    >
      <span className="BlogManagement-statusDot" />
      {status}
    </span>
  );

  /* =====================================================
     ACTION MENU
  ===================================================== */

  const renderActions = (blog) => (
    <div className="BlogManagement-cardMenu">

      <button
        type="button"
        className="BlogManagement-menuTrigger"
        onClick={() =>
          setOpenMenu(
            openMenu === blog.id ? null : blog.id
          )
        }
        aria-label={`Actions for ${blog.title}`}
        aria-expanded={openMenu === blog.id}
      >
        <FiMoreVertical />
      </button>

      {openMenu === blog.id && (
        <div className="BlogManagement-menuDropdown">

          <button
            type="button"
            onClick={() => {
              setSelectedBlog(blog);
              setOpenMenu(null);
            }}
          >
            <FiEye />
            View details
          </button>

          <button
            type="button"
            onClick={() => handleEdit(blog)}
          >
            <FiEdit2 />
            Edit blog
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange(blog)}
          >
            {blog.status === "Published" ? (
              <FiClock />
            ) : (
              <FiCheckCircle />
            )}

            {blog.status === "Published"
              ? "Move to draft"
              : "Publish post"}
          </button>

          <button
            type="button"
            className="BlogManagement-menuDelete"
            onClick={() => {
              setDeleteId(blog.id);
              setOpenMenu(null);
            }}
          >
            <FiTrash2 />
            Delete blog
          </button>

        </div>
      )}
    </div>
  );

  /* =====================================================
     MAIN JSX
  ===================================================== */

  return (
    <div className="BlogManagement">

      {/* HEADER */}

      <div className="BlogManagement-header">

        <div className="BlogManagement-heading">

          <span className="BlogManagement-headingIcon">
            <FiFileText />
          </span>

          <div>
            <span className="BlogManagement-eyebrow">
              RHINO'S EQUIPMENT
            </span>

            <h1>Blog Management</h1>

            <p>
              Manage industry insights, machinery updates
              and company news.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="BlogManagement-createButton"
          onClick={handleCreate}
        >
          <FiPlus />
          Create New Blog
        </button>

      </div>

      {/* NOTIFICATION */}

      {notice && (
        <div className="BlogManagement-notice" role="status">

          <FiCheckCircle />

          <span>{notice}</span>

          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotice("")}
          >
            <FiX />
          </button>

        </div>
      )}

      {/* STATISTICS */}

      <div className="BlogManagement-stats">

        <div className="BlogManagement-statCard">
          <span className="BlogManagement-statIcon">
            <FiFileText />
          </span>

          <div>
            <span>Total Posts</span>
            <strong>{blogs.length}</strong>
            <small>All blog entries</small>
          </div>
        </div>

        <div className="BlogManagement-statCard">
          <span className="BlogManagement-statIcon BlogManagement-statIcon--green">
            <FiCheckCircle />
          </span>

          <div>
            <span>Published</span>
            <strong>{publishedCount}</strong>
            <small>Published blog posts</small>
          </div>
        </div>

        <div className="BlogManagement-statCard">
          <span className="BlogManagement-statIcon BlogManagement-statIcon--amber">
            <FiFileText />
          </span>

          <div>
            <span>Drafts</span>
            <strong>{draftCount}</strong>
            <small>Work in progress</small>
          </div>
        </div>

        <div className="BlogManagement-statCard">
          <span className="BlogManagement-statIcon BlogManagement-statIcon--blue">
            <FiEye />
          </span>

          <div>
            <span>Total Views</span>
            <strong>{totalViews.toLocaleString("en-IN")}</strong>
            <small>{scheduledCount} scheduled posts</small>
          </div>
        </div>

      </div>

      {/* BLOG COLLECTION */}

      <section className="BlogManagement-panel">

        <div className="BlogManagement-panelHeader">

          <div>
            <h2>Your Blog Collection</h2>
            <p>
              Browse, edit and organize your blog posts.
            </p>
          </div>

          <div
            className="BlogManagement-viewToggle"
            aria-label="View mode"
          >

            <button
              type="button"
              className={
                viewMode === "grid"
                  ? "BlogManagement-viewButton BlogManagement-viewButton--active"
                  : "BlogManagement-viewButton"
              }
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <FiGrid />
            </button>

            <button
              type="button"
              className={
                viewMode === "list"
                  ? "BlogManagement-viewButton BlogManagement-viewButton--active"
                  : "BlogManagement-viewButton"
              }
              onClick={() => setViewMode("list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <FiList />
            </button>

          </div>

        </div>

        {/* SEARCH AND FILTERS */}

        <div className="BlogManagement-toolbar">

          <label className="BlogManagement-search">

            <FiSearch />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                changeFilter(setSearch, event.target.value)
              }
              placeholder="Search title, author, category..."
              aria-label="Search blog posts"
            />

            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => changeFilter(setSearch, "")}
              >
                <FiX />
              </button>
            )}

          </label>

          <label className="BlogManagement-selectWrap">

            <FiFilter />

            <select
              value={categoryFilter}
              onChange={(event) =>
                changeFilter(
                  setCategoryFilter,
                  event.target.value
                )
              }
              aria-label="Filter by category"
            >
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <FiChevronDown className="BlogManagement-selectArrow" />

          </label>

          <label className="BlogManagement-selectWrap">

            <select
              value={statusFilter}
              onChange={(event) =>
                changeFilter(
                  setStatusFilter,
                  event.target.value
                )
              }
              aria-label="Filter by status"
            >
              <option value="All Status">All Status</option>

              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <FiChevronDown className="BlogManagement-selectArrow" />

          </label>

          <label className="BlogManagement-selectWrap BlogManagement-sortSelect">

            <select
              value={sortBy}
              onChange={(event) =>
                changeFilter(setSortBy, event.target.value)
              }
              aria-label="Sort blog posts"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A–Z</option>
              <option value="mostViewed">Most Viewed</option>
            </select>

            <FiChevronDown className="BlogManagement-selectArrow" />

          </label>

        </div>

        {/* RESULTS COUNT */}

        <div className="BlogManagement-resultsBar">

          <p>
            Showing <strong>{filteredBlogs.length}</strong> blog{" "}
            {filteredBlogs.length === 1 ? "post" : "posts"}
          </p>

          {(search ||
            categoryFilter !== "All Categories" ||
            statusFilter !== "All Status" ||
            sortBy !== "newest") && (
            <button
              type="button"
              onClick={clearFilters}
            >
              <FiX />
              Clear filters
            </button>
          )}

        </div>

        {/* GRID VIEW */}

        {viewMode === "grid" && filteredBlogs.length > 0 && (
          <div className="BlogManagement-grid">

            {visibleBlogs.map((blog) => (
              <article
                className="BlogManagement-card"
                key={blog.id}
              >

                <div className="BlogManagement-cardImage">

                  {getImage(blog) ? (
                    <img
                      src={getImage(blog)}
                      alt={blog.title}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="BlogManagement-noImage">
                      <FiImage />
                    </div>
                  )}

                  <span className="BlogManagement-blogCode">
                    {blog.code || `BLOG-${blog.id}`}
                  </span>

                  {renderActions(blog)}

                  <div className="BlogManagement-imageStatus">
                    {renderStatus(blog.status)}
                  </div>

                </div>

                <div className="BlogManagement-cardBody">

                  <span className="BlogManagement-category">
                    {blog.category || "Uncategorized"}
                  </span>

                  <h3>{blog.title}</h3>

                  <p className="BlogManagement-excerpt">
                    {getDescription(blog)}
                  </p>

                  <div className="BlogManagement-author">
                    <FiUser />
                    <span>{getAuthor(blog)}</span>
                  </div>

                  <div className="BlogManagement-cardFooter">

                    <div className="BlogManagement-cardMeta">

                      <span>
                        <FiCalendar />
                        {formatDate(getDate(blog))}
                      </span>

                      <span>
                        <FiEye />
                        {(blog.views || 0).toLocaleString("en-IN")} views
                      </span>

                    </div>

                    <button
                      type="button"
                      className="BlogManagement-viewLink"
                      onClick={() => setSelectedBlog(blog)}
                    >
                      View <FiArrowUpRight />
                    </button>

                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

        {/* LIST VIEW */}

        {viewMode === "list" && filteredBlogs.length > 0 && (
          <div className="BlogManagement-listWrap">

            <table className="BlogManagement-table">

              <thead>
                <tr>
                  <th>Blog Post</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Publish Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {visibleBlogs.map((blog) => (
                  <tr key={blog.id}>

                    <td>
                      <div className="BlogManagement-listPost">

                        {getImage(blog) ? (
                          <img
                            src={getImage(blog)}
                            alt={blog.title}
                            loading="lazy"
                          />
                        ) : (
                          <div className="BlogManagement-noImage">
                            <FiImage />
                          </div>
                        )}

                        <div>
                          <strong>{blog.title}</strong>

                          <span>
                            {blog.code || `BLOG-${blog.id}`}
                          </span>

                          <small>{getDescription(blog)}</small>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="BlogManagement-category">
                        {blog.category}
                      </span>
                    </td>

                    <td>
                      <span className="BlogManagement-listAuthor">
                        <FiUser />
                        {getAuthor(blog)}
                      </span>
                    </td>

                    <td>
                      {renderStatus(blog.status)}
                    </td>

                    <td>
                      {(blog.views || 0).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {formatDate(getDate(blog))}
                    </td>

                    <td>
                      <div className="BlogManagement-listActions">

                        <button
                          type="button"
                          aria-label={`View ${blog.title}`}
                          title="View"
                          onClick={() => setSelectedBlog(blog)}
                        >
                          <FiEye />
                        </button>

                        <button
                          type="button"
                          aria-label={`Edit ${blog.title}`}
                          title="Edit"
                          onClick={() => handleEdit(blog)}
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          type="button"
                          className="BlogManagement-listDelete"
                          aria-label={`Delete ${blog.title}`}
                          title="Delete"
                          onClick={() => setDeleteId(blog.id)}
                        >
                          <FiTrash2 />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

        {/* EMPTY STATE */}

        {filteredBlogs.length === 0 && (
          <div className="BlogManagement-empty">

            <span>
              <FiImage />
            </span>

            <h3>No blog posts found</h3>

            <p>
              Try changing your search or filters to find a blog.
            </p>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear all filters
            </button>

          </div>
        )}

        {/* PAGINATION */}

        {filteredBlogs.length > 0 && (
          <div className="BlogManagement-pagination">

            <span>
              Showing {startIndex + 1}–
              {Math.min(
                startIndex + itemsPerPage,
                filteredBlogs.length
              )}{" "}
              of {filteredBlogs.length} posts
            </span>

            <div className="BlogManagement-pageButtons">

              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setCurrentPage(safePage - 1)}
                aria-label="Previous page"
              >
                ‹
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  type="button"
                  key={page}
                  className={
                    page === safePage
                      ? "BlogManagement-pageButton--active"
                      : ""
                  }
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage(safePage + 1)}
                aria-label="Next page"
              >
                ›
              </button>

            </div>

          </div>
        )}

      </section>

      {/* =================================================
         BLOG PREVIEW MODAL
      ================================================= */}

      {selectedBlog && (
        <div
          className="BlogManagement-modalBackdrop"
          onClick={() => setSelectedBlog(null)}
        >

          <section
            className="BlogManagement-detailModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="BlogManagement-detailTitle"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="BlogManagement-modalHeader">

              <div>
                <span className="BlogManagement-eyebrow">
                  RHINO'S EQUIPMENT
                </span>

                <h2 id="BlogManagement-detailTitle">
                  Blog Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBlog(null)}
                aria-label="Close details"
              >
                <FiX />
              </button>

            </div>

            {getImage(selectedBlog) && (
              <img
                className="BlogManagement-detailImage"
                src={getImage(selectedBlog)}
                alt={selectedBlog.title}
              />
            )}

            <div className="BlogManagement-detailBody">

              <div className="BlogManagement-detailMeta">

                {renderStatus(selectedBlog.status)}

                <span className="BlogManagement-category">
                  {selectedBlog.category}
                </span>

                <span>
                  <FiCalendar />
                  {formatDate(getDate(selectedBlog))}
                </span>

              </div>

              <h3>{selectedBlog.title}</h3>

              <div className="BlogManagement-detailAuthor">
                <FiUser />
                Written by {getAuthor(selectedBlog)}
              </div>

              {selectedBlog.location && (
                <div className="BlogManagement-detailAuthor">
                  <FiMapPin />
                  {selectedBlog.location}
                </div>
              )}

              <div
                className="BlogManagement-detailDescription"
                dangerouslySetInnerHTML={{
                  __html:
                    selectedBlog.description ||
                    `<p>${selectedBlog.excerpt || ""}</p>`,
                }}
              />

             {selectedBlog.quote && (
  <blockquote className="BlogManagement-detailQuote">
    <FiMessageSquare />
    {selectedBlog.quote}
  </blockquote>
)}

              {selectedBlog.otherImages?.length > 0 && (
                <div className="BlogManagement-detailImages">

                  <h4>Other Images</h4>

                  <div>
                    {selectedBlog.otherImages.map((image, index) => (
                      <img
                        key={index}
                        src={
                          typeof image === "string"
                            ? image
                            : image.data || image.preview
                        }
                        alt={image.name || `Blog image ${index + 1}`}
                      />
                    ))}
                  </div>

                </div>
              )}

              {getTags(selectedBlog.tags).length > 0 && (
                <div className="BlogManagement-detailTags">

                  {getTags(selectedBlog.tags).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}

                </div>
              )}

              {(selectedBlog.seoTitle ||
                selectedBlog.seoDescription) && (
                <div className="BlogManagement-detailSEO">

                  <h4>SEO Information</h4>

                  {selectedBlog.seoTitle && (
                    <p>
                      <strong>SEO Title:</strong>{" "}
                      {selectedBlog.seoTitle}
                    </p>
                  )}

                  {selectedBlog.seoDescription && (
                    <p>{selectedBlog.seoDescription}</p>
                  )}

                </div>
              )}

              {selectedBlog.documents?.length > 0 && (
                <div className="BlogManagement-detailDocuments">

                  <h4>Attached Documents</h4>

                  {selectedBlog.documents.map((document, index) => (
                    <div
                      key={index}
                      className="BlogManagement-detailDocument"
                    >
                      <FiFile />

                      <span>
                        {document.name || `Document ${index + 1}`}
                      </span>
                    </div>
                  ))}

                </div>
              )}

            </div>

            <div className="BlogManagement-modalFooter">

              <button
                type="button"
                className="BlogManagement-modalSecondary"
                onClick={() => setSelectedBlog(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="BlogManagement-createButton"
                onClick={() => handleEdit(selectedBlog)}
              >
                <FiEdit2 />
                Edit Blog
              </button>

            </div>

          </section>

        </div>
      )}

      {/* =================================================
         DELETE CONFIRMATION
      ================================================= */}

      {deleteId !== null && (
        <div
          className="BlogManagement-modalBackdrop"
          onClick={() => setDeleteId(null)}
        >

          <section
            className="BlogManagement-confirmModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="BlogManagement-deleteTitle"
            onClick={(event) => event.stopPropagation()}
          >

            <span className="BlogManagement-deleteIcon">
              <FiTrash2 />
            </span>

            <h2 id="BlogManagement-deleteTitle">
              Delete blog post?
            </h2>

            <p>
              This blog will be removed from your local
              blog collection. This action cannot be undone.
            </p>

            <div className="BlogManagement-confirmActions">

              <button
                type="button"
                className="BlogManagement-modalSecondary"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="BlogManagement-confirmDelete"
                onClick={handleDelete}
              >
                <FiTrash2 />
                Delete Blog
              </button>

            </div>

          </section>

        </div>
      )}

      {/* CLOSE DROPDOWN WHEN CLICKING OUTSIDE */}

      {openMenu !== null && (
        <button
          type="button"
          className="BlogManagement-dismissMenu"
          aria-label="Close actions menu"
          onClick={() => setOpenMenu(null)}
        />
      )}

    </div>
  );
};

export default BlogManagement;
