import React from "react";
import { Droplet } from "lucide-react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";

import "./Team_Meet.css";

const teamMembers = [
  {
    id: 1,
    name: "Doris Jordan",
    role: "Founder & CEO",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Johnny Ramirez",
    role: "Operations Manager",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: 3,
    name: "Diana Wagner",
    role: "Customer Support Lead",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 4,
    name: "Harry Garrett",
    role: "Delivery Head",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: 5,
    name: "Doris Jordan",
    role: "Quality Control Expert",
    image: "https://randomuser.me/api/portraits/men/18.jpg",
  },
  {
    id: 6,
    name: "Johnny Ramirez",
    role: "Sales Executive",
    image: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    id: 7,
    name: "Diana Wagner",
    role: "Marketing Manager",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: 8,
    name: "Harry Garrett",
    role: "Logistics Coordinator",
    image: "https://randomuser.me/api/portraits/men/85.jpg",
  },
];

const socialLinks = [
  {
    name: "Facebook",
    icon: faFacebookF,
    url: "https://www.facebook.com/",
  },
  {
    name: "Instagram",
    icon: faInstagram,
    url: "https://www.instagram.com/",
  },
  {
    name: "LinkedIn",
    icon: faLinkedinIn,
    url: "https://www.linkedin.com/",
  },
];

const Team_Meet = () => {
  return (
    <section className="team-meet-section">
      {/* Decorative background */}
      <div className="team-meet-dots" aria-hidden="true" />

      <div
        className="team-meet-glow team-meet-glow-1"
        aria-hidden="true"
      />

      <div
        className="team-meet-glow team-meet-glow-2"
        aria-hidden="true"
      />

      <div className="team-meet-container">
        {/* Section heading */}
        <div className="team-meet-heading">
          <span className="team-meet-badge">
            <span className="team-meet-badge-dot" aria-hidden="true" />
            MEET OUR TEAM
          </span>

          <h2>
            The People Behind
            <br />
            <em>Alka Drops</em>
          </h2>

          <p>
            A dedicated team working every day to bring clean, safe pH 8.5+
            alkaline drinking water to your doorstep with care, convenience,
            and reliability.
          </p>
        </div>

        {/* Team members */}
        <div className="team-meet-grid">
          {teamMembers.map((member, index) => (
            <article
              className="team-meet-card"
              key={member.id}
              style={{ "--card-index": index }}
            >
              {/* Profile image */}
              <div className="team-meet-image-wrapper">
                <div className="team-meet-image-ring">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="team-meet-image"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <span className="team-meet-drop" aria-hidden="true">
                  <Droplet size={16} strokeWidth={2.4} />
                </span>
              </div>

              {/* Member information */}
              <div className="team-meet-info">
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>

              {/* Social media */}
              <div className="team-meet-social">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on ${social.name}`}
                    title={social.name}
                  >
                    <FontAwesomeIcon icon={social.icon} />
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* Bottom message */}
        <div className="team-meet-footer">
          <span className="team-meet-footer-icon" aria-hidden="true">
            <Droplet size={20} />
          </span>

          <p>
            <strong>Every drop matters.</strong> Every customer matters.
            That is the Alka Drops promise.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Team_Meet;