// src/app/components/Layout/MainLayout.tsx
import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import HeaderWrapper from "../Header/HeaderWrapper";
import SubscriptionMonitor from "../subscription/SubscriptionMonitor";
import Footer from "./Footer";

const PageFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const MainLayout: React.FC = () => {
  const location = useLocation();
  // Hero pages get extra bottom padding for mobile nav
  const isHeroPage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
      <HeaderWrapper />
      <SubscriptionMonitor />
      <main
        className={`flex-1 ${
          isHeroPage ? '' : 'pt-0'
        } pb-16 lg:pb-0`}
      >
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {/* Bottom padding for mobile nav bar */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  );
};

export default MainLayout;
