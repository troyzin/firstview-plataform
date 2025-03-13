
import React from "react";
import { Progress } from "@/components/ui/progress";
import { MoreVertical } from "lucide-react";

type WorkloadItem = {
  name: string;
  initials: string;
  current?: number;
  max?: number;
  currentLoad?: number;
  maxLoad?: number;
};

type WorkloadCardProps = {
  workloads?: WorkloadItem[];
  members?: WorkloadItem[];
};

const WorkloadCard = ({ workloads, members }: WorkloadCardProps) => {
  // Use members prop if provided, otherwise use workloads
  const items = members || workloads || [];

  const getProgressColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTextColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage < 50) return "text-green-500";
    if (percentage < 80) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="bg-[#141414] rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex justify-between items-center">
        <span>Carga de Trabalho</span>
        <MoreVertical className="w-5 h-5 cursor-pointer hover:text-red-500 transition-colors" />
      </h3>
      <div className="space-y-4">
        {items.map((item, index) => {
          // Handle both current/max and currentLoad/maxLoad properties
          const current = item.current || item.currentLoad || 0;
          const max = item.max || item.maxLoad || 1;
          
          return (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">{item.name} ({item.initials})</span>
                <span className={`text-xs ${getTextColor(current, max)}`}>
                  {current}/{max}
                </span>
              </div>
              <Progress 
                value={(current / max) * 100} 
                className="h-2 bg-[#0a0a0a]"
                color={getProgressColor(current, max)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkloadCard;
