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
      label: 'Financial Health',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      badge: 'Scene 7',
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: <Repeat className="w-4 h-4 shrink-0" />,
      badge: 'Scene 3',
    },
    {
      id: 'quotes',
      label: 'Quote Builder',
      icon: <FileSpreadsheet className="w-4 h-4 shrink-0" />,
      badge: 'Scene 3',
    },
    {
      id: 'invoices',
      label: 'Billing & Invoices',
      icon: <Receipt className="w-4 h-4 shrink-0" />,
      badge: 'Scene 4 & 6',
    },
    {
      id: 'products',
      label: 'Products & Plans',
      icon: <Package className="w-4 h-4 shrink-0" />,
      badge: 'Scene 2',
    },
    ...(isAdmin
      ? [
          {
            id: 'discounts',
            label: 'Discounts & Taxes',
            icon: <Percent className="w-4 h-4 shrink-0" />,
            badge: 'Scene 5',
          },
          {
            id: 'staff',
            label: 'Staff Directory',
            icon: <Users className="w-4 h-4 shrink-0" />,
            badge: 'Scene 1',
          },
        ]
      : []),
    {
      id: 'portal',
      label: 'Customer Portal',
      icon: <Compass className="w-4 h-4 shrink-0" />,
      badge: 'Preview',
    },
  ];

  const customerNav = [
    {
      id: 'portal',
      label: 'My Subscriptions',
      icon: <Compass className="w-4 h-4 shrink-0" />,
      badge: 'Portal',
    },
  ];

  const navItems = isCustomer ? customerNav : internalNav;

  return (
    <aside className="w-64 xl:w-72 border-r border-[#ececec] bg-[#fafafb] flex flex-col shrink-0 min-h-[calc(100vh-65px)]">
      <div className="p-4 flex-1 space-y-6">
        <div>
          <div className="px-3 mb-2 font-mono text-[10px] uppercase tracking-wider text-[#979799]">
            {isCustomer ? 'Customer Portal' : 'Business Operations'}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-full text-xs transition ${
                    active
                      ? 'bg-[#17191c] text-[#ffffff] font-medium'
                      : 'text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] font-normal'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={active ? 'text-[#ffffff]' : 'text-[#777b86]'}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono shrink-0 px-2 py-0.5 rounded-full ml-1.5 ${
                        active
                          ? 'bg-[#ffffff]/20 text-[#ffffff]'
                          : 'text-[#979799]'
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

        {/* Neutral card for RBAC simulation status */}
        <div className="p-4 bg-[#f2f2f3] rounded-[24px] space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-[#17191c]">
            <Sparkles className="w-3.5 h-3.5 text-[#17191c]" />
            <span>Brightloop System</span>
          </div>
          <p className="text-[12px] text-[#777b86] leading-relaxed">
            Logged in as{' '}
            <strong className="text-[#17191c] font-medium uppercase">{currentUser.role}</strong>.
            {currentUser.role === 'admin' && ' Full privileges for products, plans, discount rules, and staff.'}
            {currentUser.role === 'staff' && ' Access to quote building, batch billing day, and payment recording.'}
            {currentUser.role === 'customer' && ' Self-service portal scoped to your active subscriptions and invoices.'}
          </p>
          <button
            onClick={onOpenVerificationGuide}
            className="w-full mt-2 py-1.5 border border-[#17191c] rounded-full text-[11px] font-medium text-[#17191c] hover:bg-[#ffffff] transition flex items-center justify-center gap-1.5"
          >
            <span>Open PDF Checklist</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-[#ececec] text-center text-[11px] text-[#979799]">
        Brightloop Software • Odoo Challenge
      </div>
    </aside>
  );
};
