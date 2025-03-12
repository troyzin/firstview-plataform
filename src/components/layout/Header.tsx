
import React, { useState } from "react";
import {
  Bell,
  Menu,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/ui/sidebar"; // Updated import path to use the shadcn/ui sidebar
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar desconectar",
        variant: "destructive",
      });
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <header className="border-b border-gray-800 bg-black px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Header Left Side */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <button
                className="text-gray-400 hover:text-white focus:outline-none"
                aria-label="Abrir menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-gray-900 text-white w-64">
              {/* Instead of passing onClose prop, we can use a SidebarWrapper component */}
              <div className="flex flex-col h-full">
                <Sidebar />
                <button 
                  onClick={handleCloseSidebar}
                  className="mt-auto mb-4 text-sm text-gray-400 hover:text-white self-end px-4"
                >
                  Fechar menu
                </button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo and Title */}
          <h1 className="text-lg font-semibold">First View</h1>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <button
            className="text-gray-400 hover:text-white"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 rounded-full overflow-hidden" aria-label="Menu do usuário">
                <Avatar className="h-8 w-8 border border-gray-700">
                  <AvatarFallback className="bg-gray-800 text-gray-400">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-900 border border-gray-800">
              <div className="flex items-center justify-start p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm text-gray-300">
                    {user?.user_metadata?.full_name || "Usuário"}
                  </p>
                  <p className="text-xs text-gray-400 truncate w-[200px]">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-gray-400 focus:text-white focus:bg-gray-800">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-gray-400 focus:text-white focus:bg-gray-800">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-gray-800"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
