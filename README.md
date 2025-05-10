# RAG-Powered News Chatbot

A full-stack chatbot that answers queries about news articles using Retrieval-Augmented Generation (RAG).

## Features

- Real-time chat with streaming responses
- Session management with unique identifiers
- RAG-based query processing with Google Gemini API
- News article ingestion from RSS feeds
- Chat history persistence with Redis
- Responsive UI for all devices
- Real-time news search using NewsData.io API
- Fallback to vector search for historical news
- Web search capability for comprehensive coverage
- Intelligent response generation using Google's Gemini model

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Embeddings**: Jina Embeddings
- **Vector Store**: Qdrant
- **LLM**: Google Gemini
- **Cache**: Redis
- **Real-time Communication**: Socket.io

## Getting Started

### Prerequisites

- Node.js 18+
- Redis server
- Qdrant server
- Google Gemini API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the `.env.example` file
4. Start Redis and Qdrant servers
5. Run the development server:
   ```bash
   npm run dev
   ```

## Caching Strategy

The application uses Redis for efficient caching with the following configurations:

### TTL Configuration

- Default TTL for chat sessions: 86400 seconds (24 hours)
- This can be configured in the `.env` file using the `REDIS_TTL` variable

### Cache Warming

In a production environment, you could implement cache warming by:

1. Pre-fetching popular news articles and generating embeddings
2. Periodically updating the vector store with new articles
3. Implementing a background job that refreshes embeddings for older articles

### Cache Invalidation

For production, consider these cache invalidation strategies:

1. Use Redis EXPIRE command to automatically expire old sessions
2. Implement a cleaning job that removes sessions older than X days
3. When users explicitly clear their chat, remove the corresponding cache entries

## Project Structure

```
project/
├── server/
│   ├── index.js           # Main server entry point
│   ├── ragPipeline.js     # RAG implementation
│   ├── services/
│   │   └── newsDataService.js  # NewsData.io integration
│   ├── routes/
│   │   ├── chat.js       # Chat endpoints
│   │   ├── session.js    # Session management
│   │   └── news.js       # News search endpoints
│   └── utils/            # Utility functions
```

## Environment Variables

Required environment variables:
- `PORT`: Server port number
- `REDIS_URL`: Redis connection URL
- `REDIS_TTL`: Redis cache TTL in seconds
- `QDRANT_URL`: Qdrant vector database URL
- `QDRANT_API_KEY`: Qdrant API key
- `QDRANT_COLLECTION`: Qdrant collection name
- `GEMINI_API_KEY`: Google Gemini API key
- `NEWSDATA_API_KEY`: NewsData.io API key

## License

MIT