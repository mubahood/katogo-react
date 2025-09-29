// src/app/components/Layout/StaticPageLayout.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface StaticPageLayoutProps {
  title: string;
  subtitle?: string;
  breadcrumbs: BreadcrumbItem[];
  children: React.ReactNode;
  className?: string;
}

const StaticPageLayout: React.FC<StaticPageLayoutProps> = ({
  title,
  subtitle,
  breadcrumbs,
  children,
  className = ''
}) => {
  return (
    <div className={`static-page-layout ${className}`}>
      {/* Breadcrumb Section */}
      <div className="static-breadcrumb-section">
        <div className="container">
          <nav className="static-breadcrumb">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="static-breadcrumb-separator">/</span>}
                {item.path ? (
                  <Link to={item.path} className="static-breadcrumb-link">
                    {item.label}
                  </Link>
                ) : (
                  <span className="static-breadcrumb-current">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="static-page-header">
        <div className="container">
          <div className="static-page-header-content">
            <h1 className="static-page-title">{title}</h1>
            {subtitle && <p className="static-page-subtitle">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="static-page-content">
        <div className="container">
          <div className="static-content-wrapper">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticPageLayout;
