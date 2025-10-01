// src/app/components/ContactSellerButton.tsx
import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ChatApiService from '../services/ChatApiService';
import ChatPage from '../pages/Chat/ChatPage';

interface ContactSellerButtonProps {
  productId?: number;
  sellerId?: number;
  className?: string;
  variant?: string;
  size?: 'sm' | 'lg';
  children?: React.ReactNode;
  showModal?: boolean; // If true, opens chat in modal, if false navigates to chat page
}

const ContactSellerButton: React.FC<ContactSellerButtonProps> = ({
  productId,
  sellerId,
  className,
  variant = 'primary',
  size,
  children,
  showModal = false
}) => {
  const [showChatModal, setShowChatModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleContactSeller = async () => {
    setIsLoading(true);
    
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('ugflix_auth_token');
      const userStr = localStorage.getItem('ugflix_user');
      
      if (!token || !userStr) {
        // Redirect to login page
        navigate('/auth/login');
        return;
      }

      const currentUser = JSON.parse(userStr);
      
      // Don't allow user to contact themselves
      if (sellerId && currentUser.id === sellerId) {
        alert("You can't contact yourself");
        return;
      }
      
      // Start chat using ChatApiService
      if (sellerId) {
        // Start chat with specific seller
        console.log('🔄 Starting chat with seller:', sellerId, 'for product:', productId);
        
        const newChatHead = await ChatApiService.startChat({
          sender_id: currentUser.id,
          receiver_id: sellerId,
          product_id: productId
        });
        
        console.log('✅ Chat started successfully:', newChatHead);
        
        // Navigate to the standalone chat page with the new chat head ID
        navigate(`/chat?chatHeadId=${newChatHead.id}`);
      } else {
        // Navigate to general account chats page  
        navigate('/account/chats');
      }
    } catch (error: any) {
      console.error('❌ Error starting chat:', error);
      
      // Show user-friendly error message
      if (error.message && error.message.includes('not found')) {
        alert('Unable to start chat: User not found');
      } else {
        alert('Failed to start chat. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleContactSeller}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Starting chat...
          </>
        ) : (
          children || (
            <>
              <i className="bi bi-chat-dots me-2"></i>
              Contact Seller
            </>
          )
        )}
      </Button>

      {showModal && (
        <Modal
          show={showChatModal}
          onHide={() => setShowChatModal(false)}
          size="xl"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-chat-dots me-2"></i>
              Chat with Seller
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0" style={{ height: '70vh' }}>
            <ChatPage productId={productId} sellerId={sellerId} />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default ContactSellerButton;