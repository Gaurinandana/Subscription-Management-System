import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';
import { VerificationGuide } from './components/VerificationGuide';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Subscriptions } from './pages/Subscriptions';
import { QuoteBuilder } from './pages/QuoteBuilder';
import { Invoices } from './pages/Invoices';
import { ProductsPlans } from './pages/ProductsPlans';
import { DiscountsTaxes } from './pages/DiscountsTaxes';
import { StaffManagement } from './pages/StaffManagement';
import { CustomerPortal } from './pages/CustomerPortal';

export const App: React.FC = () => {
  const { currentUser } = useApp();

  // Active view tab
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVerificationGuideOpen, setIsVerificationGuideOpen] = useState(false);

  // Enforce customer landing view (Scene 1)
  useEffect(() => {
    if (currentUser.role === 'customer') {
      setCurrentTab('portal');
    } else if (currentTab === 'portal') {
      setCurrentTab('dashboard');
    }
  }, [currentUser.role]);

  const renderActivePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'subscriptions':
        return <Subscriptions onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'quotes':
        return <QuoteBuilder onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'invoices':
        return <Invoices />;
      case 'products':
        return <ProductsPlans />;
      case 'discounts':
        return <DiscountsTaxes />;
      case 'staff':
        return <StaffManagement />;
      case 'portal':
        return <CustomerPortal />;
      default:
        return <Dashboard onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenVerificationGuide={() => setIsVerificationGuideOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Workspace (Sidebar + Dynamic Page) */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onOpenVerificationGuide={() => setIsVerificationGuideOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Toast Notifications Alert System */}
      <ToastContainer />

      {/* Scene 1 Customer Registration & Password Security Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signup"
      />

      {/* Verification & Learning Walkthrough Drawer */}
      <VerificationGuide
        isOpen={isVerificationGuideOpen}
        onClose={() => setIsVerificationGuideOpen(false)}
        onNavigate={(tab) => setCurrentTab(tab)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
    </div>
  );
};

export default App;
