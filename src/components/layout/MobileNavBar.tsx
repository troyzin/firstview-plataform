
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
      path: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
      isCenter: true
    },
    {
      path: "/productions",
      icon: Film,
      label: "Produções",
      isCenter: false
    },
    {
      path: "/edits",
      icon: Pen,
      label: "Edições",
      isCenter: false
    },
    {
      path: "/clients",
      icon: Users,
      label: "Clientes",
      isCenter: false
    },
    {
      path: "/equipment",
      icon: Camera,
      label: "Equipamentos",
      isCenter: false
    }
  ];

  // Rearrange items to have center item in the middle
  const orderedNavItems = [...navItems].sort((a, b) => {
    if (a.isCenter) return 1;
    if (b.isCenter) return -1;
    return 0;
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#141414] border-t border-[#222] h-16 px-2">
      <div className="flex justify-around items-center h-full">
        {orderedNavItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-16 transition-colors",
              item.isCenter ? "text-white" : "",
              isActiveRoute(item.path) ? "text-[#ff3335]" : "text-gray-400"
            )}
          >
            <div 
              className={cn(
                "flex items-center justify-center rounded-full mb-1",
                item.isCenter ? "bg-[#ff3335] p-3" : ""
              )}
            >
              <item.icon 
                size={item.isCenter ? 24 : 20} 
                className={item.isCenter ? "text-white" : ""}
              />
            </div>
            <span className="text-xs truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavBar;
