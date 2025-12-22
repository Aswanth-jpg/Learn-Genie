import React, { useState, useEffect } from 'react'
import CourseCard from '../Course_Card/CourseCard';
import axios from "axios"
import "./Explore.css"
import Downnav from './Downnav';
import SkeletonCard from '../Course_Card/SkeletonCard';
import NavbarEg from '../../Homeeg/NavbarEg';

export default function Explore(props) {

  const [isSearching, setIsSearching] = useState(false);
  const [learnGenieCourses, setLearnGenieCourses] = useState([]);
  const [courseraCourses, setCourseraCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const FetchLearnGenieData = (page) => {
    const API = `https://learngenieapi-production.up.railway.app/api/courses?page=${page}&limit=10`;
    return axios.get(API).then((response) => {
      const data = response.data.Courses;
      return data;
    }).catch((error) => {
      console.log("Error fetching LearnGenie data", error);
      return [];
    });
  };

  const FetchCourseraData = () => {
    const API = `http://localhost:5000/api/coursera/courses`;
    return axios.get(API).then((response) => {
      const data = response.data.courses;
      return data.slice(0, 10); // Limit to 10 courses for display
    }).catch((error) => {
      console.log("Error fetching Coursera data", error);
      return [];
    });
  };

  const FetchAllData = async (page) => {
    props.setProgress(10);
    setLoading(true);
    
    try {
      // Fetch all three data sources in parallel
      const [learnGenieData, courseraData] = await Promise.all([
        FetchLearnGenieData(page),
        FetchCourseraData()
      ]);

      props.setProgress(40);
      
      setLearnGenieCourses(learnGenieData);
      setCourseraCourses(courseraData);
      
      props.setProgress(70);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setLoading(false);
      props.setProgress(100);
    } catch (error) {
      console.log("Error fetching data", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(page);
    FetchAllData(page);
  }, [page]);

  const handleOnNext = () => {
    setPage(page + 1);
  }
  
  const handleOnPrev = () => {
    setPage(page - 1);
  }

  return (
    <div className='explore-wrapper'>
      <NavbarEg />
      <div className="row my-3 mx-3">
        <h1 style={{ fontSize: '40px', textAlign: "center" }} >Courses List</h1>
        {loading && learnGenieCourses.length === 0 ? (
          <SkeletonCard />
        ) : (
          <div className="three-section-container">
            {/* LearnGenie Section */}
            <div className="section">
              <h2 className="section-title">LearnGenie Courses</h2>
              <div className="course_container">
                {learnGenieCourses.map((element) => {
                  return (
                    <div className='row' key={element.ID}>
                      <CourseCard data={element} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coursera Section */}
            <div className="section">
              <h2 className="section-title">Coursera Courses</h2>
              <div className="course_container">
                {courseraCourses.map((element) => {
                  return (
                    <div className='row' key={element.id}>
                      <CourseCard data={element} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Pagination only for LearnGenie courses */}
      <div className="container d-flex justify-content-between" style={{ height: "80px" }}>
        <button disabled={page <= 1} style={{ fontSize: "16px" }} type="button" className="btn btn-dark" onClick={handleOnPrev} > &larr; Previous</button>
        <button style={{ fontSize: "16px" }} type="button" className="btn btn-dark" onClick={handleOnNext} >Next &rarr;</button>
      </div>
      
      <div style={{ position: "fixed", bottom: "0px", zIndex: '1000' }}>
        <Downnav />
      </div>
    </div>
  )
}

