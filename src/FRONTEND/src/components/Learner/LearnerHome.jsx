"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import {
  Search,
  BookOpen,
  Clock,
  Star,
  User,
  Bell,
  Trophy,
  PlayCircle,
  TrendingUp,
  Users,
  Award,
  PlusCircle,
  LayoutDashboard,
  GraduationCap,
  Lightbulb,
  LogOut,
} from "lucide-react"
import "./LearnerHome.css"
import logo from "./logo.png"
import axios from "axios"
import { useToast } from '../Toast/ToastContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactStars from 'react-rating-stars-component';

// API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- Helper function to extract YouTube video ID ---
function extractYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// --- Self-contained YouTube Player Component (with Progress Tracking) ---
function YouTubePlayer({ videoId, onVideoEnd, onProgressUpdate }) {
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const progressInterval = useRef(null);

  useEffect(() => {
    let playerInstance = null;

    const createPlayer = () => {
      if (!playerContainerRef.current) return;
      playerInstance = new window.YT.Player(playerContainerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
        },
        events: {
          'onStateChange': (event) => {
            clearInterval(progressInterval.current);

            if (event.data === window.YT.PlayerState.PLAYING) {
              progressInterval.current = setInterval(() => {
                const player = playerInstance;
                if (player && typeof player.getCurrentTime === 'function') {
                  const currentTime = player.getCurrentTime();
                  const duration = player.getDuration();
                  if (duration > 0) {
                    const percentage = (currentTime / duration) * 100;
                    onProgressUpdate(percentage);
                  }
                }
              }, 2000);
            }

            if (event.data === window.YT.PlayerState.ENDED) {
              onProgressUpdate(100);
              if (onVideoEnd) onVideoEnd();
            }
          },
        },
      });
      playerRef.current = playerInstance;
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      window.onYouTubeIframeAPIReady = createPlayer;
      document.body.appendChild(tag);
    } else {
      createPlayer();
    }

    // Cleanup on component unmount
    return () => {
      clearInterval(progressInterval.current);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
    };
    // Only run when videoId changes
    // eslint-disable-next-line
  }, [videoId]);

  return <div ref={playerContainerRef} style={{ width: '100%', height: '100%' }} />;
}

