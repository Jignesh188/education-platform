# EduLearn - AI-Powered Education Dashboard

A modern, highly aesthetic education dashboard where students can upload documents, get AI-powered summaries, create adaptive quizzes, take exams with instant evaluation, and track learning progress.

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python FastAPI |
| Database | MongoDB Atlas |
| AI Model | Qwen3-VL via Ollama |

## 📁 Project Structure

```
Education/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── config.py         # Environment settings
│   │   ├── database.py       # MongoDB connection
│   │   ├── models/           # Pydantic models
│   │   ├── routers/          # API endpoints
│   │   ├── services/         # Business logic & AI
│   │   └── utils/            # Helpers
│   ├── uploads/              # Document storage
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/       # UI components
│   │   ├── context/          # React context
│   │   ├── pages/            # Route pages
│   │   └── App.jsx           # Main app
│   ├── package.json
│   └── .env
│
├── .venv/                    # Python virtual environment
└── .gitignore
```

## 🛠️ Setup Instructions

### 1. Backend Setup

```bash
# Navigate to project root
cd Education

# Activate virtual environment
source .venv/bin/activate

# Navigate to backend
cd backend

# Update .env with your credentials (already configured)
# - MONGODB_URI: Your MongoDB Atlas connection string
# - OLLAMA_BASE_URL: Your Ollama/ngrok endpoint
# - OLLAMA_MODEL: qwen3-vl:235b-instruct-cloud

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
# Open a new terminal
cd Education/frontend

# Install dependencies (already installed)
npm install

# Start the development server
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## ✨ Features

### 📄 Document Management
- Upload PDFs, images (JPEG, PNG, WebP), and DOCX files
- AI-powered text extraction and analysis
- Automatic summary generation
- Easy-to-understand explanations
- Key concept extraction

### 📝 Adaptive Quizzes
- Generate MCQ quizzes from any document
- Three difficulty levels: Easy, Medium, Hard
- Customizable question count (3-20)
- AI-generated explanations for each answer

### 📊 Exam & Analytics
- Interactive exam interface with timer
- Instant evaluation upon submission
- Detailed score breakdown (correct/wrong)
- Weak topic identification
- Performance analytics

### 📈 Progress Tracking
- Study streak tracking
- Daily activity charts
- Topic mastery visualization
- Achievement system

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get profile

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/` - List documents
- `GET /api/documents/{id}` - Get document details
- `DELETE /api/documents/{id}` - Delete document

### Quizzes
- `POST /api/quiz/create` - Generate quiz
- `GET /api/quiz/` - List quizzes
- `POST /api/quiz/submit` - Submit exam
- `GET /api/quiz/results/all` - Get all results

### Progress
- `GET /api/progress/overview` - Quick stats
- `GET /api/progress/detailed` - Full analytics

## 🎨 Design System

- **Theme**: Dark navy with solid colors (no gradients)
- **Typography**: Inter font family
- **Colors**:
  - Primary: `#3b82f6`
  - Secondary: `#8b5cf6`
  - Success: `#10b981`
  - Warning: `#f59e0b`
  - Error: `#ef4444`
- **Animations**: Student-themed loading with graduation cap, book, and pencil icons

## 📝 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://...
OLLAMA_BASE_URL=https://your-ngrok.ngrok-free.app/
OLLAMA_MODEL=qwen3-vl:235b-instruct-cloud
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 🚦 Running Both Servers

```bash
# Terminal 1 - Backend
cd Education
source .venv/bin/activate
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd Education/frontend
npm run dev
```

## 📄 License

MIT License
# education-platform
