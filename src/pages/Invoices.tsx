import React, { useState } from 'react';
import { 
  Receipt, Search, Zap, Send, CreditCard, 
  CheckCircle2, Clock, DollarSign, X, ArrowUpRight 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Invoices: React.FC = () => {
  const { 
    invoices, 
    payments, 
    runBillingDay, 
    sendInvoice, 
    recordPayment, 
    addToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Quick Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
 const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card');

  const today = new Date().toISOString().split('T')[0];

  const totalBilled = invoices.reduce((sum: number, i: any) => sum + Number(i.total || 0), 0);
  const totalPaid = invoices.reduce((sum: number, i: any) => sum + Number(i.amountPaid || 0), 0);
  const outstandingTotal = Math.max(0, totalBilled - totalPaid);

  const filteredInvoices = invoices.filter((inv: any) => {
    const num = (inv.number || '').toLowerCase();
    const cust = (inv.customerName || '').toLowerCase();
    const subNum = (inv.subscriptionNumber || '').toLowerCase();
    const matchesSearch = num.includes(searchQuery.toLowerCase()) || 
                          cust.includes(searchQuery.toLowerCase()) ||
                          subNum.includes(searchQuery.toLowerCase());

    const status = (inv.status || '').toLowerCase();
    const matchesStatus = statusFilter === 'ALL' || status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'confirmed') return 'bg-sky-50 text-sky-700 border-sky-200';
    if (s === 'draft') return 'bg-slate-100 text-slate-700 border-slate-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const openPaymentModal = (inv: any) => {
    setSelectedInvoice(inv);
    const due = Number(inv.total || 0) - Number(inv.amountPaid || 0);
    setPaymentAmount(due > 0 ? due : Number(inv.total || 0));
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || paymentAmount <= 0) return;

    recordPayment({
      invoiceId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.number,
      customerId: selectedInvoice.customerId,
      customerName: selectedInvoice.customerName,
      amount: Number(paymentAmount),
      method: paymentMethod as any,
      date: today,
      note: 'Settled via Billing Operations Portal',
      transactionRef: `tx_${Date.now().toString().slice(-6)}`,
    });
    setSelectedInvoice(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="revops-card rounded-2xl p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white border border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Receipt className="w-3.5 h-3.5 text-indigo-600" />
            <span>Billing Operations</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Recurring Invoicing & Receivables
          </h1>
          <p className="text-sm text-slate-500">
            Automated recurring invoice generation, customer ledger statements, and payment reconciliation.
          </p>
        </div>

        <button
          onClick={() => runBillingDay()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <Zap className="w-4 h-4" />
          <span>Run Billing Day Batch</span>
        </button>
      </div>

      {/* 2. Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="revops-card rounded-xl p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Invoiced</span>
            <Receipt className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
            ${totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{invoices.length} invoices generated</p>
        </div>

        <div className="revops-card rounded-xl p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Collected Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2 font-mono tabular-nums">
            ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{payments.length} settled transactions</p>
        </div>

        <div className="revops-card rounded-xl p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Outstanding Balance</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2 font-mono tabular-nums">
            ${outstandingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Pending payment receipts</p>
        </div>
      </div>

      {/* 3. Invoices Ledger */}
      <div className="revops-card rounded-2xl overflow-hidden bg-white border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice #, customer, or contract..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Invoices</option>
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-6">Invoice #</th>
                <th className="py-3 px-6">Subscription</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Due Date</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Amount Due</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    No invoices match your search.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv: any) => {
                  const due = Number(inv.total || 0) - Number(inv.amountPaid || 0);
                  const isPaid = (inv.status || '').toLowerCase() === 'paid' || due <= 0;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-semibold text-indigo-600 text-xs">
                        {inv.number}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-600">
                        {inv.subscriptionNumber || '—'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900 text-xs">{inv.customerName}</div>
                        <div className="text-[11px] text-slate-400">{inv.customerEmail}</div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-600">
                        {inv.dueDate}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${getStatusBadge(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-900 tabular-nums text-xs">
                        ${due > 0 ? due.toFixed(2) : '0.00'}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">/ ${Number(inv.total || 0).toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          {(inv.status || '').toLowerCase() === 'draft' && (
                            <button
                              onClick={() => sendInvoice(inv.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>Dispatch</span>
                            </button>
                          )}

                          {!isPaid ? (
                            <button
                              onClick={() => openPaymentModal(inv)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Settle</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Settled</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Payment Settlement Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Payment</h3>
                <p className="text-xs text-slate-500 font-mono">Invoice {selectedInvoice.number}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer</label>
                <input
                  type="text"
                  value={selectedInvoice.customerName}
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount to Pay ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Credit Card">Credit Card (Stripe)</option>
                  <option value="Wire Transfer">Wire Transfer</option>
                  <option value="Direct Debit">Direct Debit (ACH)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs cursor-pointer"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;