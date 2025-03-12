import React, { ReactNode, useState } from "react";
import { Menu, Bell, Settings, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import NavItem from "../ui/NavItem";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useAuth } from "../../contexts/AuthContext";
import { useIsMobile } from "../../hooks/use-mobile";
import MobileNavBar from "./MobileNavBar";
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
  const { user, profile, signOut } = useAuth();
  const isMobile = useIsMobile();
  
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
      case "/edits":
        return "Edições";
      case "/profile":
        return "Perfil";
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

  const getInitials = () => {
    if (!profile?.full_name) return "U";
    
    const nameParts = profile.full_name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="bg-black text-white font-sans min-h-screen flex">
      {!isMobile && (
        <aside 
          className={`bg-[#141414] border-r border-gray-800 transition-all duration-300 flex flex-col ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <img 
                  src="/logo.png" 
                  alt="Logo da empresa" 
                  className="w-16 h-auto object-contain" 
                />
              </div>
            )}
            {sidebarCollapsed && (
              <img 
                src="/logo.png" 
                alt="Logo da empresa" 
                className="w-10 h-10 object-contain mx-auto" 
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
                  to="/edits" 
                  icon="edit" 
                  label={sidebarCollapsed ? undefined : "Edições"} 
                  isActive={isActiveRoute("/edits")}
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
        </aside>
      )}

      <div className="flex-1 flex flex-col">
        <header className="bg-black p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">{getPageTitle()}</h2>
          
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
            
            <Button variant="ghost" size="icon" className="hover:bg-gray-800">
              <Settings size={20} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <Avatar className="w-8 h-8 bg-[#ff3335] hover:bg-[#ff3335]/80 transition-colors">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt="Avatar do usuário" />
                    ) : null}
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{profile?.full_name || 'Usuário'}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
                <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer" onClick={() => navigate('/profile')}>
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer" onClick={() => navigate('/settings')}>
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
        
        <main className={`flex-1 p-6 ${isMobile ? 'pb-20' : ''}`}>
          {children}
        </main>

        {isMobile && <MobileNavBar />}
      </div>
    </div>
  );
};

export default MainLayout;