export default function App() {
  const { success: showSuccess, error: showError, warning: showWarning } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState(null);

  // State for learner profile
  const [academicDetails, setAcademicDetails] = useState({
    twelfthStream: "",
    degree: "",
    postGrad: "",
  });
  const [areasOfInterest, setAreasOfInterest] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);

  // All available categories for filtering and interests
  const categories = [
    "all", "Development", "Data Science", "AI/ML", "Design",
    "Marketing", "Cloud", "Security", "Business", "Finance",
  ];

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // State for YouTube Modal and Progress Tracking
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const lastUpdateTime = useRef(0);

  // Function to handle progress updates from the YouTube player
  const handleProgressUpdate = (courseId, progress) => {
    if (!courseId) return;

    const roundedProgress = Math.round(progress);

    // Update UI immediately for a responsive feel
    setEnrolledCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === courseId ? { ...course, progress: roundedProgress } : course
      )
    );

    // Throttle backend updates to once every 5 seconds
    const now = Date.now();
    if (now - lastUpdateTime.current > 5000) {
      lastUpdateTime.current = now;
      updateCourseProgress(courseId, roundedProgress);
    }
  };

  const handleEnroll = (courseId) => {
    const courseraCourse = courseraCourses.find((c) => c.id === courseId);
    if (courseraCourse) {
      window.open(courseraCourse.url, '_blank');
      return;
    }
    const courseToEnroll = courses.find((c) => c.id === courseId || c._id === courseId);
    if (courseToEnroll && !enrolledCourses.some((c) => c.id === courseId)) {
      const newCourse = {
        ...courseToEnroll,
        progress: 0,
        totalLessons: Math.floor(Math.random() * 30) + 20,
        completedLessons: 0,
        nextLesson: "Introduction to " + (courseToEnroll.title?.split(" ")[0] || "Course"),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        thumbnail: courseToEnroll.title?.charAt(0)?.toUpperCase() || 'C',
      };
      setEnrolledCourses([...enrolledCourses, newCourse]);
      showSuccess(`Successfully enrolled in ${courseToEnroll.title}! Check your "My Courses" tab.`);
    } else if (enrolledCourses.some((c) => c.id === courseId)) {
      showWarning(`You are already enrolled in ${courseToEnroll.title}.`);
    }
  };

  const totalProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce(
            (sum, course) => sum + (typeof course.progress === 'number' && !isNaN(course.progress) ? course.progress : 0),
            0
          ) / enrolledCourses.length
        )
      : 0;

  const completedCoursesCount = enrolledCourses.filter((course) => course.progress === 100).length;

  const handleAcademicChange = (e) => {
    const { name, value } = e.target;
    setAcademicDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("full_name");
    localStorage.removeItem("user_email");
    window.location.href = "/start";
  };

  const [name, setName] = useState('');

  const getName = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userobj = JSON.parse(storedUser);
      setName(userobj.full_name);
    }
  };

  const getCourses = () => {
    setCoursesLoading(true);
    axios.post(`${API_URL}/api/get_courses`)
      .then((response) => {
        setCourses(response.data);
        setCoursesLoading(false);
      }).catch((error) => {
        console.error(error);
        setCoursesLoading(false);
      });
  };

  const [userMap, setUserMap] = useState({});

  const fetchUserMap = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users`);
      if (Array.isArray(response.data)) {
        const map = {};
        response.data.forEach(user => {
          if (user._id) map[user._id] = user.full_name || user.email;
          if (user.email) map[user.email] = user.full_name || user.email;
        });
        setUserMap(map);
      }
    } catch (error) {
      setUserMap({});
      console.error('Error fetching users for manager map:', error);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      setProfileLoading(true);
      const res = await axios.get(`${API_URL}/api/user_profile/${userId}`);
      if (res.data && res.data.profile) {
        setAcademicDetails({
          twelfthStream: res.data.profile.twelfthStream || "",
          degree: res.data.profile.degree || "",
          postGrad: res.data.profile.postGrad || "",
        });
        setAreasOfInterest(res.data.profile.areasOfInterest || []);
      }
      setProfileLoading(false);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    getName();
    getCourses();
    fetchUserMap();
    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser).id : null;
    if (userId) {
      axios.get(`${API_URL}/api/purchased_courses/${userId}`)
        .then((response) => {
          if (response.data && response.data.courses) {
            setEnrolledCourses(response.data.courses.map(course => ({
              ...course,
              id: course._id || course.id,
              youtubeLink: course.youtubeLink,
              thumbnail: course.title?.charAt(0)?.toUpperCase() || 'C',
              progress: typeof course.progress === 'number' ? course.progress : 0,
            })));
          }
        })
        .catch((error) => {
          showError('Error fetching purchased courses.');
          console.error('Error fetching purchased courses:', error);
        });
      fetchUserProfile(userId);
    }
  }, []);

  const userAvatarInitials = name
    ? name.split(" ").map((n) => n.charAt(0).toUpperCase()).join("").substring(0, 2)
    : "U";

  const [courseraCourses, setCourseraCourses] = useState([]);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreError, setExploreError] = useState(null);

  const fetchCourseraCourses = async () => {
    setExploreLoading(true);
    setExploreError(null);
    try {
      let url = `${API_URL}/api/coursera/courses?page=1&limit=100`;
      const response = await axios.get(url);
      setCourseraCourses(response.data.courses || []);
    } catch (err) {
      setExploreError('Failed to load Coursera courses');
      setCourseraCourses([]);
    } finally {
      setExploreLoading(false);
    }
  };

  const filteredCourseraCourses = courseraCourses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || (course.category && course.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    return matchesSearch && matchesCategory;
  });

  const filteredDbCourses = courses
    .map((course) => ({
      id: course._id || course.id,
      title: course.title,
      instructor: course.instructor || 'Learn Genie',
      description: course.description || '',
      category: course.category || '',
      duration: course.duration || '',
      rating: course.rating || 'N/A',
      students: course.students || 0,
      price: course.price || 'Free',
      level: course.level || 'Beginner',
      url: '',
      platform: 'Learn Genie',
      thumbnail: course.title?.charAt(0)?.toUpperCase() || 'C',
      createdBy: course.createdBy,
      youtubeLink: course.youtubeLink,
    }))
    .filter((course) => {
      const matchesSearch =
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

  const [purchasedCourseIds, setPurchasedCourseIds] = useState([]);

  useEffect(() => {
    const courseIds = enrolledCourses.map(course => course.id || course._id).filter(Boolean);
    setPurchasedCourseIds(courseIds);
  }, [enrolledCourses]);

  const handlePurchase = async (course) => {
    try {
      if (!window.Razorpay) {
        showWarning("Payment gateway is loading. Please wait a moment and try again.");
        return;
      }
      const storedUser = localStorage.getItem("user");
      const userEmail = storedUser ? JSON.parse(storedUser).email : "";
      const userName = storedUser ? JSON.parse(storedUser).full_name : "";
      const amount = course.price === "Free" ? 0 : Math.round(parseFloat(course.price?.replace("$", "") || "0") * 100);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: "INR",
        name: "Learn Genie",
        description: `Purchase: ${course.title}`,
        image: "https://yourdomain.com/logo.png",
        handler: async function (response) {
          try {
            console.log("Payment successful:", response);
            setPurchasedCourseIds((prev) => [...prev, course.id]);
            setEnrolledCourses((prev) => [...prev, {
              ...course,
              progress: 0,
              totalLessons: 0,
              completedLessons: 0,
              nextLesson: '',
              dueDate: '',
              thumbnail: course.title?.charAt(0)?.toUpperCase() || 'C',
            },
            ]);
            const userId = storedUser ? JSON.parse(storedUser).id : null;
            if (userId) {
              await axios.post(`${API_URL}/api/purchase_course`, { userId, courseId: course.id });
            }
            showSuccess(`Payment successful! You have purchased: ${course.title}`);
          } catch (error) {
            console.error("Error processing payment success:", error);
            showError("Payment was successful but there was an error saving your purchase. Please contact support.");
          }
        },
        prefill: { name: userName, email: userEmail },
        theme: { color: "#3b82f6" },
        modal: { ondismiss: () => { console.log("Payment window closed"); } }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error creating payment:", error);
      showError("Failed to initiate payment. Please try again.");
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser).id : null;
    if (!userId || typeof userId !== 'string' || userId.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(userId)) {
      showError("Invalid user ID. Please log in again.");
      return;
    }
    if (academicDetails.twelfthStream || academicDetails.degree || academicDetails.postGrad || (areasOfInterest && areasOfInterest.length > 0)) {
      axios.post(`${API_URL}/api/user_profile/save`, {
        userId,
        twelfthStream: academicDetails.twelfthStream,
        degree: academicDetails.degree,
        postGrad: academicDetails.postGrad,
        areasOfInterest,
      })
        .then(() => setShowProfileSavedModal(true))
        .catch(() => showError('Error saving profile.'));
    }
  };

  const updateCourseProgress = async (courseId, newProgress) => {
    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser).id : null;
    if (!userId) return;
    try {
      await axios.post(`${API_URL}/api/update_course_progress`, { userId, courseId, progress: newProgress });
      // State is now updated optimistically in handleProgressUpdate, 
      // but we can keep this to ensure consistency after the API call succeeds.
      setEnrolledCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, progress: newProgress } : c));
    } catch (err) {
      showError("Failed to update course progress");
    }
  };

  const [learnGeniePage, setLearnGeniePage] = useState(1);
  const [courseraPage, setCourseraPage] = useState(1);
  const COURSES_PER_PAGE = 8;

  const paginatedLearnGenie = filteredDbCourses.slice((learnGeniePage - 1) * COURSES_PER_PAGE, learnGeniePage * COURSES_PER_PAGE);
  const paginatedCoursera = filteredCourseraCourses.slice((courseraPage - 1) * COURSES_PER_PAGE, courseraPage * COURSES_PER_PAGE);

  useEffect(() => { setLearnGeniePage(1); }, [searchTerm, selectedCategory, filteredDbCourses.length]);
  useEffect(() => { setCourseraPage(1); }, [searchTerm, selectedCategory, filteredCourseraCourses.length]);

  const markCourseAsCompleted = (courseId) => {
    const roundedProgress = 100;
    setEnrolledCourses((prevCourses) =>
      prevCourses.map((course) => course.id === courseId ? { ...course, progress: roundedProgress } : course)
    );
    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser).id : null;
    if (userId && courseId) {
      updateCourseProgress(courseId, roundedProgress);
    }
  };

  const handleVideoEnd = () => {
    if (currentCourseId) {
      // The final 100% progress update is handled in the player's onStateChange event.
      // This function can now be used for other side effects on completion.
      showSuccess("Course marked as complete!");
      setShowVideoModal(false); // Close modal on completion
    }
  };

  useEffect(() => {
    if (activeTab === 'explore') {
      fetchCourseraCourses();
    }
  }, [activeTab]);

  function getUserKeywords() {
    const keywords = [
      ...Object.values(academicDetails).filter(Boolean),
      ...(areasOfInterest || [])
    ]
      .join(",")
      .split(",")
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);
    return Array.from(new Set(keywords));
  }

  function getRecommendedCourses() {
    const keywords = getUserKeywords();
    if (keywords.length === 0) return [];
    const allCourses = [
      ...courses.map(c => ({ ...c, source: "Learn Genie" })),
      ...courseraCourses.map(c => ({ ...c, source: "Coursera" }))
    ];
    const scored = allCourses.map(course => {
      const text = [course.title, course.description, course.category, course.instructor]
        .join(" ").toLowerCase();
      const matchCount = keywords.filter(kw => text.includes(kw)).length;
      return { ...course, matchCount };
    });
    return scored.filter(c => c.matchCount > 0).sort((a, b) => b.matchCount - a.matchCount);
  }

  const RECOMMENDED_PER_PAGE = 8;
  const [recommendedPage, setRecommendedPage] = useState(1);

  const getUserId = () => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser).id : null;
  };

  const recommendedCourses = (!profileLoading && !coursesLoading && getUserId()) ? getRecommendedCourses() : [];
  const totalRecommendedPages = Math.ceil(recommendedCourses.length / RECOMMENDED_PER_PAGE);
  const paginatedRecommended = recommendedCourses.slice((recommendedPage - 1) * RECOMMENDED_PER_PAGE, recommendedPage * RECOMMENDED_PER_PAGE);

  const [showProfileSavedModal, setShowProfileSavedModal] = useState(false);
  useEffect(() => {
    if (showProfileSavedModal) {
      const timer = setTimeout(() => setShowProfileSavedModal(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showProfileSavedModal]);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const downloadCertificate = async (course) => {
    const certificate = document.getElementById('certificate');
    if (!certificate) return;

    certificate.style.display = 'block';
    certificate.style.position = 'absolute';
    certificate.style.left = '-9999px';

    updateCertificateContent(certificate, course);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(certificate, { scale: 3 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('landscape', 'px', [canvas.width, canvas.height]);
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`Certificate_${name}_${course?.title || 'Course'}.pdf`);

    certificate.style.display = 'none';
  }

  const updateCertificateContent = (certificateElement, course) => {
    certificateElement.querySelector('[data-course-title]').textContent = `"${course?.title || 'Course Title'}"`;
    certificateElement.querySelector('[data-course-category]').textContent = course?.category || 'General';
    certificateElement.querySelector('[data-course-duration]').textContent = course?.duration || '1 week';
    certificateElement.querySelector('[data-certificate-id]').textContent = `Certificate ID: LG-${course?._id?.slice(-8) || 'XXXXXXXX'}`;
    certificateElement.querySelector('[data-student-name]').textContent = name || 'Student Name';
  };

  const handleDownload = (course) => {
    setSelectedCourse(course);
    downloadCertificate(course);
  }

  const colorClasses = [
    "course-thumbnail-indigo", "course-thumbnail-purple", "course-thumbnail-green",
    "course-thumbnail-yellow", "course-thumbnail-blue", "course-thumbnail-red",
    "course-thumbnail-pink", "course-thumbnail-orange"
  ];

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const notificationDropdownRef = useRef(null);

  const fetchNotifications = async () => {
    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser).id : null;
    if (!userId || typeof userId !== 'string' || userId.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(userId)) {
      setNotifications([]);
      setNotificationsLoading(false);
      return;
    }
    setNotificationsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/notifications/${userId}`);
      setNotifications(res.data.notifications || []);
    } catch (err) {
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markNotificationRead = async (notificationId) => {
    try {
      await axios.post(`${API_URL}/api/notifications/mark_read`, { notificationId });
      setNotifications((prev) => prev.map(n => n._id === notificationId ? { ...n, read: true } : n));
    } catch (err) {}
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);

    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [showNotifications]);

  return (
    <div className="app-container">
      {/* Modal for Logout Confirmation */}
      {showLogoutModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem 2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', textAlign: 'center', minWidth: '320px' }}>
            <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Confirm Logout</h2>
            <p style={{ marginBottom: '2rem' }}>Are you sure you want to log out?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
              <button style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.75rem 2rem', fontSize: '1rem', cursor: 'pointer', fontWeight: 600 }} onClick={confirmLogout}>
                Yes, Log Out
              </button>
              <button style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.75rem 2rem', fontSize: '1rem', cursor: 'pointer', fontWeight: 600 }} onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal for Profile Saved */}
      {showProfileSavedModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, transition: 'opacity 0.5s', opacity: showProfileSavedModal ? 1 : 0 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem 2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', textAlign: 'center', minWidth: '320px', transition: 'opacity 0.5s', opacity: showProfileSavedModal ? 1 : 0 }}>
            <h2 style={{ color: '#059669', marginBottom: '1rem' }}>Profile Saved!</h2>
            <p style={{ marginBottom: '2rem' }}>Your profile has been updated successfully.</p>
          </div>
        </div>
      )}
      {/* YouTube Video Modal */}
      {showVideoModal && (
        <div className="video-modal-backdrop" onClick={() => setShowVideoModal(false)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={() => setShowVideoModal(false)}>×</button>
            {currentVideoId && (
              <YouTubePlayer
                videoId={currentVideoId}
                onVideoEnd={handleVideoEnd}
                onProgressUpdate={(progress) => handleProgressUpdate(currentCourseId, progress)}
              />
            )}
          </div>
        </div>
      )}

      {/* Header Section */}
      <header className="header">
        <div className="header-content">
          <div className="app-branding">
            <div className="app-logo-icon">
              <img src={logo || "/placeholder.svg"} alt="Learn Genie Logo" className="app-logo-icon" />
            </div>
            <div>
              <p className="learn-title">LEARN GENIE</p>
              <p className="app-subtitle">Your Personalized Learning Path</p>
            </div>
          </div>
          <div className="user-actions">
            <div style={{ position: 'relative' }} ref={notificationDropdownRef}>
              <button className="notification-button" onClick={() => setShowNotifications((v) => !v)}>
                <Bell className="notification-icon" />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div style={{ position: 'absolute', right: 0, top: '110%', minWidth: '320px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 10000, maxHeight: '400px', overflowY: 'auto', padding: '0.5rem 0' }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: '#1e3a8a' }}>Notifications</div>
                  {notificationsLoading ? (<div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>Loading...</div>
                  ) : notifications.length === 0 ? (<div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No notifications yet.</div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif._id} style={{ padding: '0.75rem 1rem', background: notif.read ? '#f9fafb' : '#e0e7ff', borderBottom: '1px solid #f3f4f6', cursor: notif.read ? 'default' : 'pointer', fontWeight: notif.read ? 400 : 600, color: notif.read ? '#64748b' : '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => { if (!notif.read) markNotificationRead(notif._id); }}>
                        <span style={{ fontSize: '1.1em' }}>{notif.type === 'purchase' ? '🛒' : notif.type === 'completion' ? '🎓' : '🔔'}</span>
                        <span>{notif.message}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.8em', color: '#a1a1aa' }}>{new Date(notif.createdAt).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="user-profile" onClick={() => setActiveTab("profile")}>
              <div className="user-avatar">{userAvatarInitials}</div>
              <div className="user-info">
                <p className="user-name">{name}</p>
                <p className="user-role">Learner</p>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-button" title="Log Out">
              <LogOut className="logout-icon" />
              <span className="logout-label">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="main-content-area">
        <div className="welcome-section">
          <div>
            <h2 className="welcome-title">Welcome , {name.split(" ")[0]}!</h2>
            <p className="welcome-subtitle">Keep up the great work on your learning journey.</p>
          </div>
        </div>
        <div className="nav-tabs-container">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "recommended", label: "Recommended Courses for You", icon: Award },
            { id: "courses", label: "My Courses", icon: BookOpen },
            { id: "explore", label: "Explore Courses", icon: Search },
            { id: "profile", label: "My Profile", icon: User },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`nav-tab-button ${activeTab === tab.id ? "active" : ""}`}>
              <tab.icon className="nav-tab-icon" />
              <span className="nav-tab-label-full">{tab.label}</span>
              <span className="nav-tab-label-short">{tab.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Dashboard View */}
        {activeTab === "dashboard" && (
          <div className="dashboard-view">
            <div className="welcome-action">
              {(!enrolledCourses || enrolledCourses.length === 0) && (
                <button onClick={() => setActiveTab("explore")} className="btn-start-new">
                  <span>Start New Learning</span>
                  <Search className="btn-icon" />
                </button>
              )}
            </div>
            <div className="stats-section">
              <h3 className="section-title">Your Progress at a Glance</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div><p className="stat-label">Enrolled Courses</p><p className="stat-value">{enrolledCourses.length}</p></div>
                  <BookOpen className="stat-icon stat-icon-indigo" />
                </div>
                <div className="stat-card">
                  <div><p className="stat-label">Courses Completed</p><p className="stat-value">{completedCoursesCount}</p></div>
                  <Trophy className="stat-icon stat-icon-green" />
                </div>
                <div className="stat-card">
                  <div><p className="stat-label">Average Progress</p><p className="stat-value">{totalProgress}%</p></div>
                  <TrendingUp className="stat-icon stat-icon-blue" />
                </div>
                <div className="stat-card">
                  <div><p className="stat-label">Certificates Earned</p><p className="stat-value">{completedCoursesCount}</p></div>
                  <Award className="stat-icon stat-icon-yellow" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="section-title">Continue Learning</h3>
              {enrolledCourses.length > 0 ? (
                <div className="course-grid">
                  {enrolledCourses.map((course, idx) => (
                    <div key={course.id || course._id} className="course-card">
                      <div className="course-card-header">
                        <div className={`course-thumbnail ${colorClasses[idx % colorClasses.length]}`}>{course.thumbnail || course.title?.charAt(0)?.toUpperCase() || 'C'}</div>
                        <div>
                          <h4 className="course-title">{course.title}</h4>
                          {course.createdBy && (<p className="course-instructor">{userMap[course.createdBy] || course.createdBy}</p>)}
                        </div>
                      </div>
                      <p className="course-next-lesson">Next: <span className="highlight">{course.nextLesson || "Ready to start!"}</span></p>
                      <div className="progress-bar-container">
                        <div className="progress-text"><span>{course.progress || 0}%</span></div>
                        <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${course.progress || 0}%` }} /></div>
                      </div>
                      <div style={{ margin: '0.5rem 0' }}><CourseRating courseId={course._id || course.id} /></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button className="btn-primary-course" onClick={() => {
                          const videoId = extractYouTubeId(course.youtubeLink);
                          if (videoId) {
                            setCurrentVideoId(videoId);
                            setCurrentCourseId(course.id || course._id);
                            setShowVideoModal(true);
                          } else {
                            showWarning('No valid YouTube link available for this course.');
                          }
                        }}>
                          <PlayCircle className="btn-icon" /><span>{course.progress > 0 ? 'Resume Course' : 'Start Course'}</span>
                        </button>
                        {course.progress === 100 && (
                          <button className="btn-primary-course" style={{ marginTop: '0.5rem', background: '#10b981' }} onClick={() => handleDownload(course)}>
                            <Award className="btn-icon" /><span>Download Certificate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-card">
                  <BookOpen className="empty-state-icon" />
                  <p className="empty-state-text">No active courses. Time to explore something new!</p>
                  <button onClick={() => setActiveTab("explore")} className="btn-primary">Explore Courses</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "recommended" && (
          <div className="recommended-courses-view">
            <h2 className="page-title">Recommended Courses for You</h2>
            {(profileLoading || coursesLoading) ? (<div className="empty-state-card"><p className="empty-state-text">Loading recommendations...</p></div>
            ) : !getUserId() ? (<div className="empty-state-card"><p className="empty-state-text">Please log in to see recommendations.</p></div>
            ) : paginatedRecommended.length === 0 ? (<div className="empty-state-card"><p className="empty-state-text">No recommendations found. Please update your profile or interests.</p></div>
            ) : (
              <div className="recommended-section" style={{ marginTop: '2rem' }}>
                <div className="course-grid">
                  {paginatedRecommended.map((course, idx) => (
                    <div key={course.id || course._id} className="course-card">
                      <div className="course-card-header">
                        <div className={`course-thumbnail ${colorClasses[idx % colorClasses.length]}`}>{course.thumbnail || course.title?.charAt(0).toUpperCase() || "C"}</div>
                        <div>
                          <h4 className="course-title">{course.title}</h4>
                          <p className="course-instructor">{course.instructor || course.source}</p>
                        </div>
                      </div>
                      <p className="course-next-lesson">{course.category}</p>
                      <button className="btn-primary-course" onClick={() => {
                        if (course.source === "Coursera" && course.url) window.open(course.url, "_blank");
                        else if (course.youtubeLink) window.open(course.youtubeLink, "_blank");
                        else showWarning("No course link available.");
                      }}><span>View Course</span></button>
                    </div>
                  ))}
                </div>
                <div className="pagination-controls">
                  <button className="btn btn-dark" onClick={() => setRecommendedPage(recommendedPage - 1)} disabled={recommendedPage === 1}>← Previous</button>
                  <span style={{ margin: '0 1rem' }}>Page {recommendedPage} of {totalRecommendedPages}</span>
                  <button className="btn btn-dark" onClick={() => setRecommendedPage(recommendedPage + 1)} disabled={recommendedPage === totalRecommendedPages}>Next →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "courses" && (
          <div className="my-courses-view">
            <h2 className="page-title">All My Courses</h2>
            {enrolledCourses.length > 0 ? (
              <div className="course-grid">
                {enrolledCourses.map((course, idx) => (
                  <div key={course.id || course._id} className="course-card">
                    <div className="course-card-header-flex">
                      <div className="course-card-header">
                        <div className={`course-thumbnail ${colorClasses[idx % colorClasses.length]}`}>{course.thumbnail || course.title?.charAt(0)?.toUpperCase() || "C"}</div>
                        <div>
                          <h4 className="course-title">{course.title}</h4>
                          {course.createdBy && (<p className="course-instructor">{userMap[course.createdBy] || course.createdBy}</p>)}
                        </div>
                      </div>
                    </div>
                    <p className="course-next-lesson">Duration: <span className="highlight">{course.duration}</span></p>
                    {course.youtubeLink && (
                      <div style={{ margin: '0.5rem 0' }}>
                        <button className="btn-primary-course" onClick={() => {
                          const videoId = extractYouTubeId(course.youtubeLink);
                          if (videoId) {
                            setCurrentVideoId(videoId);
                            setCurrentCourseId(course.id || course._id);
                            setShowVideoModal(true);
                          } else {
                            showWarning('No valid YouTube link available.');
                          }
                        }}>
                          <PlayCircle className="btn-icon" /><span>Watch Course</span>
                        </button>
                      </div>
                    )}
                    <div style={{ margin: '0.5rem 0' }}><CourseRating courseId={course._id || course.id} /></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-card">
                <BookOpen className="empty-state-icon" />
                <p className="empty-state-text">You haven't enrolled in any courses yet!</p>
                <button onClick={() => setActiveTab("explore")} className="btn-primary">Browse Courses</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "explore" && (
          <div className="explore-courses-view">
            <h2 className="page-title">Discover New Courses</h2>
            <div className="search-filter-section">
              <div className="search-input-wrapper">
                <Search className="search-icon" />
                <input type="text" placeholder="Search courses, instructors, or topics..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
              </div>
            </div>
            <h3 className="section-title" style={{ marginTop: '2rem' }}>Learn Genie Courses</h3>
            {paginatedLearnGenie.length > 0 ? (
              <>
                <div className="course-grid">
                  {paginatedLearnGenie.map((course, idx) => (
                    <div key={course.id} className="course-card">
                      <div className="course-card-header-flex">
                        <div className="course-card-header">
                          <div className={`course-thumbnail ${colorClasses[idx % colorClasses.length]}`}>{course.thumbnail}</div>
                          <div>
                            <h4 className="course-title">{course.title}</h4>
                            {course.createdBy && (<p className="course-instructor">{userMap[course.createdBy] || course.createdBy}</p>)}
                          </div>
                        </div>
                        <span className={`level-badge level-badge-${course.level ? course.level.toLowerCase() : ''}`}>{course.level}</span>
                      </div>
                      <div className="course-details-row">
                        <div className="course-detail-item"><Clock className="detail-icon" /><span>{course.duration}</span></div>
                        <div className="course-detail-item"><Star className="detail-icon icon-yellow-fill" /><span>{course.rating}</span></div>
                      </div>
                      <div className="course-details-row users-price-row">
                        <div className="course-detail-item"><Users className="detail-icon" /><span>{course.students?.toLocaleString()} students</span></div>
                        <span className="course-price">{course.price === "Free" ? "Free" : `₹${Number.parseFloat(course.price?.replace("$", "")).toFixed(2)}`}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {purchasedCourseIds.includes(course.id) ? (
                          course.youtubeLink ? (
                            <button className="btn-primary-course" onClick={() => {
                              setCurrentVideoId(extractYouTubeId(course.youtubeLink));
                              setCurrentCourseId(course.id);
                              setShowVideoModal(true);
                            }}>
                              <PlayCircle className="btn-icon" /><span>Watch Course</span>
                            </button>
                          ) : (<span className="btn-primary-course" style={{ background: '#22c55e' }}>Purchased</span>)
                        ) : (
                          <button className="btn-primary-course" onClick={() => handlePurchase(course)}>
                            <PlusCircle className="btn-icon" /><span>Purchase</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pagination-controls">
                  <button className="btn btn-dark" onClick={() => setLearnGeniePage(learnGeniePage - 1)} disabled={learnGeniePage === 1}>← Previous</button>
                  <span style={{ margin: '0 1rem' }}>Page {learnGeniePage} of {Math.ceil(filteredDbCourses.length / COURSES_PER_PAGE)}</span>
                  <button className="btn btn-dark" onClick={() => setLearnGeniePage(learnGeniePage + 1)} disabled={learnGeniePage >= Math.ceil(filteredDbCourses.length / COURSES_PER_PAGE)}>Next →</button>
                </div>
              </>
            ) : (<div className="empty-state-card"><Search className="empty-state-icon" /><p className="empty-state-text">No Learn Genie courses found matching your search.</p></div>)}

            <h3 className="section-title" style={{ marginTop: '2rem' }}>Coursera Courses</h3>
            {paginatedCoursera.length > 0 ? (
              <>
                <div className="course-grid">
                  {paginatedCoursera.map((course, idx) => (
                    <div key={course.id} className="course-card">
                      <div className="course-card-header-flex">
                        <div className="course-card-header">
                          <div className={`course-thumbnail ${colorClasses[idx % colorClasses.length]}`}>{course.thumbnail || course.title?.charAt(0)?.toUpperCase() || 'C'}</div>
                          <div>
                            <h4 className="course-title">{course.title}</h4>
                            {course.createdBy && (<p className="course-instructor">{userMap[course.createdBy] || course.createdBy}</p>)}
                          </div>
                        </div>
                        <span className={`level-badge level-badge-${course.level ? course.level.toLowerCase() : ''}`}>{course.level}</span>
                      </div>
                      <div className="course-details-row">
                        <div className="course-detail-item"><Clock className="detail-icon" /><span>{course.duration}</span></div>
                        <div className="course-detail-item"><Star className="detail-icon icon-yellow-fill" /><span>{course.rating}</span></div>
                      </div>
                      <div className="course-details-row users-price-row">
                        <div className="course-detail-item"><Users className="detail-icon" /><span>{course.students?.toLocaleString()} students</span></div>
                        <span className="course-price">{course.price === "Free" ? "Free" : `₹${Number.parseFloat(course.price?.replace("$", "")).toFixed(2)}`}</span>
                      </div>
                      <button onClick={() => handleEnroll(course.id)} className="btn-primary-course"><PlusCircle className="btn-icon" /><span>Enroll on Coursera</span></button>
                    </div>
                  ))}
                </div>
                <div className="pagination-controls">
                  <button className="btn btn-dark" onClick={() => setCourseraPage(courseraPage - 1)} disabled={courseraPage === 1}>← Previous</button>
                  <span style={{ margin: '0 1rem' }}>Page {courseraPage} of {Math.ceil(filteredCourseraCourses.length / COURSES_PER_PAGE)}</span>
                  <button className="btn btn-dark" onClick={() => setCourseraPage(courseraPage + 1)} disabled={courseraPage >= Math.ceil(filteredCourseraCourses.length / COURSES_PER_PAGE)}>Next →</button>
                </div>
              </>
            ) : (<div className="empty-state-card"><BookOpen className="empty-state-icon" /><p className="empty-state-text">No Coursera courses found.</p></div>)}
          </div>
        )}

        {activeTab === "profile" && (
          <form className="profile-view" onSubmit={handleProfileSubmit}>
            <h2 className="page-title">My Profile</h2>
            <div className="profile-card">
              <h3 className="section-title"><GraduationCap className="profile-icon" /> Academic Details & Areas of Interest <Lightbulb className="profile-icon" /></h3>
              <div className="form-group">
                <label htmlFor="twelfthStream" className="form-label">12th Standard Stream:</label>
                <input type="text" id="twelfthStream" name="twelfthStream" value={academicDetails.twelfthStream} onChange={handleAcademicChange} placeholder="e.g., Science, Commerce, Arts" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="degree" className="form-label">Degree (UG):</label>
                <input type="text" id="degree" name="degree" value={academicDetails.degree} onChange={handleAcademicChange} placeholder="e.g., B.Tech in CSE, B.Com, BA English" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="postGrad" className="form-label">Post Graduation (PG) / Other Certifications:</label>
                <input type="text" id="postGrad" name="postGrad" value={academicDetails.postGrad} onChange={handleAcademicChange} placeholder="e.g., M.Tech, MBA, Data Science Certification" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="areasOfInterest" className="form-label">Enter your interests (comma-separated):</label>
                <input type="text" id="areasOfInterest" name="areasOfInterest" value={areasOfInterest.join(", ")} onChange={e => setAreasOfInterest(e.target.value.split(",").map(s => s.trim()).filter(Boolean))} placeholder="e.g., AI/ML, Cloud, Design" className="form-input" />
              </div>
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>Save Profile</button>
            </div>
          </form>
        )}
      </div>

      <footer className="learner-footer" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: '#f3f4f6', padding: '1rem 0' }}>
        © {new Date().getFullYear()} | Learn Genie | All rights reserved.
      </footer>

      <div id="certificate" style={{ display: 'none', width: '800px', minHeight: '600px', padding: '0', textAlign: 'center', fontFamily: 'Georgia, serif', backgroundColor: '#ffffff', border: '8px solid #1e3a8a', borderRadius: '15px', margin: '0 auto', position: 'relative', backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px', border: '2px solid #3b82f6', borderRadius: '10px', background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)' }}>
          <div style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '20px', borderRadius: '8px 8px 0 0', position: 'relative' }}>
            {logo && <img src={logo} alt="Learn Genie Logo" style={{ width: '60px', height: '60px', position: 'absolute', top: '15px', left: '30px', backgroundColor: 'white', borderRadius: '50%', padding: '5px' }} />}
            <h1 style={{ fontSize: '28px', margin: '0', fontWeight: 'bold', letterSpacing: '2px' }}>LEARN GENIE</h1>
            <p style={{ fontSize: '14px', margin: '5px 0 0 0', opacity: '0.9', fontStyle: 'italic' }}>Online Learning Platform</p>
          </div>
          <div style={{ padding: '40px 30px 30px 30px' }}>
            <div style={{ backgroundColor: '#fbbf24', color: '#92400e', padding: '15px 30px', borderRadius: '25px', display: 'block', margin: '0 0 25px 0', boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)' }}>
              <h2 style={{ fontSize: '24px', margin: '0', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Certificate of Completion</h2>
            </div>
            <div style={{ margin: '30px 0' }}>
              <p style={{ fontSize: '16px', color: '#374151', margin: '0 0 15px 0' }}>This is to certify that</p>
              <div style={{ backgroundColor: '#eff6ff', border: '2px solid #3b82f6', borderRadius: '10px', padding: '15px 20px', margin: '20px 0', display: 'block', width: '100%', maxWidth: '100%', textAlign: 'center' }}>
                <h3 data-student-name style={{ fontSize: '32px', margin: '0', color: '#1e40af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{name || 'Student Name'}</h3>
              </div>
              <p style={{ fontSize: '16px', color: '#374151', margin: '20px 0 15px 0' }}>has successfully completed the course</p>
              <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px', padding: '12px 20px', margin: '15px auto', display: 'block', width: 'fit-content', maxWidth: '100%', textAlign: 'center' }}>
                <h4 data-course-title style={{ fontSize: '22px', fontStyle: 'italic', margin: '0', color: '#0369a1', fontWeight: 'normal' }}>"{selectedCourse?.title || 'Course Title'}"</h4>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px 0 20px 0', padding: '0 40px' }}>
                <div style={{ textAlign: 'left' }}><p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 5px 0' }}>Course Category:</p><p data-course-category style={{ fontSize: '16px', color: '#1f2937', margin: '0', fontWeight: 'bold' }}>{selectedCourse?.category || 'General'}</p></div>
                <div style={{ textAlign: 'center' }}><p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 5px 0' }}>Duration:</p><p data-course-duration style={{ fontSize: '16px', color: '#1f2937', margin: '0', fontWeight: 'bold' }}>{selectedCourse?.duration || '1 week'}</p></div>
                <div style={{ textAlign: 'right' }}><p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 5px 0' }}>Completion Date:</p><p style={{ fontSize: '16px', color: '#1f2937', margin: '0', fontWeight: 'bold' }}>{new Date().toLocaleDateString()}</p></div>
              </div>
            </div>
            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '20px', marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px' }}>
                <div style={{ textAlign: 'left' }}><div style={{ width: '120px', height: '2px', backgroundColor: '#374151', margin: '0 0 5px 0' }}></div><p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Director</p></div>
                <div style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '8px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>VERIFIED CERTIFICATE</div>
                <div style={{ textAlign: 'right' }}><div style={{ width: '120px', height: '2px', backgroundColor: '#374151', margin: '0 0 5px 0', marginLeft: 'auto' }}></div><p data-certificate-id style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Certificate ID: LG-{selectedCourse?._id?.slice(-8) || 'XXXXXXXX'}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseRating({ courseId }) {
  const [avgRating, setAvgRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [error, setError] = useState(null);

  const userId = useMemo(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser).id : null;
  }, []);

  useEffect(() => {
    if (!courseId || !userId) return;
    fetch(`${API_URL}/api/courses/${courseId}/ratings?userId=${userId}`)
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(r => {
        setAvgRating(r.average || 0);
        setUserRating(r.userRating || 0);
        setRatingCount(r.count || 0);
      })
      .catch(() => setError('Could not load ratings.'));
  }, [courseId, userId]);

  const handleRatingChange = (newRating) => {
    if (!userId) {
      alert('You must be logged in to rate.');
      return;
    }
    fetch(`${API_URL}/api/courses/${courseId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, rating: newRating })
    })
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(() => {
        setUserRating(newRating);
        fetch(`${API_URL}/api/courses/${courseId}/ratings?userId=${userId}`)
          .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
          .then(r => {
            setAvgRating(r.average || 0);
            setRatingCount(r.count || 0);
            setUserRating(r.userRating || 0);
          });
      })
      .catch(() => setError('Could not submit rating.'));
  };

  return (
    <div>
      <ReactStars
        count={5}
        value={userRating}
        onChange={handleRatingChange}
        size={24}
        isHalf={false}
        activeColor="#ffd700"
      />
      <div style={{ fontSize: '0.9em', color: '#555' }}>
        Average Rating: {avgRating.toFixed(1)} ({ratingCount} ratings)
      </div>
      {error && <div style={{ color: 'red', fontSize: '0.9em' }}>{error}</div>}
    </div>
  );
}