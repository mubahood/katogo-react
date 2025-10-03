// src/app/pages/account/AccountChats.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import AccountApiService, { ChatConversation, ChatMessage } from '../../services/AccountApiService';
import './AccountChats.css';

const AccountChats: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle product details and initial messages from URL parameters
  useEffect(() => {
    const productId = searchParams.get('productId');
    const productName = searchParams.get('productName');
    const productPrice = searchParams.get('productPrice');
    const initialMessage = searchParams.get('initialMessage');

    // Priority 1: If initial message is present (from Connect profile), use it
    if (initialMessage && selectedConversation) {
      const decodedMessage = decodeURIComponent(initialMessage);
      setNewMessage(decodedMessage);
      
      // Focus on message input after a brief delay
      setTimeout(() => {
        messageInputRef.current?.focus();
        // Move cursor to end of text
        const textLength = decodedMessage.length;
        messageInputRef.current?.setSelectionRange(textLength, textLength);
      }, 500);
    }
    // Priority 2: If product details are present, auto-fill product message
    else if (productId && productName && selectedConversation) {
      const priceText = productPrice ? ` - UGX ${productPrice}` : '';
      const productMessage = `Hi! I'm interested in this product:\n\nProduct: ${decodeURIComponent(productName)}${priceText}\nProduct ID: ${productId}\n\nCould you provide more details?`;
      
      setNewMessage(productMessage);
      
      // Focus on message input after a brief delay
      setTimeout(() => {
        messageInputRef.current?.focus();
        // Move cursor to end of text
        const textLength = productMessage.length;
        messageInputRef.current?.setSelectionRange(textLength, textLength);
      }, 500);
    }
  }, [selectedConversation, searchParams]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async (isRetry: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await AccountApiService.getConversations();
      setConversations(data);
      setRetryCount(0);
      
      // Check if there's a specific chatId to select
      const chatId = searchParams.get('chatId');
      if (chatId && data.length > 0) {
        const targetChat = data.find(conv => conv.id === parseInt(chatId));
        if (targetChat) {
          setSelectedConversation(targetChat);
          return;
        }
      }
      
      // Auto-select first conversation if any
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
      }
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      const errorMessage = error?.message || 'Failed to load conversations';
      setError(errorMessage);
      
      // Auto-retry logic (max 3 attempts)
      if (!isRetry && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadConversations(true), 2000 * (retryCount + 1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      setIsLoadingMessages(true);
      setError(null);
      const response = await AccountApiService.getMessages(conversationId);
      setMessages(response.data);
      
      // Mark messages as read
      try {
        await AccountApiService.markMessagesAsRead(conversationId);
        
        // Update conversation unread count
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, unread_count: 0 }
              : conv
          )
        );
      } catch (markReadError) {
        // Don't fail if marking as read fails
        console.warn('Failed to mark messages as read:', markReadError);
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
      const errorMessage = error?.message || 'Failed to load messages';
      setError(errorMessage);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || !selectedConversation || isSending) {
      return;
    }

    // Validate message length
    if (trimmedMessage.length > 5000) {
      setError('Message is too long. Maximum 5000 characters.');
      return;
    }

    // Create optimistic message
    const optimisticMessage: ChatMessage = {
      id: Date.now(), // Temporary ID
      sender_id: 0, // Will be set by backend
      content: trimmedMessage,
      sent_at: new Date().toISOString(),
      message_type: 'text',
      status: 'sending'
    };

    try {
      setIsSending(true);
      setError(null);
      
      // Add optimistic message immediately
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
      
      // Send to backend
      const message = await AccountApiService.sendMessage(
        selectedConversation.id, 
        trimmedMessage
      );
      
      // Replace optimistic message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id 
            ? { ...message, status: 'sent' }
            : msg
        )
      );
      
      // Update conversation's last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { 
                ...conv, 
                last_message: {
                  id: message.id,
                  content: message.content,
                  sent_at: message.sent_at,
                  sender_id: message.sender_id
                }
              }
            : conv
        )
      );
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error?.message || 'Failed to send message';
      setError(errorMessage);
      
      // Mark optimistic message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
      
      // Restore message to input for retry
      setNewMessage(trimmedMessage);
    } finally {
      setIsSending(false);
    }
  };

    // Get initials from name (first letter of first and last name)
  const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Generate consistent color from name
  const getAvatarColor = (name: string): string => {
    if (!name) return '#667eea';
    
    const colors = [
      '#667eea', // Purple
      '#f093fb', // Pink
      '#4facfe', // Blue
      '#43e97b', // Green
      '#fa709a', // Rose
      '#feca57', // Yellow
      '#ee5a6f', // Red
      '#c471ed', // Violet
      '#f7797d', // Coral
      '#00d2ff', // Cyan
    ];
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Toggle mobile sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when conversation is selected on mobile
  const handleSelectConversation = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  // Skeleton loader component
  const ConversationSkeleton = () => (
    <div className="conversation-skeleton">
      <div className="skeleton-avatar"></div>
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-name"></div>
        <div className="skeleton-line skeleton-message"></div>
      </div>
    </div>
  );

  const MessageSkeleton = () => (
    <div className="message-skeleton">
      <div className="skeleton-bubble"></div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="account-chats">
        <div className="chat-layout">
          <div className="conversations-section">
            <div className="conversations-header">
              <h6>Loading...</h6>
            </div>
            <div className="conversations-list">
              {[1, 2, 3, 4, 5].map(i => <ConversationSkeleton key={i} />)}
            </div>
          </div>
          <div className="messages-section">
            <div className="messages-header">
              <div className="skeleton-avatar skeleton-avatar-small"></div>
              <div className="skeleton-line skeleton-name"></div>
            </div>
            <div className="messages-container">
              <div className="messages-list">
                {[1, 2, 3].map(i => <MessageSkeleton key={i} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-chats">
      {error && (
        <Alert 
          variant="danger" 
          dismissible 
          onClose={() => setError(null)}
          style={{ marginBottom: '12px', fontSize: '11px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div>
            <i className="bi bi-exclamation-triangle" style={{ marginRight: '6px' }}></i>
            {error}
          </div>
          {retryCount > 0 && retryCount < 3 && (
            <Button 
              size="sm" 
              variant="outline-light" 
              onClick={() => loadConversations()}
              style={{ fontSize: '10px', padding: '4px 8px', marginLeft: '8px' }}
            >
              <i className="bi bi-arrow-clockwise" style={{ marginRight: '4px' }}></i>
              Retry
            </Button>
          )}
        </Alert>
      )}

      {conversations.length > 0 ? (
        <>
          {/* Mobile Sidebar Overlay */}
          <div 
            className={`chat-sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
            onClick={toggleSidebar}
          ></div>

          {/* Mobile Toggle Button */}
          <button 
            className="chat-sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle conversations"
          >
            <i className="bi bi-chat-dots"></i>
          </button>

          <div className="chat-layout">
            {/* Conversations List - Flat, No Cards */}
            <div className={`conversations-section ${isSidebarOpen ? 'mobile-open' : ''}`}>
            <div className="conversations-header">
              <h6>Conversations ({conversations.length})</h6>
              <button 
                className="conversations-close" 
                onClick={toggleSidebar}
                aria-label="Close"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="conversations-list">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="conversation-avatar">
                    {conversation.participants[0]?.avatar ? (
                      <img 
                        src={conversation.participants[0].avatar} 
                        alt="Avatar"
                        onError={(e) => {
                          // Hide failed image and show initials fallback
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = 'conversation-avatar-placeholder';
                            fallback.style.background = getAvatarColor(conversation.participants[0]?.name || '');
                            fallback.textContent = getInitials(conversation.participants[0]?.name || 'Unknown');
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div 
                        className="conversation-avatar-placeholder"
                        style={{ 
                          background: getAvatarColor(conversation.participants[0]?.name || '')
                        }}
                      >
                        {getInitials(conversation.participants[0]?.name || 'Unknown')}
                      </div>
                    )}
                  </div>
                  
                  <div className="conversation-details">
                    <p className="conversation-name">
                      {conversation.participants.map(p => p.name).join(', ')}
                    </p>
                    <p className="conversation-preview">
                      {conversation.last_message.content}
                    </p>
                  </div>
                  
                  <div className="conversation-meta">
                    <span className="conversation-time">
                      {formatMessageTime(conversation.last_message.sent_at)}
                    </span>
                    {conversation.unread_count > 0 && (
                      <span className="unread-badge">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages Area - Flat, No Cards */}
          {selectedConversation ? (
            <div className="messages-section">
              <div className="messages-header">
                <div className="messages-header-avatar">
                  {selectedConversation.participants[0]?.avatar ? (
                    <img 
                      src={selectedConversation.participants[0].avatar} 
                      alt="Avatar"
                      onError={(e) => {
                        // Hide failed image and show initials fallback
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'conversation-avatar-placeholder';
                          fallback.style.background = getAvatarColor(selectedConversation.participants[0]?.name || '');
                          fallback.textContent = getInitials(selectedConversation.participants[0]?.name || 'Unknown');
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div 
                      className="conversation-avatar-placeholder"
                      style={{ 
                        background: getAvatarColor(selectedConversation.participants[0]?.name || '')
                      }}
                    >
                      {getInitials(selectedConversation.participants[0]?.name || 'Unknown')}
                    </div>
                  )}
                </div>
                <h6>
                  {selectedConversation.participants.map(p => p.name).join(', ')}
                </h6>
              </div>

              <div className="messages-container">
                {isLoadingMessages ? (
                  <div className="chat-loading">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : (
                  <div className="messages-list" ref={messageListRef}>
                    {messages.length === 0 ? (
                      <div className="chat-empty-messages">
                        <i className="bi bi-chat-text"></i>
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`message ${message.sender_id === selectedConversation.participants[0]?.id ? 'message-received' : 'message-sent'} ${message.status === 'failed' ? 'message-failed' : ''}`}
                        >
                          <div className="message-bubble">
                            <p>{message.content}</p>
                            <div className="message-meta">
                              <small className="message-time">
                                {new Date(message.sent_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </small>
                              {message.sender_id !== selectedConversation.participants[0]?.id && (
                                <span className="message-status">
                                  {message.status === 'sending' && (
                                    <i className="bi bi-clock" title="Sending..."></i>
                                  )}
                                  {message.status === 'sent' && (
                                    <i className="bi bi-check" title="Sent"></i>
                                  )}
                                  {message.status === 'delivered' && (
                                    <i className="bi bi-check-all" title="Delivered"></i>
                                  )}
                                  {message.status === 'read' && (
                                    <i className="bi bi-check-all text-primary" title="Read"></i>
                                  )}
                                  {message.status === 'failed' && (
                                    <i className="bi bi-exclamation-circle text-danger" title="Failed to send"></i>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="messages-input-area">
                <form className="messages-input-form" onSubmit={handleSendMessage}>
                  <textarea
                    ref={messageInputRef}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isSending}
                    rows={3}
                    onKeyDown={(e) => {
                      // Send on Enter, new line on Shift+Enter
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                  >
                    {isSending ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <i className="bi bi-send"></i>
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="chat-empty-state">
              <i className="bi bi-chat-dots"></i>
              <h5>Select a conversation</h5>
              <p>Choose a conversation from the list to start chatting</p>
            </div>
          )}
        </div>
        </>
      ) : (
        <div className="no-conversations-state">
          <i className="bi bi-chat-dots"></i>
          <h4>No Conversations</h4>
          <p>
            You don't have any conversations yet. Start chatting with sellers or buyers.
          </p>
          <button>
            <i className="bi bi-plus-circle"></i>
            Start New Conversation
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountChats;