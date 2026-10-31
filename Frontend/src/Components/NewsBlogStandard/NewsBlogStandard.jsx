
import React, { useMemo, useState } from "react";
import "./NewsBlogStandard.css";

import heroImage from "../../assets/news-hero-children.jpg";
import articleImage from "../../assets/news-delivery-article.jpg";
import recentChildren from "../../assets/news-recent-children.jpg";
import recentDelivery from "../../assets/news-recent-delivery.jpg";
import recentWater from "../../assets/news-recent-water.jpg";
import contactImage from "../../assets/news-contact-delivery.jpg";

const categories = [
  "Tempor lorem interdum",
  "Auctor mattis lacus",
  "Dolor proin",
  "Pharetra amet",
  "Nullam dolor gravida",
];

const recentNews = [
  {
    id: 1,
    title: "Nunc scelerisque tincidunt vestibulum",
    date: "21 July",
    category: "Tempor lorem interdum",
    image: recentChildren,
  },
  {
    id: 2,
    title: "Nunc scelerisque tincidunt vestibulum",
    date: "21 July",
    category: "Auctor mattis lacus",
    image: recentDelivery,
  },
  {
    id: 3,
    title: "Nunc scelerisque tincidunt vestibulum",
    date: "21 July",
    category: "Dolor proin",
    image: recentWater,
  },
];

const paragraphs = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
  "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
];

const NewsBlogStandard = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [showAll, setShowAll] = useState(false);

  const filteredNews = useMemo(() => {
    return recentNews.filter((news) => {
      const matchesSearch = news.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        !activeCategory || news.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <section className="news-detail-page">
      <div className="news-detail-container">

        {/* LEFT ARTICLE CONTENT */}
        <main className="news-article">

          <div className="news-hero-image">
            <img src={heroImage} alt="Children holding drinking water bottles" />
          </div>

          <div className="news-meta">
            <span>
              <i className="news-user-icon">♙</i>
              Admin
            </span>

            <span>
              <i className="news-calendar-icon">▦</i>
              28 JAN, 2021
            </span>
          </div>

          <h1 className="news-main-title">
            Social media-driven trading frenzy for GameStop, AMC Entertainment
            sparks calls for scrutiny
          </h1>

          <div className="news-article-text">
            <p>{paragraphs[0]}</p>
            <p>{paragraphs[1]}</p>
            <p>{paragraphs[2]}</p>

            {showAll && (
              <>
                <p>{paragraphs[0]}</p>
                <p>{paragraphs[1]}</p>
              </>
            )}
          </div>

          <blockquote className="news-quote">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
              diam nonummy nibh euismod tincidunt ut laoreet dolore magna
              aliquam erat volutpat.
            </p>
            <strong>Marilyn Gilbert</strong>
          </blockquote>

          <div className="news-article-text">
            <p>{paragraphs[1]}</p>
            <p>{paragraphs[2]}</p>
          </div>

          <div className="news-second-image">
            <img
              src={articleImage}
              alt="Water delivery professional handing a water bottle to a customer"
            />
          </div>

          <h2 className="news-secondary-title">
            AMC Entertainment sparks calls for scrutiny
          </h2>

          <div className="news-article-text">
            <p>{paragraphs[0]}</p>
            <p>{paragraphs[1]}</p>
          </div>

          <ul className="news-check-list">
            <li>sed diam nonummy nibh euismod tincidunt ut labore et dolore</li>
            <li>Stet clita kasd gubergren, no sea takimata sanctus</li>
            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
          </ul>

          <div className="news-article-footer">
            <div className="news-tags">
              <strong>Related Tags :</strong>
              <p>
                <a href="#doctor">Doctor</a>,{" "}
                <a href="#medical">Medical</a>,{" "}
                <a href="#health">Health</a>
              </p>
            </div>

            <div className="news-share">
              <strong>Share:</strong>
              <div className="news-social-links">
                <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
                <a href="https://twitter.com/" target="_blank" rel="noreferrer" aria-label="Twitter">♥</a>
                <a href="https://www.google.com/" target="_blank" rel="noreferrer" aria-label="Google">G</a>
                <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">◎</a>
              </div>
            </div>
          </div>

          <div className="news-comments">
            <h3>03 Comments</h3>
          </div>

          <button
            className="news-read-more"
            onClick={() => setShowAll((previous) => !previous)}
          >
            {showAll ? "Show Less" : "Read More"}
            <span>→</span>
          </button>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="news-sidebar">

          {/* SEARCH */}
          <div className="news-widget">
            <h3>Search</h3>

            <form className="news-search-form" onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Search Here"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search news"
              />

              <button type="submit" aria-label="Search">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="10.8" cy="10.8" r="6.3" />
                  <path d="m15.5 15.5 4 4" />
                </svg>
              </button>
            </form>
          </div>

          {/* CATEGORY */}
          <div className="news-widget news-category-widget">
            <h3>Category</h3>

            <div className="news-category-list">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`news-category-btn ${
                    activeCategory === category ? "active" : ""
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  <span>{category}</span>
                  <span className="news-category-arrow">›</span>
                </button>
              ))}
            </div>
          </div>

          {/* RECENT NEWS */}
          <div className="news-widget news-recent-widget">
            <h3>Recent News</h3>

            <div className="news-recent-list">
              {filteredNews.length > 0 ? (
                filteredNews.map((news) => (
                  <a
                    className="news-recent-card"
                    href={`#recent-${news.id}`}
                    key={news.id}
                  >
                    <img src={news.image} alt="" />

                    <div className="news-recent-info">
                      <p>{news.title}</p>
                      <span>▦ {news.date}</span>
                    </div>
                  </a>
                ))
              ) : (
                <p className="news-no-results">No news found.</p>
              )}
            </div>
          </div>

          {/* CONTACT CARD */}
          <div className="news-contact-card">
            <img
              className="news-contact-image"
              src={contactImage}
              alt="Water delivery professional"
            />

            <div className="news-contact-details">
              <a href="tel:+919876543210" className="news-contact-item">
                <span className="news-contact-icon">⌕</span>
                <span>
                  <strong>Call Us</strong>
                  <small>+91 98765 43210</small>
                </span>
              </a>

              <a
                href="mailto:info@example.com"
                className="news-contact-item"
              >
                <span className="news-contact-icon">✉</span>
                <span>
                  <strong>Our Mail</strong>
                  <small>info@example.com</small>
                </span>
              </a>
            </div>
          </div>

        </aside>
      </div>
    </section>
  );
};

export default NewsBlogStandard;
