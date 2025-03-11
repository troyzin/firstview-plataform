
import React from "react";

const Loading = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      <p className="ml-2 text-white">Carregando...</p>
    </div>
  );
};

export default Loading;
