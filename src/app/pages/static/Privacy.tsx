// src/app/pages/static/Privacy.tsx
import React from 'react';
import StaticPageLayout from '../../components/Layout/StaticPageLayout';
import { COMPANY_INFO } from '../../constants';

const Privacy: React.FC = () => {
  return (
    <StaticPageLayout
      title="Privacy Policy"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Privacy Policy', path: '/privacy' }
      ]}
    >
      <div className="static-content">
        <div className="static-intro">
          <p className="static-subtitle">
            Your privacy is important to us. This Privacy Policy explains how {COMPANY_INFO.NAME} collects,
            uses, and protects your personal information.
          </p>
        </div>

        <div className="static-section">
          <h3>1. Information We Collect</h3>
          <p>We collect information you provide directly to us, such as:</p>
          <ul className="static-list">
            <li><strong>Account Information:</strong> Name, email address, phone number, and password</li>
            <li><strong>Profile Information:</strong> Delivery addresses, payment information, and preferences</li>
            <li><strong>Transaction Data:</strong> Order history, payment details, and communication records</li>
            <li><strong>Communication:</strong> Messages between buyers and sellers, customer service interactions</li>
          </ul>
        </div>

        <div className="static-section">
          <h3>2. Automatically Collected Information</h3>
          <p>We automatically collect certain information when you use our platform:</p>
          <ul className="static-list">
            <li><strong>Device Information:</strong> IP address, device type, operating system, and browser type</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent on site, search queries, and click patterns</li>
            <li><strong>Location Data:</strong> General location information for delivery and local recommendations</li>
            <li><strong>Cookies:</strong> Small data files stored on your device to enhance user experience</li>
          </ul>
        </div>

        <div className="static-section">
          <h3>3. How We Use Your Information</h3>
          <p>We use the collected information to:</p>
          <ul className="static-list">
            <li>Process orders and facilitate transactions</li>
            <li>Provide customer support and respond to inquiries</li>
            <li>Improve our platform and develop new features</li>
            <li>Send order updates, promotional offers, and important notices</li>
            <li>Prevent fraud and ensure platform security</li>
            <li>Comply with legal obligations and resolve disputes</li>
          </ul>
        </div>

        <div className="static-section">
          <h3>4. Information Sharing</h3>
          <p>We may share your information in the following circumstances:</p>
          <ul className="static-list">
            <li><strong>With Sellers:</strong> Contact and delivery information necessary for order fulfillment</li>
            <li><strong>Service Providers:</strong> Third-party companies that help us operate our platform</li>
            <li><strong>Payment Processors:</strong> Secure payment handling by authorized financial partners</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and users</li>
            <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of business assets</li>
          </ul>
          <p><strong>We never sell your personal information to third parties for marketing purposes.</strong></p>
        </div>

        <div className="static-section">
          <h3>5. Data Security</h3>
          <p>We implement robust security measures to protect your information:</p>
          <ul className="static-list">
            <li>SSL encryption for all data transmission</li>
            <li>Secure servers with regular security updates</li>
            <li>Access controls limiting employee access to personal data</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Secure payment processing through certified providers</li>
          </ul>
        </div>

        <div className="static-section">
          <h3>6. Your Rights and Choices</h3>
          <p>You have the following rights regarding your personal information:</p>
          <ul className="static-list">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Update or correct inaccurate personal information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
            <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
          </ul>
        </div>

        <div className="static-section">
          <h3>7. Cookies and Tracking</h3>
          <p>
            We use cookies and similar technologies to enhance your experience. You can control cookie
            settings through your browser, but some features may not function properly if cookies are disabled.
          </p>
          <ul className="static-list">
            <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
          </ul>
        </div>

        <div className="static-section">
          <h3>8. Third-Party Services</h3>
          <p>
            Our platform may contain links to third-party websites or integrate with external services.
            We are not responsible for the privacy practices of these third parties. Please review their
            privacy policies before providing any information.
          </p>
        </div>

        <div className="static-section">
          <h3>9. Data Retention</h3>
          <p>
            We retain your personal information for as long as necessary to provide our services and
            comply with legal obligations. Account information is typically retained for the duration
            of your account plus 3 years after closure.
          </p>
        </div>

        <div className="static-section">
          <h3>10. International Transfers</h3>
          <p>
            Your information may be processed and stored in countries outside Uganda. We ensure appropriate
            safeguards are in place to protect your information during international transfers.
          </p>
        </div>

        <div className="static-section">
          <h3>11. Children's Privacy</h3>
          <p>
            Our platform is not intended for children under 18. We do not knowingly collect personal
            information from children. If you believe we have inadvertently collected such information,
            please contact us immediately.
          </p>
        </div>

        <div className="static-section">
          <h3>12. Changes to This Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. We will notify users of significant
            changes by email or through prominent notices on our platform. Your continued use constitutes
            acceptance of the updated policy.
          </p>
        </div>

        <div className="static-section">
          <h3>13. Contact Us</h3>
          <p>
            If you have questions about this Privacy Policy or how we handle your personal information,
            please contact us:
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

export default Privacy;
