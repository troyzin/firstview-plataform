
import React from "react";
import KanbanCard, { KanbanCardType } from "./KanbanCard";

// Define the KanbanColumn type for export
export type KanbanColumn = {
  id: string;
  title: string;
  count: number;
  color: string;
  items: KanbanCardType[];
};

type KanbanBoardProps = {
  columns?: KanbanColumn[];
  onCardClick?: (itemId: string) => void;
};

// Simulação de dados para o quadro Kanban
const defaultKanbanData = {
  production: {
    title: "Produção",
    borderColor: "border-red-600",
    bgColor: "bg-red-600/20",
    textColor: "text-red-600",
    count: 6,
    cards: [
      {
        id: "prod-1",
        title: "Campanha Nova Marca",
        description: "Vídeo de lançamento para redes sociais",
        dueDate: "12/05/2023",
        priority: "urgent",
        assignees: [
          { initials: "RM", color: "blue" },
          { initials: "AL", color: "green" },
        ],
      },
      {
        id: "prod-2",
        title: "Teaser Evento",
        description: "Vídeo de 30s para divulgação",
        dueDate: "15/05/2023",
        priority: "normal",
        assignees: [
          { initials: "JS", color: "red" },
        ],
      },
    ],
  },
  editing: {
    title: "Edição",
    borderColor: "border-blue-500",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-500",
    count: 8,
    cards: [
      {
        id: "edit-1",
        title: "Documentário",
        description: "Entrevistas e montagem final",
        dueDate: "10/05/2023",
        priority: "priority",
        assignees: [
          { initials: "LF", color: "purple" },
        ],
      },
    ],
  },
  review: {
    title: "Revisão",
    borderColor: "border-yellow-500",
    bgColor: "bg-yellow-500/20",
    textColor: "text-yellow-500",
    count: 3,
    cards: [
      {
        id: "rev-1",
        title: "Comercial TV",
        description: "Ajustes de cor e áudio",
        dueDate: "08/05/2023",
        priority: "normal",
        assignees: [
          { initials: "FT", color: "orange" },
        ],
      },
    ],
  },
  delivered: {
    title: "Entregue",
    borderColor: "border-green-500",
    bgColor: "bg-green-500/20",
    textColor: "text-green-500",
    count: 15,
    cards: [
      {
        id: "del-1",
        title: "Vídeo Instagram",
        description: "Reels para feed cliente",
        dueDate: "05/05/2023",
        priority: "normal",
        assignees: [
          { initials: "AL", color: "green" },
        ],
      },
    ],
  },
};

const KanbanBoard = ({ columns, onCardClick }: KanbanBoardProps) => {
  // If columns are provided, use them; otherwise, use the default data
  const renderColumns = () => {
    if (columns) {
      return columns.map((column) => (
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
                card={item} 
                onClick={() => onCardClick && onCardClick(item.id)} 
              />
            ))}
          </div>
        </div>
      ));
    } else {
      // Use default data
      return Object.entries(defaultKanbanData).map(([key, column]) => (
        <div
          key={key}
          className={`flex-shrink-0 w-80 bg-gray-800 rounded-lg p-4 border-t-2 ${column.borderColor}`}
        >
          <h4 className="font-medium flex items-center justify-between">
            <span>{column.title}</span>
            <span className={`${column.bgColor} ${column.textColor} text-xs px-2 py-1 rounded-full`}>
              {column.count}
            </span>
          </h4>
          
          <div className="mt-4 space-y-3">
            {column.cards.map((card) => (
              <KanbanCard 
                key={card.id} 
                card={card as KanbanCardType} 
                onClick={() => onCardClick && onCardClick(card.id)}
              />
            ))}
          </div>
        </div>
      ));
    }
  };

  return (
    <div className="overflow-hidden overflow-x-auto">
      <div className="flex space-x-4 pb-4">
        {renderColumns()}
      </div>
    </div>
  );
};

export default KanbanBoard;
