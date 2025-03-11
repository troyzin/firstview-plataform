
import React from "react";

export type KanbanCardType = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "urgent" | "normal" | "low" | "priority";
  assignees: Array<{
    initials: string;
    color: string;
  }>;
};

type KanbanCardProps = {
  card: KanbanCardType;
};

const KanbanCard: React.FC<KanbanCardProps> = ({ card }) => {
  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-yellow-500/20 text-yellow-400";
      case "priority":
        return "bg-red-500/20 text-red-400";
      case "normal":
        return "bg-green-500/20 text-green-400";
      case "low":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="bg-gray-900 p-3 rounded-lg hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <h5 className="font-medium">{card.title}</h5>
        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityClasses(card.priority)}`}>
          {card.priority.charAt(0).toUpperCase() + card.priority.slice(1)}
        </span>
      </div>
      <p className="text-sm text-gray-400 mt-2">{card.description}</p>
      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <span className="material-symbols-outlined text-sm">schedule</span>
          <span className="text-xs">{card.dueDate}</span>
        </div>
        <div className="flex -space-x-2">
          {card.assignees.map((assignee, idx) => (
            <div
              key={idx}
              className={`w-6 h-6 bg-${assignee.color}-500 rounded-full flex items-center justify-center text-xs border border-gray-900`}
            >
              {assignee.initials}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;
