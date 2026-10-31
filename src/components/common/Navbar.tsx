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
  Compass,
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
      icon: <Shield className="w-4 h-4 text-purple-600" />,
    },
    {
      role: 'staff',
      label: 'Internal Staff (Alex Turner)',
      desc: 'Sales rep, quotation builder, billing day runner, payments',
      icon: <Briefcase className="w-4 h-4 text-blue-600" />,
    },
    {
      role: 'customer',
      label: 'Customer (Sarah Jenkins - Apex)',
      desc: 'Self-service portal, view only own subscriptions and invoices',
      icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                Brightloop<span className="text-purple-600">.</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 uppercase tracking-wide">
                Odoo Challenge
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Unified Subscription Management & Recurring Billing Platform
            </p>
          </div>
        </div>

        {/* Action Controls & Interactive Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Sign up test button for Scene 1 */}
          <button
            onClick={onOpenAuth}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 rounded-xl transition border border-slate-200/60"
            title="Test Scene 1: Sign Up with strict password rules"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up (Scene 1)</span>
          </button>

          {/* Interactive Verification Walkthrough Guide */}
          <button
            onClick={onOpenVerificationGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-xl transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
            <span className="font-bold">Verify PDF Scenes</span>
          </button>

          {/* Reset Demo Data button */}
          <button
            onClick={resetToDemoData}
            title="Reset data to initial state"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-slate-200" />

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition text-left"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-purple-600/30"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                      currentUser.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : currentUser.role === 'staff'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
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
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-40 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Role (RBAC Simulation)
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
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
                            ? 'bg-purple-50 text-purple-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="p-1 bg-white rounded-lg shadow-2xs border border-slate-100 shrink-0 mt-0.5">
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
