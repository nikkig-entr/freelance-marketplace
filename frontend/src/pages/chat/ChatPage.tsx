import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { api } from '../../services/api';
import { Message, MessageType, formatDateTime } from '../../types';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function ChatPage() {
  const params = useParams({ from: '/chat/$projectId' });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, joinProject, leaveProject, sendMessage, sendTyping, onMessage, onTyping, onUserJoined, onUserLeft } = useWebSocket();

  const projectId = parseInt(params.projectId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await api.getMessages(projectId);
        setMessages(data.items || []);
        await api.markMessagesRead(projectId);
      } catch (error) {
        toast.error('Failed to load messages');
        navigate('/projects');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [projectId, navigate]);

  useEffect(() => {
    if (!isConnected) return;

    joinProject(projectId);

    const unsubMessage = onMessage((message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    const unsubTyping = onTyping((data) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (data.isTyping && data.userId !== user?.id) {
          next.add(data.userId);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    });

    const unsubJoined = onUserJoined((data) => {
      setOnlineUsers((prev) => new Set([...prev, data.userId]));
    });

    const unsubLeft = onUserLeft((data) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    });

    return () => {
      leaveProject(projectId);
      unsubMessage();
      unsubTyping();
      unsubJoined();
      unsubLeft();
    };
  }, [isConnected, projectId, user?.id, joinProject, leaveProject, onMessage, onTyping, onUserJoined, onUserLeft]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    sendTyping(projectId, false);

    try {
      await api.sendMessage(projectId, { content, message_type: 'user' });
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to send message');
      setNewMessage(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    sendTyping(projectId, true);
    setTimeout(() => sendTyping(projectId, false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    try {
      await api.uploadFile(projectId, file);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const isOwnMessage = (message: Message) => message.user_id === user?.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 h-16">
              <Link to="/projects" className="text-gray-500 hover:text-gray-700">
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <div className="animate-pulse space-y-1">
                <div className="h-4 bg-gray-200 rounded w-48" />
                <div className="h-3 bg-gray-200 rounded w-32" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link to={`/projects/${projectId}`} className="text-gray-500 hover:text-gray-700">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <h1 className="font-semibold text-gray-900">Project Chat</h1>
              <p className="text-sm text-gray-500">Real-time communication</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-6" role="log" aria-live="polite">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center text-gray-500">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = isOwnMessage(message);
              const isSystem = message.message_type === 'system';

              if (isSystem) {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="px-4 py-1.5 text-xs text-gray-500 bg-gray-100 rounded-full">
                      {getSystemMessageText(message)}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  {!isOwn && (
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-1">
                      {message.user?.avatar_url ? (
                        <img src={message.user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <UserCircleIcon className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                  )}

                  <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                    {!isOwn && (
                      <p className="text-xs font-medium text-gray-500 mb-1 ml-1">
                        {message.user?.full_name || 'Unknown'}
                      </p>
                    )}
                    <div
                      className={`inline-block px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-primary-600 text-white rounded-tr-sm'
                          : 'bg-white text-gray-900 rounded-tl-sm shadow-sm border border-gray-200'
                      }`}
                    >
                      {message.file_url && (
                        <div className="mb-2">
                          <a
                            href={message.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
                          >
                            <PaperClipIcon className="w-5 h-5" />
                            {message.file_name}
                            {message.file_size && (
                              <span className="text-xs text-gray-500">
                                ({formatFileSize(message.file_size)})
                              </span>
                            )}
                          </a>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      {isOwn && (
                        <>
                          {message.is_read ? (
                            <CheckIcon className="w-4 h-4 text-primary-500" />
                          ) : (
                            <ClockIcon className="w-4 h-4" />
                          )}
                        </>
                      )}
                      <span>{formatMessageTime(message.created_at)}</span>
                    </div>
                  </div>

                  {isOwn && (
                    <div className="w-8 flex-shrink-0" />
                  )}
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {typingUsers.size > 0 && (
            <div className="flex justify-center px-4">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-500">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span>typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            <div className="relative flex-1">
              <input
                type="file"
                ref={fileInputRef}
                id="file-upload"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="file-upload"
                className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <PaperClipIcon className="w-6 h-6" />
              </label>
              <textarea
                value={newMessage}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent max-h-32"
                disabled={isSending}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="btn-primary p-3 rounded-xl disabled:opacity-50"
              aria-label="Send message"
            >
              {isSending ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </form>
          {isUploading && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading file...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function getSystemMessageText(message: Message): string {
  switch (message.system_event) {
    case 'bid_placed':
      return 'A new bid was placed on this project';
    case 'bid_accepted':
      return 'A bid was accepted - project started';
    case 'bid_rejected':
      return 'A bid was rejected';
    case 'project_started':
      return 'Project has been started';
    case 'project_completed':
      return 'Project has been completed';
    case 'payment_released':
      return 'Payment has been released';
    case 'dispute_opened':
      return 'A dispute has been opened';
    case 'user_joined':
      return `${message.system_data?.user_name || 'A user'} joined the chat`;
    case 'user_left':
      return `${message.system_data?.user_name || 'A user'} left the chat`;
    default:
      return 'System message';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Need to import Link
import { Link } from '@tanstack/react-router';