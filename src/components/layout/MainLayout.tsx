
import React, { ReactNode, useState } from "react";
import { Menu, Bell, Settings } from "lucide-react";
import { useLocation } from "react-router-dom";
import NavItem from "../ui/NavItem";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

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
      case "/equipment":
        return "Equipamentos";
      case "/clients":
        return "Clientes";
      case "/settings":
        return "Configurações";
      default:
        return "First View";
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
              {/* Logo atualizada aqui */}
              <img 
                src="/logo.png" 
                alt="Logo da empresa" 
                className="w-8 h-8 object-contain" 
              />
              <h1 className="text-xl font-bold">First View</h1>
            </div>
          )}
          {sidebarCollapsed && (
            <img 
              src="/logo.png" 
              alt="Logo da empresa" 
              className="w-8 h-8 object-contain mx-auto" 
            />
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
                to="/equipment" 
                icon="videocam" 
                label={sidebarCollapsed ? undefined : "Equipamentos"} 
                isActive={isActiveRoute("/equipment")}
              />
            </li>
            <li>
              <NavItem 
                to="/clients" 
                icon="groups" 
                label={sidebarCollapsed ? undefined : "Clientes"} 
                isActive={isActiveRoute("/clients")}
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
          </ul>
        </nav>

        {/* Projetos Recentes */}
        {!sidebarCollapsed && (
          <div className="mt-8 pt-6 border-t border-gray-800/30 px-4 pb-6">
            <h3 className="text-xs uppercase text-gray-500 font-semibold px-3 mb-3">Projetos Recentes</h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="#"
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-800/70 text-sm group transition-all duration-200"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="group-hover:text-red-400">Campanha Nova Marca</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-800/70 text-sm group transition-all duration-200"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="group-hover:text-blue-400">Documentário</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-800/70 text-sm group transition-all duration-200"
                >
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="group-hover:text-yellow-400">Teaser Evento</span>
                </a>
              </li>
            </ul>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-black p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">{getPageTitle()}</h2>
          
          {/* User and Notifications */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative hover:bg-gray-800">
              <Bell size={20} />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
              >
                3
              </Badge>
            </Button>
            
            {/* Botão de configurações movido para o cabeçalho */}
            <Button variant="ghost" size="icon" className="hover:bg-gray-800">
              <Settings size={20} />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8 bg-red-600 hover:bg-red-700 transition-colors">
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">João Silva</span>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
