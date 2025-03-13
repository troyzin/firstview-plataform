
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: string | LucideIcon;
  color?: "red" | "blue" | "yellow" | "green" | string;
  trend: {
    value: string;
    label?: string;
    positive?: boolean;
    negative?: boolean;
    neutral?: boolean;
    isPositive?: boolean;
  };
  iconColor?: string;
  iconBgColor?: string;
  borderColor?: string;
};

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = "blue", 
  trend, 
  iconColor, 
  iconBgColor, 
  borderColor 
}: StatCardProps) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "red":
        return {
          border: borderColor || "border-red-600",
          iconBg: iconBgColor || "bg-red-600/10",
          iconColor: iconColor || "text-red-600",
        };
      case "blue":
        return {
          border: borderColor || "border-blue-500",
          iconBg: iconBgColor || "bg-blue-500/10",
          iconColor: iconColor || "text-blue-500",
        };
      case "yellow":
        return {
          border: borderColor || "border-yellow-500",
          iconBg: iconBgColor || "bg-yellow-500/10",
          iconColor: iconColor || "text-yellow-500",
        };
      case "green":
        return {
          border: borderColor || "border-green-500",
          iconBg: iconBgColor || "bg-green-500/10",
          iconColor: iconColor || "text-green-500",
        };
      default:
        return {
          border: borderColor || "border-primary",
          iconBg: iconBgColor || "bg-primary/10",
          iconColor: iconColor || "text-primary",
        };
    }
  };

  const colorClasses = getColorClasses(color);
  
  const getTrendColor = () => {
    if (trend.positive || trend.isPositive) return "text-green-500";
    if (trend.negative) return "text-red-500";
    return "text-gray-400";
  };

  const getTrendIcon = () => {
    if (trend.positive || trend.isPositive) return "trending_up";
    if (trend.negative) return "trending_down";
    return "schedule";
  };

  const renderIcon = () => {
    if (typeof icon === "string") {
      return <span className={cn("material-symbols-outlined", colorClasses.iconColor)}>{icon}</span>;
    } else {
      const Icon = icon;
      return <Icon className={colorClasses.iconColor} />;
    }
  };

  return (
    <div className={cn(
      "bg-[#141414] p-6 rounded-lg border-l-4 hover:shadow-lg transition-all transform hover:-translate-y-1",
      colorClasses.border
    )}>
      <div className="flex justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", colorClasses.iconBg)}>
          {renderIcon()}
        </div>
      </div>
      <p className={cn("text-sm mt-4 flex items-center", getTrendColor())}>
        <span className="material-symbols-outlined text-sm mr-1">{getTrendIcon()}</span>
        {trend.value} {trend.label || ""}
      </p>
    </div>
  );
};

export default StatCard;
