# NewzAI - AI-Powered News Chat Application

NewzAI is a real-time chat application that uses AI to provide intelligent responses about news and current events. The application consists of a React frontend and Node.js backend, utilizing WebSocket connections for real-time communication.

## 🚀 Features

- Real-time chat interface with AI responses
- Session management for conversation history
- WebSocket-based communication
- Responsive and modern UI
- Environment-based configuration
- Redis-backed message persistence
- News aggregation and analysis

## 🛠️ Tech Stack

### Frontend
- React 18
- Socket.io-client
- TypeScript
- Vite
- TailwindCSS
- Lucide React (for icons)

### Backend
- Node.js
- Express
- Socket.io
- Redis
- Google's Generative AI
- Qdrant Vector Database

## 📋 Prerequisites

- Node.js (v16 or higher)
- Redis server
- Qdrant server
- Google AI API key
- NewsData API key

## 🔧 Environment Setup

### Frontend (.env.local)
```env
VITE_API_URL=https://newzai-backend.vercel.app
VITE_SOCKET_URL=https://newzai-backend.vercel.app
VITE_ENV=production
```

### Backend (.env)
```env
PORT=3001
REDIS_URL=your_redis_url
REDIS_TTL=86400
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_COLLECTION=your_collection_name
GEMINI_API_KEY=your_gemini_api_key
NEWSDATA_API_KEY=your_newsdata_api_key
```

## 🚀 Installation & Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/newzai.git
cd newzai
```

2. Install dependencies for both frontend and backend
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Set up environment variables
- Copy `.env.example` to `.env` in the backend directory
- Copy `.env.local.example` to `.env.local` in the frontend directory
- Fill in your environment variables

4. Start the development servers
```bash
# Backend
cd backend
npm run dev

# Frontend (in a new terminal)
cd frontend
npm run dev
```

## 🌐 Deployment

The application is configured for deployment on Vercel:

1. Frontend: Deploy the frontend directory to Vercel
2. Backend: Deploy the backend directory to Vercel
3. Set up the environment variables in Vercel's dashboard
4. Ensure the WebSocket connections are properly configured in `vercel.json`

## 📝 API Routes

### WebSocket Events
- `connection`: Initial socket connection
- `message`: Send/receive chat messages
- `status`: Chat status updates
- `error`: Error events
- `session`: Session management

### REST Endpoints
- `GET /api/session`: Get all chat sessions
- `GET /api/chat/:sessionId`: Get chat history for a session
- `POST /api/chat/:sessionId`: Send a chat message
- `GET /api/news`: Get latest news articles

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Google Generative AI
- NewsData API
- Qdrant Vector Database
- All other open-source libraries used in this project 