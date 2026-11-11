import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import {
  FiFileText,
  FiUploadCloud,
  FiImage,
  FiUser,
  FiTag,
  FiMapPin,
  FiMessageSquare,
  FiFolder,
  FiSave,
  FiRotateCcw,
  FiCheckCircle,
  FiAlertCircle,
  FiTrash2,
  FiArrowLeft,
  FiLoader,
  FiGlobe,
  FiPlus,
} from "react-icons/fi";
import "./BlogPosting.css";
import API from "../../services/api";

const API_BLOGS_URL = "http://localhost:5000/api/blogs";
const API_UPLOAD_URL = "http://localhost:5000/api/upload";
const API_CATEGORIES_URL = "http://localhost:5000/api/categories?status=active";

const DEFAULT_CATEGORIES = [
  "Hydration & Health",
  "Water Quality & Purity",
  "Eco & Refills",
  "Delivery Updates",
  "Alkaline Benefits",
  "Industry News",
];

const createEmptyForm = () => ({
  title: "",
  slug: "",
  description: "",
  category: "",
  postedBy: "Alka Drops Team",
  quote: "",
  tags: [],
  location: "",
  featuredImage: null,
  status: "published",
});

// Helper to convert any image file to WebP format on the client before upload
const convertFileToWebP = (file) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith("image/")) {
      return resolve(file);
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const baseName = file.name.replace(/\.[^/.]+$/, "");
              const webpFile = new File([blob], `${baseName}.webp`, {
                type: "image/webp",
              });
              resolve(webpFile);
            } else {
              resolve(file);
            }
          },
          "image/webp",
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

