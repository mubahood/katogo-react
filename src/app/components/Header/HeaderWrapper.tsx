// src/app/components/Header/HeaderWrapper.tsx
import React from 'react';
import TopUtilityBar from './TopUtilityBar';
import ModernMainNav from './ModernMainNav';
import MobileBottomNav from './MobileBottomNav';

const HeaderWrapper: React.FC = () => {
  return (
    <>
      <header className="fixed-top header-wrapper">
        <TopUtilityBar />
        <ModernMainNav />
      </header>
      <MobileBottomNav />
    </>
  );
};

export default HeaderWrapper;