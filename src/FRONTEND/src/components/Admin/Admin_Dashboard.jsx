import React, { useState, useEffect } from 'react';
import './Admin_Dashboard.css';
import logo from "./logo.png";
import {
  Users, BookOpen, UserCheck, PlusCircle, Trash2, Loader2,
  Info, XCircle, Pencil, LogOut, Mail
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// Remove jsPDF and html2canvas imports

const SIDEBAR_LINKS = [
  { key: 'dashboard', label: 'Dashboard', icon: <BookOpen size={20} /> },
  { key: 'user', label: 'User Management', icon: <Users size={20} /> },
  { key: 'managers', label: 'Course Managers', icon: <UserCheck size={20} /> },
  { key: 'course', label: 'Course Management', icon: <BookOpen size={20} /> },
  { key: 'feedback', label: 'Feedback', icon: <Mail size={20} /> },
  { key: 'settings', label: 'Settings', icon: <Pencil size={20} /> },
  // Removed Reports button
];

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#d8854f', '#d0ed57', '#a28fd0'
];

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalCourseManagers: 0,
    totalLearners: 0,
    totalPurchasedCourses: 0,
    totalCategories: 0,
  });
  const [learners, setLearners] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseManagers, setCourseManagers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [learnerSearch, setLearnerSearch] = useState("");
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState({
    full_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [learnerToDelete, setLearnerToDelete] = useState(null);
  const [showDeleteManagerConfirmation, setShowDeleteManagerConfirmation] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState(null);
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [newManager, setNewManager] = useState({ full_name: '', email: '', password: '' });
  const [addManagerLoading, setAddManagerLoading] = useState(false);
  const [editProfileTab, setEditProfileTab] = useState('profile');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ full_name: '', email: '', password: '' });
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [showAddLearnerModal, setShowAddLearnerModal] = useState(false);
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  // Reports tab state
  // Remove reportTab state and handleExportPDF function

  const API_BASE_URL = 'http://localhost:5000/api';

  // Get admin user from localStorage (simulate logged-in admin)
  const adminUser = JSON.parse(localStorage.getItem('user')) || { full_name: 'Admin', email: 'admin@example.com', role: 'admin' };
  const adminId = adminUser._id || adminUser.id;

  const [selectedLearner, setSelectedLearner] = useState(null);
  const [learnerCourses, setLearnerCourses] = useState([]);
  const [showLearnerModal, setShowLearnerModal] = useState(false);
  const [learnerCoursesLoading, setLearnerCoursesLoading] = useState(false);

  // Fetch learner's enrolled courses
  const fetchLearnerCourses = async (learner) => {
    setLearnerCoursesLoading(true);
    setLearnerCourses([]);
    try {
      const res = await fetch(`http://localhost:5000/api/purchased_courses/${learner._id}`);
      const data = await res.json();
      setLearnerCourses(data.courses || []);
    } catch (err) {
      setLearnerCourses([]);
    } finally {
      setLearnerCoursesLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      setMessage(null);
      try {
        const usersResponse = await fetch(`${API_BASE_URL}/users`);
        if (!usersResponse.ok) throw new Error(`HTTP error! status: ${usersResponse.status}`);
        const users = await usersResponse.json();

        const courseCountResponse = await fetch(`${API_BASE_URL}/course_count`);
        if (!courseCountResponse.ok) throw new Error(`HTTP error! status: ${courseCountResponse.status}`);
        const courseCountData = await courseCountResponse.json();

        const managersResponse = await fetch(`${API_BASE_URL}/users/managers`);
        if (!managersResponse.ok) throw new Error(`HTTP error! status: ${managersResponse.status}`);
        const managers = await managersResponse.json();

        const coursesResponse = await fetch(`${API_BASE_URL}/courses`);
        if (!coursesResponse.ok) throw new Error(`HTTP error! status: ${coursesResponse.status}`);
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);

        // Fetch feedbacks
        const feedbacksResponse = await fetch(`${API_BASE_URL}/messages`);
        if (!feedbacksResponse.ok) throw new Error(`HTTP error! status: ${feedbacksResponse.status}`);
        const feedbacksData = await feedbacksResponse.json();
        setFeedbacks(feedbacksData.feedbacks || []);

        // Fetch purchased course count
        const purchasedCountResponse = await fetch(`${API_BASE_URL}/purchased_course_count`);
        let purchasedCount = 0;
        if (purchasedCountResponse.ok) {
          const purchasedCountData = await purchasedCountResponse.json();
          purchasedCount = purchasedCountData.count || 0;
        }

        // Compute unique categories
        const uniqueCategories = Array.from(new Set((coursesData || []).map(c => c.category))).filter(Boolean);

        const learnersList = users.filter(user => user.role && user.role.toLowerCase() === 'learner');
        setLearners(learnersList);

        setStats({
          totalUsers: users.length,
          totalCourses: courseCountData.count,
          totalCourseManagers: managers.length,
          totalLearners: learnersList.length,
          totalPurchasedCourses: purchasedCount,
          totalCategories: uniqueCategories.length,
        });
        setCourseManagers(managers);
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err);
        setError(`Failed to load dashboard data: ${err.message}. Please ensure your backend is running.`);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [API_BASE_URL]);

  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirmation(false);
    console.log("Logged out");
    window.location.href = '/start';
  };

  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  const handleProfileDetailsUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const updateData = {
        full_name: editingProfile.full_name,
        email: editingProfile.email
      };
      const response = await fetch(`${API_BASE_URL}/users/${adminId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile.');
      const updatedUser = { ...adminUser, ...updateData, _id: adminId };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage('Profile updated successfully!');
      setShowEditProfileModal(false);
      setEditingProfile({
        ...editingProfile,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
      });
    } catch (err) {
      setError(`Error updating profile: ${err.message}`);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!editingProfile.current_password) {
      setError('Current password is required to change password.');
      return;
    }
    if (editingProfile.new_password !== editingProfile.confirm_password) {
      setError('New passwords do not match.');
      return;
    }
    try {
      const updateData = {
        current_password: editingProfile.current_password,
        new_password: editingProfile.new_password
      };
      const response = await fetch(`${API_BASE_URL}/users/${adminId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to change password.');
      setMessage('Password changed successfully!');
      setShowEditProfileModal(false);
      setEditingProfile({
        ...editingProfile,
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      setError(`Error changing password: ${err.message}`);
    }
  };

  const handleEditProfileCancel = () => {
    setShowEditProfileModal(false);
    setEditingProfile({
      full_name: adminUser.full_name || '',
      email: adminUser.email || '',
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setError(null);
    setMessage(null);
  };

  const handleDeleteLearner = async () => {
    setError(null);
    setMessage(null);
    if (!learnerToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${learnerToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete learner.');
      setLearners(learners.filter(learner => learner._id !== learnerToDelete._id));
      setShowDeleteConfirmation(false);
      setLearnerToDelete(null);
      setMessage(`Successfully deleted learner: ${learnerToDelete.full_name}`);
      setStats(prevStats => ({
        ...prevStats,
        totalLearners: prevStats.totalLearners - 1,
        totalUsers: prevStats.totalUsers - 1,
      }));
    } catch (err) {
      console.error("Error deleting learner:", err);
      setError(`Error deleting learner: ${err.message}`);
    }
  };

  const handleDeleteManager = async () => {
    setError(null);
    setMessage(null);
    if (!managerToDelete) return;
    try {
      // Delete manager
      const response = await fetch(`${API_BASE_URL}/users/${managerToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete manager.');
      // Delete all courses by manager
      await fetch(`${API_BASE_URL}/courses/by-manager/${managerToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      setCourseManagers(courseManagers.filter(m => m._id !== managerToDelete._id));
      setCourses(courses.filter(c => c.createdBy !== managerToDelete._id));
      setShowDeleteManagerConfirmation(false);
      setManagerToDelete(null);
      setMessage(`Successfully deleted manager: ${managerToDelete.full_name} and all their courses.`);
      setStats(prevStats => ({
        ...prevStats,
        totalCourseManagers: prevStats.totalCourseManagers - 1,
        totalUsers: prevStats.totalUsers - 1,
        totalCourses: courses.filter(c => c.createdBy !== managerToDelete._id).length
      }));
    } catch (err) {
      console.error("Error deleting manager and their courses:", err);
      setError(`Error deleting manager and their courses: ${err.message}`);
    }
  };

  // Sidebar navigation handler
  const handleSidebarClick = (key) => {
    setActiveSection(key);
  };

  // Remove handleExportPDF function

  if (loading) {
    return (
      <div className="admin-dashboard-container loading-state">
        <Loader2 className="loading-spinner" size={48} />
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" />
          <span>Admin</span>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR_LINKS.map(link => (
            <button
              key={link.key}
              className={`sidebar-link${activeSection === link.key ? ' active' : ''}`}
              onClick={() => handleSidebarClick(link.key)}
            >
              {link.icon}
              <span>{link.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-title">
            <h1>Admin Dashboard</h1>
          </div>
          <div className="admin-profile">
            <Users size={24} />
            <span>Admin</span>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={20} style={{ marginLeft: '8px' }} /> Logout
            </button>
          </div>
        </header>
        <div className="admin-content">
          {error && (
            <div className="message error-message">
              <Info size={20} />
              <p>{error}</p>
              <button className="close-message-btn" onClick={() => setError(null)}>×</button>
            </div>
          )}
          {message && (
            <div className="message success-message">
              <Info size={20} />
              <p>{message}</p>
              <button className="close-message-btn" onClick={() => setMessage(null)}>×</button>
            </div>
          )}
          {activeSection === 'dashboard' && (
            <section className="insights-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon-container blue">
                    <Users size={32} className="stat-icon" />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Total Learners</p>
                    <p className="stat-value">{stats.totalLearners}</p>
                  </div>
                  <button className="more-info-btn" onClick={() => setActiveSection('user')}>More info</button>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-container green">
                    <BookOpen size={32} className="stat-icon" />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Total Courses</p>
                    <p className="stat-value">{stats.totalCourses}</p>
                  </div>
                  <button className="more-info-btn" onClick={() => setActiveSection('course')}>More info</button>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-container purple">
                    <UserCheck size={32} className="stat-icon" />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Course Managers</p>
                    <p className="stat-value">{stats.totalCourseManagers}</p>
                  </div>
                  <button className="more-info-btn" onClick={() => setActiveSection('managers')}>More info</button>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-container emerald">
                    <Mail size={32} className="stat-icon" />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Feedback</p>
                    <p className="stat-value">{feedbacks.length}</p>
                  </div>
                  <button className="more-info-btn" onClick={() => setActiveSection('feedback')}>More info</button>
                </div>
              </div>
              {/* Pie chart for course distribution by category */}
              <div className="piechart-card" style={{ width: '100%', height: 350 }}>
                <h3 style={{marginBottom: 16, color: '#2563eb'}}>Course Distribution by Category</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={Object.entries(
                        courses.reduce((acc, c) => {
                          acc[c.category] = (acc[c.category] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([name, value]) => ({ name, value }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {Object.entries(
                        courses.reduce((acc, c) => {
                          acc[c.category] = (acc[c.category] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([name, value], index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
          {activeSection === 'user' && (
            <section className="manager-management-section">
              <h2 className="admin-section-title">User Management</h2>
              <div className="learners-table-container">
                <h3 className="admin-section-title">Learners List</h3>
                <div className="learners-table-header-bar">
                  <span className="learners-table-title">Learners List</span>
                  <input
                    className="learners-table-search"
                    type="text"
                    placeholder="Search by name or email..."
                    value={learnerSearch}
                    onChange={e => setLearnerSearch(e.target.value)}
                  />
                </div>
                <div className="learners-table-scroll">
                  <table className="learners-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {learners.filter(l =>
                        l.full_name.toLowerCase().includes(learnerSearch.toLowerCase()) ||
                        l.email.toLowerCase().includes(learnerSearch.toLowerCase())
                      ).length === 0 ? (
                        <tr><td colSpan="3" style={{textAlign:'center'}}>No learners found.</td></tr>
                      ) : (
                        learners.filter(l =>
                          l.full_name.toLowerCase().includes(learnerSearch.toLowerCase()) ||
                          l.email.toLowerCase().includes(learnerSearch.toLowerCase())
                        ).map(learner => (
                          <tr key={learner._id}>
                            <td>
                              <span
                                style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={async () => {
                                  setSelectedLearner(learner);
                                  setShowLearnerModal(true);
                                  await fetchLearnerCourses(learner);
                                }}
                              >
                                <Users className="learner-user-icon" />{learner.full_name}
                              </span>
                            </td>
                            <td>{learner.email}</td>
                            <td>
                              <button className="delete-btn" onClick={() => {
                                setLearnerToDelete(learner);
                                setShowDeleteConfirmation(true);
                              }}>
                                <Trash2 size={16} /> Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
          {/* Learner Details Modal */}
          {showLearnerModal && selectedLearner && (
            <div className="modal-overlay">
              <div className="modal-content edit-profile-modal" style={{maxWidth: 600}}>
                <div className="modal-header">
                  <h3>Learner Details</h3>
                  <button className="close-modal-btn" onClick={() => setShowLearnerModal(false)}><XCircle size={20} /></button>
                </div>
                <div className="learner-fullname" style={{
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: '#000', // Changed from '#2563eb' to black
                  marginBottom: 4,
                  textAlign: 'center'
                }}>
                  {selectedLearner.full_name}
                </div>
                <div style={{marginBottom: 16, textAlign: 'center', color: '#000'}}>
                  <b>Email:</b> {selectedLearner.email}
                </div>
                <h4 style={{ color: '#000' }}>Enrolled Courses</h4>
                {learnerCoursesLoading ? (
                  <div>Loading courses...</div>
                ) : learnerCourses.length === 0 ? (
                  <div>No enrolled courses found.</div>
                ) : (
                  <table className="learners-table" style={{marginTop: 8, color: '#000'}}>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Progress</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {learnerCourses.map(course => (
                        <tr key={course._id || course.id}>
                          <td>{course.title}</td>
                          <td>
                            <div style={{width: 120, background: '#e5e7eb', borderRadius: 6, overflow: 'hidden'}}>
                              <div style={{width: `${course.progress || 0}%`, background: '#2563eb', height: 8}}></div>
                            </div>
                            <span style={{fontSize: '0.9em', marginLeft: 8}}>{course.progress || 0}%</span>
                          </td>
                          <td>{course.progress === 100 ? 'Completed' : 'In Progress'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
          {activeSection === 'managers' && (
            <section className="manager-management-section">
              <h2 className="admin-section-title">Course Managers</h2>
              <button className="add-manager-btn" style={{marginBottom: 20}} onClick={() => setShowAddManagerModal(true)}>
                <PlusCircle size={18} style={{marginRight: 6}} /> Add Manager
              </button>
              <div className="managers-table-container">
                <h3 className="admin-section-title">Managers List</h3>
                {courseManagers.length === 0 ? (
                  <p>No course managers found.</p>
                ) : (
                  <table className="managers-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseManagers.map(manager => (
                        <tr key={manager._id}>
                          <td>{manager.full_name}</td>
                          <td>{manager.email}</td>
                          <td>{manager.role}</td>
                          <td>
                            <button className="delete-btn" onClick={() => {
                              setManagerToDelete(manager);
                              setShowDeleteManagerConfirmation(true);
                            }}>
                              <Trash2 size={16} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {showAddManagerModal && (
                <div className="modal-overlay">
                  <div className="modal-content edit-profile-modal">
                    <div className="modal-header">
                      <h3>Add New Course Manager</h3>
                      <button className="close-modal-btn" onClick={() => {
                        setShowAddManagerModal(false);
                        setNewManager({ full_name: '', email: '', password: '' });
                        setError(null);
                        setMessage(null);
                      }}><XCircle size={20} /></button>
                    </div>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      setError(null);
                      setMessage(null);
                      setAddManagerLoading(true);
                      try {
                        const response = await fetch(`${API_BASE_URL}/insert`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...newManager, role: 'manager' })
                        });
                        const data = await response.json();
                        if (!response.ok) throw new Error(data.message || 'Failed to add manager.');
                        setCourseManagers([...courseManagers, { ...data.user, _id: data.user.id }]);
                        setShowAddManagerModal(false);
                        setNewManager({ full_name: '', email: '', password: '' });
                        setMessage('Manager added successfully!');
                        setStats(prevStats => ({
                          ...prevStats,
                          totalCourseManagers: prevStats.totalCourseManagers + 1,
                          totalUsers: prevStats.totalUsers + 1
                        }));
                      } catch (err) {
                        setError(`Error adding manager: ${err.message}`);
                      } finally {
                        setAddManagerLoading(false);
                      }
                    }} className="modal-form">
                      <div className="form-group">
                        <label htmlFor="manager_full_name">Full Name:</label>
                        <input
                          type="text"
                          id="manager_full_name"
                          value={newManager.full_name}
                          onChange={e => setNewManager({ ...newManager, full_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="manager_email">Email:</label>
                        <input
                          type="email"
                          id="manager_email"
                          value={newManager.email}
                          onChange={e => setNewManager({ ...newManager, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="manager_password">Password:</label>
                        <input
                          type="password"
                          id="manager_password"
                          value={newManager.password}
                          onChange={e => setNewManager({ ...newManager, password: e.target.value })}
                          required
                        />
                      </div>
                      <div className="modal-actions">
                        <button type="submit" className="modal-confirm-btn" disabled={addManagerLoading}>{addManagerLoading ? 'Adding...' : 'Add Manager'}</button>
                        <button type="button" className="modal-cancel-btn" onClick={() => {
                          setShowAddManagerModal(false);
                          setNewManager({ full_name: '', email: '', password: '' });
                          setError(null);
                          setMessage(null);
                        }}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </section>
          )}
          {activeSection === 'course' && (
            <section className="course-management-section">
              <div className="courses-table-container">
                <div className="courses-table-header-bar">
                  <span className="courses-table-title">Courses List</span>
                  <input
                    className="courses-table-search"
                    type="text"
                    placeholder="Search by title or category..."
                    value={courseSearch || ''}
                    onChange={e => setCourseSearch && setCourseSearch(e.target.value)}
                  />
                </div>
                <div className="courses-table-head-row">
                  <div className="courses-table-head-cell">Title</div>
                  <div className="courses-table-head-cell">Category</div>
                  <div className="courses-table-head-cell">Duration</div>
                  <div className="courses-table-head-cell">Price</div>
                  <div className="courses-table-head-cell">Created By</div>
                </div>
                <div className="courses-table-scroll">
                  <table className="courses-table">
                    <tbody>
                      {(courses.filter ? courses.filter(course =>
                        (!courseSearch || course.title.toLowerCase().includes(courseSearch.toLowerCase()) || (course.category && course.category.toLowerCase().includes(courseSearch.toLowerCase())))
                      ) : courses).map(course => (
                        <tr key={course._id}>
                          <td>{course.title}</td>
                          <td>{course.category}</td>
                          <td>{course.duration}</td>
                          <td>{course.price}</td>
                          <td>{course.createdBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
          {activeSection === 'feedback' && (
            <section className="feedback-section">
              {feedbacks.length === 0 ? (
                <p>No feedback messages found.</p>
              ) : (
                <div className="feedback-table-container">
                  <div className="feedback-table-header-bar">
                    <span className="feedback-table-title">Feedback List</span>
                    <input
                      className="feedback-table-search"
                      type="text"
                      placeholder="Search by name or email..."
                      value={feedbackSearch || ''}
                      onChange={e => setFeedbackSearch && setFeedbackSearch(e.target.value)}
                    />
                  </div>
                  <div className="feedback-table-head-row">
                    <div className="feedback-table-head-cell">Name</div>
                    <div className="feedback-table-head-cell">Email</div>
                    <div className="feedback-table-head-cell">Number</div>
                    <div className="feedback-table-head-cell">Message</div>
                    <div className="feedback-table-head-cell">Date</div>
                  </div>
                  <div className="feedback-table-scroll">
                    <table className="feedback-table">
                      <tbody>
                        {(feedbacks.filter ? feedbacks.filter(fb =>
                          (!feedbackSearch || fb.name.toLowerCase().includes(feedbackSearch.toLowerCase()) || fb.email.toLowerCase().includes(feedbackSearch.toLowerCase()))
                        ) : feedbacks).map((fb) => (
                          <tr key={fb._id}>
                            <td>{fb.name}</td>
                            <td>{fb.email}</td>
                            <td>{fb.number}</td>
                            <td>{fb.message}</td>
                            <td>{fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}
          {activeSection === 'reports' && (
            <section className="reports-section">
              <h2 className="admin-section-title">System Reports</h2>
              <div className="reports-summary-cards">
                <div className="stat-card">
                  <div className="stat-icon-container blue">
                    <Users size={32} className="stat-icon" />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Total Users</p>
                    <p className="stat-value">{stats.totalUsers}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-container green">
                    <BookOpen size={32} className="stat-icon" />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Total Courses</p>
                    <p className="stat-value">{stats.totalCourses}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-container purple">
                    <UserCheck size={32} className="stat-icon" />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Course Managers</p>
                    <p className="stat-value">{stats.totalCourseManagers}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-container emerald">
                    <Mail size={32} className="stat-icon" />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Feedback</p>
                    <p className="stat-value">{feedbacks.length}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-container orange">
                    <BookOpen size={32} className="stat-icon" />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Purchased Courses</p>
                    <p className="stat-value">{stats.totalPurchasedCourses}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-container yellow">
                    <BookOpen size={32} className="stat-icon" />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Categories</p>
                    <p className="stat-value">{stats.totalCategories}</p>
                  </div>
                </div>
              </div>
              {/* Users Table */}
              <div className="reports-table-container">
                <h3>All Users</h3>
                <div className="reports-table-scroll">
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {learners.concat(courseManagers).map(user => (
                        <tr key={user._id}>
                          <td>{user.full_name}</td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Courses Table */}
              <div className="reports-table-container">
                <h3>All Courses</h3>
                <div className="reports-table-scroll">
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Duration</th>
                        <th>Price</th>
                        <th>Created By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map(course => (
                        <tr key={course._id}>
                          <td>{course.title}</td>
                          <td>{course.category}</td>
                          <td>{course.duration}</td>
                          <td>{course.price}</td>
                          <td>{course.createdBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Feedback Table */}
              <div className="reports-table-container">
                <h3>All Feedback</h3>
                <div className="reports-table-scroll">
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Message</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedbacks.map(fb => (
                        <tr key={fb._id}>
                          <td>{fb.name}</td>
                          <td>{fb.email}</td>
                          <td>{fb.message}</td>
                          <td>{fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
          {activeSection === 'settings' && (
            <section className="settings-section">
              <div className="section-header">
                <h2 className="admin-section-title">Admin Profile</h2>
                <button className="edit-profile-btn" onClick={() => {
                  setEditingProfile({
                    full_name: adminUser.full_name || '',
                    email: adminUser.email || '',
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                  });
                  setShowEditProfileModal(true);
                }}>
                  <Pencil size={20} /> Edit Profile
                </button>
                <button className="add-manager-btn" style={{marginLeft: 16}} onClick={() => setShowAddAdminModal(true)}>
                  <PlusCircle size={18} style={{marginRight: 6}} /> Add Admin
                </button>
              </div>
              <div className="admin-profile-card">
                <div className="admin-profile-row">
                  <span className="admin-profile-label">Name:</span> 
                  <span>{adminUser.full_name}</span>
                </div>
                <div className="admin-profile-row">
                  <span className="admin-profile-label">Email:</span> 
                  <span>{adminUser.email}</span>
                </div>
                <div className="admin-profile-row">
                  <span className="admin-profile-label">Role:</span> 
                  <span>{adminUser.role}</span>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {showEditProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content edit-profile-modal">
            <div className="modal-header">
              <h3>Edit Admin Profile</h3>
              <button className="close-modal-btn" onClick={handleEditProfileCancel}><XCircle size={20} /></button>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <button
                className={`modal-tab-btn${editProfileTab === 'profile' ? ' active' : ''}`}
                onClick={() => setEditProfileTab('profile')}
              >
                Edit Profile
              </button>
              <button
                className={`modal-tab-btn${editProfileTab === 'password' ? ' active' : ''}`}
                onClick={() => setEditProfileTab('password')}
              >
                Change Password
              </button>
            </div>
            {editProfileTab === 'profile' && (
              <form onSubmit={handleProfileDetailsUpdate} className="modal-form">
                <div className="form-group">
                  <label htmlFor="edit_full_name">Full Name:</label>
                  <input
                    type="text"
                    id="edit_full_name"
                    value={editingProfile.full_name}
                    onChange={(e) => setEditingProfile({ ...editingProfile, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit_email">Email:</label>
                  <input
                    type="email"
                    id="edit_email"
                    value={editingProfile.email}
                    onChange={(e) => setEditingProfile({ ...editingProfile, email: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="modal-confirm-btn">Update Profile</button>
                  <button type="button" className="modal-cancel-btn" onClick={handleEditProfileCancel}>Cancel</button>
                </div>
              </form>
            )}
            {editProfileTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="modal-form">
                <div className="form-group">
                  <label htmlFor="current_password">Current Password:</label>
                  <input
                    type="password"
                    id="current_password"
                    value={editingProfile.current_password}
                    onChange={(e) => setEditingProfile({ ...editingProfile, current_password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new_password">New Password:</label>
                  <input
                    type="password"
                    id="new_password"
                    value={editingProfile.new_password}
                    onChange={(e) => setEditingProfile({ ...editingProfile, new_password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirm_password">Confirm New Password:</label>
                  <input
                    type="password"
                    id="confirm_password"
                    value={editingProfile.confirm_password}
                    onChange={(e) => setEditingProfile({ ...editingProfile, confirm_password: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="modal-confirm-btn">Change Password</button>
                  <button type="button" className="modal-cancel-btn" onClick={handleEditProfileCancel}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button className="close-modal-btn" onClick={() => {
                setShowDeleteConfirmation(false);
                setLearnerToDelete(null);
              }}><XCircle size={20} /></button>
            </div>
            <p className="confirmation-text">
              Are you sure you want to delete learner: <strong>{learnerToDelete?.full_name}</strong>?
            </p>
            <div className="modal-actions">
              <button className="modal-confirm-btn delete-confirm-btn" onClick={handleDeleteLearner}>
                Delete
              </button>
              <button className="modal-cancel-btn" onClick={() => {
                setShowDeleteConfirmation(false);
                setLearnerToDelete(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteManagerConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button className="close-modal-btn" onClick={() => {
                setShowDeleteManagerConfirmation(false);
                setManagerToDelete(null);
              }}><XCircle size={20} /></button>
            </div>
            <p className="confirmation-text">
              Are you sure you want to delete manager: <strong>{managerToDelete?.full_name}</strong> and <strong>all courses created by them</strong>?
            </p>
            <div className="modal-actions">
              <button className="modal-confirm-btn delete-confirm-btn" onClick={handleDeleteManager}>
                Delete
              </button>
              <button className="modal-cancel-btn" onClick={() => {
                setShowDeleteManagerConfirmation(false);
                setManagerToDelete(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAddAdminModal && (
        <div className="modal-overlay">
          <div className="modal-content edit-profile-modal">
            <div className="modal-header">
              <h3>Add New Admin</h3>
              <button className="close-modal-btn" onClick={() => {
                setShowAddAdminModal(false);
                setNewAdmin({ full_name: '', email: '', password: '' });
                setError(null);
                setMessage(null);
              }}><XCircle size={20} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setMessage(null);
              setAddAdminLoading(true);
              try {
                const response = await fetch(`${API_BASE_URL}/insert`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...newAdmin, role: 'admin' })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to add admin.');
                setShowAddAdminModal(false);
                setNewAdmin({ full_name: '', email: '', password: '' });
                setMessage('Admin added successfully!');
              } catch (err) {
                setError(`Error adding admin: ${err.message}`);
              } finally {
                setAddAdminLoading(false);
              }
            }} className="modal-form">
              <div className="form-group">
                <label htmlFor="admin_full_name">Full Name:</label>
                <input
                  type="text"
                  id="admin_full_name"
                  value={newAdmin.full_name}
                  onChange={e => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="admin_email">Email:</label>
                <input
                  type="email"
                  id="admin_email"
                  value={newAdmin.email}
                  onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="admin_password">Password:</label>
                <input
                  type="password"
                  id="admin_password"
                  value={newAdmin.password}
                  onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="modal-confirm-btn" disabled={addAdminLoading}>{addAdminLoading ? 'Adding...' : 'Add Admin'}</button>
                <button type="button" className="modal-cancel-btn" onClick={() => {
                  setShowAddAdminModal(false);
                  setNewAdmin({ full_name: '', email: '', password: '' });
                  setError(null);
                  setMessage(null);
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogoutConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h3>Confirm Logout</h3>
              <button className="close-modal-btn" onClick={cancelLogout}><XCircle size={20} /></button>
            </div>
            <p className="confirmation-text">
              Are you sure you want to logout?
            </p>
            <div className="modal-actions">
              <button className="modal-confirm-btn delete-confirm-btn" onClick={confirmLogout}>
                Logout
              </button>
              <button className="modal-cancel-btn" onClick={cancelLogout}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
