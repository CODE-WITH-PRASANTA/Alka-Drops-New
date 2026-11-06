import React, { useEffect, useState, useMemo } from "react";
import {
  FiMail,
  FiSearch,
  FiPhone,
  FiRefreshCw,
  FiTrash2,
  FiInbox,
} from "react-icons/fi";
import API from "../../services/api";
import "./EnquiryManagement.css";

const EnquiryManagement = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await API.get("/contact");
      if (res.data?.contacts) {
        const mapped = res.data.contacts.map((c) => ({
          _id: c._id,
          name: c.name || "Customer",
          email: c.email || "",
          phone: c.phone || "",
          subject: c.subject || (c.interest ? `${c.interest} Enquiry` : "General Inquiry"),
          interest: c.interest || "",
          message: c.message || "",
          date: c.createdAt
            ? new Date(c.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
        }));
        setEnquiries(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch enquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) {
      return;
    }
    try {
      await API.delete(`/contact/${id}`);
      setEnquiries((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      alert("Failed to delete enquiry.");
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return enquiries;
    const q = search.toLowerCase();
    return enquiries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.phone.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q)
    );
  }, [enquiries, search]);

  return (
    <div className="EnquiryManagement">
      {/* Top Bar: Title + Count + Search + Sync */}
      <div className="EnquiryManagement-topBar">
        <div className="EnquiryManagement-titleRow">
          <div className="EnquiryManagement-icon">
            <FiMail />
          </div>
          <div>
            <h2>Customer Enquiries</h2>
            <span className="EnquiryManagement-countBadge">
              {enquiries.length} {enquiries.length === 1 ? "Enquiry" : "Enquiries"}
            </span>
          </div>
        </div>

        <div className="EnquiryManagement-actionsRow">
          <div className="EnquiryManagement-searchBox">
            <FiSearch className="EnquiryManagement-searchIcon" />
            <input
              type="text"
              placeholder="Search by customer, email, phone, or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="EnquiryManagement-syncBtn"
            onClick={fetchEnquiries}
            disabled={loading}
            title="Refresh list"
          >
            <FiRefreshCw className={loading ? "spin" : ""} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Enquiries Compact List */}
      <div className="EnquiryManagement-list">
        {loading && (
          <div className="EnquiryManagement-loading">
            <FiRefreshCw className="spin" />
            <span>Loading enquiries...</span>
          </div>
        )}

        {!loading &&
          filtered.map((item) => (
            <div key={item._id} className="EnquiryManagement-row">
              <div className="EnquiryManagement-rowHeader">
                <div className="EnquiryManagement-customer">
                  <span className="EnquiryManagement-name">{item.name}</span>
                  {item.email && (
                    <a
                      href={`mailto:${item.email}`}
                      className="EnquiryManagement-metaLink"
                      title="Send email"
                    >
                      <FiMail size={13} /> {item.email}
                    </a>
                  )}
                  {item.phone && (
                    <a
                      href={`tel:${item.phone}`}
                      className="EnquiryManagement-metaLink"
                      title="Call phone"
                    >
                      <FiPhone size={13} /> {item.phone}
                    </a>
                  )}
                  {item.interest && (
                    <span className="EnquiryManagement-interestTag">
                      {item.interest}
                    </span>
                  )}
                </div>

                <div className="EnquiryManagement-rowRight">
                  <span className="EnquiryManagement-date">{item.date}</span>
                  <button
                    type="button"
                    className="EnquiryManagement-delBtn"
                    onClick={() => handleDelete(item._id)}
                    title="Delete enquiry"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <div className="EnquiryManagement-content">
                <span className="EnquiryManagement-subject">{item.subject}:</span>{" "}
                <span className="EnquiryManagement-message">{item.message}</span>
              </div>
            </div>
          ))}

        {!loading && filtered.length === 0 && (
          <div className="EnquiryManagement-empty">
            <FiInbox />
            <h3>No Customer Enquiries Found</h3>
            <p>
              {enquiries.length === 0
                ? "Incoming messages from http://localhost:5173/contact will appear here."
                : "No enquiries match your search query."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnquiryManagement;
