import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';
import { VerificationGuide } from './components/VerificationGuide';

import { Dashboard } from './pages/Dashboard';
import { Subscriptions } from './pages/Subscriptions';
import { QuoteBuilder } from './pages/QuoteBuilder';
import { Invoices } from './pages/Invoices';
import { ProductsPlans } from './pages/ProductsPlans';
import { DiscountsTaxes } from './pages/DiscountsTaxes';
import { StaffManagement } from './pages/StaffManagement';
import { CustomerPortal } from './pages/CustomerPortal';

export default function App() {
  const { activeTab, setActiveTab } = useApp();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'subscriptions':
        return <Subscriptions onNavigate={setActiveTab} />;
      case 'quotes':
      case 'quote-builder':
        return <QuoteBuilder onNavigate={setActiveTab} />;
      case 'invoices':
        return <Invoices />;
      case 'products':
      case 'products-plans':
        return <ProductsPlans />;
      case 'discounts':
      case 'discounts-taxes':
        return <DiscountsTaxes />;
      case 'staff':
      case 'staff-management':
        return <StaffManagement />;
      case 'portal':
      case 'customer-portal':
        return <CustomerPortal />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar 
        onOpenAuth={() => setIsAuthOpen(true)} 
        onOpenGuide={() => setIsGuideOpen(true)} 
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto px-6 py-7 lg:px-10">
          <div className="w-full max-w-[1600px] mx-auto space-y-7 pb-14">
            {renderActivePage()}
          </div>
        </main>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <VerificationGuide {...({ isOpen: isGuideOpen, onClose: () => setIsGuideOpen(false), onNavigate: setActiveTab, activeTab } as any)} />
      <ToastContainer />
    </div>
  );
}