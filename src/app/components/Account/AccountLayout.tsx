// src/app/components/Account/AccountLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Form, InputGroup } from 'react-bootstrap';
import AccountSidebar from './AccountSidebar';

const AccountLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Detect mobile screen
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 992;
            setIsMobile(mobile);
            if (!mobile) {
                setIsSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname, isMobile]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const getCurrentPageTitle = (): string => {
        const path = location.pathname;
        const pageMap: Record<string, string> = {
            '/account': 'Dashboard',
            '/account/profile': 'My Profile',
            '/account/subscriptions': 'Subscriptions',
            '/account/watchlist': 'My Watchlist',
            '/account/history': 'Watch History',
            '/account/likes': 'My Likes',
            '/account/products': 'My Products',
            '/account/orders': 'Orders',
            '/account/chats': 'My Chats',
            '/account/settings': 'Settings',
        };
        return pageMap[path] || 'Account';
    };

    return (
        <div className="account-layout-container">
            {/* Mobile Header with Toggle and Search */}
            {isMobile && (
                <div className="account-mobile-top-bar">
                    <button
                        className="account-mobile-toggle"
                        onClick={toggleSidebar}
                        aria-label="Toggle menu"
                    >
                        <i className={`bi ${isSidebarOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
                    </button>
                    
                    <Form onSubmit={handleSearch} className="account-mobile-search-form">
                        <InputGroup size="sm">
                            <Form.Control
                                type="search"
                                placeholder="Search movies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="account-mobile-search-input"
                            />
                            <button type="submit" className="account-mobile-search-btn">
                                <i className="bi bi-search"></i>
                            </button>
                        </InputGroup>
                    </Form>
                </div>
            )}

            {/* Sidebar Overlay for Mobile */}
            {isMobile && isSidebarOpen && (
                <div
                    className="account-sidebar-overlay"
                    onClick={toggleSidebar}
                />
            )}

            <div className="container-fluid">
                <div className="account-layout-wrapper">
                    <div className={`account-sidebar-wrapper ${isMobile && isSidebarOpen ? 'open' : ''} ${isMobile && !isSidebarOpen ? 'closed' : ''}`}>
                        <AccountSidebar />
                    </div>
                    <div className="account-content-wrapper">
                        {/* Mobile page title below search bar */}
                        {isMobile && (
                            <div className="account-mobile-page-title">
                                <h1>{getCurrentPageTitle()}</h1>
                            </div>
                        )}
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountLayout;
