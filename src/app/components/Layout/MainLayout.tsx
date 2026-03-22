// src/app/components/Layout/MainLayout.tsx
import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import HeaderWrapper from "../Header/HeaderWrapper";
import SubscriptionMonitor from "../subscription/SubscriptionMonitor";
import Footer from "./Footer";

const PageFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Routes whose hero/banner handles the header offset themselves
const FULL_BLEED_PREFIXES = ['/', '/landing', '/watch'];

const isFullBleedRoute = (pathname: string) =>
  pathname === '/' ||
  pathname === '/landing' ||
  pathname.startsWith('/watch/') ||
  pathname.startsWith('/live');

const MainLayout: React.FC = () => {
  const { pathname } = useLocation();
  const fullBleed = isFullBleedRoute(pathname);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-gray-100">
      <HeaderWrapper />
      <SubscriptionMonitor />

      {/*
        Header is fixed: h-12 (48px) on mobile, h-[52px] (52px) on lg+.
        Safe-area-inset-bottom accounts for iPhone home indicator.
        Bottom nav is 65px tall on mobile only.
      */}
      <main
        className={`flex-1 ${fullBleed ? '' : 'pt-12 lg:pt-[52px]'}`}
        style={{
          paddingBottom: 'calc(65px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
