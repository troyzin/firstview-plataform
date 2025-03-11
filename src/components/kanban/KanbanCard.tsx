
import React from 'react';
import { Clock } from 'lucide-react';
import { KanbanItem } from './KanbanBoard';

interface KanbanCardProps {
  item: KanbanItem;
  onClick: () => void;
}

const KanbanCard = ({ item, onClick }: KanbanCardProps) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">Urgente</span>;
      case 'high':
        return <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">Prioridade</span>;
      case 'normal':
        return <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">Normal</span>;
      case 'low':
        return <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Baixa</span>;
      case 'completed':
        return <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Concluído</span>;
      default:
        return null;
    }
  };

  return (
    <div 
      className="bg-gray-900 p-3 rounded-lg hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h5 className="font-medium">{item.title}</h5>
        {getPriorityBadge(item.priority)}
      </div>
      <p className="text-sm text-gray-400 mt-2">{item.description}</p>
      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <Clock size={14} />
          <span className="text-xs">{item.dueDate}</span>
        </div>
        <div className="flex -space-x-2">
          {item.assignees.map((assignee, index) => (
            <div 
              key={index}
              className={`w-6 h-6 bg-${assignee.color} rounded-full flex items-center justify-center text-xs border border-gray-900`}
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
