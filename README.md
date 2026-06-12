# ✨ PrepWise

PrepWise is a modern, full-stack competitive exam preparation platform designed to help students study smarter. It goes beyond simple quizzes by integrating advanced learning techniques like **Spaced Repetition (SRS)**, high-intensity **Speed Rounds**, and built-in **Pomodoro Timers** to maximize focus and retention.

## 🚀 Features

* **Spaced Repetition System (SRS):** Automatically tracks your mistakes and schedules them for review at scientifically optimized intervals (1, 3, 7, 14, 30 days) to ensure long-term retention.
* **Practice Mode with AI Tutor:** Stuck on a question? Get instant, personalized hints, simplified analogies, or step-by-step explanations powered by Google's Gemini AI.
* **Speed Round Sprint:** A high-intensity 10-question sprint mode with a 30-second timer per question to train your speed and pressure management.
* **Integrated Pomodoro Timer:** A built-in 25-minute focus timer that automatically logs your productive study time to your dashboard analytics.
* **PYQ & Mock Test Engine:** Browse previous year questions and take full-length mock tests with instant result generation.
* **Admin Panel:** Secure dashboard for administrators to add, edit, and manage the question bank.

## 💻 Tech Stack

This project was built using the **MERN Stack** with a focus on clean, scalable architecture:

* **Frontend:** React (powered by Vite for rapid development), Tailwind CSS for responsive styling, and React Router for seamless single-page navigation.
* **Backend:** Node.js and Express.js REST API using an MVC architecture (Models, Routes, Middleware).
* **Database:** MongoDB & Mongoose for robust document storage and schema validation.
* **Authentication:** Secure JWT (JSON Web Tokens) with role-based access control (Student vs. Admin).
* **AI Integration:** `@google/generative-ai` SDK.

## 🛠️ Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/prepwise.git
   cd prepwise
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/prepwise
   JWT_SECRET=your_secret_key
   ADMIN_SECRET_CODE=your_admin_code
   GEMINI_API_KEY=your_google_gemini_key
   ```
   Run the backend: `npm run dev`

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 📐 Architecture Note

This project strictly adheres to best practices for a student-built MERN stack application. It avoids unnecessary enterprise bloat (like Docker or Redux) in favor of a clean, highly readable, and maintainable Model-View-Controller structure.
