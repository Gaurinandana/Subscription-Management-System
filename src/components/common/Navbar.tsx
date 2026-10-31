import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Layers,
  Shield,
  Briefcase,
  UserCheck,
  ChevronDown,
  Sparkles,
  RefreshCw,
  UserPlus,
} from 'lucide-react';

interface NavbarProps {
  onOpenVerificationGuide: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenVerificationGuide, onOpenAuth }) => {
  const { currentUser, switchRole, resetToDemoData } = useApp();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      role: 'admin',
      label: 'Admin (Elena Vance)',
      desc: 'Full system control, staff management, product & plan launching',
      icon: <Shield className="w-4 h-4 text-purple-400" />,
    },
    {
      role: 'staff',
      label: 'Internal Staff (Alex Turner)',
      desc: 'Sales rep, quotation builder, billing day runner, payments',
      icon: <Briefcase className="w-4 h-4 text-blue-400" />,
    },
    {
      role: 'customer',
      label: 'Customer (Sarah Jenkins - Apex)',
      desc: 'Self-service portal, view only own subscriptions and invoices',
      icon: <UserCheck className="w-4 h-4 text-emerald-400" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white tracking-tight text-base sm:text-lg">
                Brightloop<span className="text-purple-400">.</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60 uppercase tracking-wide">
                Odoo Challenge
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Unified Subscription Management & Recurring Billing Platform
            </p>
          </div>
        </div>

        {/* Action Controls & Interactive Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Sign up test button for Scene 1 */}
          <button
            onClick={onOpenAuth}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700/80"
            title="Test Scene 1: Sign Up with strict password rules"
          >
            <UserPlus className="w-3.5 h-3.5 text-purple-400" />
            <span>Sign Up (Scene 1)</span>
          </button>

          {/* Interactive Verification Walkthrough Guide */}
          <button
            onClick={onOpenVerificationGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-300 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/80 rounded-xl transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="font-bold">Verify PDF Scenes</span>
          </button>

          {/* Reset Demo Data button */}
          <button
            onClick={resetToDemoData}
            title="Reset data to initial state"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-slate-800" />

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-800 transition text-left"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-purple-500/40"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                      currentUser.role === 'admin'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                        : currentUser.role === 'staff'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">{currentUser.department || 'Account'}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 z-40 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Role (RBAC Simulation)
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Change perspective to test admin vs staff vs customer experience.
                    </p>
                  </div>

                  <div className="p-1 space-y-1">
                    {roles.map((item) => (
                      <button
                        key={item.role}
                        onClick={() => {
                          switchRole(item.role);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition ${
                          currentUser.role === item.role
                            ? 'bg-purple-950/70 border border-purple-800/60 text-purple-200 font-semibold'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="p-1 bg-slate-800 rounded-lg border border-slate-700 shrink-0 mt-0.5">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold leading-tight flex items-center justify-between">
                            <span>{item.label}</span>
                            {currentUser.role === item.role && (
                              <span className="text-[10px] bg-purple-600 text-white px-1.5 rounded-full font-bold">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
