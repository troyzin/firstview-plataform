
import React, { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import NavItem from "../ui/NavItem";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";

type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    <div className="bg-black text-white font-sans min-h-screen flex">
      {/* Sidebar */}
      <aside 
        className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Logo and Toggle */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
              <h1 className="text-xl font-bold">ProduFlow</h1>
            </div>
          )}
          {sidebarCollapsed && (
            <svg className="w-8 h-8 text-red-600 mx-auto" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
            className="hover:bg-gray-800"
          >
            <Menu size={20} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4">
          <ul className="space-y-6">
            <li>
              <NavItem 
                to="/" 
                icon="dashboard" 
                label={sidebarCollapsed ? undefined : "Dashboard"} 
                isActive={isActiveRoute("/")}
              />
            </li>
            <li>
              <NavItem 
                to="/productions" 
                icon="view_kanban" 
                label={sidebarCollapsed ? undefined : "Produções"} 
                isActive={isActiveRoute("/productions")}
              />
            </li>
            <li>
              <NavItem 
                to="/reports" 
                icon="bar_chart" 
                label={sidebarCollapsed ? undefined : "Relatórios"} 
                isActive={isActiveRoute("/reports")}
              />
            </li>
            <li>
              <NavItem 
                to="/team" 
                icon="groups" 
                label={sidebarCollapsed ? undefined : "Equipe"} 
                isActive={isActiveRoute("/team")}
              />
            </li>
            <li>
              <NavItem 
                to="/settings" 
                icon="settings" 
                label={sidebarCollapsed ? undefined : "Configurações"} 
                isActive={isActiveRoute("/settings")}
              />
            </li>
            <li>
              <NavItem 
                to="/notifications" 
                icon="notifications" 
                label={sidebarCollapsed ? undefined : "Notificações"} 
                notificationCount={3} 
                isActive={isActiveRoute("/notifications")}
              />
            </li>
          </ul>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-800">
          <div className={`flex ${sidebarCollapsed ? "justify-center" : "items-center space-x-2"}`}>
            <Avatar className="w-8 h-8 bg-red-600 hover:bg-red-700 transition-colors">
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && <span className="text-sm font-medium">João Silva</span>}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-black p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold">{getPageTitle()}</h2>
        </header>
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
