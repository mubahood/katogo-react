// src/app/pages/static/BuyerProtection.tsx
import React from 'react';
import StaticPageLayout from '../../components/Layout/StaticPageLayout';
import { STATIC_CONTENT, COMPANY_INFO } from '../../constants';

const BuyerProtection: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Buyer Protection' }
  ];

  return (
    <StaticPageLayout
      title={STATIC_CONTENT.BUYER_PROTECTION.TITLE}
      subtitle={STATIC_CONTENT.BUYER_PROTECTION.SUBTITLE}
      breadcrumbs={breadcrumbs}
    >
      <div>
        <h2>Our Commitment to You</h2>
        <p>
          At BlitXpress, your safety and satisfaction are our top priorities. We've implemented comprehensive 
          buyer protection measures to ensure you have a safe, secure, and enjoyable shopping experience.
        </p>

        <h2>Protection Features</h2>
        <div className="static-feature-grid">
          {STATIC_CONTENT.BUYER_PROTECTION.FEATURES.map((feature, index) => (
            <div key={index} className="static-feature-card">
              <i className={`${feature.icon} static-feature-icon`}></i>
              <h3 className="static-feature-title">{feature.title}</h3>
              <p className="static-feature-description">{feature.description}</p>
            </div>
          ))}
        </div>

        <h2>Secure Payment Processing</h2>
        <p>
          All payments on BlitXpress are processed through secure, encrypted channels. We support multiple 
          payment methods including:
        </p>
        <ul>
          <li>Mobile Money (MTN Mobile Money, Airtel Money)</li>
          <li>Bank Cards (Visa, Mastercard)</li>
          <li>Bank Transfers</li>
          <li>Cash on Delivery (where available)</li>
        </ul>

        <h2>Return & Refund Policy</h2>
        <p>
          We offer a hassle-free return policy to protect your purchases:
        </p>
        <ul>
          <li><strong>7-Day Return Window:</strong> Return items within 7 days of delivery</li>
          <li><strong>Quality Guarantee:</strong> Items must be as described or you get a full refund</li>
          <li><strong>Damaged Items:</strong> Report damaged items within 24 hours for immediate resolution</li>
          <li><strong>Wrong Items:</strong> We'll arrange free pickup and replacement for wrong items</li>
        </ul>

        <h2>Order Protection</h2>
        <p>Every order on BlitXpress is protected by our comprehensive order protection program:</p>
        <ul>
          <li><strong>Order Tracking:</strong> Track your order from dispatch to delivery</li>
          <li><strong>Delivery Guarantee:</strong> We ensure your order reaches you or provide a full refund</li>
          <li><strong>Quality Assurance:</strong> All products are verified before shipping</li>
          <li><strong>Dispute Resolution:</strong> Fair and fast resolution of any order disputes</li>
        </ul>

        <h2>Customer Support</h2>
        <p>
          Our dedicated customer support team is available to help you with any issues or questions. 
          We're committed to resolving problems quickly and fairly.
        </p>

        <div className="static-contact-grid">
          <div className="static-contact-item">
            <i className="bi bi-headset static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">24/7 Support</p>
              <p className="static-contact-value">Always here to help</p>
            </div>
          </div>
          
          <div className="static-contact-item">
            <i className="bi bi-clock static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">Response Time</p>
              <p className="static-contact-value">Within 2 hours</p>
            </div>
          </div>
          
          <div className="static-contact-item">
            <i className="bi bi-shield-check static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">Success Rate</p>
              <p className="static-contact-value">99.9% Resolution</p>
            </div>
          </div>
        </div>

        <h2>Reporting Issues</h2>
        <p>
          If you encounter any issues with your order, please contact us immediately using any of the 
          methods below:
        </p>

        <div className="static-contact-grid">
          <div className="static-contact-item">
            <i className="bi bi-envelope static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">Email Support</p>
              <p className="static-contact-value">
                <a href={`mailto:${COMPANY_INFO.EMAIL}`}>{COMPANY_INFO.EMAIL}</a>
              </p>
            </div>
          </div>
          
          <div className="static-contact-item">
            <i className="bi bi-telephone static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">Phone Support</p>
              <p className="static-contact-value">
                <a href={`tel:${COMPANY_INFO.PHONE}`}>{COMPANY_INFO.PHONE}</a>
              </p>
            </div>
          </div>
          
          <div className="static-contact-item">
            <i className="bi bi-whatsapp static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">WhatsApp</p>
              <p className="static-contact-value">
                <a href={`https://wa.me/${COMPANY_INFO.WHATSAPP.replace(/\D/g, '')}`}>
                  {COMPANY_INFO.WHATSAPP}
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="static-app-download">
          <h3 className="static-app-title">Shop with Confidence</h3>
          <p className="static-app-description">
            With our comprehensive buyer protection, you can shop on BlitXpress with complete peace of mind.
          </p>
          <div className="static-app-buttons">
            <a href="/products" className="static-app-button">
              <i className="bi bi-bag"></i>
              Start Shopping
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

export default BuyerProtection;
