// src/app/pages/legal/PrivacyPage.tsx
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const PrivacyPage: React.FC = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <div className="text-center mb-5">
            <h1 className="h2 fw-bold">Privacy Policy</h1>
            <p className="text-muted">Last updated: July 5, 2025</p>
          </div>

          <div className="content">
            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
              </p>
              
              <h5 className="fw-semibold mt-4 mb-2">Personal Information</h5>
              <ul>
                <li>Name and contact information (email, phone, address)</li>
                <li>Payment information (credit card details, billing address)</li>
                <li>Account credentials (username, password)</li>
                <li>Purchase history and preferences</li>
                <li>Communication history with our support team</li>
              </ul>

              <h5 className="fw-semibold mt-4 mb-2">Automatically Collected Information</h5>
              <ul>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, clicks)</li>
                <li>Cookies and tracking technologies data</li>
                <li>Location information (if you enable location services)</li>
              </ul>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">2. How We Use Your Information</h2>
              <p>
                We use the information we collect for various purposes, including:
              </p>
              <ul>
                <li>Processing and fulfilling your orders</li>
                <li>Providing customer support and responding to inquiries</li>
                <li>Personalizing your shopping experience</li>
                <li>Sending promotional emails and marketing communications (with your consent)</li>
                <li>Improving our website and services</li>
                <li>Preventing fraud and ensuring security</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">3. Information Sharing and Disclosure</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
              </p>
              <ul>
                <li><strong>Service Providers:</strong> We share information with trusted third-party service providers who assist us in operating our website and conducting business</li>
                <li><strong>Payment Processing:</strong> Payment information is shared with secure payment processors to complete transactions</li>
                <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, your information may be transferred to the new entity</li>
              </ul>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul>
                <li>SSL encryption for data transmission</li>
                <li>Secure servers and databases</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">5. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to enhance your browsing experience. Cookies help us:
              </p>
              <ul>
                <li>Remember your preferences and login information</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Provide personalized content and advertisements</li>
                <li>Improve website functionality and performance</li>
              </ul>
              <p>
                You can control cookie settings through your browser preferences, but disabling cookies may limit some website functionality.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">6. Your Privacy Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul>
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
              </ul>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">7. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. When we no longer need your information, we will securely delete or anonymize it.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">8. Children's Privacy</h2>
              <p>
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">9. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and provide appropriate safeguards for your information.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">10. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">11. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <ul className="list-unstyled">
                <li><strong>Email:</strong> privacy@blitxpress.com</li>
                <li><strong>Phone:</strong> +256 783 204 665</li>
                <li><strong>Address:</strong> Bwera, Kasese, Uganda</li>
              </ul>
              <p>
                For data protection inquiries, please include "Privacy Policy" in the subject line of your email.
              </p>
            </section>
          </div>

          <div className="text-center mt-5 pt-4 border-top">
            <Link to="/" className="btn btn-primary me-3">
              Back to Home
            </Link>
            <Link to="/terms" className="btn btn-outline-secondary">
              Terms of Service
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PrivacyPage;
