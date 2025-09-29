// src/app/components/Header/HeaderWrapper.tsx
import React from 'react';
import TopUtilityBar from './TopUtilityBar';
import ModernMainNav from './ModernMainNav';
import './Header.css';

const HeaderWrapper: React.FC = () => {
  return (
    <header className="fixed-top header-wrapper">
      <TopUtilityBar />
      <ModernMainNav />
    </header>
  );
};

export default HeaderWrapper;