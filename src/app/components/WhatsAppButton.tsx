import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import './WhatsAppButton.css';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showText?: boolean;
  className?: string;
}

/**
 * WhatsApp Support Button Component
 * 
 * Floating button that opens WhatsApp chat with support
 * Default number: +1 (647) 968-6445
 */
const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = '+16479686445',
  message = 'Hello! I need help with my subscription',
  position = 'bottom-right',
  showText = true,
  className = '',
}) => {
  const handleClick = () => {
    // Remove all non-numeric characters from phone number
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Encode the message
    const encodedMessage = encodeURIComponent(message);
    
    // Construct WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const getPositionClass = () => {
    switch (position) {
      case 'bottom-left':
        return 'whatsapp-btn-bottom-left';
      case 'top-right':
        return 'whatsapp-btn-top-right';
      case 'top-left':
        return 'whatsapp-btn-top-left';
      default:
        return 'whatsapp-btn-bottom-right';
    }
  };

  return (
    <button
      className={`whatsapp-support-button ${getPositionClass()} ${className}`}
      onClick={handleClick}
      aria-label="Contact us on WhatsApp"
      title="Chat with support on WhatsApp"
    >
      <FaWhatsapp className="whatsapp-icon" size={24} />
      {showText && <span className="whatsapp-text">Need Help?</span>}
    </button>
  );
};

export default WhatsAppButton;
