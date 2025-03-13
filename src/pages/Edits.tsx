
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction, Clock } from "lucide-react";

const Edits = () => {
  return (
    <MainLayout>
      <div className="container mx-auto">
        <Card className="bg-[#141414] border-gray-800">
          <CardHeader>
            <CardTitle>Página em Desenvolvimento</CardTitle>
            <CardDescription>
              Esta funcionalidade estará disponível em breve
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Construction className="w-24 h-24 mb-4 text-gray-600" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              Estamos trabalhando nesta página
            </h3>
            <p className="text-gray-400 max-w-md mb-4">
              A ferramenta de gerenciamento de edições está em desenvolvimento e será disponibilizada em breve.
            </p>
            <div className="flex items-center text-gray-500">
              <Clock className="mr-2 h-5 w-5" />
              <span>Lançamento previsto em breve</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Edits;
