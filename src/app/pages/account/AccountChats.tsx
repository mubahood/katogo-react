// src/app/pages/account/AccountChats.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spinner, Alert, Badge, ListGroup, Form, InputGroup } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import AccountApiService, { ChatConversation, ChatMessage } from '../../services/AccountApiService';

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

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await AccountApiService.getConversations();
      setConversations(data);
      
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
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      setIsLoadingMessages(true);
      const response = await AccountApiService.getMessages(conversationId);
      setMessages(response.data);
      
      // Mark messages as read
      await AccountApiService.markMessagesAsRead(conversationId);
      
      // Update conversation unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || isSending) {
      return;
    }

    try {
      setIsSending(true);
      const message = await AccountApiService.sendMessage(
        selectedConversation.id, 
        newMessage.trim()
      );
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
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
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading conversations...</span>
      </div>
    );
  }

  return (
    <div className="account-chats">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title mb-2">My Chats</h2>
          <p className="text-muted">Your conversations and messages</p>
        </div>
        <Badge bg="primary" className="fs-6">
          {conversations.reduce((total, conv) => total + conv.unread_count, 0)} unread
        </Badge>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {conversations.length > 0 ? (
        <Row className="g-3">
          {/* Conversations List */}
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0 pb-2">
                <h6 className="mb-0">Conversations</h6>
              </Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  {conversations.map((conversation) => (
                    <ListGroup.Item
                      key={conversation.id}
                      className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="d-flex align-items-center">
                        <div className="conversation-avatar me-3">
                          {conversation.participants[0]?.avatar ? (
                            <img 
                              src={conversation.participants[0].avatar} 
                              alt="Avatar"
                              className="rounded-circle"
                              width="40"
                              height="40"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                              style={{ width: '40px', height: '40px' }}
                            >
                              <i className="bi bi-person"></i>
                            </div>
                          )}
                        </div>
                        
                        <div className="conversation-details flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <h6 className="conversation-name mb-0 small">
                              {conversation.participants.map(p => p.name).join(', ')}
                            </h6>
                            <div className="d-flex align-items-center">
                              {conversation.unread_count > 0 && (
                                <Badge bg="danger" className="small me-2">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                              <small className="text-muted">
                                {formatMessageTime(conversation.last_message.sent_at)}
                              </small>
                            </div>
                          </div>
                          
                          <p className="conversation-preview text-muted small mb-0" style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {conversation.last_message.content}
                          </p>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          {/* Messages Area */}
          <Col md={8}>
            {selectedConversation ? (
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-transparent border-0">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      {selectedConversation.participants[0]?.avatar ? (
                        <img 
                          src={selectedConversation.participants[0].avatar} 
                          alt="Avatar"
                          className="rounded-circle"
                          width="32"
                          height="32"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                          style={{ width: '32px', height: '32px' }}
                        >
                          <i className="bi bi-person"></i>
                        </div>
                      )}
                    </div>
                    <h6 className="mb-0">
                      {selectedConversation.participants.map(p => p.name).join(', ')}
                    </h6>
                  </div>
                </Card.Header>

                <Card.Body className="messages-container" style={{ 
                  height: '400px', 
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {isLoadingMessages ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <Spinner animation="border" size="sm" />
                    </div>
                  ) : (
                    <div className="messages-list">
                      {messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`message mb-3 ${message.sender_id === selectedConversation.participants[0]?.id ? 'message-received' : 'message-sent'}`}
                        >
                          <div 
                            className={`message-bubble p-3 rounded ${
                              message.sender_id === selectedConversation.participants[0]?.id 
                                ? 'bg-light text-dark' 
                                : 'bg-primary text-white ms-auto'
                            }`}
                            style={{ 
                              maxWidth: '70%',
                              marginLeft: message.sender_id === selectedConversation.participants[0]?.id ? '0' : 'auto'
                            }}
                          >
                            <p className="mb-1">{message.content}</p>
                            <small className={`d-block text-end ${
                              message.sender_id === selectedConversation.participants[0]?.id 
                                ? 'text-muted' 
                                : 'text-white-50'
                            }`}>
                              {new Date(message.sent_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>

                <Card.Footer className="bg-transparent border-0">
                  <Form onSubmit={handleSendMessage}>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={isSending}
                      />
                      <Button 
                        type="submit" 
                        variant="primary"
                        disabled={!newMessage.trim() || isSending}
                      >
                        {isSending ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <i className="bi bi-send"></i>
                        )}
                      </Button>
                    </InputGroup>
                  </Form>
                </Card.Footer>
              </Card>
            ) : (
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="d-flex align-items-center justify-content-center">
                  <div className="text-center text-muted">
                    <i className="bi bi-chat-dots display-4 mb-3"></i>
                    <h5>Select a conversation</h5>
                    <p>Choose a conversation from the list to start chatting</p>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      ) : (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-chat-dots display-1 text-muted"></i>
          </div>
          <h4 className="mb-3">No Conversations</h4>
          <p className="text-muted mb-4">
            You don't have any conversations yet. Start chatting with sellers or buyers.
          </p>
          <Button variant="primary">
            <i className="bi bi-plus-circle me-2"></i>
            Start New Conversation
          </Button>
        </div>
      )}
    </div>
  );
};

export default AccountChats;