# Helloji

Helloji is a full-stack coding practice and learning platform that combines problem-solving, submissions, video explanations, and an AI-powered mentor experience. The project is organized as a monorepo with two main parts:

- Backend service under [CODEDOJO](CODEDOJO)
- Frontend application under [Frontend](Frontend)

The platform allows users to register and authenticate, browse programming problems, submit solutions, upload or view solution videos, and interact with an AI assistant for guidance.

---

## 1. Overview

Helloji is designed as an educational coding platform where users can:

- create accounts and log in securely
- access programming problems by topic and identifier
- submit code solutions for review
- view and manage their submissions
- upload explanation videos for problems
- ask an AI mentor questions related to coding problems

The system is built around a modular backend API and a React-based frontend experience with Redux-based state management.

---

## 2. Project Structure

### Root structure

- [CODEDOJO](CODEDOJO) — backend API, database connection, AI services, models, and routes
- [Frontend](Frontend) — Vite + React frontend UI and pages

### Backend structure

- [CODEDOJO/src/index.js](CODEDOJO/src/index.js) — application bootstrap and route registration
- [CODEDOJO/src/config](CODEDOJO/src/config) — database and Redis connection setup
- [CODEDOJO/src/controllers](CODEDOJO/src/controllers) — request handlers for authentication, problems, submissions, and videos
- [CODEDOJO/src/models](CODEDOJO/src/models) — MongoDB schemas for users, problems, submissions, and videos
- [CODEDOJO/src/routes](CODEDOJO/src/routes) — API endpoints for users, problems, submissions, and videos
- [CODEDOJO/src/middleware](CODEDOJO/src/middleware) — authentication and authorization middleware
- [CODEDOJO/src/utils](CODEDOJO/src/utils) — validation helpers and problem-related utilities
- [CODEDOJO/src/ai](CODEDOJO/src/ai) — AI-related logic including embeddings, search, mentor support, and tool integrations

### Frontend structure

- [Frontend/src/main.jsx](Frontend/src/main.jsx) — app bootstrap
- [Frontend/src/App.jsx](Frontend/src/App.jsx) — route configuration and main app shell
- [Frontend/src/pages](Frontend/src/pages) — individual screens like login, signup, home, problem view, submissions, chat, and uploads
- [Frontend/src/store](Frontend/src/store) — Redux store configuration
- [Frontend/src/authSlice.js](Frontend/src/authSlice.js) — authentication state slice
- [Frontend/src/utils](Frontend/src/utils) — Axios instance and shared client configuration

---

## 3. Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Redux Toolkit
- Tailwind CSS
- DaisyUI
- Monaco Editor
- PrismJS
- React Markdown
- Axios
- Heroicons, Lucide React, React Icons
- Zod for validation
- ESLint for linting

### Backend

- Node.js + Express
- MongoDB with Mongoose
- Redis
- JWT for authentication
- bcrypt for password hashing
- cookie-parser for cookie-based auth
- CORS for cross-origin requests
- dotenv for environment configuration
- Cloudinary for media handling
- Judge0 API via RapidAPI for code execution and test-case evaluation
- LangChain and Google GenAI for AI workflows
- Pinecone vector database for semantic search or embeddings-based retrieval

### Development tooling

- npm
- nodemon for backend development
- Vite dev server for frontend development

---

## 4. Architecture

The system follows a classic client-server architecture with a clear separation between the frontend experience and the backend services.

### High-level architecture

1. The frontend user interface runs in the browser and communicates with the backend through HTTP requests.
2. The backend exposes REST-style routes for authentication, problem management, submissions, videos, and AI chat.
3. MongoDB stores core application data such as users, problems, submissions, and solution videos.
4. Redis is used as an auxiliary data store and can support caching or session-related workflows.
5. AI modules use LangChain, Google GenAI, and Pinecone to support search or mentor-like responses.

### Request flow

- A user signs up or logs in through the frontend.
- The authentication middleware verifies JWTs and attaches user identity to requests.
- Problem-related routes fetch or create problem data from MongoDB.
- Submission routes process and store code solutions.
- Video routes handle media metadata and solution video references.
- The AI endpoint accepts user questions and returns assistance using the configured AI stack.

