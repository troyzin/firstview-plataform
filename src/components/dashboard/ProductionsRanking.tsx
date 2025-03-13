
import React from "react";

type RankedProduction = {
  name: string;
  initials: string;
  client: string;
};

interface ProductionsRankingProps {
  productions: RankedProduction[];
}

const ProductionsRanking = ({ productions }: ProductionsRankingProps) => {
  return (
    <div className="bg-[#141414] rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Ranking de Produções</h3>
      {productions.length > 0 ? (
        <div className="space-y-4">
          {productions.map((production: RankedProduction, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#0a0a0a] flex items-center justify-center text-xs mr-3">
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
  );
};

export default ProductionsRanking;
