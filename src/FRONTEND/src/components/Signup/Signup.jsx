"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./SignUp.css"
import { useNavigate } from "react-router-dom"
import { useToast } from '../Toast/ToastContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [learnerName, setLearnerName] = useState("")
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState(""); // <-- Add error state
  const navigate = useNavigate()
  const { error: showError } = useToast()

  // Redirect to login page after showing success message
  useEffect(() => {
    if (registrationSuccess) {
      const timer = setTimeout(() => {
        navigate("/start")
      }, 3000) // Redirect after 3 seconds

      return () => clearTimeout(timer)
    }
  }, [registrationSuccess, navigate])

  const validateEmail = (email) => {
    // Simple email regex for validation
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const handleRegister = () => {
    // Email format validation
    if (!validateEmail(email)) {
      const msg = "Please enter a valid email address.";
      showError(msg);
      setFormError(msg);
      return;
    }
    setFormError(""); // Clear previous error
    console.log(`Attempting registration for new Learner`)
    console.log(`Name: ${learnerName}`)
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)

    setIsLoading(true)

    // First check if user already exists
    axios
      .get(`${API_URL}/api/check-user/${email}`)
      .then((checkResponse) => {
        // If we get here, user exists
        setIsLoading(false)
        const msg = "Registration Failed: An account with this email address already exists. Please use a different email or sign in with your existing account.";
        showError(msg);
        setFormError(msg);
      })
      .catch((checkError) => {
        // If we get 404 or similar error, user doesn't exist, proceed with registration
        if (checkError.response && checkError.response.status === 404) {
          // User doesn't exist, proceed with registration
          axios
            .post(`${API_URL}/api/insert`, {
              full_name: learnerName,
              email,
              password,
              role: "learner",
            })
            .then((response) => {
              console.log("API Response:", response.data) // Debug log

              // More flexible success checking
              if (
                response.status === 200 ||
                response.status === 201 ||
                (response.data &&
                  (response.data.message?.toLowerCase().includes("success") ||
                    response.data.status === "success" ||
                    response.data.success === true ||
                    response.data.message === "Registration successful"))
              ) {
                console.log("Registration confirmed as successful")

                // Store the full name in localStorage for the dashboard
                localStorage.setItem("full_name", learnerName)
                localStorage.setItem("user_email", email)

                setRegistrationSuccess(true)
                setIsLoading(false)
                // Clear form fields
                setLearnerName("")
                setEmail("")
                setPassword("")
                setFormError(""); // Clear error on success
              } else {
                // If we get here, treat as error
                throw new Error(response.data?.message || "Registration failed")
              }
            })
            .catch((error) => {
              console.error("Registration error:", error)
              setIsLoading(false)
              let msg = "Registration Failed: Unknown error";
              if (error.response && error.response.data && error.response.data.message) {
                // Check for duplicate email error from backend
                if (error.response.data.message.toLowerCase().includes("duplicate") || 
                    error.response.data.message.toLowerCase().includes("already exists") ||
                    (error.response.data.message.toLowerCase().includes("email") && error.response.data.message.toLowerCase().includes("exist"))) {
                  msg = "Registration Failed: An account with this email address already exists. Please use a different email or sign in with your existing account.";
                } else {
                  msg = `Registration Failed: ${error.response.data.message}`;
                }
              }
              showError(msg);
              setFormError(msg);
            })
        } else {
          // Some other error occurred during user check
          console.error("User check error:", checkError)
          setIsLoading(false)
          let msg = "Registration Failed: Unable to verify email availability";
          if (checkError.response && checkError.response.data && checkError.response.data.message) {
            // Check if it's a duplicate/already exists error
            if (checkError.response.data.message.toLowerCase().includes("duplicate") || 
                checkError.response.data.message.toLowerCase().includes("already exists") ||
                (checkError.response.data.message.toLowerCase().includes("email") && checkError.response.data.message.toLowerCase().includes("exist"))) {
              msg = "Registration Failed: An account with this email address already exists. Please use a different email or sign in with your existing account.";
            } else {
              msg = `Registration Failed: ${checkError.response.data.message}`;
            }
          }
          showError(msg);
          setFormError(msg);
        }
      })
  }

  const handleHome = () => {
    window.location.href = "/" // Navigate to home page
  }

  // Show success message if registration is successful
  if (registrationSuccess) {
    return (
      <div className="signin-container">
        <div className="left-section">
          <div className="vision-mission">
            <div className="vision">
              <h3>Vision</h3>
              <p>
                To be a socially committed centre of learning, renowned for its excellence in quality higher education &
                research to foster holistic development of individuals.
              </p>
            </div>
            <div className="mission">
              <h3>Mission</h3>
              <p>
                To impart inclusive quality education to aspiring younger generation through the best of teaching and
                learning opportunities.
              </p>
              <p>
                To discover, nurture and enhance creativity and innovation in scientific, technical and managerial
                competencies.
              </p>
              <p>To provide an enabling environment to imbibe human values in research, and community involvement.</p>
            </div>
          </div>
        </div>

        <div className="right-section">
          <div className="school-title">
            <h1>
              ONLINE COURSE RECOMMENDATION
              <br />
              SYSTEM
            </h1>
          </div>

          <div className="signin-form">
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Registration Successful!</h2>
              <p>Welcome {learnerName}! Your learner account has been created successfully.</p>
              <p>You will be redirected to the login page in a few seconds...</p>
              <button onClick={() => navigate("/start")} className="login-button" style={{ marginTop: "20px" }}>
                Go to Login Now
              </button>
            </div>
          </div>

          <div className="powered-by">© {new Date().getFullYear()} | Learn Genie | All rights reserved.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="signin-container">
      <div className="left-section">
        <div className="vision-mission">
          <div className="vision">
            <h3>Vision</h3>
            <p>
              To be a socially committed centre of learning, renowned for its excellence in quality higher education &
              research to foster holistic development of individuals.
            </p>
          </div>
          <div className="mission">
            <h3>Mission</h3>
            <p>
              To impart inclusive quality education to aspiring younger generation through the best of teaching and
              learning opportunities.
            </p>
            <p>
              To discover, nurture and enhance creativity and innovation in scientific, technical and managerial
              competencies.
            </p>
            <p>To provide an enabling environment to imbibe human values in research, and community involvement.</p>
          </div>
        </div>
      </div>
      <div className="right-section">
        <button onClick={handleHome} className="home-button">
          Home
        </button>

        <div className="school-title">
          <h1>
            ONLINE COURSE RECOMMENDATION
            <br />
            SYSTEM
          </h1>
        </div>

        <div className="signin-form">
          <div className="registration-form">
            <div className="signin-header">
              <h2 className="signin-title">Register as Learner</h2>
            </div>
            {/* Display the fixed Learner role */}
            <div className="role-display">
              <span className="role-label">Role: </span>
              <span className="role-value">Learner</span>
            </div>
            {/* Display error message if present */}
            {formError && (
              <div className="form-error" style={{ color: 'red', marginBottom: '10px' }}>
                {formError}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Full Name:</label>
              <input
                type="text"
                value={learnerName}
                onChange={(e) => setLearnerName(e.target.value)}
                className="form-input"
                placeholder="Enter your full name"
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleRegister}
              disabled={!learnerName || !email || !password || isLoading}
              className="login-button"
            >
              {isLoading ? "Registering..." : "Register Learner Account"}
            </button>
            <div className="toggle-form-mode">
              <p>
                Already have an account?{" "}
                <span onClick={() => navigate("/start")} className="toggle-link">
                  Sign In
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="powered-by">© {new Date().getFullYear()} | Learn Genie | All rights reserved.</div>
      </div>
    </div>
  )
}