
import React from 'react';
import KanbanCard from './KanbanCard';

export interface KanbanColumn {
  id: string;
  title: string;
  count: number;
  color: string;
  items: KanbanItem[];
}

export interface KanbanItem {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'normal' | 'low' | 'completed';
  dueDate: string;
  assignees: { initials: string; color: string }[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onCardClick: (itemId: string) => void;
}

const KanbanBoard = ({ columns, onCardClick }: KanbanBoardProps) => {
  return (
    <div className="overflow-hidden overflow-x-auto">
      <div className="flex space-x-4 pb-4">
        {columns.map((column) => (
          <div 
            key={column.id}
            className={`flex-shrink-0 w-80 bg-gray-800 rounded-lg p-4 border-t-2 border-${column.color}`}
          >
            <h4 className="font-medium flex items-center justify-between">
              <span>{column.title}</span>
              <span className={`bg-${column.color}/20 text-${column.color} text-xs px-2 py-1 rounded-full`}>
                {column.count}
              </span>
            </h4>
            
            <div className="mt-4 space-y-3">
              {column.items.map((item) => (
                <KanbanCard 
                  key={item.id}
                  item={item}
                  onClick={() => onCardClick(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
