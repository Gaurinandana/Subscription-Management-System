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
    <header className="sticky top-0 z-40 bg-[#ffffff]/90 backdrop-blur-md border-b border-[#ececec] px-4 sm:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4 max-w-[1400px] mx-auto">
        {/* Brand identity — Serif display with editorial quiet elegance */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#17191c] flex items-center justify-center text-[#ffffff]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="font-serif text-xl tracking-tight text-[#17191c]">
                Brightloop
              </span>
              <span className="text-[12px] text-[#979799] tracking-wider uppercase font-normal hidden sm:inline-block">
                Odoo Challenge
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Steep Pill Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Sign up test button (Ghost Pill) */}
          <button
            onClick={onOpenAuth}
            className="hidden md:flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-[#17191c] border border-[#17191c] hover:bg-[#f2f2f3] rounded-full transition"
            title="Test Scene 1: Sign Up with strict password rules"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#17191c]" />
            <span>Sign Up (Scene 1)</span>
          </button>

          {/* Verification Walkthrough Guide (Filled Lozenge Pill) */}
          <button
            onClick={onOpenVerificationGuide}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-[#ffffff] bg-[#17191c] hover:bg-black rounded-full transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#fbe1d1]" />
            <span>Verify PDF Scenes</span>
          </button>

          {/* Reset Demo Data button */}
          <button
            onClick={resetToDemoData}
            title="Reset data to initial state"
            className="p-2 text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] rounded-full transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-[#ececec]" />

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[#ececec] bg-[#ffffff] hover:bg-[#f2f2f3] transition text-left shadow-xs"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-[#17191c]/10"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-medium text-[#17191c] flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      currentUser.role === 'admin'
                        ? 'bg-[#17191c] text-[#ffffff]'
                        : currentUser.role === 'staff'
                        ? 'bg-[#f2f2f3] text-[#17191c]'
                        : 'bg-[#fbe1d1] text-[#5d2a1a]'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#777b86]" />
            </button>

            {roleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-[#ffffff] rounded-[24px] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.08),0_8px_10px_-6px_rgba(0,0,0,0.06)] border border-[#ececec] p-2.5 z-40">
                  <div className="px-3 py-2 border-b border-[#f2f2f3]">
                    <p className="text-[11px] font-medium text-[#979799] uppercase tracking-wider">
                      Role-Based Access
                    </p>
                    <p className="text-xs text-[#777b86] mt-0.5">
                      Switch perspective to test Admin, Staff, or Customer view.
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
                        className={`w-full flex items-start gap-2.5 p-2 rounded-[16px] text-left transition ${
                          currentUser.role === item.role
                            ? 'bg-[#f2f2f3] text-[#17191c] font-medium'
                            : 'hover:bg-[#fafafb] text-[#777b86]'
                        }`}
                      >
                        <div className="p-1.5 bg-[#ffffff] rounded-full border border-[#ececec] shrink-0 mt-0.5">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-[#17191c] leading-tight flex items-center justify-between">
                            <span>{item.label}</span>
                            {currentUser.role === item.role && (
                              <span className="text-[10px] bg-[#17191c] text-[#ffffff] px-2 py-0.5 rounded-full font-medium">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#777b86] leading-snug mt-0.5 line-clamp-2">
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
