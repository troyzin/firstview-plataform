
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import DeadlineCard from "@/components/dashboard/DeadlineCard";
import ProductionModal from "@/components/productions/ProductionModal";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TodayProductions from "@/components/dashboard/TodayProductions";
import ProductionsRanking from "@/components/dashboard/ProductionsRanking";
import { useDashboardData } from "@/hooks/useDashboardData";

const Dashboard = () => {
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { 
    productionsCount, 
    todayProductions, 
    topProductions, 
    isLoading 
  } = useDashboardData();
  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600 mr-2"></div>
          <p>Carregando...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <DashboardHeader 
        onFilterChange={handleFilterChange}
        onAddProduction={() => setIsModalOpen(true)}
      />

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
