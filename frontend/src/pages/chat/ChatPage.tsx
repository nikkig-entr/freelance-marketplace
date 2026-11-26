import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { messageService } from '@/services/api';
import { Message } from '@/types';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  CheckIcon,
  ClockIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface MessageWithMeta extends Message {
  metadata?: Record<string, unknown>;
}

interface PaginatedMessages {
  items: MessageWithMeta[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export function ChatPage() {
  const params = useParams({ from: '/chat/$projectId' });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, joinProject, leaveProject, sendTyping, onMessage, onTyping, onUserLeft } = useWebSocket();

  const projectId = parseInt(params.projectId);
  const [messages, setMessages] = useState<MessageWithMeta[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
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
        const data = await messageService.list(String(projectId)) as PaginatedMessages;
        setMessages(data.items || []);
        await messageService.markRead(projectId);
      } catch {
        toast.error('Failed to load messages');
        navigate({ to: '/projects' });
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
      setTypingUsers((prev: Set<number>) => {
        const next = new Set(prev);
        if (data.isTyping && data.userId !== user?.id) {
          next.add(data.userId);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    });

    const unsubLeft = onUserLeft((data) => {
      setTypingUsers((prev: Set<number>) => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    });

    return () => {
      leaveProject(projectId);
      unsubMessage();
      unsubTyping();
      unsubLeft();
    };
  }, [isConnected, projectId, user?.id, joinProject, leaveProject, onMessage, onTyping, onUserLeft]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    sendTyping(projectId, false);

    try {
      await messageService.send(String(projectId), { content, message_type: 'user' });
    } catch {
      toast.error('Failed to send message');
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
      // File upload would need a specific endpoint
      // await api.uploadFile(projectId, file);
      toast.success('File upload coming soon');
    } catch {
      toast.error('Failed to upload file');
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

  const isOwnMessage = (message: Message) => message.sender_id === user?.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
        <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 h-16">
              <Link to="/projects" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)]">
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <div className="animate-pulse space-y-1">
                <div className="h-4 bg-[var(--color-border)] rounded w-48" />
                <div className="h-3 bg-[var(--color-border)] rounded w-32" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-accent)] border-t-transparent" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Header */}
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link to="/projects" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)]">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <h1 className="font-semibold text-[var(--color-text)]">Project Chat</h1>
              <p className="text-sm text-[var(--color-text-muted)]">Real-time communication</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-success-muted)] text-[var(--color-success)]">
                <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
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
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center text-[var(--color-text-muted)]">
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
                    <div className="px-4 py-1.5 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] rounded-full">
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
                    <div className="w-8 h-8 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center flex-shrink-0 mt-1">
                      {message.sender?.avatar_url ? (
                        <img src={message.sender.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <UserCircleIcon className="w-5 h-5 text-[var(--color-accent)]" />
                      )}
                    </div>
                  )}

                  <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                    {!isOwn && (
                      <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1 ml-1">
                        {message.sender?.full_name || 'Unknown'}
                      </p>
                    )}
                    <div
                      className={`inline-block px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-[var(--color-accent)] text-white rounded-tr-sm'
                          : 'bg-[var(--color-surface)] text-[var(--color-text)] rounded-tl-sm shadow-sm border border-[var(--color-border)]'
                      }`}
                    >
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mb-2">
                          {message.attachments.map((att, idx) => (
                            <a
                              key={idx}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:underline"
                            >
                              <PaperClipIcon className="w-5 h-5" />
                              {att.name}
                              {att.size && (
                                <span className="text-xs text-[var(--color-text-muted)]">
                                  ({formatFileSize(att.size)})
                                </span>
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-subtle)]">
                      {isOwn && (
                        <>
                          {message.is_read ? (
                            <CheckIcon className="w-4 h-4 text-[var(--color-accent)]" />
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
              <div className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-surface-muted)] rounded-full text-sm text-[var(--color-text-muted)]">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[var(--color-text-subtle)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[var(--color-text-subtle)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[var(--color-text-subtle)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span>typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4">
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
                className="absolute left-3 top-3 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] cursor-pointer"
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
                className="w-full pl-12 pr-12 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder-[var(--color-text-subtle)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent max-h-32"
                disabled={isSending}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!newMessage.trim() || isSending}
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
            </Button>
          </form>
          {isUploading && (
            <div className="mt-2 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
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

function getSystemMessageText(message: MessageWithMeta): string {
  switch (message.metadata?.system_event as string) {
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
      return `${(message.metadata?.system_data as Record<string, unknown>)?.user_name || 'A user'} joined the chat`;
    case 'user_left':
      return `${(message.metadata?.system_data as Record<string, unknown>)?.user_name || 'A user'} left the chat`;
    default:
      return 'System message';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}