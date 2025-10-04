// src/app/components/Layout/MainLayout.tsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import HeaderWrapper from "../Header/HeaderWrapper";
import SubscriptionMonitor from "../subscription/SubscriptionMonitor";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isHomepage = location.pathname === '/';

  return (
    <>
      <HeaderWrapper />
      <SubscriptionMonitor />
      <main className={`main-content ${isHomepage ? 'homepage-layout' : ''}`}>
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;
