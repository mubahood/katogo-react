// src/app/pages/static/Contact.tsx
import React, { useState } from 'react';
import StaticPageLayout from '../../components/Layout/StaticPageLayout';
import { COMPANY_INFO, SOCIAL_MEDIA } from '../../constants';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    // You would typically send this to your backend API
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <StaticPageLayout
      title="Contact Us"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Contact Us', path: '/contact' }
      ]}
    >
      <div className="static-content">
        <div className="static-intro">
          <p className="static-subtitle">
            Get in touch with us! We're here to help with any questions, concerns, or feedback you may have.
          </p>
        </div>

        <div className="row">
          {/* Contact Information */}
          <div className="col-lg-6 mb-5">
            <div className="static-section">
              <h3>Get In Touch</h3>
              <p>
                Whether you're a buyer looking for assistance with an order, a seller wanting to join our platform,
                or someone with general inquiries, we'd love to hear from you.
              </p>

              <div className="contact-info-grid">
                <div className="contact-info-item">
                  <div className="contact-icon">
                    <i className="bi bi-envelope-fill"></i>
                  </div>
                  <div className="contact-details">
                    <h5>Email Us</h5>
                    <p><a href={`mailto:${COMPANY_INFO.EMAIL}`}>{COMPANY_INFO.EMAIL}</a></p>
                    <small>We typically respond within 24 hours</small>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon">
                    <i className="bi bi-telephone-fill"></i>
                  </div>
                  <div className="contact-details">
                    <h5>Call Us</h5>
                    <p><a href={`tel:${COMPANY_INFO.PHONE}`}>{COMPANY_INFO.PHONE}</a></p>
                    <small>Monday - Friday, 8:00 AM - 6:00 PM</small>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon">
                    <i className="bi bi-whatsapp"></i>
                  </div>
                  <div className="contact-details">
                    <h5>WhatsApp</h5>
                    <p>
                      <a href={`https://wa.me/${COMPANY_INFO.WHATSAPP.replace(/\D/g, '')}`} 
                         target="_blank" 
                         rel="noopener noreferrer">
                        {COMPANY_INFO.WHATSAPP}
                      </a>
                    </p>
                    <small>Quick support and instant responses</small>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon">
                    <i className="bi bi-geo-alt-fill"></i>
                  </div>
                  <div className="contact-details">
                    <h5>Location</h5>
                    <p>Kampala, Uganda</p>
                    <small>Serving customers nationwide</small>
                  </div>
                </div>
              </div>

              <div className="social-contact mt-4">
                <h5>Follow Us</h5>
                <div className="social-links-contact">
                  <a href={SOCIAL_MEDIA.FACEBOOK} target="_blank" rel="noopener noreferrer" className="social-contact-link">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href={SOCIAL_MEDIA.INSTAGRAM} target="_blank" rel="noopener noreferrer" className="social-contact-link">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href={SOCIAL_MEDIA.TWITTER} target="_blank" rel="noopener noreferrer" className="social-contact-link">
                    <i className="bi bi-twitter-x"></i>
                  </a>
                  <a href={SOCIAL_MEDIA.TIKTOK} target="_blank" rel="noopener noreferrer" className="social-contact-link">
                    <i className="bi bi-tiktok"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="col-lg-6">
            <div className="static-section">
              <h3>Send Us a Message</h3>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group mb-3">
                  <label htmlFor="name" className="form-label">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="email" className="form-label">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="subject" className="form-label">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    className="form-control"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="order-inquiry">Order Inquiry</option>
                    <option value="technical-support">Technical Support</option>
                    <option value="seller-application">Become a Seller</option>
                    <option value="payment-issue">Payment Issue</option>
                    <option value="refund-request">Refund Request</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group mb-4">
                  <label htmlFor="message" className="form-label">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    className="form-control"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="Please provide details about your inquiry..."
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-100">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="static-section mt-5">
          <h3>Frequently Asked Questions</h3>
          <div className="row">
            <div className="col-md-6">
              <div className="faq-item">
                <h5>How do I track my order?</h5>
                <p>You can track your order by logging into your account and visiting the "Order History" section.</p>
              </div>
              <div className="faq-item">
                <h5>What payment methods do you accept?</h5>
                <p>We accept mobile money, bank transfers, and major credit/debit cards through secure payment gateways.</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="faq-item">
                <h5>How can I become a seller?</h5>
                <p>Visit our "Sell on BlitXpress" page to learn about the requirements and apply to become a seller.</p>
              </div>
              <div className="faq-item">
                <h5>What is your return policy?</h5>
                <p>We offer a 7-day return policy for most items. Please check our Buyer Protection page for details.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default Contact;