---

## 5. Backend Design

### Express application

The backend entry point in [CODEDOJO/src/index.js](CODEDOJO/src/index.js) initializes:

- environment variables via dotenv
- the Express app
- CORS configuration for frontend origins
- JSON body parsing and cookie parsing
- route mounting for authentication, problems, submissions, chat, and videos
- connection initialization to MongoDB and Redis

### Main API areas

#### Authentication

The authentication flow is handled by [CODEDOJO/src/routes/userAuth.js](CODEDOJO/src/routes/userAuth.js) and [CODEDOJO/src/controllers/userAuthent.js](CODEDOJO/src/controllers/userAuthent.js).

Responsibilities include:

- user registration
- login
- token issuance
- cookie-based authentication support
- protected route access

#### Problems

Problem management is handled by [CODEDOJO/src/routes/problemCreator.js](CODEDOJO/src/routes/problemCreator.js) and [CODEDOJO/src/controllers/userProblem.js](CODEDOJO/src/controllers/userProblem.js).

Responsibilities include:

- creating and retrieving programming problems
- listing problems for the frontend
- assigning problem identifiers and metadata
- supporting problem-specific details and instructions

#### Submissions

Submission handling is implemented in [CODEDOJO/src/routes/submit.js](CODEDOJO/src/routes/submit.js) and [CODEDOJO/src/controllers/userSubmission.js](CODEDOJO/src/controllers/userSubmission.js).

Responsibilities include:

- storing submitted code
- tracking user submissions
- associating submissions with problems and users
- sending code and test cases to Judge0 for execution and evaluation
- supporting AI-assisted doubt-solving through the chat endpoint

#### Videos

Video-related functionality is handled by [CODEDOJO/src/routes/videoSolution.js](CODEDOJO/src/routes/videoSolution.js) and [CODEDOJO/src/controllers/videoSection.js](CODEDOJO/src/controllers/videoSection.js).

Responsibilities include:

- managing solution videos
- storing video metadata
- exposing video content to the frontend

### Middleware

- [CODEDOJO/src/middleware/userMiddleware.js](CODEDOJO/src/middleware/userMiddleware.js) — protects endpoints and authenticates the current user
- [CODEDOJO/src/middleware/adminMiddleware.js](CODEDOJO/src/middleware/adminMiddleware.js) — likely intended for admin-restricted operations

### Data models

#### User model

The user schema in [CODEDOJO/src/models/user.js](CODEDOJO/src/models/user.js) stores profile information, authentication details, and account metadata.

#### Problem model

The problem schema in [CODEDOJO/src/models/problem.js](CODEDOJO/src/models/problem.js) stores problem statements, categories, constraints, examples, and solution-related metadata.

#### Submission model

The submission schema in [CODEDOJO/src/models/submission.js](CODEDOJO/src/models/submission.js) stores code submissions, user associations, timestamps, and evaluation-related information.

#### Solution video model

The solution video schema in [CODEDOJO/src/models/solutionVideo.js](CODEDOJO/src/models/solutionVideo.js) stores video references and related metadata for educational explanations.

### Utilities and helpers

- [CODEDOJO/src/utils/validator.js](CODEDOJO/src/utils/validator.js) — validates request data and input quality
- [CODEDOJO/src/utils/ProblemUtility.js](CODEDOJO/src/utils/ProblemUtility.js) — supports problem utility logic
- [CODEDOJO/src/utils/langchain.js](CODEDOJO/src/utils/langchain.js) — integrates LangChain-based AI capabilities

### AI modules

The AI support in [CODEDOJO/src/ai](CODEDOJO/src/ai) includes:

- agent-based logic for assisted flows
- embeddings support for vector search
- mentor-style interaction
- problem search tooling
- Pinecone integration
- Google GenAI integration

These components indicate a strong AI-assistance direction, where the system can recommend, interpret, and help users solve coding problems.

