// src/app/pages/static/Terms.tsx
import React from 'react';
import StaticPageLayout from '../../components/Layout/StaticPageLayout';
import { COMPANY_INFO } from '../../constants';

const Terms: React.FC = () => {
  return (
    <StaticPageLayout
      title="Terms & Conditions"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Terms & Conditions', path: '/terms' }
      ]}
    >
      <div className="static-content">
        <div className="static-intro">
          <p className="static-subtitle">
            Please read these Terms and Conditions carefully before using {COMPANY_INFO.NAME}.
          </p>
        </div>

        <div className="static-section">
          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing and using {COMPANY_INFO.NAME}, you accept and agree to be bound by the terms and provision of this agreement.
            If you do not agree to abide by the above, please do not use this service.
          </p>
        </div>

        <div className="static-section">
          <h3>2. Account Registration</h3>
          <p>
            To access certain features of our platform, you may be required to create an account. You are responsible for:
          </p>
          <ul className="static-list">
            <li>Providing accurate and complete information during registration</li>
            <li>Maintaining the security of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
          </ul>
        </div>

        <div className="static-section">
          <h3>3. Buyer Responsibilities</h3>
          <p>As a buyer on our platform, you agree to:</p>
          <ul className="static-list">
            <li>Provide accurate delivery information</li>
            <li>Pay for all orders placed through your account</li>
            <li>Report any issues with orders promptly</li>
            <li>Treat sellers and customer service staff with respect</li>
          </ul>
        </div>

        <div className="static-section">
          <h3>4. Seller Responsibilities</h3>
          <p>Sellers on our platform must:</p>
          <ul className="static-list">
            <li>Provide accurate product descriptions and images</li>
            <li>Honor all confirmed orders and delivery timeframes</li>
            <li>Maintain product quality standards</li>
            <li>Respond to customer inquiries promptly</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </div>

        <div className="static-section">
          <h3>5. Payment Terms</h3>
          <p>
            All payments are processed securely through our payment partners. We accept various payment methods
            including mobile money, bank transfers, and card payments. Refunds will be processed according to
            our refund policy.
          </p>
        </div>

        <div className="static-section">
          <h3>6. Shipping and Delivery</h3>
          <p>
            Delivery times are estimates provided by sellers. While we strive to ensure timely delivery,
            we are not responsible for delays caused by factors beyond our control.
          </p>
        </div>

        <div className="static-section">
          <h3>7. Returns and Refunds</h3>
          <p>
            Our return policy allows returns within 7 days of delivery for most items. Items must be in
            original condition. Refunds are processed within 5-10 business days after approval.
          </p>
        </div>

        <div className="static-section">
          <h3>8. Prohibited Activities</h3>
          <p>Users are prohibited from:</p>
          <ul className="static-list">
            <li>Selling counterfeit, illegal, or harmful products</li>
            <li>Manipulating reviews or ratings</li>
            <li>Harassing other users or staff</li>
            <li>Attempting to circumvent platform fees</li>
            <li>Violating any applicable laws or regulations</li>
          </ul>
        </div>

        <div className="static-section">
          <h3>9. Platform Fees</h3>
          <p>
            {COMPANY_INFO.NAME} charges commission fees on successful sales. Fee structures are clearly
            communicated to sellers during the registration process.
          </p>
        </div>

        <div className="static-section">
          <h3>10. Intellectual Property</h3>
          <p>
            All content on this platform, including but not limited to text, graphics, logos, and software,
            is the property of {COMPANY_INFO.NAME} or its content suppliers and is protected by copyright laws.
          </p>
        </div>

        <div className="static-section">
          <h3>11. Limitation of Liability</h3>
          <p>
            {COMPANY_INFO.NAME} shall not be liable for any indirect, incidental, special, consequential,
            or punitive damages resulting from your use of the platform.
          </p>
        </div>

        <div className="static-section">
          <h3>12. Changes to Terms</h3>
          <p>
            We reserve the right to modify these terms at any time. Users will be notified of significant
            changes, and continued use of the platform constitutes acceptance of the modified terms.
          </p>
        </div>

        <div className="static-section">
          <h3>13. Contact Information</h3>
          <p>
            For questions about these Terms & Conditions, please contact us:
          </p>
          <ul className="static-list">
            <li>Email: {COMPANY_INFO.EMAIL}</li>
            <li>Phone: {COMPANY_INFO.PHONE}</li>
            <li>WhatsApp: {COMPANY_INFO.WHATSAPP}</li>
          </ul>
        </div>

        <div className="static-footer">
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default Terms;
