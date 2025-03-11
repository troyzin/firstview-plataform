
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { FileSpreadsheet } from "lucide-react";

const Edits = () => {
  return (
    <MainLayout>
      <div className="flex items-center justify-center h-[70vh] flex-col space-y-4">
        <div className="rounded-full bg-gray-800 p-6">
          <FileSpreadsheet size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Página em Manutenção</h2>
        <p className="text-gray-400 max-w-md text-center">
          Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
        </p>
      </div>
    </MainLayout>
  );
};

export default Edits;
