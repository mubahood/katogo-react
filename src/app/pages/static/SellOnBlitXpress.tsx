// src/app/pages/static/SellOnBlitXpress.tsx
import React from 'react';
import StaticPageLayout from '../../components/Layout/StaticPageLayout';
import { COMPANY_INFO, STATIC_CONTENT } from '../../constants';

const SellOnBlitXpress: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Sell on BlitXpress' }
  ];

  return (
    <StaticPageLayout
      title="Sell on BlitXpress"
      subtitle="Join thousands of vendors and grow your business with Uganda's leading e-commerce platform"
      breadcrumbs={breadcrumbs}
    >
      <div>
        <h2>Why Choose BlitXpress?</h2>
        <p>
          BlitXpress is Uganda's premier e-commerce platform, connecting sellers with customers across the country. 
          Whether you're a small business owner, entrepreneur, or established retailer, we provide the tools and 
          support you need to succeed online.
        </p>

        <h2>Benefits of Selling with Us</h2>
        <div className="static-feature-grid">
          {STATIC_CONTENT.VENDOR_BENEFITS.map((benefit, index) => (
            <div key={index} className="static-feature-card">
              <i className="bi bi-check-circle static-feature-icon"></i>
              <p className="static-feature-description">{benefit}</p>
            </div>
          ))}
        </div>

        <h2>Requirements to Get Started</h2>
        <p>To maintain the quality and trust that our customers expect, we have the following requirements for vendors:</p>
        <ul>
          {STATIC_CONTENT.VENDOR_REQUIREMENTS.map((requirement, index) => (
            <li key={index}>{requirement}</li>
          ))}
        </ul>

        <h2>How to Get Started</h2>
        <p>Ready to start selling on BlitXpress? Follow these simple steps:</p>
        <ol>
          <li><strong>Contact Our Team:</strong> Reach out to us using the contact information below</li>
          <li><strong>Submit Documentation:</strong> Provide your business registration and product information</li>
          <li><strong>Account Setup:</strong> We'll help you set up your vendor account and product listings</li>
          <li><strong>Start Selling:</strong> Once approved, you can start receiving orders from customers</li>
        </ol>

        <h2>Contact Information</h2>
        <p>For more information about becoming a vendor or to get started, please contact us:</p>
        
        <div className="static-contact-grid">
          <div className="static-contact-item">
            <i className="bi bi-envelope static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">Email</p>
              <p className="static-contact-value">
                <a href={`mailto:${COMPANY_INFO.EMAIL}`}>{COMPANY_INFO.EMAIL}</a>
              </p>
            </div>
          </div>
          
          <div className="static-contact-item">
            <i className="bi bi-telephone static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">Phone</p>
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
          <h3 className="static-app-title">Ready to Start?</h3>
          <p className="static-app-description">
            Contact us today to begin your journey as a BlitXpress vendor. Our team is here to help you succeed.
          </p>
          <div className="static-app-buttons">
            <a 
              href={`mailto:${COMPANY_INFO.EMAIL}?subject=Vendor Application - BlitXpress`}
              className="static-app-button"
            >
              <i className="bi bi-envelope"></i>
              Send Email
            </a>
            <a 
              href={`https://wa.me/${COMPANY_INFO.WHATSAPP.replace(/\D/g, '')}?text=Hi, I'm interested in becoming a vendor on BlitXpress`}
              className="static-app-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-whatsapp"></i>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default SellOnBlitXpress;
