import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./Servicedetails.css";
import BreadCrumb from "../BreadCrumb/BreadCrumb";

const mainImage =
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=85";

const drinkingWaterImage =
  "https://images.pexels.com/photos/3124674/pexels-photo-3124674.jpeg?auto=compress&cs=tinysrgb&w=1000";

const services = [
  {
    title: "Tempor lorem interdum",
    heading: "Business Analysis",
    description:
      "Our business analysis services help improve water delivery operations, understand customer requirements, and create efficient service strategies.",
    image: mainImage,
  },
  {
    title: "Auctor mattis lacus",
    heading: "Water Quality Management",
    description:
      "We focus on maintaining water quality through responsible handling, hygiene practices, regular checks, and reliable distribution procedures.",
    image: drinkingWaterImage,
  },
  {
    title: "Dolor proin",
    heading: "Water Delivery Solutions",
    description:
      "Our delivery solutions help households and businesses receive their drinking water conveniently, with organized scheduling and dependable service.",
    image:
      "https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=1400",
  },
  {
    title: "Pharetra amet",
    heading: "Customer Support",
    description:
      "We help customers manage orders, delivery schedules, service enquiries, and other requirements through responsive customer support.",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85",
  },
];

const paragraph =
  "We believe that dependable water delivery begins with quality, consistency, and attention to customer needs. Our team works to make drinking water accessible through organized delivery, responsible handling, and professional service. We continuously focus on improving our processes to provide a convenient and dependable experience for every customer.";

