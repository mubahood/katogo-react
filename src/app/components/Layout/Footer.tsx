// src/app/components/Layout/Footer.tsx
import React from 'react';
import { COMPANY_INFO, APP_LINKS, APP_NAME } from '../../constants';

const Footer: React.FC = () => {
  return (
    <footer className="ugflix-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-copyright">
            <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          </div>
          
          <div className="footer-apps">
            <a href={APP_LINKS.ANDROID} target="_blank" rel="noopener noreferrer" className="app-download-link">
              Android App
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;