const BlogPosting = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const editId = searchParams.get("id") || location.state?.blog?._id || location.state?.blog?.id;

  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [tagInput, setTagInput] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("info"); // "info" | "success" | "error"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoadingBlog, setIsLoadingBlog] = useState(false);

  const featuredImageRef = useRef(null);

  // Load Dynamic Categories from MongoDB via Axios
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories?status=active");
        const data = res.data;
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories.map((c) => c.name));
        }
      } catch (err) {
        console.warn("Could not load dynamic categories, using defaults:", err);
      }
    };
    fetchCategories();
  }, []);

  // Load Blog Details If in Edit Mode via Axios
  useEffect(() => {
    const loadBlogToEdit = async () => {
      if (!editId) return;

      try {
        setIsLoadingBlog(true);
        const res = await API.get(`/blogs/${editId}`);
        const data = res.data;

        if (data.success && data.blog) {
          const b = data.blog;
          setEditingId(b._id);

          let initialTags = [];
          if (Array.isArray(b.tags)) {
            initialTags = b.tags;
          } else if (typeof b.tags === "string" && b.tags.trim()) {
            initialTags = b.tags.split(",").map((t) => t.trim().replace(/^#+/, "")).filter(Boolean);
          }

          setForm({
            title: b.title || "",
            slug: b.slug || "",
            description: b.content || b.description || "",
            category: b.category || "",
            postedBy: b.author || b.postedBy || "Alka Drops Team",
            quote: b.quote || "",
            tags: initialTags,
            location: b.location || "",
            featuredImage: b.coverImage || b.image || b.featuredImage || null,
            status: (b.status || "published").toLowerCase(),
          });
          setNotice(`Editing blog post: "${b.title}"`);
          setNoticeType("info");
        } else {
          setNotice("Could not find the requested blog post to edit.");
          setNoticeType("error");
        }
      } catch (err) {
        console.error("Error fetching blog for edit:", err);
        setNotice("Network error loading blog details.");
        setNoticeType("error");
      } finally {
        setIsLoadingBlog(false);
      }
    };

    loadBlogToEdit();
  }, [editId]);

  // Update form fields
  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Automatic Slug Generation When Title Changes
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    const generatedSlug = newTitle
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setForm((prev) => ({
      ...prev,
      title: newTitle,
      // Auto-update slug if it was never manually overridden or is empty
      slug: !editingId || !prev.slug ? generatedSlug : prev.slug,
    }));
  };

  // Add Tag from input
  const handleAddTag = (e) => {
    if (e) e.preventDefault();
    const trimmed = tagInput.trim();
    if (!trimmed) return;

    const newTags = trimmed
      .split(",")
      .map((t) => t.trim().replace(/^#+/, ""))
      .filter(Boolean);

    const existingTags = Array.isArray(form.tags)
      ? form.tags
      : typeof form.tags === "string" && form.tags
      ? form.tags.split(",").map((t) => t.trim().replace(/^#+/, "")).filter(Boolean)
      : [];

    const merged = Array.from(new Set([...existingTags, ...newTags]));
    updateField("tags", merged);
    setTagInput("");
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove) => {
    const existingTags = Array.isArray(form.tags)
      ? form.tags
      : typeof form.tags === "string" && form.tags
      ? form.tags.split(",").map((t) => t.trim().replace(/^#+/, "")).filter(Boolean)
      : [];

    updateField(
      "tags",
      existingTags.filter((t) => t !== tagToRemove)
    );
  };

  // KeyDown Handler on Tag Input
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Upload Featured Image and Automatically Convert to WebP (Client + Server Sharp)
  const handleFeaturedImageUpload = async (event) => {
    const rawFile = event.target.files?.[0];
    if (!rawFile) return;

    if (!rawFile.type.startsWith("image/")) {
      setNotice("Please select a valid image file (PNG, JPG, JPEG, WEBP, etc.).");
      setNoticeType("error");
      event.target.value = "";
      return;
    }

    try {
      setIsUploadingImage(true);
      setNotice("Optimizing and converting image to WebP format...");
      setNoticeType("info");

      // 1. Convert to WebP
      const webpFile = await convertFileToWebP(rawFile);

      // 2. Upload to backend via Axios
      const formData = new FormData();
      formData.append("image", webpFile);

      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;

      if (data.success && data.url) {
        updateField("featuredImage", data.url);
        setNotice("Image converted to WebP and saved successfully!");
        setNoticeType("success");
      } else {
        setNotice(data.message || "Failed to upload image.");
        setNoticeType("error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setNotice("Upload failed. Ensure backend server is running.");
      setNoticeType("error");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  // Remove uploaded image
  const removeFeaturedImage = () => {
    updateField("featuredImage", null);
  };

  // Reset form
  const handleReset = () => {
    setForm(createEmptyForm());
    setTagInput("");
    setEditingId(null);
    setNotice("Form has been reset.");
    setNoticeType("info");
  };

  // Form Submit (Save to MongoDB)
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setNotice("Please enter a blog title.");
      setNoticeType("error");
      return;
    }

    if (!form.category) {
      setNotice("Please choose a category.");
      setNoticeType("error");
      return;
    }

    const plainText = form.description ? form.description.replace(/<[^>]*>/g, "").trim() : "";
    if (!plainText || plainText.length < 5) {
      setNotice("Please write your blog content in the TinyMCE editor.");
      setNoticeType("error");
      return;
    }

    try {
      setIsSubmitting(true);
      setNotice("Saving blog post to database...");
      setNoticeType("info");

      const url = editingId ? `${API_BLOGS_URL}/${editingId}` : API_BLOGS_URL;
      const method = editingId ? "PUT" : "POST";

      const finalSlug = form.slug
        ? form.slug
        : form.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

      const finalTags = Array.isArray(form.tags)
        ? form.tags
        : typeof form.tags === "string" && form.tags
        ? form.tags.split(",").map((t) => t.trim().replace(/^#+/, "")).filter(Boolean)
        : [];

      const payload = {
        title: form.title.trim(),
        slug: finalSlug,
        content: form.description,
        description: form.description,
        category: form.category,
        author: form.postedBy.trim() || "Alka Drops Team",
        postedBy: form.postedBy.trim() || "Alka Drops Team",
        quote: form.quote.trim(),
        tags: finalTags,
        location: form.location.trim(),
        featuredImage: form.featuredImage || "",
        coverImage: form.featuredImage || "",
        image: form.featuredImage || "",
        status: form.status || "published",
      };

      const res = editingId
        ? await API.put(`/blogs/${editingId}`, payload)
        : await API.post("/blogs", payload);

      const data = res.data;

      if (data.success) {
        setNotice(editingId ? "Blog post updated successfully!" : "Blog post published successfully!");
        setNoticeType("success");
        setTimeout(() => {
          navigate("/admin/blog-management");
        }, 800);
      } else {
        setNotice(data.message || "Failed to save blog post.");
        setNoticeType("error");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setNotice("Server error while saving. Please ensure backend is active.");
      setNoticeType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="BlogPosting">
      {/* Top Header */}
      <header className="BlogPosting-header">
        <div className="BlogPosting-heading">
          <div className="BlogPosting-headingIcon">
            <FiFileText />
          </div>

          <div>
            <h1>{editingId ? "Edit Blog Post" : "Add New Blog Post"}</h1>
          </div>
        </div>

        <div className="BlogPosting-headerActions">
          <button
            type="button"
            className="BlogPosting-viewAllButton"
            onClick={() => navigate("/admin/blog-management")}
          >
            <FiArrowLeft /> Back to Blog Management
          </button>
        </div>
      </header>

      {/* Loading state indicator */}
      {isLoadingBlog && (
        <div className="BlogPosting-loadingBar">
          <FiLoader className="spin" />
          <span>Loading blog details from database...</span>
        </div>
      )}

      {/* Notice / Feedback Banner */}
      {notice && (
        <div className={`BlogPosting-notice ${noticeType === "error" ? "is-error" : noticeType === "success" ? "is-success" : ""}`}>
          <div className="BlogPosting-noticeIcon">
            {noticeType === "error" ? <FiAlertCircle /> : <FiCheckCircle />}
          </div>
          <span>{notice}</span>
          <button
            type="button"
            className="BlogPosting-noticeClose"
            onClick={() => setNotice("")}
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Form Card */}
      <div className="BlogPosting-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="BlogPosting-formGrid">
            {/* SINGLE FEATURED IMAGE (CONVERTED TO WEBP WITH PROPORTIONAL FIT) */}
            <div className="BlogPosting-field BlogPosting-field--wide">
              <div className="BlogPosting-fieldHeading">
                <div className="BlogPosting-uploadHeadingIcon">
                  <FiImage />
                </div>
                <div>
                  <label>Featured Blog Image (Auto WebP Conversion)</label>
                  <p>
                    Select 1 cover image for this article. Image will automatically be converted to high-efficiency WebP.
                  </p>
                </div>
              </div>

              <input
                ref={featuredImageRef}
                type="file"
                accept="image/*"
                className="BlogPosting-hiddenInput"
                onChange={handleFeaturedImageUpload}
              />

              {form.featuredImage ? (
                <div className="BlogPosting-singleImagePreviewWrap">
                  <div className="BlogPosting-imageCard">
                    <img
                      src={form.featuredImage}
                      alt="Featured WebP Cover"
                      className="BlogPosting-imagePreviewImg"
                    />

                    <span className="BlogPosting-webpBadge">
                      ✓ WebP
                    </span>
                  </div>

                  <div className="BlogPosting-imageControls">
                    <button
                      type="button"
                      onClick={() => featuredImageRef.current?.click()}
                      className="BlogPosting-changeBtn"
                      title="Change image"
                    >
                      <FiUploadCloud size={14} /> Change Image
                    </button>

                    <button
                      type="button"
                      onClick={removeFeaturedImage}
                      className="BlogPosting-deleteImgBtn"
                      title="Remove image"
                    >
                      <FiTrash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isUploadingImage}
                  className="BlogPosting-uploadBox BlogPosting-uploadBox--main"
                  onClick={() => featuredImageRef.current?.click()}
                >
                  <span className="BlogPosting-uploadIcon">
                    {isUploadingImage ? <FiLoader className="spin" /> : <FiUploadCloud />}
                  </span>
                  <strong>{isUploadingImage ? "Converting to WebP..." : "Upload Blog Cover Image"}</strong>
                  <span>Click to choose an image from your computer</span>
                  <small>PNG, JPG, JPEG, WEBP · Auto converted to WebP</small>
                </button>
              )}
            </div>

            {/* BLOG TITLE */}
            <div className="BlogPosting-field BlogPosting-field--wide">
              <label htmlFor="BlogPosting-title">
                Blog Title <span style={{ color: "#ef4444" }}>*</span>
              </label>

              <input
                id="BlogPosting-title"
                type="text"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="e.g. 10 Proven Health Benefits of Daily Alkaline Hydration"
                required
              />
            </div>

            {/* AUTOMATIC URL SLUG */}
            <div className="BlogPosting-field BlogPosting-field--wide">
              <label htmlFor="BlogPosting-slug">
                URL Slug <small style={{ color: "#64748b", fontWeight: 400 }}>(Automatically generated from title)</small>
              </label>
              <div className="BlogPosting-slugWrapper">
                <span className="BlogPosting-slugPrefix">
                  <FiGlobe /> https://alkadrops.com/blog/
                </span>
                <input
                  id="BlogPosting-slug"
                  type="text"
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="10-proven-health-benefits-of-daily-alkaline-hydration"
                  className="BlogPosting-slugInput"
                />
              </div>
            </div>

            {/* CATEGORY (DYNAMIC FROM MONGO) */}
            <div className="BlogPosting-field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label htmlFor="BlogPosting-category" style={{ margin: 0 }}>
                  Category <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <a
                  href="/admin/blog-category"
                  style={{
                    fontSize: "12px",
                    color: "#00a896",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  + Add Category
                </a>
              </div>

              <div className="BlogPosting-inputWithIcon">
                <FiFolder />
                <select
                  id="BlogPosting-category"
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* AUTHOR / POSTED BY */}
            <div className="BlogPosting-field">
              <label htmlFor="BlogPosting-postedBy">
                Author / Posted By
              </label>

              <div className="BlogPosting-inputWithIcon">
                <FiUser />
                <input
                  id="BlogPosting-postedBy"
                  type="text"
                  value={form.postedBy}
                  onChange={(e) => updateField("postedBy", e.target.value)}
                  placeholder="e.g. Dr. Aarti Sharma"
                />
              </div>
            </div>

            {/* LOCATION */}
            <div className="BlogPosting-field">
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
                  placeholder="e.g. Bhubaneswar, India"
                />
              </div>
            </div>

            {/* PUBLICATION STATUS TOGGLE (NO DROPDOWN) */}
            <div className="BlogPosting-field">
              <label>Publication Status</label>
              <div className="BlogPosting-statusToggleContainer">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.status === "published"}
                  className={`BlogPosting-statusToggleSwitch ${form.status === "published" ? "is-active" : ""}`}
                  onClick={() =>
                    updateField("status", form.status === "published" ? "draft" : "published")
                  }
                  title={`Click to ${form.status === "published" ? "save as draft" : "publish"}`}
                >
                  <span className="BlogPosting-statusToggleSlider" />
                </button>
                <span className={`BlogPosting-statusToggleText ${form.status === "published" ? "text-published" : "text-draft"}`}>
                  {form.status === "published" ? "Published (Live on Website)" : "Draft (Saved Privately)"}
                </span>
              </div>
            </div>

            {/* QUOTES / HIGHLIGHT */}
            <div className="BlogPosting-field BlogPosting-field--wide">
              <label htmlFor="BlogPosting-quote">
                Highlight Quote
              </label>

              <div className="BlogPosting-inputWithIcon BlogPosting-quoteInput">
                <FiMessageSquare />
                <textarea
                  id="BlogPosting-quote"
                  rows="2"
                  value={form.quote}
                  onChange={(e) => updateField("quote", e.target.value)}
                  placeholder="Write an inspirational quote or key takeaway..."
                />
              </div>
            </div>

            {/* ARTICLE TAGS WITH DYNAMIC ADD BUTTON */}
            <div className="BlogPosting-field BlogPosting-field--wide">
              <label htmlFor="BlogPosting-tagInput">
                Article Tags <small style={{ color: "#64748b", fontWeight: 400 }}>(Type and click Add Tag)</small>
              </label>

              <div className="BlogPosting-tagInputRow">
                <div className="BlogPosting-inputWithIcon" style={{ flex: 1 }}>
                  <FiTag />
                  <input
                    id="BlogPosting-tagInput"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type a tag name (e.g. Alkaline Water, Immunity, Health)..."
                  />
                </div>

                <button
                  type="button"
                  className="BlogPosting-addTagBtn"
                  onClick={handleAddTag}
                >
                  <FiPlus size={16} />
                  <span>Add Tag</span>
                </button>
              </div>

              {/* Tag Chips List */}
              <div className="BlogPosting-tagsContainer">
                {(Array.isArray(form.tags)
                  ? form.tags
                  : typeof form.tags === "string" && form.tags
                  ? form.tags.split(",").map((t) => t.trim().replace(/^#+/, "")).filter(Boolean)
                  : []
                ).map((tag, index) => (
                  <span key={`${tag}-${index}`} className="BlogPosting-tagChip">
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="BlogPosting-tagChipRemove"
                      title={`Remove tag ${tag}`}
                      aria-label={`Remove tag ${tag}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* TINYMCE RICH TEXT EDITOR */}
            <div className="BlogPosting-field BlogPosting-field--wide">
              <div className="BlogPosting-fieldHeading">
                <div className="BlogPosting-uploadHeadingIcon">
                  <FiFileText />
                </div>
                <div>
                  <label htmlFor="BlogPosting-editor">
                    Blog Content (TinyMCE Editor) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <p>Format headings, insert lists, bold text, links, and rich HTML.</p>
                </div>
              </div>

              <div className="BlogPosting-editor">
                <Editor
                  apiKey="8hswbe7bfeeneui9eb9gjgsym8ku30nx5gwre9808ajdzniu"
                  value={form.description}
                  onEditorChange={(content) => updateField("description", content)}
                  init={{
                    height: 440,
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
                      "undo redo | blocks fontfamily fontsize | " +
                      "bold italic forecolor backcolor | alignleft aligncenter " +
                      "alignright alignjustify | bullist numlist outdent indent | " +
                      "removeformat | help",
                    branding: false,
                    promotion: false,
                    resize: true,
                    content_style:
                      "body { font-family: Inter, Arial, sans-serif; font-size: 15px; line-height: 1.7; color: #1f2937; padding: 16px; }",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Form Action Buttons - Modern Executive Design */}
          <div className="BlogPosting-actions">
            <button
              type="button"
              className="BlogPosting-resetButton"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              <FiRotateCcw size={16} />
              <span>Reset Form</span>
            </button>

            <button
              type="submit"
              className="BlogPosting-submitButton"
              disabled={isSubmitting || isUploadingImage}
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="spin" size={17} />
                  <span>Saving to MongoDB...</span>
                </>
              ) : editingId ? (
                <>
                  <FiSave size={17} />
                  <span>Update Blog Post</span>
                </>
              ) : (
                <>
                  <FiSave size={17} />
                  <span>Publish Blog Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogPosting;