---

## 6. Frontend Design

The frontend is a React-based single-page application built with Vite and styled with Tailwind CSS and DaisyUI.

### Main frontend features

- authentication pages for login and signup
- home page for browsing the platform
- problem detail page for viewing and solving problems
- code editor interface for writing solutions
- submission history and review screens
- chat-based AI assistant page
- video upload and video solution UI
- admin-related management screens

### State management

The frontend uses Redux Toolkit with [Frontend/src/store/store.js](Frontend/src/store/store.js) and [Frontend/src/authSlice.js](Frontend/src/authSlice.js) to manage global state such as:

- authentication status
- user information
- app-wide UI and request state

### Client configuration

[Frontend/src/utils/axios.js](Frontend/src/utils/axios.js) centralizes API communication and likely provides a configured Axios instance for backend calls.

### Routing

[Frontend/src/App.jsx](Frontend/src/App.jsx) configures the main navigation and page routes, connecting the UI sections with the backend-driven features.

### Key pages

- [Frontend/src/pages/Homepage.jsx](Frontend/src/pages/Homepage.jsx) — landing experience or main dashboard
- [Frontend/src/pages/Login.jsx](Frontend/src/pages/Login.jsx) — user login experience
- [Frontend/src/pages/Signup.jsx](Frontend/src/pages/Signup.jsx) — user registration experience
- [Frontend/src/pages/ProblemID.jsx](Frontend/src/pages/ProblemID.jsx) — detailed problem solving screen
- [Frontend/src/pages/mySubmission.jsx](Frontend/src/pages/mySubmission.jsx) — user submission history view
- [Frontend/src/pages/totalSubmission.jsx](Frontend/src/pages/totalSubmission.jsx) — aggregated submission view
- [Frontend/src/pages/chatAi.jsx](Frontend/src/pages/chatAi.jsx) — AI assistant interface
- [Frontend/src/pages/videoUpload.jsx](Frontend/src/pages/videoUpload.jsx) — video upload experience
- [Frontend/src/pages/deleteAndUpdate.jsx](Frontend/src/pages/deleteAndUpdate.jsx) — content management screen
- [Frontend/src/pages/Admin.jsx](Frontend/src/pages/Admin.jsx) — admin panel experience

### UI libraries and styling

The frontend uses a modern component stack:

- Tailwind CSS for layout and utility styling
- DaisyUI for ready-made UI patterns
- Heroicons, Lucide React, and React Icons for interface icons
- Monaco Editor for coding experience
- PrismJS and React Syntax Highlighter for code visualization
- React Markdown for rendering markdown-based content

---

## 7. Authentication and Authorization

The system uses JWT-based authentication with cookie support. The backend middleware ensures protected routes require a valid authenticated user. This design supports:

- secure login workflows
- user-specific submissions and problem access
- role-based or admin-oriented access control patterns

---

## 8. Database Design

The application relies on MongoDB through Mongoose for persistent application data. The main entities are:

- users
- problems
- submissions
- solution videos

This design allows the platform to support a content-driven, user-centric programming experience without overcomplicating the persistence layer.

---

## 9. AI Integration

One of the standout capabilities of the system is its AI layer, which transforms the platform from a static coding practice portal into an intelligent learning assistant.

### AI architecture

The backend AI stack is built around modular services in [CODEDOJO/src/ai](CODEDOJO/src/ai) and uses:

- Google GenAI for conversational and generation-based responses
- LangChain for orchestration and prompt-driven workflows
- Pinecone for vector-based retrieval and semantic search
- problem and submission data as context for personalized guidance

### Admin-side AI capabilities

The AI system is designed not only for end users, but also for platform administration:

- admins can use AI-driven workflows to create new coding questions automatically based on topic, difficulty, or technology requirements
- the assistant can update problem content autonomously through natural-language commands such as “make this question harder” or “rewrite this for beginners”
- AI can assist with maintaining quality by suggesting improved statements, test cases, hints, and explanations
- admin access can be used to manage question generation, content updates, and technology-based problem categorization

