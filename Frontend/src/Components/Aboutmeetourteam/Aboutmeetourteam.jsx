import React from "react";
import "./Aboutmeetourteam.css";

const teamMembers = [
  {
    id: 1,
    name: "Doris Jordan",
    role: "Design Expert",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=90",
    alt: "Portrait of Doris Jordan",
  },
  {
    id: 2,
    name: "Johnny Ramirez",
    role: "Design Expert",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=90",
    alt: "Portrait of Johnny Ramirez",
  },
  {
    id: 3,
    name: "Diana Wagner",
    role: "Design Expert",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=90",
    alt: "Portrait of Diana Wagner",
  },
  {
    id: 4,
    name: "Harry Garrett",
    role: "Design Expert",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=90",
    alt: "Portrait of Harry Garrett",
  },
];

const Aboutmeetourteam = () => {
  return (
    <section className="about-team-section">
      <div className="about-team-container">
        {/* Section Heading */}
        <div className="about-team-heading">
          <span className="about-team-subtitle">MEET OUR TEAM</span>

          <h2>Our Creative Team</h2>
        </div>

        {/* Team Members */}
        <div className="about-team-grid">
          {teamMembers.map((member) => (
            <article className="about-team-card" key={member.id}>
              <div className="about-team-image-wrapper">
                <img
                  className="about-team-image"
                  src={member.image}
                  alt={member.alt}
                  loading="lazy"
                />
              </div>

              <div className="about-team-info">
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Aboutmeetourteam;