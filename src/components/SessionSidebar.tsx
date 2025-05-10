import React, { useEffect } from 'react';
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
  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('session-sidebar');
      const menuButton = document.getElementById('menu-button');
      if (isOpen && sidebar && !sidebar.contains(e.target as Node) && menuButton && !menuButton.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div
        id="session-sidebar"
        className={`fixed top-0 left-0 h-full w-80 bg-white/10 backdrop-blur-xl border-r border-white/20 transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
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
                  className={`w-full text-left p-md rounded-xl transition-all duration-200 ${
                    session.sessionId === currentSessionId
                      ? 'bg-black/10 text-gray-dark scale-[0.98]'
                      : 'hover:bg-black/5 text-gray-medium hover:scale-[0.99]'
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
    </>
  );
};

export default SessionSidebar; 