import React, { useEffect, useRef, useState } from "react";
import "./About.css";
import NavbarEg from "../Homeeg/NavbarEg";

export default function About() {
  // Navbar hide on scroll logic (same as HomeEg)
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(window.scrollY);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 50) {
        setShowNavbar(true);
        lastScrollY.current = window.scrollY;
        return;
      }
      if (window.scrollY > lastScrollY.current) {
        setShowNavbar(false); // scrolling down
      } else {
        setShowNavbar(true); // scrolling up
      }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="about-container">
      <NavbarEg className={showNavbar ? "" : "navbar-hidden"} />
      <div className="about-content">
        <h1>About This Project</h1>
        <p>
          This Online Course Recommendation System is a web-based platform designed
          to help users discover courses tailored to their interests and academic
          background. The system uses artificial intelligence and external course APIs
          to provide personalized recommendations, making the learning process more
          efficient and engaging.
        </p>
        <p>
          Users can register and log in to update their profiles with academic details
          and personal interests. Based on this information, the system recommends
          relevant online courses. Course Managers handle course listings, updates,
          and payments, while the Admin oversees the entire system — managing users,
          monitoring learning activity, and maintaining overall platform integrity.
        </p>
        <p>
          Built with the MERN stack (MongoDB, Express.js, React.js, Node.js), the
          project aims to bridge the gap between learners and the rapidly growing
          world of online education.
        </p>
      </div>
      <footer className="about-footer">
        © {new Date().getFullYear()} | Learn Genie | All rights reserved.
      </footer>
    </div>
  );
}
