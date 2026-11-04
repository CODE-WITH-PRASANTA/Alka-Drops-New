
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import {
  FiFileText,
  FiPlus,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiX,
  FiUploadCloud,
  FiImage,
  FiGrid,
  FiCheckCircle,
  FiCalendar,
  FiTag,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiSave,
  FiRotateCcw,
  FiLayers,
  FiUser,
  FiBookOpen,
  FiHash,
  FiMessageSquare,
  FiFolder,
  FiMapPin,
  FiFile,
  FiExternalLink,
} from "react-icons/fi";
import "./BlogPosting.css";

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

const createEmptyForm = () => ({
  title: "",
  description: "",
  category: "",
  postedBy: "",
  quote: "",
  tags: "",
  seoTitle: "",
  seoDescription: "",
  location: "",
  featuredImage: null,
  otherImages: [],
  documents: [],
});

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result,
      });
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const BlogPosting = () => {
  const [activeTab, setActiveTab] = useState("form");
  const [blogs, setBlogs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);

  const [notice, setNotice] = useState("");
  const [viewBlog, setViewBlog] = useState(null);
  const [deleteBlogId, setDeleteBlogId] = useState(null);

  const featuredImageRef = useRef(null);
  const otherImagesRef = useRef(null);
  const documentsRef = useRef(null);

  const itemsPerPage = 6;

  // Save blog data in browser storage.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
    } catch (error) {
      console.error("Local storage error:", error);
      setNotice(
        "Storage limit reached. Try using smaller images or fewer documents."
      );
    }
  }, [blogs]);

  // Statistics.
  const totalBlogs = blogs.length;

  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return blogs.filter((blog) => {
      const matchesSearch =
        !query ||
        blog.title?.toLowerCase().includes(query) ||
        blog.postedBy?.toLowerCase().includes(query) ||
        blog.category?.toLowerCase().includes(query) ||
        blog.tags?.toLowerCase().includes(query) ||
        blog.location?.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All Categories" ||
        blog.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [blogs, search, categoryFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBlogs.length / itemsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedBlogs = filteredBlogs.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  // Reset form.
  const openNewForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setNotice("");
    setActiveTab("form");
  };

  // Edit existing blog.
  const openEditForm = (blog) => {
    setForm({
      ...createEmptyForm(),
      ...blog,
      featuredImage: blog.featuredImage || null,
      otherImages: blog.otherImages || [],
      documents: blog.documents || [],
    });

    setEditingId(blog.id);
    setNotice("");
    setActiveTab("form");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Update form fields.
  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // Featured image upload.
  const handleFeaturedImage = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotice("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotice("Featured image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    try {
      const image = await readFile(file);

      updateField("featuredImage", image);
      setNotice("");
    } catch {
      setNotice("Unable to read the selected image.");
    }

    event.target.value = "";
  };

  // Multiple additional images.
  const handleOtherImages = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") &&
        file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      setNotice("Some images were skipped. Images must be under 5 MB.");
    } else {
      setNotice("");
    }

    try {
      const images = await Promise.all(validFiles.map(readFile));

      setForm((previous) => ({
        ...previous,
        otherImages: [...previous.otherImages, ...images],
      }));
    } catch {
      setNotice("Unable to read one or more images.");
    }

    event.target.value = "";
  };

  // Remove additional image.
  const removeOtherImage = (index) => {
    setForm((previous) => ({
      ...previous,
      otherImages: previous.otherImages.filter(
        (_, imageIndex) => imageIndex !== index
      ),
    }));
  };

  // Other documents upload.
  const handleDocuments = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) => {
      const extension = file.name.split(".").pop().toLowerCase();

      return (
        ["pdf", "doc", "docx"].includes(extension) &&
        file.size <= 10 * 1024 * 1024
      );
    });

    if (validFiles.length !== files.length) {
      setNotice("Only PDF, DOC and DOCX files up to 10 MB are allowed.");
    } else {
      setNotice("");
    }

    try {
      const uploadedDocuments = await Promise.all(
        validFiles.map(readFile)
      );

      setForm((previous) => ({
        ...previous,
        documents: [
          ...previous.documents,
          ...uploadedDocuments,
        ],
      }));
    } catch {
      setNotice("Unable to read one or more documents.");
    }

    event.target.value = "";
  };

  // Remove document.
  const removeDocument = (index) => {
    setForm((previous) => ({
      ...previous,
      documents: previous.documents.filter(
        (_, documentIndex) => documentIndex !== index
      ),
    }));
  };

  // Save blog locally.
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.featuredImage) {
      setNotice("Please upload a featured blog image.");
      return;
    }

    if (!form.title.trim()) {
      setNotice("Please enter the blog title.");
      return;
    }

    if (!form.description.trim() || form.description === "<p></p>") {
      setNotice("Please enter the blog description.");
      return;
    }

    if (!form.category) {
      setNotice("Please choose a blog category.");
      return;
    }

    const blogData = {
      ...form,
      id: editingId || Date.now(),
      title: form.title.trim(),
      postedBy: form.postedBy.trim(),
      createdAt:
        editingId
          ? blogs.find((blog) => blog.id === editingId)?.createdAt
          : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      setBlogs((previous) =>
        previous.map((blog) =>
          blog.id === editingId ? blogData : blog
        )
      );

      setNotice("Blog updated successfully!");
    } else {
      setBlogs((previous) => [blogData, ...previous]);
      setNotice("Blog published to your local blog list!");
    }

    setForm(createEmptyForm());
    setEditingId(null);
    setCurrentPage(1);
    setActiveTab("table");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete blog.
  const confirmDelete = () => {
    setBlogs((previous) =>
      previous.filter((blog) => blog.id !== deleteBlogId)
    );

    setDeleteBlogId(null);
    setNotice("Blog deleted successfully.");
  };

  // Reset form.
  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setNotice("Form has been reset.");
  };

  // Render featured image.
  const imageUrl = (image) => image?.data || "";

  const publishedCount = blogs.length;

  return (
    <div className="BlogPosting">

      {/* NOTIFICATION */}
      {notice && (
        <div className="BlogPosting-notice" role="status">
          <FiCheckCircle />
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <div className="BlogPosting-stats">

        <div className="BlogPosting-statCard">
          <div className="BlogPosting-statIcon">
            <FiLayers />
          </div>

          <div className="BlogPosting-statContent">
            <span>Total Blogs</span>
            <strong>{totalBlogs}</strong>
            <small>All blog entries</small>
          </div>
        </div>

        <div className="BlogPosting-statCard">
          <div className="BlogPosting-statIcon BlogPosting-statIcon--green">
            <FiCheckCircle />
          </div>

          <div className="BlogPosting-statContent">
            <span>Blog Images</span>
            <strong>
              {blogs.reduce(
                (sum, blog) =>
                  sum + (blog.otherImages?.length || 0) +
                  (blog.featuredImage ? 1 : 0),
                0
              )}
            </strong>
            <small>Uploaded images</small>
          </div>
        </div>

        <div className="BlogPosting-statCard">
          <div className="BlogPosting-statIcon BlogPosting-statIcon--amber">
            <FiFileText />
          </div>

          <div className="BlogPosting-statContent">
            <span>Documents</span>
            <strong>
              {blogs.reduce(
                (sum, blog) => sum + (blog.documents?.length || 0),
                0
              )}
            </strong>
            <small>Attached documents</small>
          </div>
        </div>

        <div className="BlogPosting-statCard">
          <div className="BlogPosting-statIcon BlogPosting-statIcon--blue">
            <FiFolder />
          </div>

          <div className="BlogPosting-statContent">
            <span>Categories</span>
            <strong>
              {new Set(blogs.map((blog) => blog.category)).size}
            </strong>
            <small>Used categories</small>
          </div>
        </div>

      </div>

      {/* MAIN WORKSPACE */}
      <div className="BlogPosting-workspace">

        <div className="BlogPosting-workspaceHeader">
          <div>
            <h2>Blog Management</h2>
            <p>Create, organize and manage your blog content.</p>
          </div>

          <div className="BlogPosting-tabs">

            <button
              type="button"
              className={`BlogPosting-tab ${
                activeTab === "form" ? "BlogPosting-tab--active" : ""
              }`}
              onClick={() => setActiveTab("form")}
            >
              <FiPlus />
              Blog Posting
            </button>

            <button
              type="button"
              className={`BlogPosting-tab ${
                activeTab === "table" ? "BlogPosting-tab--active" : ""
              }`}
              onClick={() => setActiveTab("table")}
            >
              <FiGrid />
              Blog Management

              <span className="BlogPosting-tabCount">
                {blogs.length}
              </span>
            </button>

          </div>
        </div>

        {/* ================= BLOG FORM ================= */}

        {activeTab === "form" && (
          <form
            className="BlogPosting-form"
            onSubmit={handleSubmit}
          >

            <div className="BlogPosting-formTop">
              <div>
                <span className="BlogPosting-sectionKicker">
                  {editingId ? "EDIT BLOG" : "CREATE CONTENT"}
                </span>

                <h3>
                  {editingId ? "Update Blog Post" : "Add New Blog"}
                </h3>

                <p>
                  Add your blog information, images, SEO details and
                  supporting documents.
                </p>
              </div>

              {editingId && (
                <span className="BlogPosting-editBadge">
                  Editing Blog
                </span>
              )}
            </div>

            <div className="BlogPosting-formGrid">

              {/* FEATURED IMAGE */}
              <div className="BlogPosting-field BlogPosting-field--wide">

                <div className="BlogPosting-fieldHeading">
                  <div className="BlogPosting-uploadHeadingIcon">
                    <FiImage />
                  </div>

                  <div>
                    <label>Featured Blog Image *</label>
                    <p>
                      Upload the main cover image for your blog.
                    </p>
                  </div>
                </div>

                <input
                  ref={featuredImageRef}
                  type="file"
                  accept="image/*"
                  className="BlogPosting-hiddenInput"
                  onChange={handleFeaturedImage}
                />

                {form.featuredImage ? (
                  <div className="BlogPosting-mainImagePreview">

                    <img
                      src={imageUrl(form.featuredImage)}
                      alt="Featured blog"
                    />

                    <div className="BlogPosting-imageOverlay">
                      <div>
                        <strong>{form.featuredImage.name}</strong>
                        <span>Featured Blog Image</span>
                      </div>

                      <div className="BlogPosting-imageActions">
                        <button
                          type="button"
                          onClick={() => featuredImageRef.current?.click()}
                          title="Replace image"
                        >
                          <FiRotateCcw />
                        </button>

                        <button
                          type="button"
                          onClick={() => updateField("featuredImage", null)}
                          title="Remove image"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <button
                    type="button"
                    className="BlogPosting-uploadBox BlogPosting-uploadBox--main"
                    onClick={() => featuredImageRef.current?.click()}
                  >
                    <span className="BlogPosting-uploadIcon">
                      <FiUploadCloud />
                    </span>

                    <strong>Upload Featured Image</strong>
                    <span>Click to browse your device</span>
                    <small>JPG, PNG, WEBP · Maximum 5 MB</small>
                  </button>
                )}

              </div>

              {/* BLOG TITLE */}
              <div className="BlogPosting-field BlogPosting-field--wide">
                <label htmlFor="BlogPosting-title">
                  Blog Title *
                </label>

                <input
                  id="BlogPosting-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Enter your blog title"
                  required
                />
              </div>

              {/* CATEGORY */}
              <div className="BlogPosting-field">
                <label htmlFor="BlogPosting-category">
                  Choose Category *
                </label>

                <div className="BlogPosting-inputWithIcon">
                  <FiFolder />

                  <select
                    id="BlogPosting-category"
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    required
                  >
                    <option value="">Select category</option>

                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* POSTED BY */}
              <div className="BlogPosting-field">
                <label htmlFor="BlogPosting-postedBy">
                  Posted By
                </label>

                <div className="BlogPosting-inputWithIcon">
                  <FiUser />

                  <input
                    id="BlogPosting-postedBy"
                    type="text"
                    value={form.postedBy}
                    onChange={(e) => updateField("postedBy", e.target.value)}
                    placeholder="Enter author name"
                  />
                </div>
              </div>

              {/* LOCATION */}
              <div className="BlogPosting-field BlogPosting-field--wide">
                <label htmlFor="BlogPosting-location">
                  Location
                </label>

                <div className="BlogPosting-inputWithIcon">
                  <FiMapPin />

                  <input
                    id="BlogPosting-location"
                    type="text"
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="Enter location (e.g. Bhubaneswar, Odisha)"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="BlogPosting-field BlogPosting-field--wide">

                <div className="BlogPosting-fieldHeading">
                  <div className="BlogPosting-uploadHeadingIcon">
                    <FiFileText />
                  </div>

                  <div>
                    <label>Blog Description *</label>
                    <p>
                      Write and format your complete blog content.
                    </p>
                  </div>
                </div>

                <div className="BlogPosting-editor">
                  <Editor
                    apiKey="8hswbe7bfeeneui9eb9gjgsym8ku30nx5gwre9808ajdzniu"
                    value={form.description}
                    onEditorChange={(content) =>
                      updateField("description", content)
                    }
                    init={{
                      height: 420,
                      menubar: "file edit view insert format tools table",
                      plugins: [
                        "advlist",
                        "autolink",
                        "lists",
                        "link",
                        "image",
                        "charmap",
                        "preview",
                        "anchor",
                        "searchreplace",
                        "visualblocks",
                        "code",
                        "fullscreen",
                        "insertdatetime",
                        "media",
                        "table",
                        "help",
                        "wordcount",
                      ],
                      toolbar:
                        "undo redo | blocks | bold italic underline | " +
                        "forecolor backcolor | alignleft aligncenter " +
                        "alignright alignjustify | bullist numlist | " +
                        "outdent indent | link image media table | " +
                        "removeformat | code fullscreen",
                      branding: false,
                      promotion: false,
                      resize: true,
                      content_style:
                        "body { font-family: Arial, sans-serif; font-size: 15px; line-height: 1.7; color: #333; padding: 12px; }",
                    }}
                  />
                </div>

              </div>

              {/* QUOTE */}
              <div className="BlogPosting-field BlogPosting-field--wide">
                <label htmlFor="BlogPosting-quote">
                  Write Quotes
                </label>

                <div className="BlogPosting-inputWithIcon BlogPosting-quoteInput">
                 <FiMessageSquare />

                  <textarea
                    id="BlogPosting-quote"
                    rows="3"
                    value={form.quote}
                    onChange={(e) => updateField("quote", e.target.value)}
                    placeholder="Write an inspiring quote related to this blog..."
                  />
                </div>
              </div>

              {/* TAGS */}
              <div className="BlogPosting-field BlogPosting-field--wide">
                <label htmlFor="BlogPosting-tags">
                  Tags
                </label>

                <div className="BlogPosting-inputWithIcon">
                  <FiTag />

                  <input
                    id="BlogPosting-tags"
                    type="text"
                    value={form.tags}
                    onChange={(e) => updateField("tags", e.target.value)}
                    placeholder="Construction, Machinery, Equipment, Technology"
                  />
                </div>

                <small className="BlogPosting-fieldHint">
                  Separate multiple tags with commas.
                </small>
              </div>

              {/* OTHER IMAGES */}
              <div className="BlogPosting-field BlogPosting-field--wide">

                <div className="BlogPosting-fieldHeading">
                  <div className="BlogPosting-uploadHeadingIcon">
                    <FiImage />
                  </div>

                  <div>
                    <label>Upload Other Images</label>
                    <p>
                      Upload additional images for your blog content.
                    </p>
                  </div>
                </div>

                <input
                  ref={otherImagesRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="BlogPosting-hiddenInput"
                  onChange={handleOtherImages}
                />

                <button
                  type="button"
                  className="BlogPosting-uploadBox"
                  onClick={() => otherImagesRef.current?.click()}
                >
                  <span className="BlogPosting-uploadIcon">
                    <FiUploadCloud />
                  </span>

                  <strong>Upload Other Images</strong>
                  <span>Select multiple images from your device</span>
                  <small>JPG, PNG, WEBP · Maximum 5 MB each</small>
                </button>

                {form.otherImages.length > 0 && (
                  <div className="BlogPosting-bodyImageGrid">
                    {form.otherImages.map((image, index) => (
                      <div
                        className="BlogPosting-bodyImageCard"
                        key={`${image.name}-${index}`}
                      >
                        <div className="BlogPosting-bodyImagePreview">
                          <img
                            src={imageUrl(image)}
                            alt={image.name}
                          />

                          <div className="BlogPosting-bodyImageActions">
                            <span>{image.name}</span>

                            <button
                              type="button"
                              onClick={() => removeOtherImage(index)}
                              title="Remove image"
                            >
                              <FiTrash2 /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* SEO SECTION */}
              <div className="BlogPosting-field BlogPosting-field--wide">
                <div className="BlogPosting-fieldHeading">
                  <div className="BlogPosting-uploadHeadingIcon">
                    <FiSearch />
                  </div>

                  <div>
                    <label>SEO Settings</label>
                    <p>
                      Optimize your blog for search engines.
                    </p>
                  </div>
                </div>
              </div>

              {/* SEO TITLE */}
              <div className="BlogPosting-field BlogPosting-field--wide">
                <label htmlFor="BlogPosting-seoTitle">
                  SEO Title
                </label>

                <input
                  id="BlogPosting-seoTitle"
                  type="text"
                  maxLength={70}
                  value={form.seoTitle}
                  onChange={(e) => updateField("seoTitle", e.target.value)}
                  placeholder="Enter SEO title"
                />

                <small className="BlogPosting-fieldHint">
                  {form.seoTitle.length}/70 characters
                </small>
              </div>

              {/* SEO DESCRIPTION */}
              <div className="BlogPosting-field BlogPosting-field--wide">
                <label htmlFor="BlogPosting-seoDescription">
                  SEO Description
                </label>

                <textarea
                  id="BlogPosting-seoDescription"
                  rows="4"
                  maxLength={300}
                  value={form.seoDescription}
                  onChange={(e) =>
                    updateField("seoDescription", e.target.value)
                  }
                  placeholder="Write a search engine description for this blog..."
                />

                <small className="BlogPosting-fieldHint">
                  {form.seoDescription.length}/300 characters
                </small>
              </div>

              {/* DOCUMENT UPLOAD */}
              <div className="BlogPosting-field BlogPosting-field--wide">

                <div className="BlogPosting-fieldHeading">
                  <div className="BlogPosting-uploadHeadingIcon">
                    <FiFile />
                  </div>

                  <div>
                    <label>Upload Other Documents</label>
                    <p>
                      Attach supporting PDF or Word documents.
                    </p>
                  </div>
                </div>

                <input
                  ref={documentsRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  className="BlogPosting-hiddenInput"
                  onChange={handleDocuments}
                />

                <button
                  type="button"
                  className="BlogPosting-uploadBox"
                  onClick={() => documentsRef.current?.click()}
                >
                  <span className="BlogPosting-uploadIcon">
                    <FiUploadCloud />
                  </span>

                  <strong>Upload Documents</strong>
                  <span>Click to select documents</span>
                  <small>PDF, DOC, DOCX · Maximum 10 MB each</small>
                </button>

                {form.documents.length > 0 && (
                  <div className="BlogPosting-documentList">

                    {form.documents.map((document, index) => (
                      <div
                        className="BlogPosting-documentItem"
                        key={`${document.name}-${index}`}
                      >
                        <div className="BlogPosting-documentInfo">
                          <span className="BlogPosting-documentIcon">
                            <FiFileText />
                          </span>

                          <div>
                            <strong>{document.name}</strong>
                            <small>
                              {(document.size / 1024).toFixed(1)} KB
                            </small>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          aria-label={`Remove ${document.name}`}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}

                  </div>
                )}

              </div>

            </div>

            {/* FORM FOOTER */}
            <div className="BlogPosting-formFooter">

              <div className="BlogPosting-formFooterNote">
                <FiCheckCircle />

                <span>
                  Blog data is saved locally in this browser.
                </span>
              </div>

              <div className="BlogPosting-formActions">

                <button
                  type="button"
                  className="BlogPosting-secondaryButton"
                  onClick={resetForm}
                >
                  <FiRotateCcw /> Reset
                </button>

                <button
                  type="button"
                  className="BlogPosting-outlineButton"
                  onClick={() => setActiveTab("table")}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="BlogPosting-primaryButton"
                >
                  <FiSave />

                  {editingId ? "Update Blog" : "Save Blog"}
                </button>

              </div>
            </div>

          </form>
        )}

        {/* ================= BLOG TABLE ================= */}

        {activeTab === "table" && (
          <div className="BlogPosting-tableSection">

            <div className="BlogPosting-tableHeading">
              <div>
                <h3>All Blog Posts</h3>
                <p>View, edit and manage your blog content.</p>
              </div>

              <button
                type="button"
                className="BlogPosting-primaryButton"
                onClick={openNewForm}
              >
                <FiPlus /> Add Blog
              </button>
            </div>

            {/* FILTERS */}
            <div className="BlogPosting-filters">

              <div className="BlogPosting-searchBox">
                <FiSearch />

                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search title, author, tags or location..."
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              <div className="BlogPosting-filterSelect">
                <FiFilter />

                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All Categories">All Categories</option>

                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* TABLE */}
            <div className="BlogPosting-tableWrap">
              <table className="BlogPosting-table">

                <thead>
                  <tr>
                    <th>Blog Image</th>
                    <th>Blog Title</th>
                    <th>Posted By</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Images</th>
                    <th>Documents</th>
                    <th>Date</th>
                    <th className="BlogPosting-actionsColumn">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {paginatedBlogs.map((blog) => (
                    <tr key={blog.id}>

                      <td>
                        <div className="BlogPosting-postThumbnail">
                          {blog.featuredImage?.data ? (
                            <img
                              src={blog.featuredImage.data}
                              alt={blog.title}
                            />
                          ) : (
                            <FiImage />
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="BlogPosting-postInfo">
                          <strong>{blog.title}</strong>
                          <span>
                            {blog.tags || "No tags added"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="BlogPosting-authorCell">
                          <FiUser />
                          {blog.postedBy || "—"}
                        </span>
                      </td>

                      <td>
                        <span className="BlogPosting-categoryBadge">
                          {blog.category || "Uncategorized"}
                        </span>
                      </td>

                      <td>
                        <span className="BlogPosting-date">
                          {blog.location || "—"}
                        </span>
                      </td>

                      <td>
                        {blog.otherImages?.length || 0}
                      </td>

                      <td>
                        {blog.documents?.length || 0}
                      </td>

                      <td>
                        {formatDate(blog.createdAt)}
                      </td>

                      <td>
                        <div className="BlogPosting-rowActions">

                          <button
                            type="button"
                            className="BlogPosting-actionButton"
                            title="View blog"
                            onClick={() => setViewBlog(blog)}
                          >
                            <FiEye />
                          </button>

                          <button
                            type="button"
                            className="BlogPosting-actionButton"
                            title="Edit blog"
                            onClick={() => openEditForm(blog)}
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            className="BlogPosting-actionButton BlogPosting-actionButton--delete"
                            title="Delete blog"
                            onClick={() => setDeleteBlogId(blog.id)}
                          >
                            <FiTrash2 />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                  {paginatedBlogs.length === 0 && (
                    <tr>
                      <td colSpan="9">
                        <div className="BlogPosting-emptyState">
                          <div className="BlogPosting-emptyIcon">
                            <FiFileText />
                          </div>

                          <h4>No blog posts found</h4>

                          <p>
                            Create your first blog post to get started.
                          </p>

                          <button
                            type="button"
                            className="BlogPosting-primaryButton"
                            onClick={openNewForm}
                          >
                            <FiPlus /> Create Blog
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="BlogPosting-tableFooter">

              <span>
                Showing{" "}
                {filteredBlogs.length
                  ? (safePage - 1) * itemsPerPage + 1
                  : 0}
                {" "}to{" "}
                {Math.min(
                  safePage * itemsPerPage,
                  filteredBlogs.length
                )}
                {" "}of {filteredBlogs.length} posts
              </span>

              <div className="BlogPosting-pagination">

                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage(safePage - 1)}
                  aria-label="Previous page"
                >
                  <FiChevronLeft />
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={
                      safePage === page
                        ? "BlogPosting-pageButton--active"
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
                  <FiChevronRight />
                </button>

              </div>
            </div>

          </div>
        )}

      </div>

      {/* ================= VIEW BLOG MODAL ================= */}

      {viewBlog && (
        <div
          className="BlogPosting-modalBackdrop"
          onClick={() => setViewBlog(null)}
        >
          <div
            className="BlogPosting-viewModal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="BlogPosting-modalHeader">
              <div>
                <span className="BlogPosting-sectionKicker">
                  BLOG PREVIEW
                </span>
                <h3>Blog Details</h3>
              </div>

              <button
                type="button"
                className="BlogPosting-modalClose"
                onClick={() => setViewBlog(null)}
              >
                <FiX />
              </button>
            </div>

            {viewBlog.featuredImage?.data && (
              <img
                className="BlogPosting-viewMainImage"
                src={viewBlog.featuredImage.data}
                alt={viewBlog.title}
              />
            )}

            <div className="BlogPosting-viewContent">

              <div className="BlogPosting-viewMeta">
                <span>{viewBlog.category}</span>
                <span>{formatDate(viewBlog.createdAt)}</span>
              </div>

              <h2>{viewBlog.title}</h2>

              <div className="BlogPosting-previewAuthor">
                <FiUser />
                <span>Posted by: {viewBlog.postedBy || "Not specified"}</span>
              </div>

              {viewBlog.location && (
                <p className="BlogPosting-previewAuthor">
                  <FiMapPin /> {viewBlog.location}
                </p>
              )}

              <div
                className="BlogPosting-viewDescription"
                dangerouslySetInnerHTML={{
                  __html: viewBlog.description || "",
                }}
              />

              {viewBlog.quote && (
                <blockquote className="BlogPosting-viewQuote">
                  <FiMessageSquare />
                  {viewBlog.quote}
                </blockquote>
              )}

              {viewBlog.otherImages?.length > 0 && (
                <div className="BlogPosting-viewImages">
                  {viewBlog.otherImages.map((image, index) => (
                    <img
                      key={index}
                      src={image.data}
                      alt={image.name}
                    />
                  ))}
                </div>
              )}

              {viewBlog.tags && (
                <p className="BlogPosting-viewTags">
                  <FiTag /> {viewBlog.tags}
                </p>
              )}

              {(viewBlog.seoTitle || viewBlog.seoDescription) && (
                <div className="BlogPosting-seoPreview">
                  <strong>SEO Information</strong>

                  {viewBlog.seoTitle && (
                    <p>SEO Title: {viewBlog.seoTitle}</p>
                  )}

                  {viewBlog.seoDescription && (
                    <p>{viewBlog.seoDescription}</p>
                  )}
                </div>
              )}

              {viewBlog.documents?.length > 0 && (
                <div className="BlogPosting-previewDocuments">
                  <strong>Attached Documents</strong>

                  {viewBlog.documents.map((document, index) => (
                    <a
                      key={index}
                      href={document.data}
                      download={document.name}
                      className="BlogPosting-documentItem"
                    >
                      <FiFileText />
                      {document.name}
                      <FiExternalLink />
                    </a>
                  ))}
                </div>
              )}

            </div>

            <div className="BlogPosting-modalFooter">

              <button
                type="button"
                className="BlogPosting-outlineButton"
                onClick={() => setViewBlog(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="BlogPosting-primaryButton"
                onClick={() => {
                  const blog = viewBlog;
                  setViewBlog(null);
                  openEditForm(blog);
                }}
              >
                <FiEdit2 /> Edit Blog
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION ================= */}

      {deleteBlogId !== null && (
        <div
          className="BlogPosting-modalBackdrop"
          onClick={() => setDeleteBlogId(null)}
        >
          <div
            className="BlogPosting-confirmModal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="BlogPosting-confirmIcon">
              <FiTrash2 />
            </div>

            <h3>Delete this blog?</h3>

            <p>
              Are you sure you want to delete this blog post?
              This action cannot be undone.
            </p>

            <div className="BlogPosting-confirmActions">

              <button
                type="button"
                className="BlogPosting-outlineButton"
                onClick={() => setDeleteBlogId(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="BlogPosting-deleteConfirmButton"
                onClick={confirmDelete}
              >
                <FiTrash2 /> Delete Blog
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};


export default BlogPosting;
