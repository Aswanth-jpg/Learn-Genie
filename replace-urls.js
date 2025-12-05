// Script to replace all localhost URLs in specific files
const fs = require('fs');
const path = require('path');

const API_URL = "import.meta.env.VITE_API_URL || 'http://localhost:5000'";

const replacements = [
  {
    file: 'FRONTEND/src/components/Learner/LearnerHome.jsx',
    replacements: [
      { from: /axios\.post\('http:\/\/localhost:5000\/api\/get_courses'\)/g, to: "axios.post(API_ENDPOINTS.GET_COURSES)" },
      { from: /axios\.get\('http:\/\/localhost:5000\/api\/users'\)/g, to: "axios.get(API_ENDPOINTS.USERS)" },
      { from: /axios\.get\(`http:\/\/localhost:5000\/api\/user_profile\/\$\{userId\}`\)/g, to: "axios.get(API_ENDPOINTS.USER_PROFILE(userId))" },
      { from: /axios\.get\(`http:\/\/localhost:5000\/api\/purchased_courses\/\$\{userId\}`\)/g, to: "axios.get(API_ENDPOINTS.PURCHASED_COURSES(userId))" },
      { from: /let url = `http:\/\/localhost:5000\/api\/coursera\/courses\?page=1&limit=100`;/g, to: "let url = `${API_ENDPOINTS.COURSERA_COURSES}?page=1&limit=100`;" },
      { from: /await axios\.post\("http:\/\/localhost:5000\/api\/purchase_course"/g, to: 'await axios.post(API_ENDPOINTS.PURCHASE_COURSE' },
      { from: /axios\.post\("http:\/\/localhost:5000\/api\/user_profile\/save"/g, to: 'axios.post(API_ENDPOINTS.USER_PROFILE_SAVE' },
      { from: /await axios\.post\("http:\/\/localhost:5000\/api\/update_course_progress"/g, to: 'await axios.post(API_ENDPOINTS.UPDATE_COURSE_PROGRESS' },
      { from: /axios\.get\(`http:\/\/localhost:5000\/api\/notifications\/\$\{userId\}`\)/g, to: "axios.get(API_ENDPOINTS.NOTIFICATIONS(userId))" },
      { from: /await axios\.post\('http:\/\/localhost:5000\/api\/notifications\/mark_read'/g, to: "await axios.post(API_ENDPOINTS.MARK_READ" },
      { from: /fetch\(`http:\/\/localhost:5000\/api\/courses\/\$\{courseId\}\/ratings\?userId=\$\{userId\}`\)/g, to: "fetch(API_ENDPOINTS.COURSE_RATINGS(courseId, userId))" },
      { from: /fetch\(`http:\/\/localhost:5000\/api\/courses\/\$\{courseId\}\/rate`/g, to: "fetch(API_ENDPOINTS.COURSE_RATE(courseId)" },
    ]
  },
  {
    file: 'FRONTEND/src/components/CourseManager/CourseMan.jsx',
    replacements: [
      { from: /axios\.post\('http:\/\/localhost:5000\/api\/course_add'/g, to: "axios.post(API_ENDPOINTS.COURSE_ADD" },
      { from: /axios\.delete\(`http:\/\/localhost:5000\/api\/courses\/\$\{courseId\}`/g, to: "axios.delete(API_ENDPOINTS.COURSE(courseId)" },
      { from: /axios\.get\('http:\/\/localhost:5000\/api\/course_count'\)/g, to: "axios.get(API_ENDPOINTS.COURSE_COUNT)" },
      { from: /axios\.post\('http:\/\/localhost:5000\/api\/get_courses'/g, to: "axios.post(API_ENDPOINTS.GET_COURSES" },
      { from: /axios\.get\('http:\/\/localhost:5000\/api\/users'\)/g, to: "axios.get(API_ENDPOINTS.USERS)" },
      { from: /axios\.delete\(`http:\/\/localhost:5000\/api\/users\/\$\{userId\}`\)/g, to: "axios.delete(API_ENDPOINTS.USER(userId))" },
      { from: /axios\.get\(`http:\/\/localhost:5000\/api\/manager\/learner_progress\/\$\{managerId\}`\)/g, to: "axios.get(API_ENDPOINTS.LEARNER_PROGRESS(managerId))" },
      { from: /axios\.get\(`http:\/\/localhost:5000\/api\/manager\/revenue\/\$\{managerId\}`\)/g, to: "axios.get(API_ENDPOINTS.REVENUE(managerId))" },
      { from: /axios\.put\(`http:\/\/localhost:5000\/api\/courses\/\$\{editCourseId\}`/g, to: "axios.put(API_ENDPOINTS.COURSE(editCourseId)" },
      { from: /axios\.get\(`http:\/\/localhost:5000\/api\/courses\/\$\{courseId\}\/all-ratings`\)/g, to: "axios.get(API_ENDPOINTS.ALL_RATINGS(courseId))" },
      { from: /fetch\(`http:\/\/localhost:5000\/api\/courses\/\$\{courseId\}\/ratings`\)/g, to: "fetch(API_ENDPOINTS.COURSE_RATINGS(courseId, null))" },
    ]
  }
];

replacements.forEach(({ file, replacements: replaceList }) => {
  const filePath = path.join(__dirname, file);
  console.log(`Processing ${file}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    replaceList.forEach(({ from, to }) => {
      if (content.match(from)) {
        content = content.replace(from, to);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated ${file}`);
    } else {
      console.log(`- No changes needed in ${file}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log('Done!');