### User-side AI chatbot experience

The user-facing chatbot acts as a personal coding mentor rather than a simple support bot:

- it can review all of a user’s submissions and analyze patterns across problems
- it can inspect metrics such as attempts, runtime, memory usage, time taken, and pass/fail results
- it can identify weak areas and tell the user which questions they struggle with most
- it can recommend the next best practice questions based on the user’s performance and preferred technology stack
- it can provide targeted guidance for concepts such as React, Node.js, JavaScript, MongoDB, DSA, and other technologies

### Submission-aware intelligence

A key advantage of the platform is that the chatbot has access to the submission panel and can reason over the user’s actual coding history:

- “Which problems are causing repeated failures?”
- “What topics should I revise next?”
- “Which JavaScript or React questions should I solve next?”
- “Why am I failing on memory-heavy solutions?”

This makes the experience more personalized than a standard LeetCode-style platform, because it combines coding practice with AI-based performance analysis and technology-aware recommendations.

### AI-driven learning flow

In practice, the system supports a complete learning loop:

1. the user submits code and solves problems
2. the AI analyzes the submission outcome and behavior
3. it detects weak concepts and recurring mistakes
4. it recommends the next set of questions and explains how to improve
5. it helps the user move from trial-and-error practice to guided mastery

---

## 10. Getting Started

### Prerequisites

Before running the project locally, make sure you have:

- Node.js installed on your machine
- npm or another Node package manager
- MongoDB access for the backend database
- a working Redis connection if you want the auth/logout flow to behave fully
- environment variables configured for the backend

### Backend setup

1. Open a terminal and move into [CODEDOJO](CODEDOJO).
2. Install dependencies:
   - npm install
3. Create a local environment file with the required variables. The backend expects at least:
   - DB_CONNECT_STRING
   - JWT_SECRET_KEY
   - PORT
4. Start the backend server:
   - npx nodemon src/index.js
   - or node src/index.js

### Frontend setup

1. Open a second terminal and move into [Frontend](Frontend).
2. Install dependencies:
   - npm install
3. Start the development server:
   - npm run dev
4. Open the local Vite URL shown in the terminal, typically on port 5173.

### Example environment variables

A typical backend environment file should include values similar to the following:

- DB_CONNECT_STRING=your_mongodb_connection_string
- JWT_SECRET_KEY=your_secret_key
- PORT=5000

### Notes about current configuration

- The backend currently initializes MongoDB through [CODEDOJO/src/config/db.js](CODEDOJO/src/config/db.js).
- Redis credentials and host information are defined in [CODEDOJO/src/config/redis.js](CODEDOJO/src/config/redis.js).
- The frontend is configured to communicate with the backend through CORS origins defined in [CODEDOJO/src/index.js](CODEDOJO/src/index.js).

---

## 11. Development Workflow

### Backend startup

The backend can be run from [CODEDOJO](CODEDOJO) using the Node/Express server defined in [CODEDOJO/src/index.js](CODEDOJO/src/index.js).

### Frontend startup

The frontend is run with Vite using the scripts in [Frontend/package.json](Frontend/package.json).

### Typical development flow

1. Start the backend server.
2. Start the Vite frontend development server.
3. Open the frontend in the browser.
4. Use the app to authenticate, solve problems, submit solutions, and interact with AI assistance.

---

## 12. Environment Variables

The project uses environment variables for configuration, especially for:

- MongoDB connection string
- Redis configuration
- server port
- AI service credentials
- cloud storage or media service credentials

These values should be configured in a local environment file before running the application.

---

## 13. Potential Extensibility

The current architecture is extensible in several ways:

- add more problem categories and difficulty levels
- expand AI mentor capabilities
- add automated code evaluation
- add leaderboards and analytics
- add richer admin dashboards
- introduce course-based learning paths

---

## 14. Summary

Helloji is a polished educational platform that combines modern web development practices with AI-assisted learning. It is built around a robust full-stack architecture, a clear separation of concerns, and a user-centered experience for coding practice, submissions, video-based learning, and intelligent guidance.
