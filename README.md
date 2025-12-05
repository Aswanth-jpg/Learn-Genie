# LearnGenie - Learning Management System

A comprehensive Learning Management System (LMS) built with React, Node.js, and MongoDB. LearnGenie provides a platform for learners to discover, purchase, and track their progress in various courses, with integrated payment processing through Razorpay.

## Features

- 🎓 **Course Management** - Browse, search, and filter courses
- 👤 **User Roles** - Support for Learners, Managers, and Admins
- 💳 **Payment Integration** - Razorpay payment gateway for course purchases
- 📊 **Progress Tracking** - Track learning progress and completion
- 🎥 **Video Learning** - YouTube video integration for course content
- 📈 **Analytics Dashboard** - Course statistics and learner insights
- 🔔 **Notifications** - Real-time notifications for users
- ⭐ **Course Ratings** - Rate and review courses
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Chart.js** - Data visualization
- **Material-UI** - Component library
- **Lottie** - Animations

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Razorpay** - Payment processing
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables

### Additional Services
- **FastAPI** - Recommendation engine (Python)
- **MongoDB Atlas** - Cloud database
- **Razorpay** - Payment gateway

## Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/downloads/) (v3.9 or higher)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) (for database)
- [Razorpay Account](https://razorpay.com/) (for payment processing)

## Installation

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd LearnGenie-MAIN
```

### 2. Backend Setup

```bash
cd BACKEND
npm install
```

Create a `.env` file in the `BACKEND` directory:
```env
# MongoDB Connection
MONGO_URI=your_mongodb_atlas_connection_string

# Server Configuration
PORT=5000

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Frontend Setup

```bash
cd FRONTEND
npm install
```

### 4. FastAPI Setup (Optional - for recommendations)

```bash
cd FAST_API
pip install -r requirements.txt
```

## Running the Application

### Option 1: Manual Start

**Start Backend:**
```bash
cd BACKEND
npm run dev
```

**Start Frontend (in new terminal):**
```bash
cd FRONTEND
npm run dev
```

**Start FastAPI (optional, in new terminal):**
```bash
cd FAST_API
uvicorn recommendation_api:app --reload
```

### Option 2: Using PowerShell Scripts (Windows)

**Start Backend:**
```powershell
& ".\start-backend.ps1"
```

**Start Frontend (in new terminal):**
```powershell
& ".\start-frontend.ps1"
```

## Access the Application

- **Frontend**: http://localhost:5173/
- **Backend API**: http://localhost:5000/
- **FastAPI**: http://localhost:8000/ (if running)

## Project Structure

```
LearnGenie-MAIN/
├── BACKEND/                 # Node.js backend
│   ├── controllers/        # Business logic
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── app.js              # Main server file
│   └── package.json
│
├── FRONTEND/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   └── package.json
│
├── FAST_API/              # Python recommendation engine
│   ├── recommendation_api.py
│   └── requirements.txt
│
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/insert` - User registration
- `GET /api/check-user/:email` - Check if user exists

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/coursera-courses` - Get Coursera courses
- `POST /api/course_add` - Add new course
- `PUT /api/courses/:id` - Update course
- `POST /api/courses/:id/rate` - Rate a course

### Purchases
- `POST /api/purchase_course` - Purchase a course
- `GET /api/purchased_courses/:userId` - Get user's purchased courses
- `POST /api/mark_course_completed` - Mark course as completed
- `POST /api/update_course_progress` - Update learning progress

### Configuration
- `GET /api/razorpay-key` - Get Razorpay public key

## Environment Variables

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| MONGO_URI | MongoDB connection string | Yes |
| PORT | Server port (default: 5000) | No |
| RAZORPAY_KEY_ID | Razorpay public key | Yes |
| RAZORPAY_KEY_SECRET | Razorpay secret key | Yes |

## Security Notes

⚠️ **Important Security Considerations:**

1. Never commit `.env` files to Git
2. Keep your Razorpay secret key secure
3. Use strong passwords for MongoDB
4. Enable MongoDB Atlas IP whitelist
5. Use HTTPS in production
6. Implement proper authentication tokens (JWT) for production

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`

### Backend (Render)
1. Connect repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard

### Database
- MongoDB Atlas is already cloud-hosted
- No additional deployment needed

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

### npm not recognized
If you get "npm is not recognized" error:
- Make sure Node.js is installed
- Add Node.js to your system PATH
- Restart your terminal/VS Code

### MongoDB connection error
- Verify your MONGO_URI is correct
- Check MongoDB Atlas network access settings
- Ensure your IP is whitelisted

### Razorpay key not loading
- Verify `.env` file exists in BACKEND folder
- Check variable name is `RAZORPAY_KEY_ID` (not VITE_RAZORPAY_KEY_ID)
- Restart backend server after changing .env

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please open an issue in the GitHub repository.

---

**Built with ❤️ by Developer Aswanth**
