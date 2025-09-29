// src/app/pages/static/Help.tsx
import React from 'react';
import StaticPageLayout from '../../components/Layout/StaticPageLayout';
import { COMPANY_INFO } from '../../constants';

const Help: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Help & Support' }
  ];

  const faqData = [
    {
      category: "Orders & Delivery",
      questions: [
        {
          question: "How can I track my order?",
          answer: "You can track your order by logging into your account and visiting the 'My Orders' section. You'll see real-time updates on your order status."
        },
        {
          question: "What are the delivery timeframes?",
          answer: "Delivery typically takes 1-3 business days within Kampala and 2-7 business days for other areas in Uganda, depending on the location and product availability."
        },
        {
          question: "Can I change my delivery address?",
          answer: "You can change your delivery address before your order is dispatched. Contact our support team immediately if you need to make changes."
        }
      ]
    },
    {
      category: "Payments & Pricing",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept Mobile Money (MTN, Airtel), Bank Cards (Visa, Mastercard), Bank Transfers, and Cash on Delivery for eligible orders."
        },
        {
          question: "Are there any hidden fees?",
          answer: "No, we believe in transparent pricing. All costs including delivery fees are clearly shown before you complete your purchase."
        },
        {
          question: "Can I get a refund?",
          answer: "Yes, we offer refunds within 7 days of delivery if the item is not as described or defective. Please see our Buyer Protection page for full details."
        }
      ]
    },
    {
      category: "Account & Registration",
      questions: [
        {
          question: "Do I need an account to shop?",
          answer: "While you can browse products without an account, you'll need to register to place orders, track purchases, and access your wishlist."
        },
        {
          question: "How do I reset my password?",
          answer: "Click 'Forgot Password' on the login page and enter your email address. We'll send you instructions to reset your password."
        },
        {
          question: "Can I update my profile information?",
          answer: "Yes, you can update your profile information anytime by logging into your account and visiting the 'Profile' section."
        }
      ]
    },
    {
      category: "Products & Quality",
      questions: [
        {
          question: "Are all products genuine?",
          answer: "Yes, we work only with verified vendors and have strict quality control measures to ensure all products are genuine and meet our standards."
        },
        {
          question: "What if I receive a damaged item?",
          answer: "Please report damaged items within 24 hours of delivery. We'll arrange for immediate replacement or refund at no cost to you."
        },
        {
          question: "Can I return items I don't like?",
          answer: "Yes, you can return items within 7 days if they're in original condition. Some restrictions may apply for certain product categories."
        }
      ]
    }
  ];

  return (
    <StaticPageLayout
      title="Help & Support"
      subtitle="Find answers to common questions and get the help you need"
      breadcrumbs={breadcrumbs}
    >
      <div>
        <h2>Frequently Asked Questions</h2>
        <p>
          Browse through our most commonly asked questions. If you can't find what you're looking for, 
          don't hesitate to contact our support team.
        </p>

        {faqData.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h3>{category.category}</h3>
            {category.questions.map((faq, faqIndex) => (
              <div key={faqIndex} style={{ marginBottom: 'var(--spacing-6)' }}>
                <h4 style={{ 
                  fontSize: 'var(--font-size-base)', 
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--primary-color)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  Q: {faq.question}
                </h4>
                <p style={{ 
                  marginLeft: 'var(--spacing-4)',
                  paddingLeft: 'var(--spacing-4)',
                  borderLeft: '3px solid var(--border-color)',
                  color: 'var(--text-color)'
                }}>
                  <strong>A:</strong> {faq.answer}
                </p>
              </div>
            ))}
          </div>
        ))}

        <h2>Contact Support</h2>
        <p>
          Still need help? Our friendly customer support team is here to assist you. Choose your preferred 
          contact method below:
        </p>

        <div className="static-feature-grid">
          <div className="static-feature-card">
            <i className="bi bi-envelope static-feature-icon"></i>
            <h3 className="static-feature-title">Email Support</h3>
            <p className="static-feature-description">
              Send us an email and we'll respond within 2 hours during business hours.
            </p>
            <a 
              href={`mailto:${COMPANY_INFO.EMAIL}`}
              style={{
                color: 'var(--primary-color)',
                fontWeight: 'var(--font-weight-medium)',
                textDecoration: 'none'
              }}
            >
              {COMPANY_INFO.EMAIL}
            </a>
          </div>

          <div className="static-feature-card">
            <i className="bi bi-telephone static-feature-icon"></i>
            <h3 className="static-feature-title">Phone Support</h3>
            <p className="static-feature-description">
              Call our toll-free number for immediate assistance.
            </p>
            <a 
              href={`tel:${COMPANY_INFO.PHONE}`}
              style={{
                color: 'var(--primary-color)',
                fontWeight: 'var(--font-weight-medium)',
                textDecoration: 'none'
              }}
            >
              {COMPANY_INFO.PHONE}
            </a>
          </div>

          <div className="static-feature-card">
            <i className="bi bi-whatsapp static-feature-icon"></i>
            <h3 className="static-feature-title">WhatsApp</h3>
            <p className="static-feature-description">
              Chat with us on WhatsApp for quick support and updates.
            </p>
            <a 
              href={`https://wa.me/${COMPANY_INFO.WHATSAPP.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--primary-color)',
                fontWeight: 'var(--font-weight-medium)',
                textDecoration: 'none'
              }}
            >
              {COMPANY_INFO.WHATSAPP}
            </a>
          </div>
        </div>

        <h2>Operating Hours</h2>
        <p>Our customer support team is available during the following hours:</p>
        <ul>
          <li><strong>Monday - Friday:</strong> 8:00 AM - 8:00 PM</li>
          <li><strong>Saturday:</strong> 9:00 AM - 6:00 PM</li>
          <li><strong>Sunday:</strong> 10:00 AM - 4:00 PM</li>
          <li><strong>WhatsApp:</strong> 24/7 (automated responses outside business hours)</li>
        </ul>

        <h2>Self-Service Options</h2>
        <p>You can also manage many aspects of your account and orders yourself:</p>
        
        <div className="static-contact-grid">
          <div className="static-contact-item">
            <i className="bi bi-person-gear static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">Account Management</p>
              <p className="static-contact-value">
                <a href="/account">Visit My Account</a>
              </p>
            </div>
          </div>
          
          <div className="static-contact-item">
            <i className="bi bi-bag-check static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">Order Tracking</p>
              <p className="static-contact-value">
                <a href="/account/orders">Track Orders</a>
              </p>
            </div>
          </div>
          
          <div className="static-contact-item">
            <i className="bi bi-heart static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">Wishlist</p>
              <p className="static-contact-value">
                <a href="/account/wishlist">View Wishlist</a>
              </p>
            </div>
          </div>
        </div>

        <div className="static-app-download">
          <h3 className="static-app-title">Need Immediate Help?</h3>
          <p className="static-app-description">
            For urgent matters, WhatsApp us directly for the fastest response.
          </p>
          <div className="static-app-buttons">
            <a 
              href={`https://wa.me/${COMPANY_INFO.WHATSAPP.replace(/\D/g, '')}?text=Hi, I need help with my BlitXpress order`}
              className="static-app-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-whatsapp"></i>
              WhatsApp Support
            </a>
            <a href="/account" className="static-app-button">
              <i className="bi bi-person"></i>
              My Account
            </a>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default Help;
