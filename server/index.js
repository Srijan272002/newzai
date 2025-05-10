import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';

import { setupRagPipeline } from './ragPipeline.js';
import { chatRouter } from './routes/chat.js';
import { sessionRouter } from './routes/session.js';
import { newsRouter } from './routes/news.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'PORT',
  'REDIS_URL',
  'QDRANT_URL',
  'QDRANT_API_KEY',
  'QDRANT_COLLECTION',
  'GEMINI_API_KEY',
  'NEWSDATA_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.warn(`WARNING: Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Some features may not work correctly without these variables');
}

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',  // Local development
  'https://newzai.vercel.app', // Production frontend
];

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 1e8,
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE'],
}));
app.use(express.json());

// Initialize Redis client
const redisClient = new Redis(process.env.REDIS_URL);
redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Make Redis client available to routes
app.set('redisClient', redisClient);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Generate or use provided session ID
  const sessionId = socket.handshake.query.sessionId || uuidv4();
  socket.join(sessionId);
  
  // Send session ID to client
  socket.emit('session', { sessionId });
  
  socket.on('message', async (data) => {
    try {
      const { message, sessionId } = data;
      
      // Emit "typing" indicator immediately
      socket.emit('status', { type: 'typing', message: 'Searching for information...' });
      
      // Store user message in Redis (don't await)
      const storeUserMessage = redisClient.lpush(`chat:${sessionId}`, JSON.stringify({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      }));
      
      // Set TTL for the chat history (don't await)
      const setTTL = redisClient.expire(`chat:${sessionId}`, parseInt(process.env.REDIS_TTL, 10));
      
      // Broadcast user message immediately
      io.to(sessionId).emit('message', {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });
      
      // Process the message through RAG pipeline with status updates
      let processingStarted = false;
      const timeoutId = setTimeout(() => {
        if (!processingStarted) {
          socket.emit('status', { 
            type: 'processing', 
            message: 'This might take a moment...' 
          });
        }
      }, 3000);
      
      const botResponse = await processQuery(message);
      clearTimeout(timeoutId);
      processingStarted = true;
      
      // Store bot response in Redis (don't await)
      const storeBotResponse = redisClient.lpush(`chat:${sessionId}`, JSON.stringify({
        role: 'assistant',
        content: botResponse,
        timestamp: new Date().toISOString()
      }));
      
      // Send complete message immediately
      io.to(sessionId).emit('message', {
        role: 'assistant',
        content: botResponse,
        timestamp: new Date().toISOString(),
        isComplete: true
      });
      
      // Clear typing indicator
      socket.emit('status', { type: 'idle' });
      
      // Handle Redis operations in the background
      await Promise.all([storeUserMessage, setTTL, storeBotResponse]);
      
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', { message: 'Error processing your message' });
      socket.emit('status', { type: 'idle' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Initialize RAG pipeline
let processQuery = async (query) => {
  return "I'm sorry, the knowledge base is currently unavailable. Please try again later.";
};

(async () => {
  try {
    const ragPipeline = await setupRagPipeline();
    processQuery = ragPipeline.processQuery;
    console.log('RAG pipeline initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RAG pipeline:', error);
    // Continue running the server without the RAG pipeline
    console.log('Server will continue running with limited functionality');
  }
})();

// API Routes
app.use('/api/chat', chatRouter);
app.use('/api/session', sessionRouter);
app.use('/api/news', newsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await redisClient.quit();
  server.close(() => {
    console.log('Server shut down successfully');
    process.exit(0);
  });
});

export default app;