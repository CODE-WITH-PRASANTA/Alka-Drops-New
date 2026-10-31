
import React, { useState } from "react";
import "./FaqOne.css";

const FaqOne = () => {
  const [openFaq, setOpenFaq] = useState({
    section: null,
    index: null,
  });

  const toggleAccordion = (section, index) => {
    if (openFaq.section === section && openFaq.index === index) {
      setOpenFaq({ section: null, index: null });
    } else {
      setOpenFaq({ section, index });
    }
  };

  // General FAQs
  const generalFaqs = [
    {
      q: "Which are the best water suppliers in Bhubaneswar for home delivery?",
      a: "Alka Drops provides convenient drinking water delivery in Bhubaneswar for homes, offices, shops, and other regular-use locations. We focus on hygienic 20 litre water jars, dependable delivery schedules, and convenient doorstep service for customers in and around Bhubaneswar.",
    },
    {
      q: "Do you provide 20 litre water bottle delivery in Bhubaneswar?",
      a: "Yes. Alka Drops supplies 20 litre drinking water jars for homes and offices. Customers can contact us to know the current 20 litre water bottle price in Bhubaneswar, availability, delivery areas, and subscription options.",
    },
    {
      q: "Do you provide drinking water supply in Bhubaneswar?",
      a: "Yes. We provide drinking water supply for residential and commercial requirements. Whether you need a regular water jar for your home or multiple jars for an office, shop, event, or workplace, our team can help with suitable delivery arrangements.",
    },
    {
      q: "Can I get 20 litre water supply near me with home delivery?",
      a: "Customers looking for 20 litre water supply near me or drinking water supply near me can contact Alka Drops to check service availability in their Bhubaneswar location. We aim to make regular water jar delivery simple and convenient for local customers.",
    },
    {
      q: "Where is Alka Drops located in Bhubaneswar?",
      a: "Alka Drops is located at Plot-N5/22, Main Street, Block N5, IRC Village, Nayapalli, Bhubaneswar, Odisha 751012. Customers can contact us for drinking water supply, 20 litre water jars, delivery availability, and pricing information.",
    },
  ];

  // Pricing FAQs
  const pricingFaqs = [
    {
      q: "What is the price of a 20 litre water bottle in Bhubaneswar?",
      a: "The 20 litre water bottle price in Bhubaneswar can vary depending on the order type, quantity, delivery location, and applicable jar or service charges. Contact Alka Drops at +91 7327092477 for the latest price and delivery details.",
    },
    {
      q: "Do you offer wholesale mineral water prices for bulk orders?",
      a: "Yes. Customers requiring larger quantities of drinking water can contact Alka Drops for bulk and regular supply requirements. Wholesale pricing may depend on quantity, delivery location, and order frequency.",
    },
    {
      q: "Is there a deposit or additional charge for a 20 litre water jar?",
      a: "Any applicable jar deposit, replacement charge, or delivery-related fee may depend on the order and service arrangement. Please contact our team before placing your order so you can get the latest and most accurate information.",
    },
    {
      q: "How can I start regular drinking water delivery for my home or office?",
      a: "Starting regular water supply is simple. Contact Alka Drops on +91 7327092477, share your location and required quantity, and our team can guide you regarding available delivery schedules, jar requirements, pricing, and subscription arrangements.",
    },
    {
      q: "How can I contact the Bhubaneswar water supply helpline?",
      a: "For Alka Drops drinking water supply enquiries, 20 litre water jar orders, pricing, availability, and delivery support, call +91 7327092477. Our address is Plot-N5/22, Main Street, Block N5, IRC Village, Nayapalli, Bhubaneswar, Odisha 751012.",
    },
  ];

  const renderFaqs = (faqs, section) => (
    <div className="FaqOne-accordion-group">
      {faqs.map((item, index) => {
        const isOpen =
          openFaq.section === section && openFaq.index === index;

        return (
          <div className="FaqOne-accordion-item" key={`${section}-${index}`}>
            <button
              type="button"
              className="FaqOne-accordion-header"
              onClick={() => toggleAccordion(section, index)}
              aria-expanded={isOpen}
            >
              <span
                className={`FaqOne-toggle-icon ${
                  isOpen ? "FaqOne-active" : ""
                }`}
              >
                {isOpen ? "−" : "+"}
              </span>

              <span className="FaqOne-faq-question">
                {item.q}
              </span>
            </button>

            {isOpen && (
              <div className="FaqOne-accordion-content">
                <p>{item.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="FaqOne-section">

      {/* SECTION 1: GENERAL INFORMATION */}
      <section className="FaqOne-info-section">

        <div className="FaqOne-info-left-panel">

          <span className="FaqOne-info-eyebrow">
            ALKA DROPS • DRINKING WATER SUPPLY IN BHUBANESWAR
          </span>

          <h1 className="FaqOne-info-main-heading">
            Best Water Suppliers in Bhubaneswar – 20 Litre Water Bottle
            Suppliers with Home Delivery
          </h1>

          <p className="FaqOne-info-description">
            Looking for reliable drinking water supply in Bhubaneswar?
            Alka Drops provides convenient drinking water and 20 litre water
            jar delivery for homes, offices, shops, workplaces, and regular
            commercial requirements. Our focus is on hygienic water jars,
            convenient doorstep service, and dependable local delivery.
          </p>

          <p className="FaqOne-info-description">
            If you are searching for water suppliers in Bhubaneswar,
            20 litre water bottle suppliers in Bhubaneswar, or drinking water
            supply near me home delivery, Alka Drops is available to help you
            check current availability, pricing, and delivery options.
          </p>

          <ul className="FaqOne-info-features-list">
            <li>
              <span className="FaqOne-checkmark">✓</span>
              20 Litre Water Jar Supply for Homes & Offices
            </li>

            <li>
              <span className="FaqOne-checkmark">✓</span>
              Convenient Drinking Water Delivery in Bhubaneswar
            </li>

            <li>
              <span className="FaqOne-checkmark">✓</span>
              Regular & Bulk Water Supply Options
            </li>

            <li>
              <span className="FaqOne-checkmark">✓</span>
              Local Customer Support for Orders & Enquiries
            </li>

            <li>
              <span className="FaqOne-checkmark">✓</span>
              Delivery Availability Across Selected Bhubaneswar Locations
            </li>
          </ul>

          <h2 className="FaqOne-info-sub-heading">
            Reliable 20 Litre Water Jar Supplier in Bhubaneswar
          </h2>

          <p className="FaqOne-info-sub-description">
            Alka Drops makes it easier for families and businesses to arrange
            regular drinking water supply without the hassle of carrying heavy
            water jars. Our 20 litre jars are suitable for everyday hydration
            requirements at homes, offices, shops, and workplaces.
          </p>

          <p className="FaqOne-info-sub-description">
            For customers searching for a{" "}
            <strong>20 litre water jar supplier near Bhubaneswar</strong>,
            we provide local order support and can help you understand
            delivery availability, pricing, and quantity requirements before
            placing your order.
          </p>

          {/* BUSINESS CONTACT */}
          <div className="FaqOne-business-contact-box">

            <h3>Alka Drops – Drinking Water Supply in Bhubaneswar</h3>

            <p>
              <strong>Address:</strong>{" "}
              Plot-N5/22, Main Street, Block N5, IRC Village,
              Nayapalli, Bhubaneswar, Odisha 751012
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              <a href="tel:+917327092477">
                +91 7327092477
              </a>
            </p>

            <p>
              <strong>Service:</strong>{" "}
              20 Litre Water Jars, Drinking Water Supply,
              Home Delivery & Bulk Water Supply
            </p>

          </div>

        </div>

        {/* GENERAL FAQ */}
        <div className="FaqOne-info-right-panel">

          <h2 className="FaqOne-section-title">
            Drinking Water Supply FAQs in Bhubaneswar
          </h2>

          {renderFaqs(generalFaqs, "general")}

        </div>

      </section>

      {/* SECTION 2: PRICING & PAYMENT */}
      <section className="FaqOne-info-section FaqOne-pricing-section">

        <div className="FaqOne-info-left-panel FaqOne-center-btn-panel">

          <span className="FaqOne-info-eyebrow">
            20 LITRE WATER BOTTLE PRICE IN BHUBANESWAR
          </span>

          <h2 className="FaqOne-info-main-heading">
            Affordable Water Jar Supply for Homes & Businesses
          </h2>

          <p className="FaqOne-info-description">
            Need regular water jars for your home or workplace? Alka Drops
            offers convenient drinking water supply with options suitable for
            individual and bulk requirements. Pricing can vary according to
            quantity, delivery location, and order arrangement.
          </p>

          <p className="FaqOne-info-description">
            If you are comparing the{" "}
            <strong>
              20 litre water bottle suppliers in Bhubaneswar price
            </strong>
            , contact our team directly for the latest available rate instead
            of relying on outdated online pricing.
          </p>

          <h3 className="FaqOne-info-sub-heading">
            Water Supply for Homes, Offices & Bulk Requirements
          </h3>

          <p className="FaqOne-info-sub-description">
            From a single household jar to regular office requirements,
            we can help you understand the available supply options.
            Businesses and event organisers can also enquire about bulk
            drinking water requirements and wholesale pricing.
          </p>

          {/* PRICING CONTACT */}
          <div className="FaqOne-pricing-contact-card">

            <h3>Order or Enquire About Water Supply</h3>

            <p>
              Call Alka Drops for current pricing, delivery availability,
              and water jar requirements in Bhubaneswar.
            </p>

            <a
              href="tel:+917327092477"
              className="FaqOne-read-more-btn-blue"
            >
              Call +91 7327092477
            </a>

          </div>

        </div>

        {/* PRICING FAQ */}
        <div className="FaqOne-info-right-panel">

          <h2 className="FaqOne-section-title">
            Pricing, Delivery & Payment FAQs
          </h2>

          {renderFaqs(pricingFaqs, "pricing")}

        </div>

      </section>

      {/* SECTION 3: LOCAL SEO CONTENT */}
      <section className="FaqOne-local-seo-section">

        <h2>
          Drinking Water & 20 Litre Water Jar Delivery in Bhubaneswar
        </h2>

        <p>
          Alka Drops serves customers looking for dependable drinking water
          supply in Bhubaneswar. If you need a convenient source of packaged
          drinking water for your home, office, shop, workplace, or regular
          business requirement, our team can help you check suitable delivery
          options.
        </p>

        <p>
          Customers searching online for{" "}
          <strong>
            packaged drinking water manufacturers in Bhubaneswar
          </strong>
          ,{" "}
          <strong>
            packaged drinking water manufacturers in Odisha
          </strong>
          , or a{" "}
          <strong>
            mineral water dealer in Bhubaneswar
          </strong>
          {" "}can contact Alka Drops to understand our available products and
          local supply arrangements.
        </p>

        <p>
          We also cater to customers searching for{" "}
          <strong>
            wellness best water in Bhubaneswar
          </strong>
          ,{" "}
          <strong>
            wellness best drinking water in Bhubaneswar
          </strong>
          , and dependable drinking water for everyday use. Rather than
          choosing a supplier only on search results, customers can contact
          us directly to confirm current availability, pricing, and delivery
          coverage.
        </p>

        <p>
          For regular requirements, Alka Drops can also discuss bulk water
          supply and recurring orders. Whether you need a single 20 litre jar
          for your home or multiple jars for an office or event, our team is
          available to assist with your enquiry.
        </p>

        {/* LOCAL BUSINESS DETAILS */}
        <div className="FaqOne-local-business-details">

          <h3>Contact Alka Drops</h3>

          <p>
            <strong>Alka Drops</strong>
          </p>

          <p>
            Plot-N5/22, Main Street, Block N5, IRC Village,
            Nayapalli, Bhubaneswar, Odisha 751012
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            <a href="tel:+917327092477">
              +91 7327092477
            </a>
          </p>

        </div>

      </section>

    </div>
  );
};

export default FaqOne;
