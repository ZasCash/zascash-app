import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

const Layout = ({ selectedLocal, setSelectedLocal }) => {
  return (
    <div className="flex h-screen bg-secondary/40">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary/40 p-4 md:p-6 lg:p-8 pb-16 md:pb-8">
          <Outlet context={{ selectedLocal, setSelectedLocal }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;