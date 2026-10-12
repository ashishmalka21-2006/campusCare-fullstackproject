import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-page">
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="dashboard-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
