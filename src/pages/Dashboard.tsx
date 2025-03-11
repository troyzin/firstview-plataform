
import React from 'react';
import { Plus, FilterX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import StatCard from '../components/dashboard/StatCard';
import WorkloadCard from '../components/dashboard/WorkloadCard';
import DeadlineCard from '../components/dashboard/DeadlineCard';
import KanbanBoard, { KanbanColumn } from '../components/kanban/KanbanBoard';
import { useNavigate } from 'react-router-dom';
import { Film, Clock, Timer, CheckCheck } from 'lucide-react';
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();

  // Sample data for stats
  const stats = [
    {
      title: "Total de Produções",
      value: 32,
      icon: Film,
      iconColor: "text-produflow-red",
      iconBgColor: "bg-red-600/10",
      borderColor: "border-produflow-red",
      trend: {
        value: "+12% em relação ao mês anterior",
        isPositive: true
      }
    },
    {
      title: "Em Produção",
      value: 14,
      icon: Clock,
      iconColor: "text-blue-500",
      iconBgColor: "bg-blue-500/10",
      borderColor: "border-blue-500",
      trend: {
        value: "5 com prazo próximo",
        isPositive: true
      }
    },
    {
      title: "Tempo Médio de Edição",
      value: "3.2 dias",
      icon: Timer,
      iconColor: "text-yellow-500",
      iconBgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500",
      trend: {
        value: "+0.5 dias comparado ao último mês",
        isPositive: false
      }
    },
    {
      title: "Taxa de Entrega no Prazo",
      value: "92%",
      icon: CheckCheck,
      iconColor: "text-green-500",
      iconBgColor: "bg-green-500/10",
      borderColor: "border-green-500",
      trend: {
        value: "+5% em relação ao mês anterior",
        isPositive: true
      }
    }
  ];

  // Sample data for team members
  const teamMembers = [
    { name: "Filipe Silva", initials: "FS", currentLoad: 2, maxLoad: 4 },
    { name: "Arthur Fernandes", initials: "AF", currentLoad: 3, maxLoad: 4 },
    { name: "João Gustavo", initials: "JG", currentLoad: 4, maxLoad: 4 },
    { name: "Iago Tarangino", initials: "IT", currentLoad: 1, maxLoad: 4 },
    { name: "Matheus Worish", initials: "MW", currentLoad: 3, maxLoad: 4 }
  ];

  // Sample data for deadlines
  const deadlines = [
    { 
      id: "1", 
      title: "Campanha Nova Marca", 
      status: "urgent" as const, 
      timeLeft: "2 dias" 
    },
    { 
      id: "2", 
      title: "Documentário", 
      status: "late" as const, 
      timeLeft: "1 dia" 
    },
    { 
      id: "3", 
      title: "Teaser Evento", 
      status: "upcoming" as const, 
      timeLeft: "5 dias" 
    }
  ];

  // Sample kanban columns
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
        }
      ]
    }
  ];

  const handleNewProduction = () => {
    toast.info("Funcionalidade de adicionar produção em desenvolvimento");
  };

  const handleViewDeadline = (id: string) => {
    toast.info(`Visualizando prazo ID: ${id}`);
  };

  const handleCardClick = (itemId: string) => {
    toast.info(`Visualizando item ID: ${itemId}`);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <div className="flex space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 hover:bg-gray-700">
                <FilterX size={18} />
                <span>Filtrar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
              <DropdownMenuItem className="hover:bg-gray-700">Todos os projetos</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700">Meus projetos</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700">Em atraso</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700">Concluídos</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={handleNewProduction} className="flex items-center space-x-2 bg-produflow-red hover:bg-red-700">
            <Plus size={18} />
            <span>Nova Produção</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-produflow-gray-900 rounded-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Produções em Andamento</h3>
          <KanbanBoard 
            columns={kanbanColumns} 
            onCardClick={handleCardClick} 
          />
        </div>

        <div>
          <WorkloadCard members={teamMembers} />
          <DeadlineCard 
            deadlines={deadlines} 
            onViewDeadline={handleViewDeadline} 
          />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
