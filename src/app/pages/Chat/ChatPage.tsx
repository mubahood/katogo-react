// src/app/pages/Chat/ChatPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Alert, Badge, ListGroup } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import ChatApiService, { ChatHead, ChatMessage } from '../../services/ChatApiService';
import Utils from '../../services/Utils';
import { ugflix_auth_token, ugflix_user } from '../../../Constants';

interface ChatPageProps {
  productId?: number; // For contact seller functionality
  sellerId?: number;  // Specific seller to chat with
}

const ChatPage: React.FC<ChatPageProps> = ({ productId, sellerId }) => {
  const [searchParams] = useSearchParams();
  const [chatHeads, setChatHeads] = useState<ChatHead[]>([]);
  const [selectedChatHead, setSelectedChatHead] = useState<ChatHead | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: number } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const chatHeadsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Get current user
    const user = getCurrentUser();
    setCurrentUser(user);
    
    if (user) {
      loadChatHeads();
      
      // Set up real-time polling for chat heads every 10 seconds
      chatHeadsIntervalRef.current = setInterval(() => {
        loadChatHeads(true); // Silent refresh
      }, 10000);
    }
    
    // Cleanup on unmount
    return () => {
      if (chatHeadsIntervalRef.current) {
        clearInterval(chatHeadsIntervalRef.current);
      }
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Handle URL parameters after chat heads are loaded
    if (chatHeads.length > 0) {
      const chatHeadId = searchParams.get('chatHeadId');
      console.log('🔍 Processing chatHeadId from URL:', chatHeadId);
      console.log('📋 Available chat heads:', chatHeads.map(h => ({ id: h.id, name: h.product_owner_name || h.customer_name })));
      
      if (chatHeadId) {
        const targetChatHead = chatHeads.find(head => head.id === parseInt(chatHeadId));
        console.log('🎯 Target chat head found:', targetChatHead);
        
        if (targetChatHead) {
          console.log('✅ Selecting chat head:', targetChatHead.id);
          setSelectedChatHead(targetChatHead);
          return;
        } else {
          console.log('❌ Chat head not found in loaded heads');
        }
      }
      
      // If productId or sellerId is provided, start/open that chat
      if (productId || sellerId) {
        console.log('🔄 Handling contact seller for product/seller:', productId, sellerId);
        handleContactSeller();
      } else if (!selectedChatHead && chatHeads.length > 0) {
        // Auto-select first chat if no specific chat requested
        console.log('🔄 Auto-selecting first chat head');
        setSelectedChatHead(chatHeads[0]);
      }
    }
  }, [chatHeads, productId, sellerId, searchParams]);

  useEffect(() => {
    if (selectedChatHead) {
      loadMessages(selectedChatHead.id);
      
      // Set up real-time polling for messages every 5 seconds
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
      }
      
      messagesIntervalRef.current = setInterval(() => {
        loadMessages(selectedChatHead.id, true); // Silent refresh
      }, 5000);
    } else {
      // Clear interval when no chat is selected
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
        messagesIntervalRef.current = null;
      }
    }
    
    return () => {
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
        messagesIntervalRef.current = null;
      }
    };
  }, [selectedChatHead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentUser = (): { id: number } | null => {
    try {
      // Use centralized storage constants
      const token = Utils.loadFromDatabase(ugflix_auth_token);
      const user = Utils.loadFromDatabase(ugflix_user);
      
      console.log('🔍 ChatPage getCurrentUser:', {
        hasToken: !!token,
        hasUser: !!user,
        userId: user?.id,
        tokenLength: token?.length
      });
      
      if (token && user) {
        return user;
      }
      console.warn('⚠️ ChatPage: No token or user found in localStorage!');
      return null;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  };

  const loadChatHeads = async (silent: boolean = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
        setError(null);
      }
      
      const data = await ChatApiService.getChatHeads();
      
      if (!silent) {
        console.log('📥 Loaded chat heads:', data);
        console.log('🔍 Looking for chatHeadId:', searchParams.get('chatHeadId'));
      }
      
      setChatHeads(data);
    } catch (error) {
      console.error('Error loading chat heads:', error);
      if (!silent) {
        setError('Failed to load conversations');
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  const loadMessages = async (chatHeadId: number, silent: boolean = false) => {
    try {
      if (!silent) {
        setIsLoadingMessages(true);
      }
      
      const data = await ChatApiService.getChatMessages(chatHeadId);
      
      // Set isMyMessage property for each message
      const messagesWithUserFlag = data.map(message => ({
        ...message,
        isMyMessage: currentUser ? ChatApiService.isMyMessage(message, currentUser.id) : false
      }));
      
      // Only update if there are new messages (to avoid unnecessary re-renders)
      setMessages(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(messagesWithUserFlag)) {
          return messagesWithUserFlag;
        }
        return prev;
      });
      
      // Mark messages as read (only if not silent to avoid too many requests)
      if (!silent) {
        await ChatApiService.markAsRead(chatHeadId);
        
        // Update chat head unread count
        setChatHeads(prev => 
          prev.map(head => 
            head.id === chatHeadId 
              ? { 
                  ...head, 
                  customer_unread_messages_count: currentUser?.id.toString() === head.customer_id ? '0' : head.customer_unread_messages_count,
                  product_owner_unread_messages_count: currentUser?.id.toString() === head.product_owner_id ? '0' : head.product_owner_unread_messages_count
                }
              : head
          )
        );
      }
    } catch (error) {
      if (!silent) {
        console.error('Error loading messages:', error);
      }
    } finally {
      if (!silent) {
        setIsLoadingMessages(false);
      }
    }
  };

  const handleContactSeller = async () => {
    if (!currentUser) return;
    
    try {
      const targetSellerId = sellerId || 1; // Default to user ID 1 for contact seller
      
      // Check if chat already exists
      const existingChat = chatHeads.find(head => 
        (head.product_owner_id === targetSellerId.toString() && head.customer_id === currentUser.id.toString()) ||
        (head.customer_id === targetSellerId.toString() && head.product_owner_id === currentUser.id.toString())
      );
      
      if (existingChat) {
        setSelectedChatHead(existingChat);
        return;
      }
      
      // Start new chat
      const newChatHead = await ChatApiService.startSellerChat(productId);
      setChatHeads(prev => [newChatHead, ...prev]);
      setSelectedChatHead(newChatHead);
    } catch (error) {
      console.error('Error starting seller chat:', error);
      setError('Failed to start conversation with seller');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChatHead || !currentUser || isSending) {
      return;
    }

    try {
      setIsSending(true);
      
      // Get the other participant ID
      const otherParticipant = ChatApiService.getOtherParticipant(selectedChatHead, currentUser.id);
      
      const message = await ChatApiService.sendMessage({
        chat_head_id: selectedChatHead.id,
        receiver_id: parseInt(otherParticipant.id),
        body: newMessage.trim()
      });
      
      // Add message to local state with isMyMessage flag
      const messageWithUserFlag = {
        ...message,
        isMyMessage: true
      };
      
      setMessages(prev => [...prev, messageWithUserFlag]);
      setNewMessage('');
      
      // Update chat head's last message
      setChatHeads(prev => 
        prev.map(head => 
          head.id === selectedChatHead.id 
            ? { 
                ...head, 
                last_message_body: message.body,
                last_message_time: message.created_at,
                last_message_status: message.status || 'sent'
              }
            : head
        )
      );
      
      // Focus back on input
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteChat = async (chatHead: ChatHead) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }
    
    try {
      await ChatApiService.deleteChat(chatHead.id);
      setChatHeads(prev => prev.filter(head => head.id !== chatHead.id));
      
      if (selectedChatHead?.id === chatHead.id) {
        setSelectedChatHead(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    return ChatApiService.formatMessageTime(dateString);
  };

  const getTotalUnreadCount = () => {
    if (!currentUser) return 0;
    
    return chatHeads.reduce((total, head) => {
      return total + ChatApiService.getUnreadCount(head, currentUser.id);
    }, 0);
  };

  if (!currentUser) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Please log in to access your messages.
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" variant="primary" />
          <span className="ms-2">Loading conversations...</span>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container fluid className="chat-page py-4">
        <Row className="h-100">
          {/* Chat List Sidebar */}
          <Col lg={4} md={5} className="border-end">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="mb-1">Messages</h4>
                <small className="text-muted">Your conversations</small>
              </div>
              {getTotalUnreadCount() > 0 && (
                <Badge bg="primary" className="fs-6">
                  {getTotalUnreadCount()} unread
                </Badge>
              )}
            </div>

            {error && (
              <Alert variant="danger" className="mb-4">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}

            <div className="chat-list" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {chatHeads.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-chat-dots display-4 text-muted"></i>
                  <p className="text-muted mt-3">No conversations yet</p>
                  {(productId || sellerId) && (
                    <Button variant="primary" onClick={handleContactSeller}>
                      Start Conversation
                    </Button>
                  )}
                </div>
              ) : (
                <ListGroup variant="flush">
                  {chatHeads.map(head => {
                    const otherParticipant = ChatApiService.getOtherParticipant(head, currentUser.id);
                    const unreadCount = ChatApiService.getUnreadCount(head, currentUser.id);
                    const isSelected = selectedChatHead?.id === head.id;
                    
                    return (
                      <ListGroup.Item
                        key={head.id}
                        action
                        active={isSelected}
                        onClick={() => setSelectedChatHead(head)}
                        className="d-flex align-items-center p-3"
                      >
                        <div className="flex-shrink-0 me-3">
                          <img
                            src={Utils.img(otherParticipant.photo) || '/default-avatar.png'}
                            alt={otherParticipant.name}
                            className="rounded-circle"
                            width="50"
                            height="50"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <div className="d-flex justify-content-between align-items-start">
                            <h6 className="mb-1 text-truncate">{otherParticipant.name}</h6>
                            <small className="text-muted">{formatTime(head.last_message_time || head.created_at)}</small>
                          </div>
                          <p className="mb-1 text-muted text-truncate small">
                            {head.last_message_body || 'No messages yet'}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              {head.type === 'product' && head.product_name && (
                                <span className="badge bg-light text-dark me-1">Product: {head.product_name}</span>
                              )}
                            </small>
                            {unreadCount > 0 && (
                              <Badge bg="primary" pill>{unreadCount}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 ms-2">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(head);
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              )}
            </div>
          </Col>

          {/* Chat Messages Area */}
          <Col lg={8} md={7}>
            {selectedChatHead ? (
              <div className="chat-window h-100 d-flex flex-column">
                {/* Chat Header */}
                <div className="chat-header border-bottom p-3 bg-light">
                  <div className="d-flex align-items-center">
                    <img
                      src={Utils.img(ChatApiService.getOtherParticipant(selectedChatHead, currentUser.id).photo) || '/default-avatar.png'}
                      alt="Profile"
                      className="rounded-circle me-3"
                      width="40"
                      height="40"
                      style={{ objectFit: 'cover' }}
                    />
                    <div>
                      <h6 className="mb-0">{ChatApiService.getOtherParticipant(selectedChatHead, currentUser.id).name}</h6>
                      <small className="text-muted">
                        {selectedChatHead.type === 'product' && selectedChatHead.product_name && (
                          <span>Chatting about: {selectedChatHead.product_name}</span>
                        )}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="chat-messages flex-grow-1 p-3" style={{ overflowY: 'auto', maxHeight: '60vh' }}>
                  {isLoadingMessages ? (
                    <div className="d-flex justify-content-center">
                      <Spinner animation="border" size="sm" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-chat-text display-4 text-muted"></i>
                      <p className="text-muted mt-3">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => (
                        <div
                          key={message.id}
                          className={`mb-3 d-flex message-container ${
                            message.isMyMessage ? 'justify-content-end' : 'justify-content-start'
                          }`}
                          style={{
                            animation: 'messageSlideIn 0.3s ease-out',
                            animationDelay: `${Math.min(index * 0.02, 0.3)}s`,
                            opacity: 0,
                            animationFillMode: 'forwards'
                          }}
                        >
                          {!message.isMyMessage && (
                            <img
                              src={Utils.img(ChatApiService.getOtherParticipant(selectedChatHead, currentUser.id).photo) || '/default-avatar.png'}
                              alt="Avatar"
                              className="rounded-circle me-2"
                              width="32"
                              height="32"
                              style={{ objectFit: 'cover', alignSelf: 'flex-end' }}
                            />
                          )}
                          <div
                            className={`message-bubble p-3 rounded shadow-sm ${
                              message.isMyMessage 
                                ? 'bg-primary text-white message-sent' 
                                : 'bg-light text-dark message-received'
                            }`}
                            style={{ maxWidth: '70%' }}
                          >
                            <div className="message-content" style={{ wordBreak: 'break-word' }}>
                              {message.body}
                            </div>
                            <small 
                              className={`d-block mt-1 text-end ${
                                message.isMyMessage ? 'text-white-50' : 'text-muted'
                              }`}
                              style={{ fontSize: '0.75rem' }}
                            >
                              {formatTime(message.created_at)}
                              {message.isMyMessage && (
                                <span className="ms-2">
                                  {message.status === 'read' && <i className="bi bi-check-all text-white"></i>}
                                  {message.status === 'delivered' && <i className="bi bi-check-all"></i>}
                                  {!message.status || message.status === 'sent' ? <i className="bi bi-check"></i> : null}
                                </span>
                              )}
                            </small>
                          </div>
                          {message.isMyMessage && (
                            <img
                              src={Utils.img(currentUser?.id ? currentUser.id.toString() : '') || '/default-avatar.png'}
                              alt="You"
                              className="rounded-circle ms-2"
                              width="32"
                              height="32"
                              style={{ objectFit: 'cover', alignSelf: 'flex-end', display: 'none' }}
                            />
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="chat-input border-top p-3 bg-light">
                  <Form onSubmit={handleSendMessage}>
                    <InputGroup>
                      <Button
                        variant="outline-secondary"
                        onClick={() => messageInputRef.current?.focus()}
                        title="Emoji (Coming soon)"
                      >
                        <i className="bi bi-emoji-smile"></i>
                      </Button>
                      <Form.Control
                        ref={messageInputRef}
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          
                          // Show typing indicator
                          setIsTyping(true);
                          
                          // Clear previous timeout
                          if (typingTimeoutRef.current) {
                            clearTimeout(typingTimeoutRef.current);
                          }
                          
                          // Hide typing indicator after 1 second of no typing
                          typingTimeoutRef.current = setTimeout(() => {
                            setIsTyping(false);
                          }, 1000);
                        }}
                        disabled={isSending}
                        autoComplete="off"
                      />
                      <Button
                        variant="outline-secondary"
                        title="Attach file (Coming soon)"
                      >
                        <i className="bi bi-paperclip"></i>
                      </Button>
                      <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={!newMessage.trim() || isSending}
                      >
                        {isSending ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <i className="bi bi-send-fill"></i>
                        )}
                      </Button>
                    </InputGroup>
                  </Form>
                </div>
              </div>
            ) : (
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="text-center">
                  <i className="bi bi-chat-square-dots display-1 text-muted"></i>
                  <h5 className="mt-3 text-muted">Select a conversation to start messaging</h5>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      <style>{`
        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        .chat-page {
          min-height: 80vh;
          background: var(--ugflix-bg-primary);
          color: var(--ugflix-text-primary);
        }

        .chat-list {
          background: var(--ugflix-bg-secondary);
          border-radius: 8px;
          scrollbar-width: thin;
          scrollbar-color: var(--ugflix-primary) var(--ugflix-bg-card);
        }

        .chat-list::-webkit-scrollbar {
          width: 6px;
        }

        .chat-list::-webkit-scrollbar-track {
          background: var(--ugflix-bg-card);
          border-radius: 3px;
        }

        .chat-list::-webkit-scrollbar-thumb {
          background: var(--ugflix-primary);
          border-radius: 3px;
        }

        .chat-window {
          background: var(--ugflix-bg-secondary);
          border-radius: 8px;
          min-height: 70vh;
        }

        .chat-header {
          background: var(--ugflix-bg-card) !important;
          border-bottom: 1px solid var(--ugflix-border) !important;
          color: var(--ugflix-text-primary);
        }

        .chat-messages {
          background: var(--ugflix-bg-primary);
          scrollbar-width: thin;
          scrollbar-color: var(--ugflix-primary) var(--ugflix-bg-card);
        }

        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: var(--ugflix-bg-card);
          border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: var(--ugflix-primary);
          border-radius: 3px;
        }

        .message-container {
          transition: all 0.2s ease;
        }

        .message-bubble {
          max-width: 70%;
          word-wrap: break-word;
          border-radius: 18px !important;
          transition: all 0.2s ease;
          position: relative;
        }

        .message-bubble:hover {
          transform: translateY(-2px);
        }

        .message-bubble.message-sent {
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%) !important;
          color: white !important;
          border-bottom-right-radius: 4px !important;
          box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
        }

        .message-bubble.message-received {
          background: var(--ugflix-bg-card) !important;
          color: var(--ugflix-text-primary) !important;
          border: 1px solid var(--ugflix-border);
          border-bottom-left-radius: 4px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .message-bubble.bg-primary {
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%) !important;
          color: white !important;
        }

        .chat-input {
          background: var(--ugflix-bg-card) !important;
          border-top: 1px solid var(--ugflix-border) !important;
        }

        .chat-input .form-control {
          background: var(--ugflix-bg-secondary);
          border: 1px solid var(--ugflix-border);
          color: var(--ugflix-text-primary);
        }

        .chat-input .form-control:focus {
          background: var(--ugflix-bg-secondary);
          border-color: var(--ugflix-primary);
          color: var(--ugflix-text-primary);
          box-shadow: 0 0 0 0.2rem rgba(255, 107, 53, 0.25);
        }

        .list-group-item {
          background: var(--ugflix-bg-card) !important;
          border-color: var(--ugflix-border) !important;
          color: var(--ugflix-text-primary) !important;
        }

        .list-group-item:hover {
          background: var(--ugflix-bg-secondary) !important;
        }

        .list-group-item.active {
          background: var(--ugflix-primary) !important;
          border-color: var(--ugflix-primary) !important;
          color: var(--ugflix-text-on-primary) !important;
        }

        .badge.bg-light {
          background: var(--ugflix-bg-secondary) !important;
          color: var(--ugflix-text-secondary) !important;
          border: 1px solid var(--ugflix-border);
        }

        .alert-danger {
          background: rgba(220, 53, 69, 0.1);
          border-color: rgba(220, 53, 69, 0.3);
          color: var(--ugflix-text-primary);
        }

        @media (max-width: 768px) {
          .chat-page {
            padding: 0.5rem !important;
          }
          
          .chat-window {
            min-height: 60vh;
          }
          
          .chat-messages {
            max-height: 50vh;
          }
        }
      `}</style>
    </>
  );
};

export default ChatPage;