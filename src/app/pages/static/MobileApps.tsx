// src/app/pages/static/MobileApps.tsx
import React from 'react';
import StaticPageLayout from '../../components/Layout/StaticPageLayout';
import { APP_LINKS, COMPANY_INFO } from '../../constants';

const MobileApps: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Mobile Apps' }
  ];

  return (
    <StaticPageLayout
      title="BlitXpress Mobile Apps"
      subtitle="Download our app and shop anywhere, anytime"
      breadcrumbs={breadcrumbs}
    >
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Main Download Section */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '3rem 2rem', 
          borderRadius: '12px', 
          marginBottom: '3rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
            Get the App
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
            Free download for iOS and Android
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a 
              href={APP_LINKS.IOS}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#000',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: '500',
                transition: 'transform 0.2s',
                minWidth: '180px',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <i className="bi bi-apple" style={{ fontSize: '1.5rem' }}></i>
              App Store
            </a>
            
            <a 
              href={APP_LINKS.ANDROID}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#34A853',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: '500',
                transition: 'transform 0.2s',
                minWidth: '180px',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <i className="bi bi-google-play" style={{ fontSize: '1.5rem' }}></i>
              Google Play
            </a>
          </div>
        </div>

        {/* Simple Features */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Why Download?</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem',
            textAlign: 'center'
          }}>
            <div>
              <i className="bi bi-lightning-fill" style={{ fontSize: '2rem', color: '#007bff', marginBottom: '0.5rem' }}></i>
              <h4>Fast Shopping</h4>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Quick and secure</p>
            </div>
            <div>
              <i className="bi bi-bell-fill" style={{ fontSize: '2rem', color: '#28a745', marginBottom: '0.5rem' }}></i>
              <h4>Notifications</h4>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Order updates</p>
            </div>
            <div>
              <i className="bi bi-credit-card-fill" style={{ fontSize: '2rem', color: '#ffc107', marginBottom: '0.5rem' }}></i>
              <h4>Mobile Pay</h4>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Easy payments</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '2rem', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>Need Help?</h3>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href={`mailto:${COMPANY_INFO.EMAIL}`}
              style={{ color: '#007bff', textDecoration: 'none' }}
            >
              <i className="bi bi-envelope"></i> Email
            </a>
            <a 
              href={`https://wa.me/${COMPANY_INFO.WHATSAPP.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#25D366', textDecoration: 'none' }}
            >
              <i className="bi bi-whatsapp"></i> WhatsApp
            </a>
          </div>
        </div>

      </div>
    </StaticPageLayout>
  );
};

export default MobileApps;
