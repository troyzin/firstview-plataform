
import React from "react";
import { AlertTriangle } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";

const Team = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <AlertTriangle className="h-20 w-20 text-yellow-500 mb-4" />
        <h1 className="text-3xl font-bold text-center mb-2">Em Manutenção</h1>
        <p className="text-gray-400 text-center max-w-md">
          Estamos trabalhando para implementar recursos de gerenciamento de equipe.
          Esta seção estará disponível em breve.
        </p>
      </div>
    </MainLayout>
  );
};

export default Team;
