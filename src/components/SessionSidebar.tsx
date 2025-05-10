import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChevronLeft, MessageSquare } from 'lucide-react';

interface Session {
  sessionId: string;
  lastMessage: string;
  timestamp: string;
}

interface SessionSidebarProps {
  sessions: Session[];
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  isOpen,
  onClose,
}) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-80 bg-white/10 backdrop-blur-xl border-r border-white/20 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-lg border-b border-white/20">
        <h2 className="text-xl font-semibold text-gray-dark">Chat History</h2>
        <button
          onClick={onClose}
          className="p-sm hover:bg-black/5 rounded-full transition-colors"
          aria-label="Close sidebar"
        >
          <ChevronLeft size={20} className="text-gray-dark" />
        </button>
      </div>

      <div className="overflow-y-auto h-[calc(100%-4rem)]">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-medium p-lg text-center">
            <MessageSquare size={32} className="mb-md opacity-50" />
            <p>No previous chats found</p>
          </div>
        ) : (
          <div className="p-md space-y-sm">
            {sessions.map((session) => (
              <button
                key={session.sessionId}
                onClick={() => onSessionSelect(session.sessionId)}
                className={`w-full text-left p-md rounded-xl transition-colors ${
                  session.sessionId === currentSessionId
                    ? 'bg-black/10 text-gray-dark'
                    : 'hover:bg-black/5 text-gray-medium'
                }`}
              >
                <div className="flex items-center gap-sm mb-xs">
                  <MessageSquare size={16} className="opacity-70" />
                  <span className="text-small font-medium">
                    {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-small line-clamp-2 opacity-80">{session.lastMessage}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionSidebar; 