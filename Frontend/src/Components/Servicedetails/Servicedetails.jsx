import React, { useState } from "react";
import "./Servicedetails.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=85";

const drinkingWaterImage =
  "https://images.pexels.com/photos/3124674/pexels-photo-3124674.jpeg?auto=compress&cs=tinysrgb&w=1000";

const services = [
  {
    title: "Bottled Water Delivery",
    heading: "Bottled Water Delivery",
    tag: "Most popular",
    description:
      "Alka Drops brings fresh pH 8.5+ alkaline drinking water to your doorstep in sealed, hygienic jars and bottles, so your home or office never runs out of safe water.",
    points: ["20L jars & bottles", "Free home delivery", "Sealed & hygienic"],
    image: FALLBACK_IMAGE,
  },
  {
    title: "Water Quality Management",
    heading: "Water Quality Management",
    tag: "Safe & tested",
    description:
      "We maintain water quality through responsible handling, strict hygiene practices, regular checks and reliable distribution procedures from our plant to your door.",
    points: ["Regular quality checks", "Hygienic handling", "Clean distribution"],
    image: drinkingWaterImage,
  },
  {
    title: "Dispenser & Refill Solutions",
    heading: "Dispenser & Refill Solutions",
    tag: "Home & office",
    description:
      "Choose convenient dispenser solutions and easy jar refills that keep clean alkaline water within reach at home, at work and in your shop.",
    points: ["Dispenser options", "Easy jar refills", "Less plastic waste"],
    image:
      "https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=1400",
  },
  {
    title: "Business & Bulk Supply",
    heading: "Business & Bulk Supply",
    tag: "For businesses",
    description:
      "Offices, shops, restaurants and events can rely on organized scheduling and dependable bulk supply of Alka Drops drinking water, delivered on time.",
    points: ["Scheduled deliveries", "Bulk pricing", "Reliable supply"],
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Customer Support",
    heading: "Customer Support",
    tag: "Always here",
    description:
      "Our friendly team helps you manage orders, delivery schedules, service enquiries and any other requirement with quick and responsive support.",
    points: ["Order assistance", "Delivery updates", "Quick responses"],
    image:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1400&q=85",
  },
];

const paragraph =
  "We believe dependable water delivery begins with quality, consistency and attention to customer needs. Our team works to make pH 8.5+ alkaline drinking water accessible through organized delivery, responsible handling and professional service. We continuously improve our processes to give every customer a convenient and dependable experience.";

const secondParagraph =
  "Whether you are a family looking for safe everyday drinking water or a business that needs a steady supply, Alka Drops is designed around your routine. Choose the service that suits you, and our team will take care of the rest.";

