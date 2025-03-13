
import React from "react";
import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-4">
      <Loader2 className="h-12 w-12 animate-spin text-[#ff3335]" />
      <p className="mt-4 text-white">Carregando...</p>
    </div>
  );
};

export default Loading;
