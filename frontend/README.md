# 🎓 Smart Attendance System – Frontend

This is the **frontend web application** for the Smart Attendance System, built using **React (Vite) + Tailwind CSS**.  
It connects to the backend (Node.js/Express + MongoDB) to provide teachers and students with a modern attendance management interface.

---

## 🚀 Tech Stack
- [React (Vite)](https://vite.dev/) – Lightning fast frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework
- [React Router](https://reactrouter.com/) – Client-side routing
- [Axios](https://axios-http.com/) – API requests
- [Context API] – Global state management for auth and user data

---

## 📂 Project Structure
frontend/
│── public/ # Static assets
│
│── src/
│ ├── api/ # API service functions (axios)
│ │ ├── auth.js # Auth APIs
│ │ ├── teacher.js # Teacher APIs
│ │ └── student.js # Student APIs (later)
│ │
│ ├── assets/ # Images, icons
│ ├── components/ # Reusable UI components
│ ├── contexts/ # Global contexts (Auth, Class)
│ ├── hooks/ # Custom hooks
│ ├── layouts/ # Layout wrappers (Teacher/Student)
│ ├── pages/ # Full-page views
│ │ ├── auth/ # Login, Register
│ │ ├── teacher/ # Teacher dashboard, classes, sessions
│ │ ├── student/ # Student pages (later)
│ │ └── NotFound.jsx
│ │
│ ├── routes/ # App routing
│ ├── styles/ # Global styles
│ ├── utils/ # Helpers (token, geo, etc.)
│ │
│ ├── App.jsx # Root component
│ ├── main.jsx # Entry point
│ └── vite-env.d.ts
│
│── .env.development # Dev API config
│── .env.production # Prod API config
│── package.json
│── vite.config.js
│── tailwind.config.js
│── README.md

yaml
Copy code

---

## ⚙️ Setup Instructions

### 1. Clone Repository
```bash
git clone <your-frontend-repo-url>
cd frontend
2. Install Dependencies
bash
Copy code
npm install
3. Environment Variables
Create .env.development:

env
Copy code
VITE_API_URL=http://localhost:5000/api
Create .env.production:

env
Copy code
VITE_API_URL=https://your-backend-domain.com/api
4. Run Development Server
bash
Copy code
npm run dev
➡️ App runs at http://localhost:5173/

5. Build for Production
bash
Copy code
npm run build
npm run preview
🔑 Features (Planned)
Teacher login, class creation, session control

Students join classes via code, mark attendance (geo-verified)

Real-time attendance tracking for teachers

Role-based access (teacher / student / admin)

Responsive UI with TailwindCSS

👨‍💻 Contributing
Fork the repo

Create a feature branch: git checkout -b feature/my-feature

Commit changes: git commit -m "Add my feature"

Push branch: git push origin feature/my-feature

Open a Pull Request