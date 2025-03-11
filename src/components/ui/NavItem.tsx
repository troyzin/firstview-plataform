
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItemProps {
  icon: React.ReactNode;
  path: string;
  label: string;
}

const NavItem = ({ icon, path, label }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link 
      to={path}
      className={`nav-item flex items-center justify-center transition-colors ${isActive ? 'text-produflow-red' : ''}`}
      aria-label={label}
    >
      {icon}
    </Link>
  );
};

export default NavItem;
