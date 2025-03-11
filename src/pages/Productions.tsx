
import React from 'react';
import { Button } from "@/components/ui/button";
import KanbanBoard, { KanbanColumn } from '../components/kanban/KanbanBoard';
import { Plus, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Productions = () => {
  // Sample kanban columns - expanded version of the dashboard
  const kanbanColumns: KanbanColumn[] = [
    {
      id: "production",
      title: "Produção",
      count: 6,
      color: "produflow-red",
      items: [
        {
          id: "p1",
          title: "Campanha Nova Marca",
          description: "Vídeo de lançamento para redes sociais",
          priority: "urgent",
          dueDate: "12/05/2023",
          assignees: [
            { initials: "RM", color: "blue-500" },
            { initials: "AL", color: "green-500" }
          ]
        },
        {
          id: "p2",
          title: "Teaser Evento",
          description: "Vídeo de 30s para divulgação",
          priority: "normal",
          dueDate: "15/05/2023",
          assignees: [
            { initials: "JS", color: "red-500" }
          ]
        },
        {
          id: "p3",
          title: "Webinar Corporativo",
          description: "Edição de webinar para plataforma",
          priority: "low",
          dueDate: "20/05/2023",
          assignees: [
            { initials: "RM", color: "blue-500" }
          ]
        },
        {
          id: "p4",
          title: "Vídeo Institucional",
          description: "Apresentação da empresa",
          priority: "high",
          dueDate: "18/05/2023",
          assignees: [
            { initials: "AL", color: "green-500" },
            { initials: "JS", color: "red-500" }
          ]
        }
      ]
    },
    {
      id: "editing",
      title: "Edição",
      count: 8,
      color: "blue-500",
      items: [
        {
          id: "e1",
          title: "Documentário",
          description: "Entrevistas e montagem final",
          priority: "high",
          dueDate: "10/05/2023",
          assignees: [
            { initials: "LF", color: "purple-500" }
          ]
        },
        {
          id: "e2",
          title: "Animação 3D",
          description: "Renderização e composição",
          priority: "normal",
          dueDate: "14/05/2023",
          assignees: [
            { initials: "MW", color: "yellow-500" }
          ]
        },
        {
          id: "e3",
          title: "Tutorial Software",
          description: "Edição e inserção de legendas",
          priority: "low",
          dueDate: "22/05/2023",
          assignees: [
            { initials: "IT", color: "green-500" }
          ]
        }
      ]
    },
    {
      id: "review",
      title: "Revisão",
      count: 3,
      color: "yellow-500",
      items: [
        {
          id: "r1",
          title: "Comercial TV",
          description: "Ajustes de cor e áudio",
          priority: "normal",
          dueDate: "08/05/2023",
          assignees: [
            { initials: "FT", color: "orange-500" }
          ]
        },
        {
          id: "r2",
          title: "Motion Graphics",
          description: "Revisão de timing e fluidez",
          priority: "normal",
          dueDate: "11/05/2023",
          assignees: [
            { initials: "JG", color: "blue-500" }
          ]
        }
      ]
    },
    {
      id: "delivered",
      title: "Entregue",
      count: 15,
      color: "green-500",
      items: [
        {
          id: "d1",
          title: "Vídeo Instagram",
          description: "Reels para feed cliente",
          priority: "completed",
          dueDate: "05/05/2023",
          assignees: [
            { initials: "AL", color: "green-500" }
          ]
        },
        {
          id: "d2",
          title: "Curso Online",
          description: "Série de vídeos instrucionais",
          priority: "completed",
          dueDate: "03/05/2023",
          assignees: [
            { initials: "FS", color: "purple-500" }
          ]
        },
        {
          id: "d3",
          title: "Evento Corporativo",
          description: "Cobertura e edição",
          priority: "completed",
          dueDate: "02/05/2023",
          assignees: [
            { initials: "JG", color: "blue-500" },
            { initials: "MW", color: "yellow-500" }
          ]
        }
      ]
    }
  ];

  const handleNewProduction = () => {
    toast.info("Funcionalidade de adicionar produção em desenvolvimento");
  };

  const handleCardClick = (itemId: string) => {
    toast.info(`Visualizando produção ID: ${itemId}`);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Produções</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              placeholder="Buscar produções..." 
              className="pl-9 bg-gray-800 border-gray-700 focus:border-produflow-red w-64"
            />
          </div>
          <Button onClick={handleNewProduction} className="flex items-center space-x-2 bg-produflow-red hover:bg-red-700">
            <Plus size={18} />
            <span>Nova Produção</span>
          </Button>
        </div>
      </div>

      <div className="bg-produflow-gray-900 rounded-lg p-6">
        <KanbanBoard 
          columns={kanbanColumns} 
          onCardClick={handleCardClick} 
        />
      </div>
    </>
  );
};

export default Productions;
