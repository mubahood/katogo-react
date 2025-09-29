// src/app/components/Account/AccountLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AccountSidebar from './AccountSidebar';

const AccountLayout: React.FC = () => {
    return (
        <div className="account-layout-container">
            <div className="container-fluid">
                <div className="account-layout-wrapper">
                    <div className="account-sidebar-wrapper">
                        <AccountSidebar />
                    </div>
                    <div className="account-content-wrapper">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountLayout;
