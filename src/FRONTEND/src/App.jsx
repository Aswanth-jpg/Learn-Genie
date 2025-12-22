import React,{useState} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import About from "./components/About/About";
import Explore from "./components/Courses/Explore/Explore";
import Contact from "./components/Contact/Contact";
import Search_Explore from "./components/Courses/Explore/Search_Explore";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import CourseDetailsCard from './components/Courses/Explore/Course_Details/CourseDetailsCard'
import  HomeEg  from "./components/Homeeg/HomeEg";
import LoadingBar from 'react-top-loading-bar'
import Compare_Emplore from "./components/Courses/Explore/Compare_Emplore";
import SignIn from "./components/SignIn/SignIn";
import LearnerDashboard from "./components/Learner/LearnerHome";
import CourseManagerDashboard from "./components/CourseManager/CourseMan";
import AdminDashboard from "./components/Admin/Admin_Dashboard";
import SignUp from "./components/Signup/Signup";
import { ToastProvider } from "./components/Toast/ToastContext";
import 'aos/dist/aos.css';

export default function App() {
  const [progress, setProgress] = useState(0)
  return (
    <ToastProvider>
      <div>
        <SkeletonTheme baseColor="#313131" highlightColor="#525252">
          <Router>
          <LoadingBar
            height={2}
            color='#f11946'
            progress={progress}
          />
              <Routes>
                <Route path="/" element={<HomeEg />} />
                <Route path="about/*" element={<About />} />
                <Route path = "/start" element={<SignIn/>}/>
                <Route path = "/register" element={<SignUp/>}/>
                <Route path="get_started/" element={<Explore setProgress={setProgress} />} />
                <Route path='get_started/:courseId' element={<CourseDetailsCard />} />
                <Route path="get_started/search" element={<Search_Explore />} />
                <Route path="get_started/compare" element={<Compare_Emplore/>} />
                <Route path='get_started/search/:courseId' element={<CourseDetailsCard />} />
                <Route path="contact/*" element={<Contact />} />
                <Route path='Learner_Index' element={<LearnerDashboard/>}/>
                <Route path="Course_Manager" element={<CourseManagerDashboard/>} />
                <Route path="Admin" element={<AdminDashboard/>}/>
              </Routes>
          </Router>
        </SkeletonTheme>
      </div>
    </ToastProvider>
  );
}
