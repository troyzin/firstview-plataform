
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type NavItemProps = {
  to: string;
  icon: string | LucideIcon;
  label?: string;
  notificationCount?: number;
  isActive?: boolean;
  onClick?: () => void;
};

const NavItem = ({
  to,
  icon,
  label,
  notificationCount,
  isActive = false,
  onClick,
}: NavItemProps) => {
  // Renderiza o ícone com base no tipo (string ou componente)
  const renderIcon = () => {
    if (typeof icon === "string") {
      // Add !important to ensure styles are applied
      return (
        <span 
          className="material-symbols-outlined" 
          style={{ fontFamily: "'Material Symbols Outlined' !important" }}
        >
          {icon}
        </span>
      );
    } else {
      const Icon = icon;
      return <Icon size={24} />;
    }
  };

  return (
    <Link
      to={to}
      className={cn(
        "relative flex items-center hover:text-red-500 transition-colors",
        isActive ? "text-red-500" : "text-white"
      )}
      onClick={onClick}
    >
      {renderIcon()}
      {label && <span className="ml-2">{label}</span>}
      
      {notificationCount && notificationCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
        >
          {notificationCount > 9 ? "9+" : notificationCount}
        </Badge>
      )}
    </Link>
  );
};

export default NavItem;
