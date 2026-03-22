// src/app/components/Header/MobileBottomNav.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Home, Film, Radio, Newspaper, User } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const active = (p: string) =>
    location.pathname === p || location.pathname.startsWith(p + '/');

  const tabs = [
    { to: '/',       label: 'Home',    Icon: Home,      on: location.pathname === '/' },
    { to: '/movies', label: 'Movies',  Icon: Film,      on: active('/movies') || active('/watch') || active('/series') },
    { to: '/live',   label: 'Live TV', Icon: Radio,     on: active('/live') },
    { to: '/news',   label: 'News',    Icon: Newspaper, on: active('/news') },
    {
      to: isAuthenticated ? '/account' : '/auth/login',
      label: isAuthenticated ? 'Account' : 'Login',
      Icon: User,
      on: active('/account') || active('/auth'),
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-gray-950/95 backdrop-blur-lg border-t border-white/[0.06]">
      <div className="flex items-stretch h-[52px]">
        {tabs.map(({ to, label, Icon, on }) => (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center justify-center gap-[2px] transition-colors ${
              on ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            <Icon size={19} strokeWidth={on ? 2.2 : 1.6} />
            <span className={`text-[10px] ${on ? 'font-medium' : ''}`}>{label}</span>
          </Link>
        ))}
      </div>
      {/* Safe-area padding for iOS notch devices */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default MobileBottomNav;

