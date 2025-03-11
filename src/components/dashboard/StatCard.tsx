
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  borderColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  iconBgColor, 
  borderColor,
  trend 
}: StatCardProps) => {
  return (
    <div className={`bg-produflow-gray-900 p-6 rounded-lg border-l-4 ${borderColor} hover:shadow-lg transition-all transform hover:-translate-y-1`}>
      <div className="flex justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center`}>
          <Icon className={`${iconColor}`} size={24} />
        </div>
      </div>
      
      {trend && (
        <p className={`${trend.isPositive ? 'text-green-500' : 'text-red-500'} text-sm mt-4 flex items-center`}>
          <span className="material-symbols-outlined text-sm mr-1">
            {trend.isPositive ? 'trending_up' : 'trending_down'}
          </span>
          {trend.value}
        </p>
      )}
    </div>
  );
};

export default StatCard;
