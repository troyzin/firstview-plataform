
import React, { ReactNode } from "react";
import Header from "./Header";

type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="bg-black text-white font-sans min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
