  import NavbarEg from "../Homeeg/NavbarEg";
  import "./Contact.css";
  import Tick from "./tickmark.gif";
  import { useState, useEffect, useRef } from "react";
  import contact_img from "./contact.svg";
  import axios from "axios";
  import { useToast } from '../Toast/ToastContext';

  const Contact = () => {
    const { error: showError } = useToast();

    const [userName, setUserName] = useState('');
    const [userMail, setUserMail] = useState('');
    const [userNo, setUserNo] = useState('');
    const [userMsg, setUserMsg] = useState('');

    const handleNameChange = (e) => {
      setUserName(e.target.value);
    };
    const handleMailChange = (e) => {
      setUserMail(e.target.value);
    };
    const handleNumberChange = (e) => {
      setUserNo(e.target.value);
    };
    const handleMsgChange = (e) => {
      setUserMsg(e.target.value);
    };


    const [sent, setSent] = useState(false);

    const handleSend = async () => {
      try {
        const response = await axios.post('http://localhost:5000/api/messages', {
          name: userName,
          email: userMail,
          number: userNo,
          message: userMsg
        });
        if (response.data && response.data.success) {
          setSent(true);
          setUserName('');
          setUserMail('');
          setUserNo('');
          setUserMsg('');
          setTimeout(() => {
            setSent(false);
          }, 2500);
        } else {
          showError('Failed to send message. Please try again.');
        }
      } catch (error) {
        showError('Failed to send message. Please try again.');
      }
    };

    // Navbar hide on scroll logic (same as HomeEg/About)
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
      <div className="contact-wrapper" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e6d2ee 0%, #c7d2fe 100%)' }}>
        <NavbarEg className={showNavbar ? "" : "navbar-hidden"} />

        {sent ? (
          <div className="thanks-msg fade-effect" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div style={{ background: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '2.5rem 3rem', textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', fontWeight: 600, color: '#059669', marginBottom: '1.5rem' }}>
                Thank You for reaching us!
                <span style={{ display: 'inline-block', marginLeft: '1rem', verticalAlign: 'middle' }}>
                  <img src={Tick} alt=".." style={{ height: '48px', width: '48px' }} />
                </span>
              </p>
              <p style={{ color: '#374151', fontSize: '1.1rem' }}>We appreciate your feedback and will get back to you soon.</p>
            </div>
          </div>
        ) : (
          <div className="background" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="contact-card" style={{ marginTop: '2rem' }}>
              <div className="contact-img">
                <img src={contact_img} alt=".." />
              </div>
              <div className="contact-form-section">
                <h2>Contact Us</h2>
                <form className="app-form" onSubmit={e => { e.preventDefault(); handleSend(); }}>
                  <div className="app-form-group">
                    <input
                      className="app-form-control"
                      name="userName"
                      placeholder="Your Name"
                      value={userName}
                      onChange={handleNameChange}
                      required
                    />
                  </div>
                  <div className="app-form-group">
                    <input
                      className="app-form-control"
                      name="userMail"
                      placeholder="Your Email"
                      value={userMail}
                      onChange={handleMailChange}
                      required
                    />
                  </div>
                  <div className="app-form-group">
                    <input
                      className="app-form-control"
                      name="userNo"
                      placeholder="Contact Number"
                      value={userNo}
                      onChange={handleNumberChange}
                      required
                    />
                  </div>
                  <div className="app-form-group message">
                    <textarea
                      className="app-form-control"
                      name="userMsg"
                      placeholder="Your Message"
                      value={userMsg}
                      onChange={handleMsgChange}
                      required
                    />
                  </div>
                  <div className="app-form-group buttons">
                    <button type="button" className="app-form-button" onClick={() => { setUserName(''); setUserMail(''); setUserNo(''); setUserMsg(''); }}>Cancel</button>
                    <button type="submit" className="app-form-button">Send</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        <div className="contact_tail">
          © {new Date().getFullYear()} | Learn Genie | All rights reserved.
        </div>
      </div>
    );
  };

  export default Contact;