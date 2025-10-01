// src/app/pages/Chat/NewChatPage.tsx - BRAND NEW CHAT PAGE

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, ListGroup, Form, Button, Spinner, Badge, Alert } from 'react-bootstrap';
import ChatService, { ChatConversation, ChatMessage } from '../../services/ChatService';
import { ugflix_user } from '../../../Constants';
import Utils from '../../services/Utils';

const NewChatPage: React.FC = () => {
  // State
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string } | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize
  useEffect(() => {
    console.log('🚀 NewChatPage mounted');
    
    // Get current user
    const user = Utils.loadFromDatabase(ugflix_user);
    console.log('👤 Current user:', user);
    
    if (!user || !user.id) {
      console.error('❌ No user found in localStorage');
      setIsLoading(false);
      return;
    }
    
    setCurrentUser(user);
    loadConversations();
    
    // Setup polling for conversations every 10 seconds
    conversationsIntervalRef.current = setInterval(() => {
      loadConversations(true);
    }, 10000);
    
    // Cleanup
    return () => {
      if (conversationsIntervalRef.current) {
        clearInterval(conversationsIntervalRef.current);
      }
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
      }
    };
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      
      // Setup polling for messages every 5 seconds
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
      }
      
      messagesIntervalRef.current = setInterval(() => {
        loadMessages(selectedConversation.id, true);
      }, 5000);
    } else {
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
      }
    }
    
    return () => {
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
      }
    };
  }, [selectedConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations
  const loadConversations = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }
      
      const data = await ChatService.getConversations();
      console.log('📨 Loaded conversations:', data.length);
      setConversations(data);
      
      if (!silent) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Failed to load conversations:', error);
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  // Load messages for a conversation
  const loadMessages = async (chatHeadId: number, silent = false) => {
    try {
      const data = await ChatService.getMessages(chatHeadId);
      console.log('💬 Loaded messages:', data.length);
      setMessages(data);
      
      if (!silent) {
        // Mark as read
        await ChatService.markAsRead(chatHeadId);
      }
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || !currentUser || isSending) {
      return;
    }
    
    try {
      setIsSending(true);
      
      const message = await ChatService.sendMessage({
        chat_head_id: selectedConversation.id,
        receiver_id: selectedConversation.other_user_id,
        body: newMessage.trim()
      });
      
      console.log('✅ Message sent:', message);
      
      // Add message to local state
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update conversation list
      loadConversations(true);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // If not logged in
  if (!currentUser) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <strong>Authentication Required</strong>
          <p>Please log in to access your messages.</p>
          <Button variant="primary" href="/login">Go to Login</Button>
        </Alert>
      </Container>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your conversations...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="chat-container py-4">
      <Row className="g-3" style={{ height: '85vh' }}>
        {/* Conversations List */}
        <Col lg={4} md={5} className="d-flex flex-column">
          <div className="bg-dark rounded p-3 h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">💬 Messages</h5>
              <Badge bg="primary">{conversations.length}</Badge>
            </div>
            
            {conversations.length === 0 ? (
              <div className="text-center text-muted py-5">
                <p>No conversations yet</p>
              </div>
            ) : (
              <ListGroup variant="flush" className="flex-grow-1" style={{ overflowY: 'auto' }}>
                {conversations.map(conv => (
                  <ListGroup.Item
                    key={conv.id}
                    action
                    active={selectedConversation?.id === conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className="border-0 mb-2 rounded"
                    style={{ cursor: 'pointer', background: selectedConversation?.id === conv.id ? '#ff6b35' : '#2a2a2a' }}
                  >
                    <div className="d-flex align-items-start">
                      <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                        <span className="text-white fw-bold">
                          {conv.other_user_name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <strong className="text-truncate" style={{ color: selectedConversation?.id === conv.id ? 'white' : '#e0e0e0' }}>
                            {conv.other_user_name}
                          </strong>
                          <small className="text-muted">
                            {ChatService.formatTime(conv.last_message_time)}
                          </small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <p className="mb-0 text-truncate small" style={{ color: selectedConversation?.id === conv.id ? '#ffffff99' : '#999' }}>
                            {conv.last_message}
                          </p>
                          {conv.unread_count > 0 && (
                            <Badge bg="primary" pill className="ms-2">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        </Col>

        {/* Chat Window */}
        <Col lg={8} md={7} className="d-flex flex-column">
          {selectedConversation ? (
            <div className="bg-dark rounded h-100 d-flex flex-column">
              {/* Chat Header */}
              <div className="border-bottom border-secondary p-3">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                    <span className="text-white fw-bold">
                      {selectedConversation.other_user_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h6 className="mb-0 text-white">{selectedConversation.other_user_name}</h6>
                    {selectedConversation.product_name && (
                      <small className="text-muted">About: {selectedConversation.product_name}</small>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-grow-1 p-3" style={{ overflowY: 'auto', maxHeight: 'calc(85vh - 180px)' }}>
                {messages.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div>
                    {messages.map((msg, index) => (
                      <div
                        key={msg.id}
                        className={`mb-3 d-flex ${msg.is_mine ? 'justify-content-end' : 'justify-content-start'}`}
                        style={{
                          animation: 'slideIn 0.3s ease-out',
                          animationDelay: `${Math.min(index * 0.02, 0.3)}s`,
                          animationFillMode: 'both'
                        }}
                      >
                        <div
                          className="px-3 py-2 rounded-3 shadow-sm"
                          style={{
                            maxWidth: '70%',
                            background: msg.is_mine 
                              ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
                              : '#2a2a2a',
                            color: 'white',
                            borderBottomRightRadius: msg.is_mine ? '4px' : undefined,
                            borderBottomLeftRadius: msg.is_mine ? undefined : '4px'
                          }}
                        >
                          <p className="mb-1" style={{ wordBreak: 'break-word' }}>
                            {msg.body}
                          </p>
                          <small className="d-block text-end" style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                            {ChatService.formatTime(msg.created_at)}
                            {msg.is_mine && ' ✓'}
                          </small>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-top border-secondary p-3">
                <Form onSubmit={handleSendMessage}>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isSending}
                      className="bg-dark text-white border-secondary"
                      style={{ flex: 1 }}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={!newMessage.trim() || isSending}
                      style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', border: 'none' }}
                    >
                      {isSending ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        '➤'
                      )}
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          ) : (
            <div className="bg-dark rounded h-100 d-flex align-items-center justify-content-center">
              <div className="text-center text-muted">
                <div style={{ fontSize: '4rem' }}>💬</div>
                <h5 className="mt-3">Select a conversation</h5>
                <p>Choose a conversation from the list to start chatting</p>
              </div>
            </div>
          )}
        </Col>
      </Row>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .chat-container {
          background: #1a1a1a;
          min-height: 90vh;
        }
        
        .list-group-item:hover {
          opacity: 0.9;
        }
      `}</style>
    </Container>
  );
};

export default NewChatPage;
