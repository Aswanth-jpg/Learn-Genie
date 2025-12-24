import React, { useState, useEffect } from 'react';
import './MarvellousMacawArticle.css';
import { Link } from 'react-router-dom';
import ReactStars from 'react-rating-stars-component';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CourseCard = ({ data, userId }) => {
  const [desc, setDesc] = useState(data.description.slice(0, 80));
  const [readMore, setReadMore] = useState('Read More...');
  const [avgRating, setAvgRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  // Get userId from localStorage if not passed as prop
  const effectiveUserId = userId || localStorage.getItem('userId');

  useEffect(() => {
    // Fetch ratings from backend
    fetch(`${API_URL}/api/courses/${data.ID}/ratings${effectiveUserId ? `?userId=${effectiveUserId}` : ''}`)
      .then(res => res.json())
      .then(r => {
        setAvgRating(r.average || 0);
        setUserRating(r.userRating || 0);
        setRatingCount(r.count || 0);
      });
  }, [data.ID, effectiveUserId]);

  const handleRatingChange = (newRating) => {
    if (!effectiveUserId) {
      alert('You must be logged in to rate.');
      return;
    }
    fetch(`${API_URL}/api/courses/${data.ID}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: effectiveUserId, rating: newRating })
    })
      .then(res => res.json())
      .then(() => {
        setUserRating(newRating);
        // Optionally, refetch average
        fetch(`${API_URL}/api/courses/${data.ID}/ratings`)
          .then(res => res.json())
          .then(r => {
            setAvgRating(r.average || 0);
            setRatingCount(r.count || 0);
          });
      });
  };

  const handleReadMore = () => {
    if (desc === data.description.slice(0, 80)) {
      setDesc(data.description);
      setReadMore('Read Less...');
    } else {
      setDesc(data.description.slice(0, 80));
      setReadMore('Read More...');
    }
  };

  return (
    <div className="card-ontainer">
      <div className="square">
        <Link to={`./${data.ID}`}>
          <img
            src={data.images}
            alt="Course Cover"
            className="mask"
          />
        </Link>
        <div className="h1">
          <Link to={`./${data.ID}`} className='link-title'>
            {data.title}
          </Link>
        </div>
        <p onClick={handleReadMore} className='courseCard-desc'>
          {desc} <span onClick={handleReadMore}><b> {readMore} </b></span>
        </p>
        {/* Star Rating UI */}
        <div style={{ margin: '0.5rem 0' }}>
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
        </div>
        <div>
          <Link to={`./${data.ID}`} className='button'>
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
