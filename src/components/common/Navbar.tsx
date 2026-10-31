import React from 'react';
import { Layers, UserPlus, RefreshCw, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenGuide }) => {
  const { currentUser, refreshData, isLoading } = useApp();

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight text-base">Brightloop</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Billing OS
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Subscription Management & Automated Invoicing
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => refreshData()}
          disabled={isLoading}
          title="Refresh Data"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
        </button>

        <button
          onClick={onOpenAuth}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-slate-500" />
          <span>New Account</span>
        </button>

        <button
          onClick={onOpenGuide}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
        >
          <span>Feature Guide</span>
        </button>

        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {currentUser?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              {currentUser?.full_name || 'Administrator'}
            </div>
            <div className="text-[10px] font-medium text-slate-400 capitalize">
              {currentUser?.role || 'Admin'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};