function downloadServicePDF(type) {
  const isProfile = type === "profile";

  const title = isProfile
    ? "ALKADROPS - COMPANY PROFILE"
    : "ALKADROPS - COMPANY BROCHURE";

  const content = isProfile
    ? [
        "COMPANY PROFILE",
        "",
        "About Alka Drops",
        "Alka Drops provides drinking water delivery solutions for",
        "households, offices, and commercial customers.",
        "",
        "Our Services",
        "1. Drinking water delivery",
        "2. Water quality management",
        "3. Scheduled home and office deliveries",
        "4. Customer support and order assistance",
        "",
        "Our Commitment",
        "We aim to provide convenient, dependable water delivery",
        "with a focus on hygiene, service quality, and customer care.",
        "",
        "Our Vision",
        "To make access to drinking water convenient and reliable",
        "for every customer we serve.",
        "",
        "Contact",
        "For orders and enquiries, please contact the Alka Drops team.",
      ]
    : [
        "ALKADROPS - COMPANY BROCHURE",
        "",
        "PURE WATER. RELIABLE DELIVERY.",
        "",
        "DRINKING WATER DELIVERY",
        "Convenient water delivery for homes, offices, and businesses.",
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
        "questions, and service-related enquiries.",
        "",
        "WHY CHOOSE ALKA DROPS?",
        "- Convenient delivery solutions",
        "- Customer-focused service",
        "- Organized order management",
        "- Commitment to quality and reliability",
        "",
        "Contact the Alka Drops team for service information.",
      ];

  const escapePDF = (text) =>
    text
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");

  const lines = content.slice(0, 37);

  const textCommands = [
    "BT",
    "/F1 19 Tf",
    "55 785 Td",
    `(${escapePDF(title)}) Tj`,
    "/F1 11 Tf",
    "0 -35 Td",
    ...lines.map(
      (line) => `(${escapePDF(line)}) Tj\n0 -17 Td`
    ),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${new TextEncoder().encode(textCommands).length} >>\nstream\n${textCommands}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = new TextEncoder().encode(pdf).length;

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

const Servicedetails = () => {
  const [activeService, setActiveService] = useState(0);
  const location = useLocation();

  const selectedService = services[activeService];

  return (
    <>
      <section className="servicedetails-section">
        <div className="servicedetails-layout">

          {/* LEFT SIDEBAR */}

          <aside className="servicedetails-sidebar">
            <h2 className="servicedetails-sidebar-title">
              Popular Services
            </h2>

            {/* POPULAR SERVICES BUTTONS */}

            <div className="servicedetails-service-list">
              {services.map((service, index) => (
                <button
                  key={service.title}
                  type="button"
                  onClick={() => setActiveService(index)}
                  className={`servicedetails-service-button ${
                    activeService === index
                      ? "servicedetails-service-active"
                      : ""
                  }`}
                  aria-pressed={activeService === index}
                >
                  <span>{service.title}</span>
                  <span className="servicedetails-arrow">›</span>
                </button>
              ))}
            </div>

            {/* PDF DOWNLOAD CARDS */}

            <div className="servicedetails-download-list">
              <button
                type="button"
                className="servicedetails-download-card"
                onClick={() => downloadServicePDF("profile")}
              >
                <svg
                  className="servicedetails-pdf-icon"
                  viewBox="0 0 32 40"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 1.5H20L29 10V36.5C29 37.6 28.1 38.5 27 38.5H5C3.9 38.5 3 37.6 3 36.5V3.5C3 2.4 3.9 1.5 5 1.5Z"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M19.5 2V11H28"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />
                  <text
                    x="5"
                    y="27"
                    fontSize="8"
                    fontWeight="700"
                    fill="currentColor"
                  >
                    PDF
                  </text>
                </svg>

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
                <svg
                  className="servicedetails-pdf-icon"
                  viewBox="0 0 32 40"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 1.5H20L29 10V36.5C29 37.6 28.1 38.5 27 38.5H5C3.9 38.5 3 37.6 3 36.5V3.5C3 2.4 3.9 1.5 5 1.5Z"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M19.5 2V11H28"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />
                  <text
                    x="5"
                    y="27"
                    fontSize="8"
                    fontWeight="700"
                    fill="currentColor"
                  >
                    PDF
                  </text>
                </svg>

                <span className="servicedetails-download-text">
                  <strong>Company Brochure</strong>
                  <span>Download PDF</span>
                </span>
              </button>
            </div>
          </aside>

          {/* RIGHT MAIN CONTENT */}

          <main
            className="servicedetails-main"
            key={selectedService.title}
          >
            <img
              className="servicedetails-main-image"
              src={selectedService.image}
              alt={selectedService.heading}
              loading="eager"
            />

            <article className="servicedetails-business">
              <h1 className="servicedetails-main-heading">
                {selectedService.heading}
              </h1>

              <p>{selectedService.description}</p>
              <p>{paragraph}</p>
            </article>

            {/* TWO SERVICE FEATURE CARDS */}

            <div className="servicedetails-feature-grid">
              <article className="servicedetails-feature-card">
                <div className="servicedetails-feature-icon">
                  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                    <path
                      d="M13 9C13 9 3 21 3 30a10 10 0 0020 0C23 21 13 9 13 9Z"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M34 7C34 7 19 25 19 38a15 15 0 0030 0C49 25 34 7 34 7Z"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M28 39l4 4 8-9"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div>
                  <h3>Reports Analysis</h3>
                  <p>
                    Review service performance, delivery reports, and
                    customer requirements to improve daily operations.
                  </p>
                </div>
              </article>

              <article className="servicedetails-feature-card">
                <div className="servicedetails-feature-icon">
                  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                    <rect
                      x="8"
                      y="13"
                      width="20"
                      height="45"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M13 13V7H23V13M13 22H23M13 30H23M13 38H23"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M45 8C45 8 36 19 36 26a9 9 0 0018 0c0-7-9-18-9-18Z"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M40 27h10M41 23h8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M34 37l5 20h12l5-20M39 37l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div>
                  <h3>Project Reporting</h3>
                  <p>
                    Organize service updates, monitor delivery processes,
                    and maintain clear operational records.
                  </p>
                </div>
              </article>
            </div>

            {/* LOWER IMAGE AND QUALITY INFORMATION */}

            <div className="servicedetails-quality-section">
              <img
                src={drinkingWaterImage}
                alt="A person drinking clean drinking water"
                className="servicedetails-quality-image"
                loading="lazy"
              />

              <div className="servicedetails-quality-content">
                <article className="servicedetails-quality-item">
                  <h3>Quality Control System</h3>
                  <p>
                    We prioritize careful handling, hygiene, and quality
                    procedures throughout our water delivery process.
                    Our aim is to provide customers with a dependable
                    and convenient service experience.
                  </p>
                </article>

                <article className="servicedetails-quality-item">
                  <h3>Highly Professional Staff</h3>
                  <p>
                    Our team focuses on timely delivery, customer care,
                    and responsible service practices to help ensure a
                    smooth experience for homes and businesses.
                  </p>
                </article>
              </div>
            </div>

            {/* FINAL CONTENT */}

            <article className="servicedetails-final-content">
              <h3>Fermentum purus fermentum</h3>
              <p>{paragraph}</p>
              <p>{paragraph}</p>
            </article>
          </main>
        </div>
      </section>
    </>
  );
};

export default Servicedetails;