# Smart Attendance System – Backend

This is the **backend service** for the Smart Attendance System built using the **MERN stack**.  
It provides APIs for authentication, class management, attendance sessions, and integration with device features like Bluetooth/Geo-location (future).

## Tech Stack
- **Node.js** – Runtime environment  
- **Express.js** – Web framework for APIs  
- **MongoDB (Mongoose)** – Database for storing users, classes, and attendance logs  
- **JWT + Bcrypt** – Authentication & authorization  
- **Nodemon** – For local development hot-reload  
- **dotenv** – Manage environment variables  

## Project Structure
backend/
**src**
**config/** Database and environment configs

**controllers/** Business logic (user, class, attendance)

**models/** Mongoose schemas

**routes/** API routes

**middlewares/** Auth / validation middlewares

**server.js** Entry point

**env** Environment variables (ignored in git)

**gitignore** to ignore the heavy files

**package.json**

**README.md**

## Setup Instructions

### 1. Clone Repository
git clone <your-repo-url>
cd backend

### 2. Install Dependencies
npm install

### 3. Environment Variables
Create a .env file inside backend/:

env
PORT=5000
MONGO_URI=mongodb://localhost:27017/attendance
JWT_SECRET=your_jwt_secret

### 4. Run the Server
For development (with auto-restart):
npm run dev

For production:
npm start

### API Endpoints (Initial Draft)

Auth
POST /api/auth/register → Register new user (teacher/student/admin)

POST /api/auth/login → Login user and return JWT token

Class
POST /api/classes → Create class (teacher only)

GET /api/classes/:id → Get class details

Attendance
POST /api/attendance/start → Start attendance session

POST /api/attendance/mark → Mark student attendance

GET /api/attendance/report/:classId → Get attendance report

### Contributing
Fork the repo

Create a feature branch: git checkout -b feature/my-feature

Commit changes: git commit -m "Add my feature"

Push branch: git push origin feature/my-feature

Create a Pull Request