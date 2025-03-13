
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import DeadlineCard from "@/components/dashboard/DeadlineCard";
import ProductionModal from "@/components/productions/ProductionModal";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TodayProductions from "@/components/dashboard/TodayProductions";
import ProductionsRanking from "@/components/dashboard/ProductionsRanking";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { 
    productionsCount, 
    todayProductions, 
    topProductions, 
    isLoading,
    error 
  } = useDashboardData();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  const handleAddProduction = () => {
    navigate('/productions');
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  // Add a timeout to prevent infinite loading states
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  React.useEffect(() => {
    // If still loading after 10 seconds, show the dashboard anyway
    const timer = setTimeout(() => {
      if (isLoading) {
        setLoadingTimeout(true);
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Either timed out or finished loading
  if (isLoading && !loadingTimeout) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600 mr-2"></div>
          <p>Carregando...</p>
        </div>
      </MainLayout>
    );
  }

  // Show error state if there was an error
  if (error && !loadingTimeout) {
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center h-full py-12 text-center">
          <div className="text-red-600 text-2xl mb-2">⚠️</div>
          <p className="text-lg font-medium mb-2">Não foi possível carregar os dados</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        {/* Filter and Add Button  */}
        <div className="flex space-x-4 ml-auto">
          <DashboardHeader 
            onFilterChange={handleFilterChange}
            onAddProduction={() => setIsModalOpen(true)}
            isMobile={isMobile}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TodayProductions productions={todayProductions} />
        </div>

        <div className="space-y-6">
          <ProductionsRanking productions={topProductions} />
          <DeadlineCard deadlines={[]} />
        </div>
      </div>

      <ProductionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddProduction}
      />
    </MainLayout>
  );
};

export default Dashboard;
