// src/app/components/Header/MainNav.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const MainNav: React.FC = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Outer wrapper for full-width background */}
      <div className="main-nav-wrapper">
        {/* Inner container for boxed content */}
        <nav className="container-fluid d-flex align-items-center h-100" style={{paddingLeft: '60px', paddingRight: '60px'}}>
          <button
            className="navbar-toggler d-lg-none border-0"
            type="button"
            onClick={toggleMenu}
          >
            <i
              className="bi bi-list fs-2"
              style={{ color: "var(--text-color)" }}
            ></i>
          </button>

          <Link to="/" className="mx-auto ms-lg-0">
            <img
              src="/media/logos/logo.png"
              alt="UgFlix"
              className="main-logo"
            />
          </Link>

          <div className="d-none d-lg-flex align-items-center flex-grow-1 ms-4">
            {/* --- THE NEW MEGA MENU --- */}
            <div className="category-toggle">
              <i className="bi bi-grid-fill"></i>
              <span>Category</span>
              <div className="mega-menu dropdown-menu">
                <div className="row">
                  <div className="col-md-4">
                    <h5 className="mega-menu-heading">Consumer Electronics</h5>
                    <a href="#" className="mega-menu-link">
                      <i className="bi bi-phone"></i> Mobile Phones
                    </a>
                    <a href="#" className="mega-menu-link">
                      <i className="bi bi-laptop"></i> Laptops & PCs
                    </a>
                    <a href="#" className="mega-menu-link">
                      <i className="bi bi-tablet-landscape"></i> Tablets
                    </a>
                    <a href="#" className="mega-menu-link">
                      <i className="bi bi-smartwatch"></i> Wearable Devices
                    </a>
                  </div>
                  <div className="col-md-4">
                    <h5 className="mega-menu-heading">Apparel & Fashion</h5>
                    <a href="#" className="mega-menu-link">
                      <i className="bi bi-gender-male"></i> Men's Clothing
                    </a>
                    <a href="#" className="mega-menu-link">
                      <i className="bi bi-gender-female"></i> Women's Clothing
                    </a>
                    <a href="#" className="mega-menu-link">
                      <i className="bi bi-handbag"></i> Bags & Shoes
                    </a>
                    <a href="#" className="mega-menu-link">
                      <i className="bi bi-watch"></i> Watches & Jewelry
                    </a>
                  </div>
                  <div className="col-md-4">
                    <h5 className="mega-menu-heading">Home & Garden</h5>
                    <a href="#" className="mega-menu-link">
                      <i className="bi bi-lightbulb"></i> Lights & Lighting
                    </a>
                    <a href="#" className="mega-menu-link">
                      <i className="bi bi-tools"></i> Tools & Hardware
                    </a>
                    <a href="#" className="mega-menu-link">
                      <i className="bi bi-flower1"></i> Garden Supplies
                    </a>
                    <a href="#" className="mega-menu-link">
                      <i className="bi bi-key"></i> Home Improvement
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <form className="search-form flex-grow-1" role="search">
              <div className="input-group">
                <input
                  type="search"
                  className="form-control"
                  placeholder="I'm shopping for..."
                />
                <button className="btn btn-search" type="submit">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </form>
          </div>

          <div className="d-none d-lg-flex align-items-center ms-4 action-icons">
            <Link to="/account" className="action-link">
              <i className="bi bi-person"></i>
              <div>Account</div>
            </Link>
            <Link to="/cart" className="action-link">
              <i className="bi bi-cart3"></i>
              <div>Cart</div>
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Off-Canvas Menu (No changes here) */}
      <div
        className={`nav-overlay ${isMenuOpen ? "show" : ""}`}
        onClick={toggleMenu}
      ></div>
      <div className={`mobile-nav-offcanvas ${isMenuOpen ? "show" : ""}`}>
        {/* ... content remains the same ... */}
      </div>
    </>
  );
};

export default MainNav;
