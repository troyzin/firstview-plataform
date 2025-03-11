
import React from "react";
import { useLocation } from "react-router-dom";
import NavItem from "../ui/NavItem";
import { Avatar, AvatarFallback } from "../ui/avatar";

const Header = () => {
  const location = useLocation();
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const getPageTitle = () => {
    switch(location.pathname) {
      case "/":
        return "Dashboard";
      case "/productions":
        return "Produções";
      case "/reports":
        return "Relatórios";
      case "/team":
        return "Equipe";
      case "/settings":
        return "Configurações";
      default:
        return "ProduFlow";
    }
  };

  return (
    <header className="bg-black p-6 border-b border-gray-800">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
          </svg>
          <h1 className="text-2xl font-bold">ProduFlow</h1>
        </div>
        <div className="flex items-center space-x-6">
          <NavItem 
            to="/" 
            icon="dashboard" 
            isActive={isActiveRoute("/")}
          />
          <NavItem 
            to="/productions" 
            icon="view_kanban" 
            isActive={isActiveRoute("/productions")}
          />
          <NavItem 
            to="/reports" 
            icon="bar_chart" 
            isActive={isActiveRoute("/reports")}
          />
          <NavItem 
            to="/team" 
            icon="groups" 
            isActive={isActiveRoute("/team")}
          />
          <NavItem 
            to="/settings" 
            icon="settings" 
            isActive={isActiveRoute("/settings")}
          />
          <NavItem 
            to="/notifications" 
            icon="notifications" 
            notificationCount={3} 
            isActive={isActiveRoute("/notifications")}
          />
          
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8 bg-red-600 hover:bg-red-700 transition-colors">
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">João Silva</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
