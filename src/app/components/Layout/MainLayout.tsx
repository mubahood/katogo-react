// src/app/components/Layout/MainLayout.tsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import HeaderWrapper from "../Header/HeaderWrapper";
import Footer from "./Footer";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isHomepage = location.pathname === '/';

  return (
    <>
      <HeaderWrapper />
      <main className={`main-content ${isHomepage ? 'homepage-layout' : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
