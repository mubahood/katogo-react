// src/app/components/Header/MobileBottomNav.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Home, Film, Radio, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import './MobileBottomNav.css';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { cartCount } = useCart();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const tabs = [
    { to: '/',        label: 'Home',    Icon: Home,       active: location.pathname === '/' },
    { to: '/movies',  label: 'Movies',  Icon: Film,       active: isActive('/movies') || isActive('/watch') || isActive('/series') },
    { to: '/live',    label: 'Live TV', Icon: Radio,      active: isActive('/live') },
    { to: '/products',label: 'Shop',    Icon: ShoppingBag, active: isActive('/products') || isActive('/product') || isActive('/cart') },
    {
      to: isAuthenticated ? '/account' : '/auth/login',
      label: isAuthenticated ? 'Account' : 'Login',
      Icon: User,
      active: isActive('/account') || isActive('/auth'),
    },
  ];

  return (
    <nav className="mobile-bottom-nav lg:hidden fixed bottom-0 inset-x-0 z-50 flex bg-gray-950 border-t border-gray-800 safe-area-pb">
      {tabs.map(({ to, label, Icon, active }) => (
        <Link
          key={to}
          to={to}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors ${
            active ? 'text-red-500' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="relative">
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            {/* Cart badge */}
            {label === 'Shop' && cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-0.5">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-medium ${active ? 'text-red-500' : ''}`}>
            {label}
          </span>
          {active && (
            <span className="absolute top-0 inset-x-0 h-0.5 bg-red-500 rounded-b" />
          )}
        </Link>
      ))}
    </nav>
  );
};

export default MobileBottomNav;

