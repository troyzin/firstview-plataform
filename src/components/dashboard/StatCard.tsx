
import React from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  icon: string;
  color: "red" | "blue" | "yellow" | "green";
  trend: {
    value: string;
    label: string;
    positive?: boolean;
    negative?: boolean;
    neutral?: boolean;
  };
};

const StatCard = ({ title, value, icon, color, trend }: StatCardProps) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "red":
        return {
          border: "border-red-600",
          iconBg: "bg-red-600/10",
          iconColor: "text-red-600",
        };
      case "blue":
        return {
          border: "border-blue-500",
          iconBg: "bg-blue-500/10",
          iconColor: "text-blue-500",
        };
      case "yellow":
        return {
          border: "border-yellow-500",
          iconBg: "bg-yellow-500/10",
          iconColor: "text-yellow-500",
        };
      case "green":
        return {
          border: "border-green-500",
          iconBg: "bg-green-500/10",
          iconColor: "text-green-500",
        };
      default:
        return {
          border: "border-primary",
          iconBg: "bg-primary/10",
          iconColor: "text-primary",
        };
    }
  };

  const colorClasses = getColorClasses(color);
  
  const getTrendColor = () => {
    if (trend.positive) return "text-green-500";
    if (trend.negative) return "text-red-500";
    return "text-gray-400";
  };

  const getTrendIcon = () => {
    if (trend.positive) return "trending_up";
    if (trend.negative) return "trending_down";
    return "schedule";
  };

  return (
    <div className={cn(
      "bg-gray-900 p-6 rounded-lg border-l-4 hover:shadow-lg transition-all transform hover:-translate-y-1",
      colorClasses.border
    )}>
      <div className="flex justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", colorClasses.iconBg)}>
          <span className={cn("material-symbols-outlined", colorClasses.iconColor)}>{icon}</span>
        </div>
      </div>
      <p className={cn("text-sm mt-4 flex items-center", getTrendColor())}>
        <span className="material-symbols-outlined text-sm mr-1">{getTrendIcon()}</span>
        {trend.value} {trend.label}
      </p>
    </div>
  );
};

export default StatCard;
