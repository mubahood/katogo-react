// src/app/pages/legal/TermsPage.tsx
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const TermsPage: React.FC = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <div className="text-center mb-5">
            <h1 className="h2 fw-bold">Terms of Service</h1>
            <p className="text-muted">Last updated: July 5, 2025</p>
          </div>

          <div className="content">
            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using BlitXpress ("we," "our," or "us"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials on BlitXpress for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul>
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                <li>attempt to decompile or reverse engineer any software contained on BlitXpress</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">3. Account Registration</h2>
              <p>
                To access certain features of our service, you must register for an account. You agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain the security of your password and identification</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">4. Product Information and Pricing</h2>
              <p>
                We strive to provide accurate product descriptions and pricing information. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free. Prices are subject to change without notice.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">5. Orders and Payment</h2>
              <p>
                All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason. Payment must be received before order processing. We accept major credit cards and other payment methods as displayed during checkout.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">6. Shipping and Delivery</h2>
              <p>
                Shipping times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers or circumstances beyond our control. Risk of loss and title for products pass to you upon delivery to the carrier.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">7. Returns and Refunds</h2>
              <p>
                Items may be returned within 30 days of delivery in original condition. Certain items may not be returnable due to hygiene or safety reasons. Refunds will be processed to the original payment method within 5-10 business days.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">8. Prohibited Uses</h2>
              <p>
                You may not use our service:
              </p>
              <ul>
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
              </ul>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">9. Disclaimer</h2>
              <p>
                The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, and conditions relating to our website and the use of this website.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">10. Limitations</h2>
              <p>
                In no event shall BlitXpress or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on BlitXpress, even if BlitXpress or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">11. Changes to Terms</h2>
              <p>
                We reserve the right to revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-semibold mb-3">12. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <ul className="list-unstyled">
                <li><strong>Email:</strong> legal@blitxpress.com</li>
                <li><strong>Phone:</strong> +256 783 204 665</li>
                <li><strong>Address:</strong> Bwera, Kasese, Uganda</li>
              </ul>
            </section>
          </div>

          <div className="text-center mt-5 pt-4 border-top">
            <Link to="/" className="btn btn-primary me-3">
              Back to Home
            </Link>
            <Link to="/privacy" className="btn btn-outline-secondary">
              Privacy Policy
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default TermsPage;
