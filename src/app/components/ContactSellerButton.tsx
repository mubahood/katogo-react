// src/app/components/ContactSellerButton.tsx
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AccountApiService from '../services/AccountApiService';
import ToastService from '../services/ToastService';

interface ContactSellerButtonProps {
  productId?: number;
  productName?: string;
  productPrice?: string | number;
  sellerId: number; // Required - the seller's user ID
  className?: string;
  variant?: string;
  size?: 'sm' | 'lg';
  children?: React.ReactNode;
}

const ContactSellerButton: React.FC<ContactSellerButtonProps> = ({
  productId,
  productName,
  productPrice,
  sellerId,
  className,
  variant = 'primary',
  size,
  children
}) => {
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
        ToastService.warning('Please login to contact seller');
        navigate('/auth/login');
        return;
      }

      const currentUser = JSON.parse(userStr);
      
      // Don't allow user to contact themselves
      if (currentUser.id === sellerId) {
        ToastService.warning("You can't contact yourself");
        return;
      }
      
      // Start conversation using AccountApiService (uses chat-start endpoint)
      console.log('🔄 Starting conversation with seller:', sellerId, 'for product:', productId);
      
      const conversation = await AccountApiService.startConversation(
        sellerId,
        productId ? `Hi, I'm interested in this product` : undefined
      );
      
      console.log('✅ Conversation started successfully:', conversation);
      
      // Build URL with conversation ID and optional product details
      let chatUrl = `/account/chats?chatId=${conversation.id}`;
      
      if (productId && productName) {
        chatUrl += `&productId=${productId}`;
        chatUrl += `&productName=${encodeURIComponent(productName)}`;
        if (productPrice) {
          chatUrl += `&productPrice=${encodeURIComponent(String(productPrice))}`;
        }
      }
      
      // Navigate to account chats with the new conversation ID and product details
      navigate(chatUrl);
      ToastService.success('Chat started successfully');
      
    } catch (error: any) {
      console.error('❌ Error starting conversation:', error);
      
      // Show user-friendly error message
      if (error?.message?.includes('not found')) {
        ToastService.error('Unable to start chat: User not found');
      } else if (error?.message?.includes('authenticated')) {
        ToastService.error('Please login to contact seller');
        navigate('/auth/login');
      } else {
        ToastService.error('Failed to start chat. Please try again.');
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
    </>
  );
};

export default ContactSellerButton;