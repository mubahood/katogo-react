// src/app/pages/static/About.tsx
import React from 'react';
import StaticPageLayout from '../../components/Layout/StaticPageLayout';
import { COMPANY_INFO, SOCIAL_MEDIA } from '../../constants';

const About: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'About Us' }
  ];

  const values = [
    {
      icon: "bi-shield-check",
      title: "Trust & Reliability",
      description: "We build trust through transparency, reliability, and consistent quality in everything we do."
    },
    {
      icon: "bi-people",
      title: "Customer First",
      description: "Our customers are at the heart of everything we do. Their satisfaction is our success."
    },
    {
      icon: "bi-lightning",
      title: "Innovation",
      description: "We continuously innovate to provide better shopping experiences and cutting-edge solutions."
    },
    {
      icon: "bi-globe",
      title: "Community Impact",
      description: "We're committed to supporting local businesses and contributing to Uganda's economic growth."
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "Company Founded",
      description: "BlitXpress was established with a vision to revolutionize e-commerce in Uganda."
    },
    {
      year: "2024",
      title: "Mobile Apps Launch",
      description: "We launched our iOS and Android mobile applications to reach more customers."
    },
    {
      year: "2024",
      title: "Vendor Network Growth",
      description: "Expanded our vendor network to include hundreds of trusted sellers across Uganda."
    },
    {
      year: "2025",
      title: "Platform Enhancement",
      description: "Continuous improvements to user experience and platform functionality."
    }
  ];

  return (
    <StaticPageLayout
      title="About BlitXpress"
      subtitle="Uganda's leading e-commerce platform connecting buyers and sellers nationwide"
      breadcrumbs={breadcrumbs}
    >
      <div>
        <h2>Our Story</h2>
        <p>
          BlitXpress was born from a simple yet powerful vision: to create Uganda's most trusted and 
          convenient e-commerce platform. We recognized the need for a reliable online marketplace 
          that could connect buyers with quality products while supporting local businesses and vendors.
        </p>
        <p>
          Since our inception, we've been committed to providing exceptional customer service, 
          ensuring product quality, and building a platform that serves the unique needs of the 
          Ugandan market. Today, we're proud to be a leading force in Uganda's digital commerce landscape.
        </p>

        <h2>Our Mission</h2>
        <p>
          To provide Uganda with the most reliable, convenient, and secure e-commerce platform that 
          connects customers with quality products while empowering local businesses to thrive in 
          the digital economy.
        </p>

        <h2>Our Vision</h2>
        <p>
          To become the most trusted e-commerce platform in East Africa, driving digital transformation 
          and economic growth while making online shopping accessible, safe, and enjoyable for everyone.
        </p>

        <h2>Our Values</h2>
        <div className="static-feature-grid">
          {values.map((value, index) => (
            <div key={index} className="static-feature-card">
              <i className={`${value.icon} static-feature-icon`}></i>
              <h3 className="static-feature-title">{value.title}</h3>
              <p className="static-feature-description">{value.description}</p>
            </div>
          ))}
        </div>

        <h2>What We Offer</h2>
        <p>BlitXpress provides a comprehensive e-commerce solution with:</p>
        <ul>
          <li><strong>Wide Product Range:</strong> From electronics to fashion, home goods to personal care</li>
          <li><strong>Verified Vendors:</strong> All our sellers are carefully vetted for quality and reliability</li>
          <li><strong>Secure Payments:</strong> Multiple payment options with bank-level security</li>
          <li><strong>Fast Delivery:</strong> Reliable delivery across Uganda with real-time tracking</li>
          <li><strong>Customer Support:</strong> 24/7 support to help with any questions or issues</li>
          <li><strong>Mobile Experience:</strong> Full-featured mobile apps for iOS and Android</li>
        </ul>

        <h2>Our Journey</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 'var(--spacing-6)',
          margin: 'var(--spacing-8) 0'
        }}>
          {milestones.map((milestone, index) => (
            <div key={index} style={{
              background: 'var(--background-light)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              padding: 'var(--spacing-6)',
              position: 'relative'
            }}>
              <div style={{
                background: 'var(--primary-color)',
                color: 'var(--white)',
                padding: 'var(--spacing-2) var(--spacing-3)',
                borderRadius: 'var(--border-radius)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'var(--spacing-3)',
                display: 'inline-block'
              }}>
                {milestone.year}
              </div>
              <h4 style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-color-dark)',
                marginBottom: 'var(--spacing-2)'
              }}>
                {milestone.title}
              </h4>
              <p style={{
                fontSize: 'var(--font-size-base)',
                color: 'var(--text-color-medium)',
                margin: 0,
                lineHeight: 'var(--line-height-normal)'
              }}>
                {milestone.description}
              </p>
            </div>
          ))}
        </div>

        <h2>Why Choose BlitXpress?</h2>
        <ul>
          <li><strong>Local Understanding:</strong> We understand the Ugandan market and customer needs</li>
          <li><strong>Quality Assurance:</strong> Rigorous quality control ensures you get genuine products</li>
          <li><strong>Competitive Pricing:</strong> We work with vendors to offer the best prices</li>
          <li><strong>Reliable Service:</strong> Consistent, dependable service you can count on</li>
          <li><strong>Community Focus:</strong> Supporting local businesses and economic growth</li>
          <li><strong>Innovation:</strong> Continuously improving our platform and services</li>
        </ul>

        <h2>Our Commitment</h2>
        <p>
          We're committed to continuously improving our platform, expanding our services, and 
          maintaining the highest standards of customer service. Your feedback helps us grow 
          and serve you better.
        </p>

        <h2>Connect With Us</h2>
        <p>Stay connected and follow our journey on social media:</p>
        
        <div className="static-contact-grid">
          <div className="static-contact-item">
            <i className="bi bi-facebook static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">Facebook</p>
              <p className="static-contact-value">
                <a href={SOCIAL_MEDIA.FACEBOOK} target="_blank" rel="noopener noreferrer">
                  Follow us on Facebook
                </a>
              </p>
            </div>
          </div>
          
          <div className="static-contact-item">
            <i className="bi bi-instagram static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">Instagram</p>
              <p className="static-contact-value">
                <a href={SOCIAL_MEDIA.INSTAGRAM} target="_blank" rel="noopener noreferrer">
                  Follow us on Instagram
                </a>
              </p>
            </div>
          </div>
          
          <div className="static-contact-item">
            <i className="bi bi-twitter static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">X (Twitter)</p>
              <p className="static-contact-value">
                <a href={SOCIAL_MEDIA.TWITTER} target="_blank" rel="noopener noreferrer">
                  Follow us on X
                </a>
              </p>
            </div>
          </div>
          
          <div className="static-contact-item">
            <i className="bi bi-tiktok static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">TikTok</p>
              <p className="static-contact-value">
                <a href={SOCIAL_MEDIA.TIKTOK} target="_blank" rel="noopener noreferrer">
                  Follow us on TikTok
                </a>
              </p>
            </div>
          </div>
        </div>

        <h2>Contact Information</h2>
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
          
          <div className="static-contact-item">
            <i className="bi bi-geo-alt static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">Location</p>
              <p className="static-contact-value">{COMPANY_INFO.ADDRESS}</p>
            </div>
          </div>
        </div>

        <div className="static-app-download">
          <h3 className="static-app-title">Join Our Community</h3>
          <p className="static-app-description">
            Be part of Uganda's growing e-commerce community. Start shopping with us today!
          </p>
          <div className="static-app-buttons">
            <a href="/products" className="static-app-button">
              <i className="bi bi-bag"></i>
              Start Shopping
            </a>
            <a href="/register" className="static-app-button">
              <i className="bi bi-person-plus"></i>
              Create Account
            </a>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default About;
