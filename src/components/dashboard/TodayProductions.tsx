
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Production = {
  id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  client_name?: string;
  start_time?: string;
  end_time?: string;
};

interface TodayProductionsProps {
  productions: Production[];
}

const TodayProductions = ({ productions }: TodayProductionsProps) => {
  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    return timeString;
  };

  return (
    <div className="bg-[#141414] rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Hoje</h3>
      {productions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {productions.map((production: Production) => (
            <div key={production.id} className="bg-[#0a0a0a] p-4 rounded-lg">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium">{production.title}</h4>
                  <p className="text-sm text-gray-400">
                    {production.client_name || 'Cliente não especificado'}
                  </p>
                </div>
                <div className="text-sm text-gray-300">
                  {production.start_time && formatTime(production.start_time)}
                  {production.end_time && ` - ${formatTime(production.end_time)}`}
                </div>
              </div>
              {production.description && (
                <p className="text-sm text-gray-400 mt-2">{production.description}</p>
              )}
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
  );
};

export default TodayProductions;
