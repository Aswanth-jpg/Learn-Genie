import "./homeeg.css";
import svg1 from "./Online_learning.gif";
import Numbers1 from "./Numbers1";
import { useEffect, useRef, useState } from "react";
import Piechart from "./Piechart";
import NavbarEg from "./NavbarEg";
import { NavLink } from "react-router-dom";
import Scroll from "./scroll.png";
import UdacityLogo from "./udacity.png";
import UdemyLogo from "./udemylogo.png";
import Coursera from "./coursera.png";
import { motion } from "framer-motion";

const HomeEg = () => {
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
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const analysisRef = useRef(null);
  const footerRef = useRef(null);
  const handleScroll = () => {
    if (footerRef.current) {
      footerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="modern-home-wrapper">
      <NavbarEg className={showNavbar ? "" : "navbar-hidden"} />

      {/* Hero Section */}
      <section className="modern-hero-section">
        <div className="modern-hero-content">
          <motion.h1
            className="modern-hero-title"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            Learn Genie
          </motion.h1>

          <motion.p
            className="modern-hero-subtitle"
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Bringing You to the Top Rated Courses
          </motion.p>

          <motion.p
            className="modern-hero-desc"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Learn Genie serves as a comprehensive platform,
            offering a centralized solution for accessing a diverse array of courses from various online learning platforms.
            By consolidating educational offerings in one place, it simplifies the search and enrollment process for learners,
            providing a seamless and efficient experience.
          </motion.p>

          <NavLink to="/register">
            <motion.button
              className="modern-hero-cta"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Get Started
            </motion.button>
          </NavLink>
        </div>

        <motion.div
          className="modern-hero-image"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src={svg1} alt="Online Learning" />
        </motion.div>

        <div className="scroll-btn-wrapper hero-scroll-btn">
          <button className="scroll-btn" onClick={handleScroll} aria-label="Scroll to analysis">
            <img src={Scroll} alt="Scroll Down" />
          </button>
        </div>
      </section>

      {/* Courses Info & Piechart Section */}
      <motion.h2
        className="modern-piechart-section-title"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Courses Information
      </motion.h2>

      <div className="modern-piechart-courses-row" ref={analysisRef}>
        <motion.div
          className="modern-piechart-card"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="modern-piechart-inner">
            <Piechart />
          </div>
        </motion.div>

        <div className="modern-courses-cards-row">
          {/* You can wrap individual cards in motion.div if you want staggered animation */}
          <div className="modern-course-card coursera-card">
            <img src={Coursera} alt="Coursera" />
            <div>
              <div className="modern-course-card-label">Coursera</div>
              <div className="modern-course-card-count">Number of Courses: 1200</div>
            </div>
          </div>

          <div className="modern-course-card udemy-card">
            <img src={UdemyLogo} alt="Udemy" />
            <div>
              <div className="modern-course-card-label">Udemy</div>
              <div className="modern-course-card-count">Number of Courses: 5500</div>
            </div>
          </div>

          <div className="modern-course-card udacity-card">
            <img src={UdacityLogo} alt="Udacity" />
            <div>
              <div className="modern-course-card-label">Udacity</div>
              <div className="modern-course-card-count">Number of Courses: 300</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="modern-features-section">
        <motion.h2
          className="modern-features-title"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Why Choose Learn Genie?
        </motion.h2>

        <div className="modern-features-list">
          {["📚", "🔍", "✨", "⚡"].map((icon, i) => (
            <motion.div
              key={i}
              className="modern-feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.2 }}
            >
              <span className="modern-feature-icon">{icon}</span>
              <h3>{["Comprehensive Catalog", "Cross-Platform Comparison", "Personalized Recommendations", "Streamlined Experience"][i]}</h3>
              <p>{["Access thousands of courses from top platforms in one place.", "Compare courses across providers to find your best fit.", "Get suggestions tailored to your learning goals.", "Enjoy a seamless, user-friendly interface for all your needs."][i]}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Platform Section */}
      <section className="modern-platforms-section">
        <motion.h2
          className="modern-platforms-title"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Our Course Partners
        </motion.h2>

        <div className="modern-platforms-list">
          {[
            {
              img: Coursera,
              name: "Coursera",
              desc: "1200+ curated courses from world-class universities and companies."
            },
            {
              img: UdemyLogo,
              name: "Udemy",
              desc: "5500+ courses for every skill level and interest."
            },
            {
              img: UdacityLogo,
              name: "Udacity",
              desc: "300+ unique courses from various providers."
            }
          ].map((partner, i) => (
            <motion.div
              key={i}
              className="modern-platform-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.2 }}
            >
              <img src={partner.img} alt={partner.name} />
              <h3>{partner.name}</h3>
              <p>{partner.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="modern-footer" ref={footerRef}>
      <p>© {new Date().getFullYear()} | Learn Genie | All rights reserved.</p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'center', marginBottom: '0.5rem' }}>
          <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" title="YouTube" style={{ color: '#ff0000' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.8 8.001a2.75 2.75 0 0 0-1.93-1.94C18.2 6 12 6 12 6s-6.2 0-7.87.06A2.75 2.75 0 0 0 2.2 8.001 28.7 28.7 0 0 0 2 12a28.7 28.7 0 0 0 .2 3.999 2.75 2.75 0 0 0 1.93 1.94C5.8 18 12 18 12 18s6.2 0 7.87-.06a2.75 2.75 0 0 0 1.93-1.94A28.7 28.7 0 0 0 22 12a28.7 28.7 0 0 0-.2-3.999zM10 15.5v-7l6 3.5-6 3.5z" fill="currentColor"/></svg>
          </a>
          <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" title="Twitter" style={{ color: '#1da1f2' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.38-.58 2.17 0 1.5.76 2.82 1.92 3.6-.7-.02-1.36-.21-1.94-.53v.05c0 2.1 1.5 3.85 3.5 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.1 2.94 3.95 2.97A8.6 8.6 0 0 1 2 19.54c-.32 0-.63-.02-.94-.06A12.13 12.13 0 0 0 8.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 22.46 6z" fill="currentColor"/></svg>
          </a>
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" title="Instagram" style={{ color: '#E4405F' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.13.62a1.13 1.13 0 1 1-2.25 0 1.13 1.13 0 0 1 2.25 0z" fill="currentColor"/></svg>
          </a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ color: '#0077b5' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20h-3v-10h3v10zm-1.5-11.27c-.97 0-1.75-.79-1.75-1.76 0-.97.78-1.76 1.75-1.76s1.75.79 1.75 1.76c0 .97-.78 1.76-1.75 1.76zm15.25 11.27h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.88v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.59z" fill="currentColor"/></svg>
          </a>
        </div>

      </footer>
    </div>
  );
};

export default HomeEg;
