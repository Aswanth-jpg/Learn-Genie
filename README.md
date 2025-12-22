# 🎓 Learn Genie

**Learn Genie** is a comprehensive online learning platform that provides personalized course recommendations, seamless course enrollment, progress tracking, and certificate generation. The platform integrates courses from both internal Learn Genie database and external sources like Coursera, offering learners a unified experience.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![MongoDB](https://img.shields.io/badge/mongodb-7.6.3-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [User Roles](#-user-roles)
- [Screenshots](#-screenshots)
- [Docker Deployment](#-docker-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### For Learners
- 🔐 **User Authentication** - Secure login and registration with encrypted passwords
- 📚 **Course Discovery** - Browse courses from Learn Genie and Coursera
- 🎯 **Personalized Recommendations** - AI-powered course suggestions based on academic profile and interests
- 💳 **Payment Integration** - Purchase courses via Razorpay payment gateway
- 📊 **Progress Tracking** - Track course completion with real-time progress updates
- 🎥 **Integrated Video Player** - Watch course videos directly within the platform (YouTube integration)
- ⭐ **Course Ratings** - Rate and review completed courses
- 📜 **Certificate Generation** - Download professional certificates upon course completion
- 🔔 **Notifications** - Stay updated with purchase confirmations and course completions
- 👤 **User Profile** - Manage academic details and areas of interest

### For Admins/Course Managers
- 📝 **Course Management** - Create, update, and delete courses
- 👥 **User Management** - View and manage registered users
- 📈 **Analytics Dashboard** - Monitor platform statistics and user engagement

### Additional Features
- 🔍 **Advanced Search** - Filter courses by category, instructor, price, and level
- 📱 **Responsive Design** - Seamless experience across desktop, tablet, and mobile devices
- 🌐 **Multi-Platform Integration** - Access both internal courses and Coursera courses
- 💬 **Messaging System** - Communication between users and administrators

---

## 🛠 Tech Stack

### Frontend
- **React 18.2.0** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API requests
- **React Router DOM** - Client-side routing
- **Chart.js & Recharts** - Data visualization
- **Lottie React** - Animated graphics
- **html2canvas & jsPDF** - Certificate generation
- **React Rating Stars** - Star rating component

### Backend
- **Node.js & Express.js** - Server-side framework
- **MongoDB & Mongoose** - Database and ODM
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### AI/ML Microservice
- **FastAPI** - Modern Python web framework
- **Sentence Transformers** - NLP embeddings for course recommendations
- **scikit-learn** - Cosine similarity calculations
- **Uvicorn** - ASGI server

### Payment Gateway
- **Razorpay** - Secure payment processing

### DevOps (Optional)
- **Docker & Docker Compose** - Containerization
- **MongoDB Atlas** - Cloud database

---

## 📁 Project Structure

```
LearnGenie-MAIN/
├── src/
│   ├── BACKEND/              # Node.js Express backend
│   │   ├── controllers/      # Request handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Helper functions
│   │   ├── app.js           # Express app configuration
│   │   ├── connectDB.js     # Database connection
│   │   └── package.json     # Backend dependencies
│   │
│   ├── FRONTEND/            # React frontend
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   │   ├── About/
│   │   │   │   ├── Admin/
│   │   │   │   ├── Contact/
│   │   │   │   ├── CourseManager/
│   │   │   │   ├── Courses/
│   │   │   │   ├── Homeeg/
│   │   │   │   ├── Homepage/
│   │   │   │   ├── Learner/
│   │   │   │   ├── SignIn/
│   │   │   │   ├── Signup/
│   │   │   │   └── Toast/
│   │   │   ├── App.jsx       # Main app component
│   │   │   └── main.jsx      # Entry point
│   │   ├── public/          # Static assets
│   │   ├── index.html       # HTML template
│   │   ├── package.json     # Frontend dependencies
│   │   └── vite.config.js   # Vite configuration
│   │
│   ├── FAST_API/            # Python recommendation service
│   │   ├── recommendation_api.py
│   │   ├── requirements.txt
│   │   └── README_recommendation.md
│   │
│   └── WEBSITE IMAGES/      # Platform screenshots
│
├── .gitignore
└── README.md                # This file
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **Python** (v3.8 or higher)
- **pip** (Python package manager)
- **MongoDB** (Local or MongoDB Atlas account)
- **Git**

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/LearnGenie-MAIN.git
cd LearnGenie-MAIN
```

### 2. Install Backend Dependencies

```bash
cd src/BACKEND
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../FRONTEND
npm install
```

### 4. Install Python Dependencies (Recommendation Service)

```bash
cd ../FAST_API
pip install -r requirements.txt
```

---

## ⚙️ Configuration

### Backend Configuration

1. Create a `.env` file in `src/BACKEND/`:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/learngenie?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (if using authentication tokens)
JWT_SECRET=your_jwt_secret_key_here
```

### Frontend Configuration

1. Create a `.env` file in `src/FRONTEND/`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your_razorpay_test_key_here
```

### Important Security Notes:
- ⚠️ **Never commit `.env` files to Git** (already in `.gitignore`)
- 🔑 Replace placeholder values with your actual credentials
- 🔐 For production, use environment-specific `.env` files
- 💳 Use Razorpay **test keys** for development

---

## 🏃 Running the Application

### Option 1: Run Services Individually

#### 1. Start MongoDB
If running locally:
```bash
mongod
```

#### 2. Start Backend Server
```bash
cd src/BACKEND
npm run dev
```
Backend will run on: `http://localhost:5000`

#### 3. Start Frontend Development Server
```bash
cd src/FRONTEND
npm run dev
```
Frontend will run on: `http://localhost:5173`

#### 4. Start Recommendation Service (Optional)
```bash
cd src/FAST_API
uvicorn recommendation_api:app --reload --host 0.0.0.0 --port 8000
```
Recommendation API will run on: `http://localhost:8000`

### Option 2: Run with Docker (Coming Soon)

```bash
docker-compose up --build
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "learner"
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "learner"
}
```

### Course Endpoints

#### Get All Courses
```http
POST /api/get_courses
```

#### Get Course by ID
```http
GET /api/courses/:courseId
```

#### Create Course (Admin/Manager)
```http
POST /api/add_course
Content-Type: application/json

{
  "title": "Introduction to React",
  "description": "Learn React from scratch",
  "category": "Development",
  "duration": "8 weeks",
  "price": "49.99",
  "level": "Beginner",
  "youtubeLink": "https://youtube.com/watch?v=..."
}
```

#### Rate Course
```http
POST /api/courses/:courseId/rate
Content-Type: application/json

{
  "userId": "userId",
  "rating": 5
}
```

### User Profile Endpoints

#### Get User Profile
```http
GET /api/user_profile/:userId
```

#### Save User Profile
```http
POST /api/user_profile/save
Content-Type: application/json

{
  "userId": "userId",
  "twelfthStream": "Science",
  "degree": "B.Tech in CSE",
  "postGrad": "M.Tech",
  "areasOfInterest": ["AI/ML", "Cloud Computing"]
}
```

### Purchase & Progress Endpoints

#### Purchase Course
```http
POST /api/purchase_course
Content-Type: application/json

{
  "userId": "userId",
  "courseId": "courseId"
}
```

#### Get Purchased Courses
```http
GET /api/purchased_courses/:userId
```

#### Update Course Progress
```http
POST /api/update_course_progress
Content-Type: application/json

{
  "userId": "userId",
  "courseId": "courseId",
  "progress": 75
}
```

### Coursera Integration

#### Get Coursera Courses
```http
GET /api/coursera/courses?page=1&limit=20
```

### Notifications

#### Get User Notifications
```http
GET /api/notifications/:userId
```

#### Mark Notification as Read
```http
POST /api/notifications/mark_read
Content-Type: application/json

{
  "notificationId": "notificationId"
}
```

---

## 👥 User Roles

### 1. **Learner**
- Browse and search courses
- Purchase courses
- Track progress
- Rate courses
- Download certificates
- View personalized recommendations

### 2. **Admin**
- Full platform access
- User management
- System analytics
- Course moderation

### 3. **Course Manager**
- Create and manage courses
- View course analytics
- Update course content

---

## 📸 Screenshots

### Landing Page
![Landing Page](src/WEBSITE%20IMAGES/Landing%20and%20Introduction%20Page.png)

### Platform Overview
![Platform Overview](src/WEBSITE%20IMAGES/Platform%20Overview%20Page.png)

### Course Search
![Course Search](src/WEBSITE%20IMAGES/Categorical%20search%20(Quick%20Search).png)

### Course Details
![Course Details](src/WEBSITE%20IMAGES/Course%20Details%20and%20Discription.png)

### Course Comparison
![Course Comparison](src/WEBSITE%20IMAGES/Course%20Comparison%20based%20on%20different%20parameters.png)

### Recommended Courses
![Recommended Courses](src/WEBSITE%20IMAGES/Recommended%20Courses%20based%20search%20query..png)

---

## 🐳 Docker Deployment

### Prerequisites
- Docker
- Docker Compose

### Build and Run

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

### Access Services
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **MongoDB**: localhost:27017

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Coding Standards
- Follow ESLint rules for JavaScript
- Use Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

---

## 🔧 Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```
Solution: Check your MONGO_URI in .env file
Ensure MongoDB is running (if local)
Verify network connectivity to MongoDB Atlas
```

#### Frontend Not Loading
```
Solution: Ensure backend is running on correct port
Check VITE_API_URL in frontend .env
Clear browser cache and restart dev server
```

#### Payment Gateway Error
```
Solution: Verify VITE_RAZORPAY_KEY_ID is set correctly
Use test key for development environment
Check Razorpay dashboard for API status
```

#### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

---

## 📝 Environment Variables Reference

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `PORT` | Server port | No (default: 5000) |
| `JWT_SECRET` | JWT signing key | Yes |
| `NODE_ENV` | Environment (development/production) | No |

### Frontend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_RAZORPAY_KEY_ID` | Razorpay API key | Yes |

---

## 🔐 Security Best Practices

1. ✅ Never commit `.env` files
2. ✅ Use strong passwords and rotate them regularly
3. ✅ Keep dependencies updated
4. ✅ Use HTTPS in production
5. ✅ Implement rate limiting
6. ✅ Validate all user inputs
7. ✅ Use prepared statements for database queries
8. ✅ Enable CORS only for trusted domains

---

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  full_name: String,
  email: String (unique),
  password: String (hashed),
  role: String (learner/admin/manager),
  createdAt: Date
}
```

### Course Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  duration: String,
  price: String,
  level: String,
  rating: Number,
  students: Number,
  instructor: String,
  youtubeLink: String,
  createdBy: ObjectId (ref: User)
}
```

### PurchasedCourse Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  courseId: ObjectId (ref: Course),
  progress: Number (0-100),
  purchaseDate: Date,
  completionDate: Date
}
```

---

## 🎯 Roadmap

- [ ] Add live video streaming
- [ ] Implement assignment submission system
- [ ] Add discussion forums
- [ ] Mobile app (React Native)
- [ ] Gamification features
- [ ] Peer-to-peer learning
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Authors & Contributors

- **ASWANTH** - [GitHub Profile](https://github.com/Aswanth-jpg)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Coursera API](https://www.coursera.org/) - External course integration
- [Razorpay](https://razorpay.com/) - Payment gateway
- [Sentence Transformers](https://www.sbert.net/) - NLP recommendations

---

## ⭐ Star This Repository

If you find this project helpful, please give it a star! ⭐

---

**Made with ❤️ by the Learn Genie Team**

© 2025 Learn Genie. All rights reserved.