/* ---------------------------------------------------------
   Simple PDF generator (Company Profile / Brochure)
--------------------------------------------------------- */
function downloadServicePDF(type) {
  const isProfile = type === "profile";

  const title = isProfile
    ? "ALKA DROPS - COMPANY PROFILE"
    : "ALKA DROPS - COMPANY BROCHURE";

  const content = isProfile
    ? [
        "COMPANY PROFILE",
        "",
        "About Alka Drops",
        "Alka Drops delivers pH 8.5+ alkaline drinking water to",
        "households, offices and commercial customers.",
        "",
        "Our Services",
        "1. Bottled water delivery",
        "2. Water quality management",
        "3. Dispenser and refill solutions",
        "4. Business and bulk supply",
        "5. Customer support and order assistance",
        "",
        "Our Commitment",
        "We aim to provide convenient, dependable water delivery",
        "with a focus on hygiene, service quality and customer care.",
        "",
        "Our Vision",
        "To make pure drinking water convenient and reliable",
        "for every customer we serve.",
        "",
        "Contact",
        "For orders and enquiries, please contact the Alka Drops team.",
      ]
    : [
        "ALKA DROPS - COMPANY BROCHURE",
        "",
        "PURE ALKALINE WATER. DELIVERED TO YOUR DOOR.",
        "",
        "pH 8.5+ ALKALINE DRINKING WATER",
        "Fresh, sealed and hygienic water for homes, offices",
        "and businesses.",
        "",
        "QUALITY AND HYGIENE",
        "We emphasize responsible handling and quality-focused",
        "processes throughout the water delivery service.",
        "",
        "FLEXIBLE DELIVERY",
        "Plan your water requirements with convenient delivery",
        "scheduling designed around customer needs.",
        "",
        "CUSTOMER CARE",
        "Our team is available to help with orders, delivery",
        "questions and service-related enquiries.",
        "",
        "WHY CHOOSE ALKA DROPS?",
        "- Free home delivery",
        "- Customer-focused service",
        "- Organized order management",
        "- Commitment to quality and reliability",
        "",
        "Contact the Alka Drops team for service information.",
      ];

  const escapePDF = (text) =>
    text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const lines = content.slice(0, 37);

  const textCommands = [
    "BT",
    "/F1 19 Tf",
    "55 785 Td",
    `(${escapePDF(title)}) Tj`,
    "/F1 11 Tf",
    "0 -35 Td",
    ...lines.map((line) => `(${escapePDF(line)}) Tj\n0 -17 Td`),
    "ET",
  ].join("\n");

  const encoder = new TextEncoder();

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${encoder.encode(textCommands).length} >>\nstream\n${textCommands}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(encoder.encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = encoder.encode(pdf).length;

  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = isProfile
    ? "AlkaDrops-Company-Profile.pdf"
    : "AlkaDrops-Company-Brochure.pdf";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function PdfIcon() {
  return (
    <svg className="servicedetails-pdf-icon" viewBox="0 0 32 40" fill="none" aria-hidden="true">
      <path
        d="M5 1.5H20L29 10V36.5C29 37.6 28.1 38.5 27 38.5H5C3.9 38.5 3 37.6 3 36.5V3.5C3 2.4 3.9 1.5 5 1.5Z"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path d="M19.5 2V11H28" stroke="currentColor" strokeWidth="2.5" />
      <text x="5" y="27" fontSize="8" fontWeight="700" fill="currentColor">
        PDF
      </text>
    </svg>
  );
}

function DropIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2.5S5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 2.5 12 2.5Z" />
      <path d="M9 15a3 3 0 0 0 3 3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const Servicedetails = () => {
  const [activeService, setActiveService] = useState(0);

  const selectedService = services[activeService];

  const handleImageError = (event) => {
    if (event.currentTarget.src !== FALLBACK_IMAGE) {
      event.currentTarget.src = FALLBACK_IMAGE;
    }
  };

  return (
    <section className="servicedetails-section">
      <span className="servicedetails-bg servicedetails-bg-left" aria-hidden="true"></span>
      <span className="servicedetails-bg servicedetails-bg-right" aria-hidden="true"></span>

      <div className="servicedetails-layout">
        {/* ================= SIDEBAR ================= */}
        <aside className="servicedetails-sidebar">
          <div className="servicedetails-sidebar-card">
            <h2 className="servicedetails-sidebar-title">
              <span className="servicedetails-sidebar-icon">
                <DropIcon />
              </span>
              Our Services
            </h2>

            <div className="servicedetails-service-list">
              {services.map((service, index) => (
                <button
                  key={service.title}
                  type="button"
                  onClick={() => setActiveService(index)}
                  className={`servicedetails-service-button ${
                    activeService === index ? "servicedetails-service-active" : ""
                  }`}
                  aria-pressed={activeService === index}
                >
                  <span>{service.title}</span>
                  <span className="servicedetails-arrow">
                    <ArrowIcon />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* PDF downloads */}
          <div className="servicedetails-download-list">
            <button
              type="button"
              className="servicedetails-download-card"
              onClick={() => downloadServicePDF("profile")}
            >
              <PdfIcon />
              <span className="servicedetails-download-text">
                <strong>Company Profile</strong>
                <span>Download PDF</span>
              </span>
            </button>

            <button
              type="button"
              className="servicedetails-download-card"
              onClick={() => downloadServicePDF("brochure")}
            >
              <PdfIcon />
              <span className="servicedetails-download-text">
                <strong>Company Brochure</strong>
                <span>Download PDF</span>
              </span>
            </button>
          </div>

          {/* Help card */}
          <div className="servicedetails-help">
            <span className="servicedetails-help-glow" aria-hidden="true"></span>
            <div className="servicedetails-help-badge" aria-hidden="true">
              <small>pH</small>
              <strong>8.5+</strong>
            </div>
            <h3>Need pure water today?</h3>
            <p>Talk to the Alka Drops team and get free home delivery.</p>
            <a href="/contact">
              Contact Us
              <ArrowIcon />
            </a>
          </div>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="servicedetails-main" key={selectedService.title}>
          <div className="servicedetails-hero">
            <img
              className="servicedetails-main-image"
              src={selectedService.image}
              alt={selectedService.heading}
              loading="eager"
              onError={handleImageError}
            />
            <div className="servicedetails-hero-overlay" />
            <span className="servicedetails-hero-tag">{selectedService.tag}</span>
            <span className="servicedetails-hero-ph">
              <DropIcon /> pH 8.5+ Alkaline
            </span>
          </div>

          <article className="servicedetails-business">
            <div className="servicedetails-eyebrow">
              <DropIcon />
              <span>Alka Drops Service</span>
            </div>

            <h1 className="servicedetails-main-heading">{selectedService.heading}</h1>

            <p className="servicedetails-lead">{selectedService.description}</p>
            <p>{paragraph}</p>

            <ul className="servicedetails-points">
              {selectedService.points.map((point) => (
                <li key={point}>
                  <span>
                    <CheckIcon />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </article>

          {/* Feature cards */}
          <div className="servicedetails-feature-grid">
            <article className="servicedetails-feature-card">
              <div className="servicedetails-feature-icon">
                <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <path
                    d="M13 9C13 9 3 21 3 30a10 10 0 0020 0C23 21 13 9 13 9Z"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    d="M34 7C34 7 19 25 19 38a15 15 0 0030 0C49 25 34 7 34 7Z"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    d="M28 39l4 4 8-9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <h3>Pure &amp; Alkaline</h3>
                <p>
                  Clean, refreshing pH 8.5+ water with a smooth taste, made for
                  everyday hydration for the whole family.
                </p>
              </div>
            </article>

            <article className="servicedetails-feature-card servicedetails-feature-card-gold">
              <div className="servicedetails-feature-icon">
                <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <path
                    d="M6 16h30v26H6z"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M36 24h11l9 9v9H36z"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <circle cx="17" cy="46" r="5" stroke="currentColor" strokeWidth="3" />
                  <circle cx="46" cy="46" r="5" stroke="currentColor" strokeWidth="3" />
                </svg>
              </div>

              <div>
                <h3>Fast &amp; Reliable Delivery</h3>
                <p>
                  Free doorstep delivery with convenient scheduling that you can
                  count on, every single time.
                </p>
              </div>
            </article>
          </div>

          {/* Quality section */}
          <div className="servicedetails-quality-section">
            <div className="servicedetails-quality-image-wrap">
              <img
                src={drinkingWaterImage}
                alt="A person drinking clean drinking water"
                className="servicedetails-quality-image"
                loading="lazy"
                onError={handleImageError}
              />
              <span className="servicedetails-quality-chip">
                <DropIcon /> Sealed &amp; hygienic
              </span>
            </div>

            <div className="servicedetails-quality-content">
              <article className="servicedetails-quality-item">
                <span className="servicedetails-quality-icon">
                  <CheckIcon />
                </span>
                <div>
                  <h3>Quality Control System</h3>
                  <p>
                    We prioritize careful handling, hygiene and quality
                    procedures throughout our water delivery process, so you
                    get a dependable and convenient service.
                  </p>
                </div>
              </article>

              <article className="servicedetails-quality-item">
                <span className="servicedetails-quality-icon">
                  <CheckIcon />
                </span>
                <div>
                  <h3>Highly Professional Staff</h3>
                  <p>
                    Our team focuses on timely delivery, customer care and
                    responsible service practices for a smooth experience at
                    homes and businesses.
                  </p>
                </div>
              </article>
            </div>
          </div>

          {/* Final content */}
          <article className="servicedetails-final-content">
            <h3>Our Promise to You</h3>
            <p>{paragraph}</p>
            <p>{secondParagraph}</p>
          </article>

          {/* CTA */}
          <div className="servicedetails-cta">
            <span className="servicedetails-cta-glow" aria-hidden="true"></span>
            <div className="servicedetails-cta-text">
              <h3>Ready for fresh Alka Drops at your door?</h3>
              <p>Order today and enjoy pure alkaline water with free home delivery.</p>
            </div>
            <div className="servicedetails-cta-actions">
              <a className="servicedetails-cta-primary" href="/shop">
                Shop Now
                <ArrowIcon />
              </a>
              <a className="servicedetails-cta-secondary" href="/contact">
                Contact Us
              </a>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default Servicedetails;