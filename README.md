# 📚 DocuMind Answers - AI-Powered Document Intelligence Platform

**DocuMind Answers** is a full-stack RAG (Retrieval-Augmented Generation) application that empowers users to upload PDF documents and engage in intelligent conversations with their content. The platform leverages cutting-edge AI technologies to extract insights, answer questions, and generate quizzes from documents.

Built with a high-performance **FastAPI** backend, responsive **React** frontend, and powered by **LLM technologies** for advanced document understanding.

---

## 🎯 Project Overview

DocuMind Answers enables seamless interaction with PDF documents through:

- **AI-Powered Chat**: Ask questions about your documents and get contextual answers with citations
- **Quiz Generation**: Automatically generate quizzes from document content for learning and assessment
- **Multi-Document Support**: Chat across multiple documents simultaneously
- **OAuth Authentication**: Secure Google OAuth integration with JWT-based sessions
- **Vector Search**: Intelligent similarity search using Qdrant vector database

---

## 📂 Project Structure

```
documind-answers/
│
├── 📱 src/                              # React Frontend (Vite)
│   ├── api/                             # API service layer
│   │   ├── auth.ts                      # Authentication endpoints
│   │   ├── chat.ts                      # Chat API calls
│   │   ├── documents.ts                 # Document management
│   │   └── quiz.ts                      # Quiz generation
│   ├── components/                      # React components
│   │   ├── auth/                        # Authentication components
│   │   ├── chat/                        # Chat interface
│   │   ├── quiz/                        # Quiz components
│   │   ├── pdf/                         # PDF viewer components
│   │   ├── upload/                      # Document upload
│   │   ├── ui/                          # Reusable UI components (Radix UI)
│   │   └── layout/                      # Layout components
│   ├── pages/                           # Page components
│   │   ├── Landing.tsx                  # Home page
│   │   ├── Login.tsx                    # Google OAuth login
│   │   ├── Upload.tsx                   # Document upload page
│   │   ├── Chat.tsx                     # Chat interface page
│   │   ├── Quiz.tsx                     # Quiz page
│   │   └── NotFound.tsx                 # 404 page
│   ├── store/                           # Zustand state management
│   │   └── useAppStore.ts               # Global app state
│   ├── hooks/                           # Custom React hooks
│   ├── context/                         # React Context
│   ├── lib/                             # Utility functions
│   │   └── authFetch.ts                 # Auto-authenticated fetch
│   ├── types/                           # TypeScript types
│   ├── config.ts                        # Frontend configuration
│   ├── App.tsx                          # Main app component
│   ├── main.tsx                         # Entry point
│   └── index.css                        # Global styles
│
├── 🖥️ server/                           # FastAPI Backend (Python)
│   ├── app/
│   │   ├── main.py                      # FastAPI application entry
│   │   ├── core/
│   │   │   ├── config.py                # Configuration & settings
│   │   │   ├── database.py              # Database connection & setup
│   │   │   └── dependencies.py          # Dependency injection (auth)
│   │   ├── models/                      # SQLAlchemy ORM models
│   │   │   ├── user.py                  # User model
│   │   │   ├── pdf.py                   # PDF document model
│   │   │   ├── chunk.py                 # Text chunk model
│   │   │   ├── chat.py                  # Chat history model
│   │   │   ├── citation.py              # Citation model
│   │   │   └── quiz.py                  # Quiz model
│   │   ├── repos/                       # Database repositories (CRUD)
│   │   │   ├── user_repo.py             # User operations
│   │   │   ├── chat/                    # Chat repository
│   │   │   ├── document/                # Document repository
│   │   │   └── quiz/                    # Quiz repository
│   │   ├── routers/                     # API route handlers
│   │   │   ├── auth/                    # Authentication routes
│   │   │   ├── chat/                    # Chat endpoints
│   │   │   ├── document/                # Document endpoints
│   │   │   ├── quiz/                    # Quiz endpoints
│   │   │   ├── health.py                # Health check endpoint
│   │   │   └── citation/                # Citation endpoints
│   │   ├── services/                    # Business logic
│   │   │   ├── auth_service.py          # Authentication service
│   │   │   ├── chat/                    # Chat service
│   │   │   ├── document/                # Document processing
│   │   │   ├── quiz/                    # Quiz generation service
│   │   │   ├── rag/                     # RAG pipeline
│   │   │   └── prompts/                 # LLM prompts
│   │   ├── schemas/                     # Pydantic models (request/response)
│   │   │   ├── chat/                    # Chat schemas
│   │   │   ├── document/                # Document schemas
│   │   │   └── quiz/                    # Quiz schemas
│   │   ├── middlewares/                 # Middleware
│   │   │   ├── cors.py                  # CORS configuration
│   │   │   ├── logging.py               # Request logging
│   │   │   └── rate_limit.py            # Rate limiting
│   │   ├── utils/                       # Utility functions
│   │   ├── tasks/                       # Background tasks
│   │   └── __init__.py
│   ├── migrate_*.py                     # Database migration scripts
│   ├── .env.example                     # Environment variables template
│   ├── requirements.txt                 # Python dependencies
│   ├── pyproject.toml                   # Project configuration
│   ├── README.md                        # Backend documentation
│   └── start_chroma.py                  # Vector DB startup
│
├── 📦 Configuration Files
│   ├── package.json                     # Frontend dependencies
│   ├── tsconfig.json                    # TypeScript configuration
│   ├── vite.config.ts                   # Vite build config
│   ├── tailwind.config.ts               # Tailwind CSS config
│   ├── components.json                  # shadcn/ui config
│   ├── .env                             # Environment variables
│   ├── .env.example                     # Environment template
│   └── .gitignore                       # Git ignore rules
│
├── 📄 Documentation Files
│   └── README.md                        # This file
```

