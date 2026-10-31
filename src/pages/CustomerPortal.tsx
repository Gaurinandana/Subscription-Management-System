import React, { useState } from 'react';
import { 
  UserCheck, Repeat, Receipt, CreditCard, 
  CheckCircle2, Clock, ShieldCheck, Download 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CustomerPortal: React.FC = () => {
  const { subscriptions, invoices, payments, recordPayment, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'subs' | 'invoices'>('subs');

  const mySub = subscriptions[0];
  const myInvoices = invoices.filter(i => i.subscriptionId === mySub?.id || i.customerId === mySub?.customerId);

  const unpaidInvoices = myInvoices.filter(i => (i.status || '').toLowerCase() !== 'paid');
  const balanceDue = unpaidInvoices.reduce((sum, i) => sum + (Number(i.total || 0) - Number(i.amountPaid || 0)), 0);

  const handlePayInvoice = (inv: any) => {
    const due = Number(inv.total || 0) - Number(inv.amountPaid || 0);
    recordPayment({
      invoiceId: inv.id,
      invoiceNumber: inv.number,
      customerId: inv.customerId,
      customerName: inv.customerName,
      amount: due,
      method: 'Credit Card',
      date: new Date().toISOString().split('T')[0],
      note: 'Customer Portal Instant Settlement',
      transactionRef: `tx_${Date.now().toString().slice(-6)}`,
    });
    addToast(`Payment of $${due.toFixed(2)} completed successfully!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="revops-card rounded-2xl p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white border border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Customer Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {mySub?.customerName || 'Acme Corp'}
          </h1>
          <p className="text-sm text-slate-500">
            Self-service contract overview, payment history, and one-click settlements.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Balance Due</span>
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              ${balanceDue.toFixed(2)}
            </span>
          </div>
          <div className="h-9 w-[1px] bg-slate-200" />
          <div className="text-right">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Active Contracts</span>
            <span className="text-2xl font-bold text-indigo-600 tabular-nums">
              {subscriptions.filter(s => s.status === 'Active').length}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tab Switcher */}
      <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveTab('subs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'subs'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>My Subscriptions ({subscriptions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'invoices'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Invoices & Statements ({myInvoices.length})</span>
        </button>
      </div>

      {/* 3. Main Content Card */}
      {activeTab === 'subs' ? (
        <div className="revops-card rounded-2xl overflow-hidden bg-white border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">Active Service Contracts</h2>
            <p className="text-xs text-slate-500">Live recurring subscriptions managed under your profile</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Contract Ref</th>
                  <th className="py-3 px-6">Plan</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Next Billing</th>
                  <th className="py-3 px-6 text-right">Recurring Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70">
                    <td className="py-4 px-6 font-mono font-bold text-indigo-600">{sub.number}</td>
                    <td className="py-4 px-6 font-medium text-slate-900">{sub.planName}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">{sub.nextBillingDate}</td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${sub.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="revops-card rounded-2xl overflow-hidden bg-white border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">Billing History & Invoices</h2>
            <p className="text-xs text-slate-500">View and settle statements generated for your accounts</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Invoice #</th>
                  <th className="py-3 px-6">Due Date</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Total</th>
                  <th className="py-3 px-6 text-right">Amount Due</th>
                  <th className="py-3 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {myInvoices.map((inv) => {
                  const due = Number(inv.total || 0) - Number(inv.amountPaid || 0);
                  const isPaid = (inv.status || '').toLowerCase() === 'paid' || due <= 0;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70">
                      <td className="py-4 px-6 font-mono font-bold text-indigo-600">{inv.number}</td>
                      <td className="py-4 px-6 font-mono text-slate-600">{inv.dueDate}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isPaid 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-slate-700 tabular-nums">
                        ${Number(inv.total || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ${due.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {!isPaid ? (
                          <button
                            onClick={() => handlePayInvoice(inv)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Now</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;