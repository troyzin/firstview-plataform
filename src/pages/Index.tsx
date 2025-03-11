
import React, { useState, useEffect } from "react";
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
import ProductionModal from "@/components/productions/ProductionModal";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productionsCount, setProductionsCount] = useState(0);
  const [todayProductions, setTodayProductions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch total productions for the current month
    const fetchProductionsCount = async () => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const { count, error } = await supabase
        .from('productions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString())
        .lte('created_at', lastDayOfMonth.toISOString());
      
      if (error) {
        console.error("Error fetching productions count:", error);
        return;
      }
      
      setProductionsCount(count || 0);
    };

    // Fetch today's productions
    const fetchTodayProductions = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('productions')
        .select('*')
        .gte('start_date', today.toISOString())
        .lt('start_date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());
      
      if (error) {
        console.error("Error fetching today's productions:", error);
        return;
      }
      
      setTodayProductions(data || []);
    };

    fetchProductionsCount();
    fetchTodayProductions();
  }, []);

  const stats = [
    {
      title: "Total de Produções",
      value: productionsCount.toString(),
      icon: "movie",
      color: "red" as const,
      trend: { value: "Mês Atual", label: "", neutral: true },
    },
    {
      title: "Tempo Médio de Edição do Time",
      value: "--",
      icon: "timer",
      color: "yellow" as const,
      trend: { value: "Em breve", label: "", neutral: true },
    },
    {
      title: "Taxa de Entrega no Prazo",
      value: "--",
      icon: "done_all",
      color: "green" as const,
      trend: { value: "Em breve", label: "", neutral: true },
    },
  ];

  // Fetch top productions for the workload card
  const [topProductions, setTopProductions] = useState([]);
  
  useEffect(() => {
    const fetchTopProductions = async () => {
      const { data, error } = await supabase
        .from('productions')
        .select('title, id, client_id, clients(name)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("Error fetching top productions:", error);
        return;
      }
      
      // Format the data for the WorkloadCard
      const formattedData = data.map((item, index) => {
        const initials = item.title.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase();
        return {
          name: item.title,
          initials,
          current: 1,  // Placeholder value
          max: 1,      // Placeholder value
          client: item.clients?.name || 'Cliente não especificado'
        };
      });
      
      setTopProductions(formattedData);
    };
    
    fetchTopProductions();
  }, []);

  const handleAddProduction = () => {
    navigate('/productions');
  };

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

          <Button className="bg-red-600 hover:bg-red-700" onClick={() => setIsModalOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Nova Produção
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Hoje</h3>
            {todayProductions.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {todayProductions.map((production: any) => (
                  <div key={production.id} className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium">{production.title}</h4>
                    <p className="text-sm text-gray-400">{production.description || 'Sem descrição'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>Nenhuma produção marcada para hoje</p>
              </div>
            )}
            
            <div className="mt-6">
              <h4 className="text-md font-medium mb-3">Edição</h4>
              <div className="text-center py-6 text-gray-400">
                <p>Em breve.</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-md font-medium mb-3">Revisão</h4>
              <div className="text-center py-6 text-gray-400">
                <p>Em breve.</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-md font-medium mb-3">Entregue</h4>
              <div className="text-center py-6 text-gray-400">
                <p>Em breve.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Ranking de Produções</h3>
            {topProductions.length > 0 ? (
              <div className="space-y-4">
                {topProductions.map((production: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs mr-3">
                        {production.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{production.name}</p>
                        <p className="text-xs text-gray-400">{production.client}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">#{index + 1}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <p>Nenhuma produção disponível</p>
              </div>
            )}
          </div>
          <DeadlineCard deadlines={[]} />
        </div>
      </div>

      {/* Modal para nova produção */}
      <ProductionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddProduction}
      />
    </MainLayout>
  );
};

export default Dashboard;
