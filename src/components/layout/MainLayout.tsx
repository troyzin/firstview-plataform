
import React from 'react';
import Header from './Header';
import { Toaster } from "sonner";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="bg-black text-white font-sans min-h-screen flex flex-col">
      <Header />
      <main className="p-6 flex-1">
        {children}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default MainLayout;
