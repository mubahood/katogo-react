// src/app/components/HomePage/VendorsSection.tsx
import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useManifestVendors } from "../../hooks/useManifest";
import Utils from "../../utils/imageUtils";
import "./VendorsSection.css";

// Temporary vendor interface until Vendor is properly defined
interface Vendor {
  id: number;
  name: string;
  logo?: string;
  description?: string;
  avatar?: string;
  profile_photo?: string;
  address?: string;
  phone_number?: string;
  email?: string;
}

const VendorsSection: React.FC = () => {
  const vendors: Vendor[] = useManifestVendors(); // Type assertion since we know it returns empty array

  if (!vendors || vendors.length === 0) {
    return (
      <section className="vendors-section py-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="section-title text-uppercase fw-bold">Vendors</h2>
          </div>
          <div className="text-center py-4">
            <p className="text-muted">No vendors available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="vendors-section py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="section-title text-uppercase fw-bold">Vendors</h2>
          <Link to="/vendors" className="view-all-link text-decoration-none">
            <span className="text-uppercase fw-semibold text-primary">
              View All
            </span>
            <i className="bi bi-chevron-right ms-1"></i>
          </Link>
        </div>
        
        {/* Horizontal scrolling vendor list */}
        <div className="vendors-horizontal-scroll">
          <div className="d-flex gap-3 overflow-auto pb-2">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

interface VendorCardProps {
  vendor: Vendor;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor }) => {
  return (
    <Link 
      to={`/vendor/${vendor.id}`} 
      className="text-decoration-none vendor-card-link"
    >
      <Card className="vendor-card text-center">
        <Card.Body className="p-3">
          <div className="vendor-avatar-container mb-3">
            <img
              src={Utils.img(vendor.avatar || vendor.profile_photo)}
              alt={vendor.name}
              className="vendor-avatar rounded-circle"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/media/avatars/blank.png";
              }}
            />
          </div>
          <h6 className="vendor-name fw-semibold mb-1 text-truncate">
            {vendor.name}
          </h6>
          <p className="vendor-location text-muted small mb-2 text-truncate">
            {vendor.address || vendor.phone_number || 'Verified Vendor'}
          </p>
          <div className="vendor-stats">
            <small className="text-muted">
              {vendor.email ? (
                <i className="bi bi-envelope-check me-1"></i>
              ) : (
                <i className="bi bi-check-circle me-1"></i>
              )}
              Verified
            </small>
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
};

export default VendorsSection;
