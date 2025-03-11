
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import WorkloadCard from "@/components/dashboard/WorkloadCard";
import DeadlineCard from "@/components/dashboard/DeadlineCard";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterIcon, PlusIcon } from "lucide-react";

const Dashboard = () => {
  const [filter, setFilter] = useState("all");

  const stats = [
    {
      title: "Total de Produções",
      value: "32",
      icon: "movie",
      color: "red" as const,
      trend: { value: "+12%", label: "em relação ao mês anterior", positive: true },
    },
    {
      title: "Em Produção",
      value: "14",
      icon: "pending",
      color: "blue" as const,
      trend: { value: "5", label: "com prazo próximo", neutral: true },
    },
    {
      title: "Tempo Médio de Edição",
      value: "3.2 dias",
      icon: "timer",
      color: "yellow" as const,
      trend: { value: "+0.5 dias", label: "comparado ao último mês", negative: true },
    },
    {
      title: "Taxa de Entrega no Prazo",
      value: "92%",
      icon: "done_all",
      color: "green" as const,
      trend: { value: "+5%", label: "em relação ao mês anterior", positive: true },
    },
  ];

  const workloads = [
    { name: "Filipe Silva", initials: "FS", current: 2, max: 4 },
    { name: "Arthur Fernandes", initials: "AF", current: 3, max: 4 },
    { name: "João Gustavo", initials: "JG", current: 4, max: 4 },
    { name: "Iago Tarangino", initials: "IT", current: 1, max: 4 },
    { name: "Matheus Worish", initials: "MW", current: 3, max: 4 },
  ];

  const deadlines = [
    {
      title: "Campanha Nova Marca",
      dueDate: "Vence em 2 dias",
      priority: "high" as const,
      status: "pending" as const,
    },
    {
      title: "Documentário",
      dueDate: "Atrasado por 1 dia",
      priority: "medium" as const,
      status: "overdue" as const,
    },
    {
      title: "Teaser Evento",
      dueDate: "Vence em 5 dias",
      priority: "low" as const,
      status: "pending" as const,
    },
  ];

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <div className="flex space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="bg-gray-800 text-white hover:bg-gray-700">
                <FilterIcon className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuItem 
                className="hover:bg-gray-700"
                onClick={() => setFilter("all")}
              >
                Todos os projetos
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-gray-700"
                onClick={() => setFilter("mine")}
              >
                Meus projetos
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-gray-700"
                onClick={() => setFilter("late")}
              >
                Em atraso
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-gray-700"
                onClick={() => setFilter("completed")}
              >
                Concluídos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="bg-red-600 hover:bg-red-700">
            <PlusIcon className="mr-2 h-4 w-4" />
            Nova Produção
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Produções em Andamento</h3>
            <KanbanBoard />
          </div>
        </div>

        <div className="space-y-6">
          <WorkloadCard workloads={workloads} />
          <DeadlineCard deadlines={deadlines} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
