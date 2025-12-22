import React, { useState } from 'react';
import axios from 'axios';
import './SignIn.css';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../Toast/ToastContext';

export default function SignIn() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(''); // Add error state
  const navigate=useNavigate();
  const { error: showError } = useToast();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
  };

  const handleLogin = () => {
  setFormError(''); // Clear previous error
  console.log(`Logging in as ${selectedRole}`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);

  // Convert role to lowercase to match backend storage
  const backendRole = selectedRole.toLowerCase();

  axios.post('http://localhost:5000/api/login', {
    email,
    password,
    role: backendRole
  }).then((response) => {
    if (response.data.message === 'Login successful') {
      const user = response.data.user;

      // Store the user data in localStorage
      localStorage.setItem('user', JSON.stringify(user));

      // Debug logging
      console.log('User role from backend:', user.role);
      console.log('User data:', user);

      // Navigate based on role (case-insensitive and handle variations)
      const userRole = user.role.toLowerCase();
      console.log('Processing role:', userRole);
      
      if (userRole === 'learner' || userRole === 'learner') {
        console.log('Navigating to Learner_Index');
        navigate('/Learner_Index');
      } else if (userRole === 'manager' || userRole === 'course manager') {
        console.log('Navigating to Course_Manager');
        navigate('/Course_Manager');
      } else if (userRole === 'admin') {
        console.log('Navigating to Admin');
        navigate('/Admin');
      } else {
        console.log('Unknown role, defaulting to Admin:', userRole);
        navigate('/Admin');
      }
    }
  }).catch((error) => {
    if (error.response && error.response.data && error.response.data.message) {
      showError(`Login Failed: ${error.response.data.message}`);
      setFormError(error.response.data.message); // Set error for UI
    } else {
      showError("Login Failed: Unknown error");
      setFormError("Login Failed: Unknown error"); // Set error for UI
    }
  });
};


  const handleBack = () => {
    setSelectedRole(null);
    setEmail('');
    setPassword('');
  };

  const handleHome = () => {
    // Navigate to home page - adjust the path as needed for your routing setup
    window.location.href = '/';
    // Or if using React Router: navigate('/');
  };

  return (
    <div className="signin-container">
      <div className="left-section">
        <div className="vision-mission">
          <div className="vision">
            <h3>Vision</h3>
            <p>To be a socially committed centre of learning, renowned for its excellence in quality higher education & research to foster holistic development of individuals.</p>
          </div>
          <div className="mission">
            <h3>Mission</h3>
            <p>To impart inclusive quality education to aspiring younger generation through the best of teaching and learning opportunities.</p>
            <p>To discover, nurture and enhance creativity and innovation in scientific, technical and managerial competencies.</p>
            <p>To provide an enabling environment to imbibe human values in research, and community involvement.</p>
          </div>
        </div>
      </div>

      <div className="right-section">
        <button onClick={handleHome} className="home-button">
          Home
        </button>
        
        <div className="school-title">
          <h1>ONLINE COURSE RECOMMENDATION<br />SYSTEM</h1>
        </div>

        <div className="signin-form">
          {!selectedRole ? (
            <div className="role-selection">
              <div className="role-buttons">
                <button
                  onClick={() => handleRoleSelect('learner')}
                  className="role-button Learner"
                >
                  Learner 
                </button>
                <button
                  onClick={() => handleRoleSelect('manager')}
                  className="role-button Course Manager"
                >
                  Course Manager   
                </button>
                <button
                  onClick={() => handleRoleSelect('admin')}
                  className="role-button Admin"
                >
                  Admin 
                </button>
              </div>
            </div>
          ) : (
            <div className="login-form">
              <div className="signin-header">
                <button onClick={handleBack} className="back-button">
                  ← Back
                </button>
                <h2 className="signin-title">Sign In</h2>
                <div></div>
              </div>
              {/* Show error message if present */}
              {formError && (
                <div className="form-error" style={{ color: 'red', marginBottom: '10px' }}>
                  {formError}
                </div>
              )}
              <div className="role-display">
                <span className="role-label">Selected Role: </span>
                <span className="role-value">{selectedRole}</span>
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
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={!email || !password}
                className="login-button"
              >
                Login as {selectedRole}
              </button>
            </div>
          )}
        </div>
          
        <div className="powered-by">
          © 2025 | Learn Genie | All rights reserved.
        </div>
      </div>
    </div>
  );
}