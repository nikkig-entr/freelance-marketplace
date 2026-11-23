import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  ClockIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner, ListLoader } from '@/components/ui/LoadingSpinner';
import { messageService } from '@/services/api';
import { Message } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export function MessagesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showConversations, setShowConversations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchQuery = useRef('');

  const { data: conversations, isLoading: convLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => messageService.list('', { page_size: 20 }),
    enabled: !!user && !projectId,
  });

  const { data: messages, isLoading: msgLoading } = useQuery({
    queryKey: ['messages', projectId],
    queryFn: () => messageService.list(projectId!, { page_size: 50 }),
    enabled: !!projectId,
  });

  const { mutate: sendMessage, isPending: sendPending } = useMutation({
    mutationFn: (content: string) => messageService.send(projectId!, { content, message_type: 'text' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', projectId] });
      setNewMessage('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to send message');
    },
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (messageId: number) => messageService.markRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', projectId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages?.items) {
      messages.items.forEach((msg) => {
        if (!msg.is_read && msg.recipient_id === user?.id) {
          markRead(msg.id);
        }
      });
    }
  }, [messages, user?.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && projectId) {
      sendMessage(newMessage.trim());
    }
  };

  if (!user) return null;

  // Conversation List View (when no projectId)
  if (!projectId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-secondary-900">Messages</h1>
            <p className="mt-1 text-secondary-600">Your conversations with clients and freelancers</p>
          </div>
        </div>

        <Card padding="none">
          {convLoading ? (
            <ListLoader count={8} />
          ) : conversations?.items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-secondary-400" />
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-1">No conversations yet</h3>
              <p className="text-secondary-600 mb-4">Start a conversation by bidding on a project or posting one.</p>
              <Button asChild>
                <Link to="/projects">Browse Projects</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-secondary-200">
              {conversations!.items.map((conversation) => (
                <Link
                  key={conversation.id}
                  to={`/messages/${conversation.project_id}`}
                  className="flex items-center gap-4 p-4 hover:bg-secondary-50 transition-colors"
                >
                  <Avatar
                    name={conversation.sender?.full_name || 'User'}
                    src={conversation.sender?.avatar_url}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-secondary-900 truncate">
                        {conversation.sender?.full_name || 'User'}
                      </p>
                      <span className="text-xs text-secondary-400">
                        {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-secondary-600 truncate">{conversation.content}</span>
                      {!conversation.is_read && conversation.recipient_id === user.id && (
                        <Badge variant="primary" size="sm">New</Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Chat View (when projectId is provided)
  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200 bg-white">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="lg:hidden">
            <ChevronLeftIcon className="w-5 h-5" />
          </Button>
          <Avatar
            name={messages?.items[0]?.sender?.full_name || 'Project'}
            src={messages?.items[0]?.sender?.avatar_url}
            size="lg"
          />
          <div>
            <p className="font-medium text-secondary-900">Project Chat</p>
            <p className="text-sm text-secondary-500">Project #{projectId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm">Active</Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: '#f8fafc' }}>
        {msgLoading ? (
          <ListLoader count={10} />
        ) : messages?.items.length === 0 ? (
          <div className="text-center py-12 text-secondary-500">
            <PaperAirplaneIcon className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages!.items.map((message) => {
              const isOwn = message.sender_id === user.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] ${isOwn ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}
                  >
                    {!isOwn && (
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar name={message.sender?.full_name} src={message.sender?.avatar_url} size="sm" />
                        <span className="text-sm font-medium text-secondary-900">
                          {message.sender?.full_name || 'User'}
                        </span>
                        <span className="text-xs text-secondary-400">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                    <div
                      className={`relative px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-white text-secondary-900 rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {isOwn && (
                        <div className="flex items-center gap-1 mt-1 text-primary-100 text-xs">
                          {message.is_read ? (
                            <CheckIcon className="w-4 h-4" />
                          ) : (
                            <ClockIcon className="w-4 h-4" />
                          )}
                          <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Message Input */}
        <div className="border-t border-secondary-200 bg-white p-4">
          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            <Button variant="ghost" size="sm" type="button">
              <PaperClipIcon className="w-5 h-5" />
            </Button>
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 min-h-[44px] max-h-32 resize-none"
              disabled={sendPending}
            />
            <Button type="submit" disabled={!newMessage.trim() || sendPending} size="lg">
              <PaperAirplaneIcon className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}