---

## ✨ Key Features

### 🔐 Authentication & Security

- **Google OAuth Integration**: Seamless login with Google accounts
- **JWT Sessions**: Secure token-based authentication
- **Protected Routes**: Role-based access control for authenticated users
- **User Data Isolation**: Each user's data is isolated and secure

### 📄 Document Management

- **PDF Upload**: Drag-and-drop interface for document uploads
- **Multi-Document Support**: Work with multiple documents in a single session
- **Document Parsing**: Intelligent PDF extraction with text chunking
- **Vector Indexing**: Automatic embedding and indexing with Qdrant

### 💬 AI Chat Interface

- **Context-Aware Responses**: Chat with AI about document content
- **Citation Tracking**: See exactly where information comes from
- **Multi-Document Chat**: Ask questions across multiple documents
- **Chat History**: Persistent conversation history for context

### 🎓 Quiz Generation

- **Automatic Quiz Creation**: Generate quizzes from document content
- **Multi-Document Quizzes**: Create quizzes spanning multiple documents
- **Multiple Question Types**: Various question formats for assessment
- **Learning Support**: Effective tool for studying and retention

### 🚀 Technical Features

- **Asynchronous Processing**: Non-blocking operations for large PDFs
- **RAG Pipeline**: Retrieval-Augmented Generation for accurate answers
- **Rate Limiting**: API protection against abuse
- **Request Logging**: Comprehensive logging for debugging
- **CORS Policy**: Secure cross-origin request handling
- **Vector Search**: Efficient similarity search using Qdrant

---

## 🔧 Tech Stack

### Frontend

- **React** 18.3 - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Modern build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **React Router** - Client-side routing
- **TanStack React Query** - Server state management
- **Zustand** - Lightweight state management
- **React Hook Form** - Form management
- **Framer Motion** - Animation library
- **React PDF** - PDF viewing

### Backend

- **FastAPI** - Modern async Python web framework
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation
- **LangChain** - LLM orchestration
- **Sentence Transformers** - Text embedding
- **Qdrant** - Vector database
- **PyMuPDF** - PDF processing
- **OpenCV** - Image processing
- **HTTPX** - Async HTTP client
- **Python Jose** - JWT token handling
- **Loguru** - Logging
- **SlowAPI** - Rate limiting

### AI/ML Models

- **Mistral AI** - LLM provider
- **Groq** - Fast inference
- **Google Gemini** - Alternative LLM
- **Hugging Face** - Model hosting
- **Sentence Transformers** - Text embeddings

### Database & Storage

- **PostgreSQL** - Relational database
- **Qdrant** - Vector database for embeddings
- **File Storage** - Upload directory for PDFs

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (frontend)
- **Python** 3.12+ (backend)
- **PostgreSQL** 12+ (database)
- **Qdrant** instance (vector database)
- **Google OAuth Credentials**

### Installation & Setup

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Chetan559/documind-answers.git
cd documind-answers
```

#### 2️⃣ Setup Backend (FastAPI)

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env

# Configure environment variables
# Edit .env with your API keys and database URL
```

**Required Environment Variables:**

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/documind

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# LLM API Keys (choose at least one)
MISTRAL_API_KEY=your_mistral_key
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
HUGGINGFACE_API_KEY=your_huggingface_key

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Start the Backend:**

```bash
# Run development server with auto-reload
python app/main.py
# or use uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

- API Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

#### 3️⃣ Setup Frontend (React)

```bash
# Navigate to root directory (or run from new terminal)
cd documind-answers  # if not already there

# Install dependencies
npm install
# or use yarn/bun
yarn install
bun install

# Create .env.local file for frontend configuration
echo "VITE_GOOGLE_CLIENT_ID=your_google_client_id" > .env.local
echo "VITE_API_URL=http://localhost:8000" >> .env.local

# Start development server
npm run dev
# or
yarn dev
bun dev
```

Frontend will be available at: `http://localhost:5173`

#### 4️⃣ Setup Database

```bash
# From server directory with venv activated
cd server

# Create PostgreSQL database
createdb documind

# Run migrations
python migrate_auth.py
python migrate_multi_doc.py
python migrate_quiz_multi_doc.py
```

#### 5️⃣ Start Vector Database (Qdrant)

```bash
# Using Docker (recommended)
docker run -p 6333:6333 qdrant/qdrant:latest

# Or with local Qdrant:
python start_chroma.py
```

### Running the Full Application

**Terminal 1 - Backend:**

