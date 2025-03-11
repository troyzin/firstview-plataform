
import React, { ReactNode, useState } from "react";
import { Menu, Bell, Settings, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import NavItem from "../ui/NavItem";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useAuth } from "../../contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, isAdmin, isMaster } = useAuth();
  
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

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  // Obter as iniciais do nome completo para o avatar
  const getInitials = () => {
    if (!profile?.full_name) return "U";
    
    const nameParts = profile.full_name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="bg-black text-white font-sans min-h-screen flex">
      {/* Sidebar */}
      <aside 
        className={`bg-[#141414] border-r border-gray-800 transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Logo and Toggle */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="Logo da empresa" 
                className="w-12 h-auto object-contain" 
              />
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
            
            {/* Mostrar equipamentos apenas para master */}
            {isMaster && (
              <li>
                <NavItem 
                  to="/equipment" 
                  icon="videocam" 
                  label={sidebarCollapsed ? undefined : "Equipamentos"} 
                  isActive={isActiveRoute("/equipment")}
                />
              </li>
            )}
            
            {/* Mostrar clientes para admin e master */}
            {(isAdmin || isMaster) && (
              <li>
                <NavItem 
                  to="/clients" 
                  icon="groups" 
                  label={sidebarCollapsed ? undefined : "Clientes"} 
                  isActive={isActiveRoute("/clients")}
                />
              </li>
            )}
            
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
                  <div className="w-2 h-2 rounded-full bg-[#ff3335]"></div>
                  <span className="group-hover:text-[#ff3335]">Campanha Nova Marca</span>
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
                className="absolute -top-1 -right-1 bg-[#ff3335] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
              >
                3
              </Badge>
            </Button>
            
            {/* Botão de configurações movido para o cabeçalho */}
            <Button variant="ghost" size="icon" className="hover:bg-gray-800">
              <Settings size={20} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <Avatar className="w-8 h-8 bg-[#ff3335] hover:bg-[#ff3335]/80 transition-colors">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{profile?.full_name || 'Usuário'}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
                <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
                  Preferências
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem 
                  className="text-red-400 hover:bg-gray-700 hover:text-red-300 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
