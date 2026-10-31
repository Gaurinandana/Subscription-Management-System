import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Repeat,
  FileSpreadsheet,
  Receipt,
  Package,
  Percent,
  Users,
  Compass,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenVerificationGuide: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenVerificationGuide,
}) => {
  const { currentUser } = useApp();
  const isAdmin = currentUser.role === 'admin';
  const isStaff = currentUser.role === 'staff';
  const isCustomer = currentUser.role === 'customer';

  // Navigation configurations
  const internalNav = [
    {
      id: 'dashboard',
      label: 'Finance Lead Metrics',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: 'Scene 7',
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions Lifecycle',
      icon: <Repeat className="w-4 h-4" />,
      badge: 'Scene 3',
    },
    {
      id: 'quotes',
      label: 'Quote Builder',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      badge: 'Scene 3',
    },
    {
      id: 'invoices',
      label: 'Billing Day & Invoices',
      icon: <Receipt className="w-4 h-4" />,
      badge: 'Scene 4 & 6',
    },
    {
      id: 'products',
      label: 'Products, Plans & Variants',
      icon: <Package className="w-4 h-4" />,
      badge: 'Scene 2',
    },
    ...(isAdmin
      ? [
          {
            id: 'discounts',
            label: 'Discounts & Taxes',
            icon: <Percent className="w-4 h-4" />,
            badge: 'Scene 4 & 5',
          },
          {
            id: 'staff',
            label: 'Staff Management',
            icon: <Users className="w-4 h-4" />,
            badge: 'Scene 1',
          },
        ]
      : []),
    {
      id: 'portal',
      label: 'Customer Portal (Preview)',
      icon: <Compass className="w-4 h-4" />,
      badge: 'Scene 1',
    },
  ];

  const customerNav = [
    {
      id: 'portal',
      label: 'My Subscriptions & Invoices',
      icon: <Compass className="w-4 h-4" />,
      badge: 'Self-Service',
    },
  ];

  const navItems = isCustomer ? customerNav : internalNav;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white/70 backdrop-blur-md flex flex-col shrink-0 min-h-[calc(100vh-61px)]">
      <div className="p-4 flex-1 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {isCustomer ? 'Customer Access' : 'Business Operations'}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        active
                          ? 'bg-purple-500 text-purple-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick RBAC indicator card */}
        <div className="p-3.5 bg-gradient-to-br from-purple-50 to-indigo-50/60 rounded-2xl border border-purple-100/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Brightloop Software</span>
          </div>
          <p className="text-[11px] text-purple-800/80 leading-relaxed">
            You are logged in as{' '}
            <strong className="text-purple-950 uppercase">{currentUser.role}</strong>.
            {currentUser.role === 'admin' && ' You have full permissions over plans, rules, and staff.'}
            {currentUser.role === 'staff' && ' You can manage quotes, run billing day, and register payments.'}
            {currentUser.role === 'customer' && ' You can self-service manage your subscriptions and invoices.'}
          </p>
          <button
            onClick={onOpenVerificationGuide}
            className="w-full mt-1 py-1.5 bg-white hover:bg-purple-50 border border-purple-200 rounded-xl text-[11px] font-bold text-purple-700 transition flex items-center justify-center gap-1 shadow-2xs"
          >
            <span>Open PDF Checklist</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
        Brightloop v1.0 • Odoo Challenge
      </div>
    </aside>
  );
};
