import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Invoice, InvoiceStatus, PaymentMethod } from '../types';
import {
  Receipt,
  Zap,
  Search,
  Eye,
  Send,
  Printer,
  XCircle,
  CreditCard,
  CheckCircle2,
  Sparkles,
  X,
  DollarSign,
} from 'lucide-react';

export const Invoices: React.FC = () => {
  const {
    invoices,
    runBillingDay,
    updateInvoiceStatus,
    sendInvoice,
    cancelInvoice,
    recordPayment,
    addToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);

  // Payment form state (Scene 6)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.subscriptionNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openPaymentModal = (inv: Invoice) => {
    setPaymentModalInvoice(inv);
    setPaymentAmount(inv.total - inv.amountPaid);
    setPaymentNote(`Settlement for ${inv.number}`);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;

    if (paymentAmount <= 0) {
      addToast('error', 'Invalid Amount', 'Payment amount must be greater than zero.');
      return;
    }

    recordPayment({
      invoiceId: paymentModalInvoice.id,
      invoiceNumber: paymentModalInvoice.number,
      customerId: paymentModalInvoice.customerId,
      customerName: paymentModalInvoice.customerName,
      amount: paymentAmount,
      method: paymentMethod,
      date: paymentDate,
      note: paymentNote,
    });

    setPaymentModalInvoice(null);
  };

  const getStatusBadge = (inv: Invoice) => {
    const isOverdue = inv.status === 'Confirmed' && inv.dueDate < todayStr && inv.amountPaid < inv.total;

    if (isOverdue) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800/60">
          Overdue
        </span>
      );
    }

    const styles: Record<InvoiceStatus, string> = {
      Draft: 'bg-slate-800 text-slate-300 border-slate-700',
      Confirmed: 'bg-blue-950 text-blue-300 border-blue-800/60',
      Paid: 'bg-emerald-950 text-emerald-300 border-emerald-800/60',
      Cancelled: 'bg-rose-950 text-rose-300 border-rose-800/60',
    };

    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
          styles[inv.status] || 'bg-slate-800 text-slate-300'
        }`}
      >
        {inv.status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-100">
      {/* Top Banner & 1-Click Billing Day Engine */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Scene 4: Billing Day & Automated Recurring Invoicing</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Recurring Invoicing & Billing Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Automatically generate invoices for due subscriptions with customer details,
            product lines, taxes and discounts. Move invoices from Draft &rarr; Confirmed &rarr; Paid.
          </p>
        </div>

        <button
          onClick={() => runBillingDay()}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/30 shrink-0"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Run Billing Day Batch</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['All', 'Draft', 'Confirmed', 'Paid', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition shrink-0 ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search invoice #, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Invoice #</th>
                <th className="px-4 py-3.5">Subscription</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Billing Date</th>
                <th className="px-4 py-3.5">Due Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Total Amount</th>
                <th className="px-4 py-3.5 text-right">Paid</th>
                <th className="px-4 py-3.5 text-center">Invoice Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                    No invoices matching filter. Click "Run Billing Day Batch" to generate invoices from active subscriptions.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3.5 font-bold text-white">{inv.number}</td>
                    <td className="px-4 py-3.5 font-mono text-purple-400 font-semibold">
                      {inv.subscriptionNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-200">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-400">{inv.customerEmail}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-400">{inv.billingDate}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-400">{inv.dueDate}</td>
                    <td className="px-4 py-3.5">{getStatusBadge(inv)}</td>
                    <td className="px-4 py-3.5 font-bold text-white font-mono text-right">
                      ${inv.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-300 text-right">
                      ${inv.amountPaid.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View / Print */}
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-lg transition"
                          title="View / Print Invoice layout"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Confirm action for Draft */}
                        {inv.status === 'Draft' && (
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'Confirmed')}
                            className="px-2.5 py-1 bg-blue-950/60 hover:bg-blue-900 border border-blue-800/60 text-blue-300 font-bold rounded-lg text-[11px] transition flex items-center gap-1"
                            title="Confirm invoice"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Confirm</span>
                          </button>
                        )}

                        {/* Send action */}
                        {inv.status === 'Confirmed' && (
                          <button
                            onClick={() => sendInvoice(inv.id)}
                            className="p-1.5 text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                            title="Send invoice email to customer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Record Payment action (Scene 6) */}
                        {(inv.status === 'Confirmed' || inv.status === 'Draft') && inv.amountPaid < inv.total && (
                          <button
                            onClick={() => openPaymentModal(inv)}
                            className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 font-bold rounded-lg text-[11px] transition flex items-center gap-1"
                            title="Record incoming payment"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Pay</span>
                          </button>
                        )}

                        {/* Cancel */}
                        {inv.status !== 'Paid' && inv.status !== 'Cancelled' && (
                          <button
                            onClick={() => cancelInvoice(inv.id)}
                            className="p-1.5 text-rose-400 hover:bg-slate-800 rounded-lg transition"
                            title="Cancel invoice"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal (Scene 6) */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-800 overflow-hidden text-slate-100">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Record Payment for {paymentModalInvoice.number}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Customer: {paymentModalInvoice.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalInvoice(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Method (Scene 6)
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full text-xs rounded-xl border border-slate-700 px-3 py-2 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer / Wire</option>
                  <option value="Stripe">Stripe Online Portal</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount Received ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-2 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Remaining balance owed: ${(paymentModalInvoice.total - paymentModalInvoice.amountPaid).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Transaction Notes / Bank Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wire confirmation ref #829103"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
                >
                  Confirm & Apply Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable / Clean View Invoice Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-800 overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-sm text-white">
                  Invoice Preview: {viewingInvoice.number}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 bg-slate-900">
              {/* Invoice Layout Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">BRIGHTLOOP</h2>
                  <p className="text-xs text-slate-400">Subscription Platform & Recurring Billing</p>
                  <p className="text-xs text-slate-400">100 Tech Promenade, Suite 600, SF, CA</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-white">{viewingInvoice.number}</div>
                  <div className="text-xs text-slate-400">Ref: {viewingInvoice.subscriptionNumber}</div>
                  <div className="mt-1">{getStatusBadge(viewingInvoice)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800 text-xs">
                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To</div>
                  <div className="font-bold text-white">{viewingInvoice.customerName}</div>
                  <div className="text-slate-400">{viewingInvoice.customerEmail}</div>
                </div>
                <div className="text-right space-y-1">
                  <div>
                    <span className="text-slate-400">Invoice Date:</span>{' '}
                    <strong className="text-white">{viewingInvoice.billingDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Payment Due:</span>{' '}
                    <strong className="text-white">{viewingInvoice.dueDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Terms:</span>{' '}
                    <strong className="text-white">{viewingInvoice.paymentTerms}</strong>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2.5">Item Description</th>
                      <th className="px-3 py-2.5 text-center">Qty</th>
                      <th className="px-3 py-2.5 text-right">Unit Price</th>
                      <th className="px-3 py-2.5 text-right">Tax</th>
                      <th className="px-3 py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {viewingInvoice.lines.map((l) => (
                      <tr key={l.id}>
                        <td className="px-3 py-2.5 font-medium text-slate-200">{l.description}</td>
                        <td className="px-3 py-2.5 text-center text-slate-400">{l.quantity}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-slate-300">
                          ${l.unitPrice.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-slate-400">
                          {l.taxRate}%
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-white font-mono">
                          ${l.lineTotal.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono text-slate-200">${viewingInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  {viewingInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Discount:</span>
                      <span className="font-mono">-${viewingInvoice.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Taxes:</span>
                    <span className="font-mono text-slate-200">${viewingInvoice.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-slate-800" />
                  <div className="flex justify-between text-sm font-extrabold text-white">
                    <span>Total:</span>
                    <span className="font-mono text-purple-400">${viewingInvoice.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-emerald-400">
                    <span>Amount Paid:</span>
                    <span className="font-mono">${viewingInvoice.amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-rose-400">
                    <span>Balance Due:</span>
                    <span className="font-mono">
                      ${(viewingInvoice.total - viewingInvoice.amountPaid).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