```bash
cd server
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app/main.py
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

**Terminal 3 - Vector Database (if needed):**

```bash
docker run -p 6333:6333 qdrant/qdrant:latest
```

Visit: `http://localhost:5173` in your browser

---

## 📝 Available Scripts

### Frontend Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run build:dev     # Build in development mode
npm run preview       # Preview production build locally
npm run lint          # Run ESLint
npm run test          # Run tests (Vitest)
npm run test:watch    # Run tests in watch mode
npm run deploy        # Deploy to GitHub Pages
```

### Backend Scripts

```bash
# Direct execution
python app/main.py                    # Start server

# Via uvicorn
uvicorn app.main:app --reload         # Development mode
uvicorn app.main:app --host 0.0.0.0   # Production mode

# Migrations
python migrate_auth.py                # Setup authentication
python migrate_multi_doc.py           # Setup multi-doc support
python migrate_quiz_multi_doc.py      # Setup quiz tables
```

---

## 🔄 Workflow & Features

### User Journey

1. **Landing Page** (`/`) - Learn about DocuMind
2. **Login** (`/login`) - Authenticate with Google
3. **Upload** (`/upload`) - Upload PDF documents
4. **Chat** (`/chat`) - Interact with documents via AI chat
5. **Quiz** (`/quiz/:documentId`) - Generate and take quizzes

### Key User Flows

#### Uploading a Document

1. Navigate to upload page
2. Drag & drop or select PDF file
3. Document is processed and indexed
4. Document becomes available for chat and quiz

#### Chatting with Documents

1. Select document(s) from sidebar
2. Ask questions in chat interface
3. AI responds with answers and citations
4. View source chunks for verification

#### Generating Quizzes

1. Select a document
2. Click "Generate Quiz"
3. System creates quiz from document content
4. Answer questions to test knowledge

---

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**

- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify all required API keys are set
- Check logs for specific errors

**Frontend won't connect to backend:**

- Verify backend is running on port 8000
- Check CORS configuration
- Verify API_URL in frontend .env.local

**Document upload fails:**

- Ensure file is a valid PDF
- Check file size limits
- Verify uploads directory has write permissions

**Quiz generation fails:**

- Check LLM API keys are valid
- Verify document was processed successfully
- Check rate limits aren't exceeded

---

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/google          # Login with Google
GET    /api/auth/me              # Get current user
```

### Document Endpoints

```
GET    /api/documents            # List user's documents
POST   /api/documents/upload     # Upload new document
DELETE /api/documents/{doc_id}   # Delete document
```

### Chat Endpoints

```
POST   /api/chat                 # Send chat message
GET    /api/chat/{doc_id}        # Get chat history
GET    /api/citations            # Get citations for answer
```

### Quiz Endpoints

```
POST   /api/quiz/generate        # Generate quiz from documents
GET    /api/quiz/{quiz_id}       # Get quiz details
POST   /api/quiz/{quiz_id}/submit  # Submit quiz answers
```

For detailed API documentation, visit: `http://localhost:8000/docs`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📋 TODO & Roadmap

### ✅ Completed Features

- [x] Google OAuth Authentication
- [x] PDF Document Upload & Processing
- [x] AI Chat with Documents
- [x] Citation Tracking
- [x] Quiz Generation
- [x] Multi-Document Support
- [x] User Data Isolation
- [x] JWT Session Management
- [x] Rate Limiting
- [x] Request Logging

### 🔄 In Progress

- [ ] Advanced search filters
- [ ] Document annotations
- [ ] Sharing documents with other users
- [ ] Real-time collaboration
- [ ] Export chat history

### 📌 Planned Features

- [ ] Mobile app (React Native)
- [ ] Document summarization
- [ ] Multi-language support
- [ ] Custom prompts library
- [ ] Analytics dashboard
- [ ] Advanced document processing (OCR)
- [ ] Voice-based interaction
- [ ] AI-powered document recommendations
- [ ] Integration with cloud storage (Google Drive, OneDrive)
- [ ] Webhook support for integrations
- [ ] API rate limiting dashboard
- [ ] User activity logs
- [ ] Team workspaces
- [ ] Document versioning
- [ ] Batch processing

### 🔧 Technical Improvements Needed

- [ ] Add comprehensive unit tests
- [ ] Improve error handling and validation
- [ ] Add request schema validation
- [ ] Implement caching strategies
- [ ] Optimize vector search performance
- [ ] Add monitoring and alerting
- [ ] Implement audit logging
- [ ] Add API versioning
- [ ] Performance optimization for large documents
- [ ] Database query optimization
- [ ] Frontend bundle size optimization
- [ ] Add dark mode improvements
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] Add E2E tests

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team & Authors

**Chetan Sharma**

---

## 📞 Support & Contact

For support, email: cschetan559@gmail.com or open an issue on GitHub.

---

## 🙏 Acknowledgments

- FastAPI team for the excellent async framework
- React team for the powerful UI library
- LangChain for RAG pipeline
- Qdrant for vector database
- Radix UI for accessible components
- All open-source contributors

---

**Last Updated:** March 26, 2026

**Version:** 0.1.0
