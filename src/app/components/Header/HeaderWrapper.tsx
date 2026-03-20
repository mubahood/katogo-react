// src/app/components/Header/HeaderWrapper.tsx
import React from 'react';
import MainNavV2 from './MainNavV2';
import MobileBottomNav from './MobileBottomNav';

const HeaderWrapper: React.FC = () => {
  return (
    <>
      <MainNavV2 />
      <MobileBottomNav />
    </>
  );
};

export default HeaderWrapper;