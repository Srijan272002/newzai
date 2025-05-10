import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import SessionSidebar from './SessionSidebar';
import { Message } from '../types/chat';
import { AlertCircle, Menu } from 'lucide-react';
import LoadingIndicator from './LoadingIndicator';

const SOCKET_URL = 'http://localhost:3001';
const API_BASE_URL = '/api';

interface ChatStatus {
  type: 'idle' | 'typing' | 'processing';
  message?: string;
}

interface Session {
  sessionId: string;
  lastMessage: string;
  timestamp: string;
}

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [streamedMessage, setStreamedMessage] = useState<Message | null>(null);
  const [status, setStatus] = useState<ChatStatus>({ type: 'idle' });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/session`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Unable to load chat sessions');
    }
  };

  // Initialize socket connection and session
  useEffect(() => {
    // Try to get existing session ID from local storage
    const storedSessionId = localStorage.getItem('chatSessionId');
    const currentSessionId = storedSessionId || uuidv4();
    
    if (!storedSessionId) {
      localStorage.setItem('chatSessionId', currentSessionId);
    }
    
    setSessionId(currentSessionId);
    
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      query: { sessionId: currentSessionId },
      transports: ['websocket', 'polling'],
      timeout: 60000,
    });
    
    // Socket event listeners
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      setError(null);
    });

    socketRef.current.on('connect_error', () => {
      setError('Unable to connect to chat server. Please check if the server is running.');
    });
    
    socketRef.current.on('session', (data) => {
      setSessionId(data.sessionId);
      localStorage.setItem('chatSessionId', data.sessionId);
    });
    
    socketRef.current.on('message', (message: Message) => {
      if (message.isComplete) {
        setStreamedMessage(null);
        setMessages((prevMessages) => [...prevMessages, message]);
        setIsLoading(false);
        // Refresh sessions after new message
        fetchSessions();
      }
    });
    
    socketRef.current.on('message-stream', (message: Message) => {
      setStreamedMessage(message);
    });
    
    socketRef.current.on('status', (newStatus: ChatStatus) => {
      setStatus(newStatus);
    });
    
    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
      setError('An error occurred while connecting to the chat server.');
      setIsLoading(false);
      setStatus({ type: 'idle' });
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your message. Please try again.',
          timestamp: new Date().toISOString(),
          isError: true
        }
      ]);
    });
    
    // Fetch chat history and sessions
    fetchChatHistory(currentSessionId);
    fetchSessions();
    
    // Cleanup socket connection on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedMessage]);
  
  // Fetch chat history from API
  const fetchChatHistory = async (sid: string) => {
    setIsHistoryLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat/${sid}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setError('Unable to load chat history. Please check if the server is running.');
    } finally {
      setIsHistoryLoading(false);
    }
  };
  
  // Send message to server
  const sendMessage = (content: string) => {
    if (!content.trim() || !socketRef.current) return;
    
    // Add user message to messages array
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);
    
    // Send message to server
    socketRef.current.emit('message', {
      message: content,
      sessionId
    });
  };
  
  // Clear chat history
  const clearChat = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      setMessages([]);
      setStreamedMessage(null);
      setError(null);
      fetchSessions();
    } catch (error) {
      console.error('Error clearing chat:', error);
      setError('Failed to clear chat history. Please try again.');
    }
  };
  
  // Create new session
  const createNewSession = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('chatSessionId');
      
      // Generate new session ID
      const newSessionId = uuidv4();
      localStorage.setItem('chatSessionId', newSessionId);
      setSessionId(newSessionId);
      
      // Reconnect socket with new session ID
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = io(SOCKET_URL, {
          query: { sessionId: newSessionId },
          transports: ['websocket', 'polling'],
          timeout: 60000,
        });
      }
      
      // Clear messages
      setMessages([]);
      setStreamedMessage(null);
      setError(null);
      fetchSessions();
    } catch (error) {
      console.error('Error creating new session:', error);
      setError('Failed to create new session. Please try again.');
    }
  };

  // Switch to a different session
  const switchSession = async (newSessionId: string) => {
    try {
      localStorage.setItem('chatSessionId', newSessionId);
      setSessionId(newSessionId);
      
      // Reconnect socket with new session ID
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = io(SOCKET_URL, {
          query: { sessionId: newSessionId },
          transports: ['websocket', 'polling'],
          timeout: 60000,
        });
      }
      
      // Fetch chat history for new session
      await fetchChatHistory(newSessionId);
      setIsSidebarOpen(false);
    } catch (error) {
      console.error('Error switching session:', error);
      setError('Failed to switch session. Please try again.');
    }
  };

  const retryConnection = () => {
    if (socketRef.current) {
      socketRef.current.connect();
      fetchChatHistory(sessionId);
    }
  };
  
  return (
    <div className="flex h-full">
      <SessionSidebar
        sessions={sessions}
        currentSessionId={sessionId}
        onSessionSelect={switchSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex flex-col h-full w-full glass-container rounded-card overflow-hidden">
        <div className="flex items-center p-md border-b border-white/20">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-sm hover:bg-black/5 rounded-full transition-colors mr-md"
            aria-label="Open session sidebar"
          >
            <Menu size={20} className="text-gray-dark" />
          </button>
          <h1 className="text-xl font-semibold text-gray-dark">NewsChat AI</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 backdrop-blur-sm border-l-4 border-primary-black p-lg">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-primary-black mr-md" />
              <span className="text-gray-dark">{error}</span>
            </div>
            <button
              onClick={retryConnection}
              className="mt-md text-small text-gray-medium hover:text-gray-dark transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {isHistoryLoading ? (
            <div className="flex justify-center items-center h-full p-lg">
              <LoadingIndicator />
            </div>
          ) : (
            <ChatMessages
              messages={messages}
              streamedMessage={streamedMessage}
              status={status}
              onExampleClick={(question) => {
                sendMessage(question);
              }}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/20 mt-auto backdrop-blur-sm">
          <ChatInput
            onSendMessage={sendMessage}
            isLoading={isLoading}
            onClearChat={clearChat}
            onNewSession={createNewSession}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;