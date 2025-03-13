
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Film, Pen, Users, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      path: "/productions",
      icon: Film,
      label: "Produções",
    },
    {
      path: "/edits",
      icon: Pen,
      label: "Edições",
    },
    {
      path: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
      isCenter: true
    },
    {
      path: "/clients",
      icon: Users,
      label: "Clientes",
    },
    {
      path: "/equipment",
      icon: Camera,
      label: "Equipamentos",
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#141414] border-t border-[#222] h-16 px-2 w-full overflow-visible">
      <div className="flex justify-between items-center h-full">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-16 transition-colors relative",
              isActiveRoute(item.path) ? "text-[#ff3335]" : "text-gray-400"
            )}
          >
            <div 
              className={cn(
                "flex items-center justify-center rounded-full mb-1",
                item.isCenter ? "bg-[#ff3335] p-3 absolute -top-6" : ""
              )}
            >
              <item.icon 
                size={item.isCenter ? 24 : 20} 
                className={item.isCenter ? "text-white" : ""}
              />
            </div>
            <span className={cn(
              "text-xs truncate",
              item.isCenter ? "mt-5" : ""
            )}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavBar;
