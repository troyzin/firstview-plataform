
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LayoutDashboard, BarChart3, Settings, Users, Kanban } from 'lucide-react';
import NavItem from '../ui/NavItem';

const Header = () => {
  const [notificationCount, setNotificationCount] = useState(3);
  const navigate = useNavigate();

  return (
    <header className="bg-black p-6 border-b border-gray-800">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-produflow-red" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
          </svg>
          <h1 className="text-2xl font-bold select-none">ProduFlow</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <NavItem icon={<LayoutDashboard size={24} />} path="/dashboard" label="Dashboard" />
          <NavItem icon={<Kanban size={24} />} path="/productions" label="Produções" />
          <NavItem icon={<BarChart3 size={24} />} path="/reports" label="Relatórios" />
          <NavItem icon={<Users size={24} />} path="/team" label="Equipe" />
          <NavItem icon={<Settings size={24} />} path="/settings" label="Configurações" />
          
          <div className="relative">
            <button className="hover:text-produflow-red transition-colors" aria-label="Notificações">
              <Bell size={24} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-produflow-red text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-produflow-red rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors cursor-pointer select-none">
              JS
            </div>
            <span className="text-sm font-medium select-none">João Silva</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
