import React from "react";
import "./Team_Meet.css";

const teamMembers = [
  {
    id: 1,
    name: "Doris Jordan",
    role: "Design Expert",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Johnny Ramirez",
    role: "Design Expert",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: 3,
    name: "Diana Wagner",
    role: "Design Expert",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    id: 4,
    name: "Harry Garrett",
    role: "Design Expert",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: 5,
    name: "Doris Jordan",
    role: "Design Expert",
    image: "https://randomuser.me/api/portraits/men/18.jpg",
  },
  {
    id: 6,
    name: "Johnny Ramirez",
    role: "Design Expert",
    image: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    id: 7,
    name: "Diana Wagner",
    role: "Design Expert",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
  },
  {
    id: 8,
    name: "Harry Garrett",
    role: "Design Expert",
    image: "https://randomuser.me/api/portraits/men/85.jpg",
  },
];

const Team_Meet = () => {
  return (
    <section className="team-meet-section">
      <div className="team-meet-container">

        {/* SECTION HEADING */}
        <div className="team-meet-heading">
          <span>MEET OUR TEAM</span>
          <h2>Our Creative Team</h2>
        </div>

        {/* TEAM CARDS */}
        <div className="team-meet-grid">
          {teamMembers.map((member) => (
            <div className="team-meet-card" key={member.id}>

              <div className="team-meet-image-wrapper">
                <img
                  src={member.image}
                  alt={member.name}
                  className="team-meet-image"
                  loading="lazy"
                />
              </div>

              <div className="team-meet-info">
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Team_Meet;