Smart Attendance System – Backend 🚀
This is the backend service for the Smart Attendance System, built with the MERN stack. It provides a robust set of APIs to handle authentication, class management, attendance sessions, and future integrations with device features like Bluetooth and Geo-location.

💻 Tech Stack
Node.js: The powerful runtime environment that allows JavaScript to be used on the server side.

Express.js: A minimalist web framework for Node.js, used to build our RESTful APIs.

MongoDB (Mongoose): Our NoSQL database, managed with Mongoose, to store user, class, and attendance data.

JWT + Bcrypt: The standard for secure authentication and authorization. Bcrypt hashes passwords, while JSON Web Tokens handle user sessions.

Nodemon: A utility that automatically restarts the server during development, making the workflow much smoother.

dotenv: Manages environment variables, keeping sensitive information separate from the codebase.

📂 Project Structure
backend/
│── src/
│ ├── config/ # Database connection and environment configs
│ ├── controllers/ # Contains the core business logic for each feature (user, class, attendance)
│ ├── models/ # Defines the Mongoose schemas for our data
│ ├── routes/ # The API endpoints that direct requests to the appropriate controllers
│ ├── middlewares/ # Authentication and validation middleware
│ └── server.js # The main entry point of the application
│
│── .env # Your environment variables (securely ignored by Git)
│── .gitignore
│── package.json
│── README.md
🛠️ Setup Instructions
1. Clone the Repository
Bash

git clone <your-repo-url>
cd backend
2. Install Dependencies
Bash

npm install
3. Configure Environment Variables
Create a .env file in the backend/ directory and add the following:

Code snippet

PORT=5000
MONGO_URI=mongodb://localhost:27017/attendance
JWT_SECRET=your_jwt_secret_key
4. Run the Server
For Development: Use npm run dev for automatic hot-reloading.

Bash

npm run dev
For Production: Use npm start to run the server.

Bash

npm start
⚡ API Endpoints
Authentication
Method	Endpoint	Description
POST	/api/auth/register	Registers a new user (teacher, student, or admin).
POST	/api/auth/login	Logs in a user and returns a JWT token.
Class Management
Method	Endpoint	Description
POST	/api/classes	Creates a new class (teacher only).
GET	/api/classes/:id	Fetches the details of a specific class.
Attendance
Method	Endpoint	Description
POST	/api/attendance/start	Starts a new attendance session for a class.
POST	/api/attendance/mark	Marks a student's attendance.
GET	/api/attendance/report/:classId	Generates and retrieves an attendance report for a class.
🤝 Contributing
We welcome contributions! To get started:

Fork the repository.

Create your feature branch: git checkout -b feature/my-feature.

Commit your changes: git commit -m "feat: Add my feature".

Push to the branch: git push origin feature/my-feature.

Open a Pull Request.