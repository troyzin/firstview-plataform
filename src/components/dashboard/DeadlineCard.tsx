
import React from "react";
import { ChevronRight } from "lucide-react";

export type DeadlineItem = {
  id?: string;
  title: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
  status: "pending" | "overdue" | "completed" | "urgent" | "late" | "upcoming";
  timeLeft?: string;
};

type DeadlineCardProps = {
  deadlines: DeadlineItem[];
  onViewDeadline?: (id: string) => void;
};

const DeadlineCard = ({ deadlines, onViewDeadline }: DeadlineCardProps) => {
  const getPriorityIcon = (priority: string, status: string) => {
    if (status === "urgent" || status === "late") {
      return "priority_high";
    }
    if (status === "upcoming") {
      return "event";
    }
    
    switch (priority) {
      case "high":
        return "priority_high";
      case "medium":
        return "warning";
      case "low":
        return "event";
      default:
        return "event";
    }
  };

  const getPriorityColor = (priority: string, status: string) => {
    if (status === "urgent" || status === "late") {
      return {
        bg: "bg-red-600/10",
        text: "text-red-600",
      };
    }
    if (status === "upcoming") {
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-500",
      };
    }
    
    switch (priority) {
      case "high":
        return {
          bg: "bg-red-600/10",
          text: "text-red-600",
        };
      case "medium":
        return {
          bg: "bg-yellow-500/10",
          text: "text-yellow-500",
        };
      case "low":
        return {
          bg: "bg-blue-500/10",
          text: "text-blue-500",
        };
      default:
        return {
          bg: "bg-gray-500/10",
          text: "text-gray-500",
        };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
      case "late":
        return "text-red-500";
      case "completed":
        return "text-green-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="bg-[#141414] rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Próximos Prazos</h3>
      <div className="space-y-3">
        {deadlines.map((item, index) => {
          const priorityColor = getPriorityColor(item.priority || "medium", item.status);
          const statusColor = getStatusColor(item.status);
          const displayDate = item.timeLeft || item.dueDate || "";
          
          return (
            <div 
              key={index} 
              className="flex items-center p-2 bg-[#0a0a0a] rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => item.id && onViewDeadline && onViewDeadline(item.id)}
            >
              <div className={`w-10 h-10 ${priorityColor.bg} rounded-full flex items-center justify-center mr-3`}>
                <span className={`material-symbols-outlined ${priorityColor.text}`}>
                  {getPriorityIcon(item.priority || "medium", item.status)}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">{item.title}</h4>
                <p className={`text-xs ${statusColor}`}>{displayDate}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 hover:text-white" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeadlineCard;
