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
        <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-[#fbe1d1] text-[#5d2a1a] border border-[#5d2a1a]/20">
          Overdue
        </span>
      );
    }

    const styles: Record<InvoiceStatus, string> = {
      Draft: 'bg-[#fafafb] text-[#777b86] border border-[#ececec]',
      Confirmed: 'bg-[#f2f2f3] text-[#17191c] border border-[#ececec]',
      Paid: 'bg-[#17191c] text-[#ffffff]',
      Cancelled: 'bg-[#fafafb] text-[#979799] border border-[#ececec]',
    };

    return (
      <span
        className={`px-3 py-0.5 rounded-full text-xs font-normal ${
          styles[inv.status] || 'bg-[#f2f2f3] text-[#777b86]'
        }`}
      >
        {inv.status}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-[#17191c]">
      {/* Top Banner & 1-Click Billing Day Engine — Editorial Serif Display */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#ececec]">
        <div>
          <div className="text-[12px] font-normal uppercase tracking-wider text-[#979799] mb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#17191c]" />
            <span>Scene 4 • Billing Day & Automated Invoicing</span>
          </div>
          <h1 className="font-serif text-[40px] md:text-[44px] leading-[1.2] tracking-[-0.66px] text-[#17191c] font-normal">
            Recurring Invoicing <span className="italic">& Receivables Ledger</span>
          </h1>
          <p className="text-sm text-[#777b86] mt-2 max-w-xl font-normal leading-relaxed">
            Automatically generate prefilled invoices for due subscriptions with customer details,
            product lines, taxes and discounts. Track progression from Draft &rarr; Confirmed &rarr; Paid.
          </p>
        </div>

        <button
          onClick={() => runBillingDay()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#17191c] hover:bg-black text-[#ffffff] rounded-full text-xs font-medium transition shadow-xs shrink-0 self-start md:self-auto"
        >
          <Zap className="w-3.5 h-3.5 text-[#fbe1d1]" />
          <span>Run Billing Day Batch</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#ffffff] p-5 rounded-[24px] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['All', 'Draft', 'Confirmed', 'Paid', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-1.5 text-xs rounded-full transition shrink-0 ${
                  statusFilter === st
                    ? 'bg-[#17191c] text-[#ffffff] font-medium'
                    : 'text-[#777b86] hover:bg-[#f2f2f3] hover:text-[#17191c] font-normal'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#979799] absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search invoice #, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] placeholder-[#a3a6af] focus:outline-none focus:border-[#17191c]"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto rounded-[16px] border border-[#ececec]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafafb] text-[#979799] uppercase tracking-wider font-normal border-b border-[#ececec]">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-5 py-3.5">Subscription</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Billing Date</th>
                <th className="px-5 py-3.5">Due Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Total Amount</th>
                <th className="px-5 py-3.5 text-right">Paid</th>
                <th className="px-5 py-3.5 text-center">Invoice Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f2f3]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-[#a3a6af]">
                    No invoices matching filter. Click "Run Billing Day Batch" to generate invoices from active subscriptions.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#fafafb] transition">
                    <td className="px-5 py-4 font-medium text-[#17191c]">{inv.number}</td>
                    <td className="px-5 py-4 font-mono text-[#777b86]">
                      {inv.subscriptionNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-[#17191c]">{inv.customerName}</div>
                      <div className="text-[11px] text-[#777b86]">{inv.customerEmail}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-[#777b86] text-[11px]">{inv.billingDate}</td>
                    <td className="px-5 py-4 font-mono text-[#777b86] text-[11px]">{inv.dueDate}</td>
                    <td className="px-5 py-4">{getStatusBadge(inv)}</td>
                    <td className="px-5 py-4 font-medium text-[#17191c] font-mono text-right">
                      ${inv.total.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-mono text-[#777b86] text-right">
                      ${inv.amountPaid.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* View / Print */}
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          className="p-1.5 text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] rounded-full transition"
                          title="View / Print Invoice layout"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Confirm action for Draft */}
                        {inv.status === 'Draft' && (
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'Confirmed')}
                            className="px-3 py-1 border border-[#17191c] text-[#17191c] hover:bg-[#f2f2f3] rounded-full text-[11px] font-normal transition flex items-center gap-1"
                            title="Confirm invoice"
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#17191c]" />
                            <span>Confirm</span>
                          </button>
                        )}

                        {/* Send action */}
                        {inv.status === 'Confirmed' && (
                          <button
                            onClick={() => sendInvoice(inv.id)}
                            className="p-1.5 text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] rounded-full transition"
                            title="Send invoice email to customer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Record Payment action (Scene 6) */}
                        {(inv.status === 'Confirmed' || inv.status === 'Draft') && inv.amountPaid < inv.total && (
                          <button
                            onClick={() => openPaymentModal(inv)}
                            className="px-3 py-1 bg-[#17191c] text-[#ffffff] hover:bg-black rounded-full text-[11px] font-normal transition flex items-center gap-1"
                            title="Record incoming payment"
                          >
                            <DollarSign className="w-3 h-3 text-[#fbe1d1]" />
                            <span>Pay</span>
                          </button>
                        )}

                        {/* Cancel */}
                        {inv.status !== 'Paid' && inv.status !== 'Cancelled' && (
                          <button
                            onClick={() => cancelInvoice(inv.id)}
                            className="p-1.5 text-[#777b86] hover:text-[#5d2a1a] hover:bg-[#fbe1d1] rounded-full transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191c]/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#ffffff] rounded-[24px] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] max-w-md w-full border border-[#ececec] overflow-hidden text-[#17191c]">
            <div className="p-6 border-b border-[#ececec] flex items-center justify-between bg-[#fafafb]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#f2f2f3] rounded-full text-[#17191c]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#17191c] font-normal">
                    Record Payment
                  </h3>
                  <p className="text-xs text-[#777b86]">
                    Invoice {paymentModalInvoice.number} • {paymentModalInvoice.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalInvoice(null)}
                className="p-2 text-[#777b86] hover:text-[#17191c] rounded-full hover:bg-[#f2f2f3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">
                  Payment Method (Scene 6)
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full text-xs rounded-full border border-[#ececec] px-4 py-2 bg-[#fafafb] text-[#17191c] focus:outline-none focus:border-[#17191c]"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer / Wire</option>
                  <option value="Stripe">Stripe Online Portal</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">
                  Amount Received ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 font-mono font-medium focus:outline-none focus:border-[#17191c]"
                />
                <span className="text-[11px] text-[#777b86] mt-1.5 block">
                  Remaining balance: ${(paymentModalInvoice.total - paymentModalInvoice.amountPaid).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">Payment Date</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">
                  Transaction Notes / Bank Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wire confirmation ref #829103"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-4 py-2 text-xs font-normal text-[#777b86] hover:bg-[#f2f2f3] rounded-full transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#17191c] hover:bg-black text-[#ffffff] font-medium text-xs rounded-full transition shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191c]/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#ffffff] rounded-[24px] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] max-w-2xl w-full border border-[#ececec] overflow-hidden flex flex-col max-h-[90vh] text-[#17191c]">
            <div className="p-5 border-b border-[#ececec] flex items-center justify-between bg-[#fafafb]">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#17191c]" />
                <span className="font-serif text-lg text-[#17191c] font-normal">
                  Invoice {viewingInvoice.number}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 border border-[#17191c] hover:bg-[#ffffff] text-[#17191c] text-xs font-normal rounded-full flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="p-2 text-[#777b86] hover:text-[#17191c] rounded-full hover:bg-[#f2f2f3]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 bg-[#ffffff]">
              {/* Invoice Layout Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-serif text-2xl tracking-tight text-[#17191c] font-normal">Brightloop Software</h2>
                  <p className="text-xs text-[#777b86] mt-0.5">Subscription Platform & Recurring Billing</p>
                  <p className="text-xs text-[#777b86]">100 Tech Promenade, Suite 600, SF, CA</p>
                </div>
                <div className="text-right">
                  <div className="font-serif text-xl text-[#17191c] font-normal">{viewingInvoice.number}</div>
                  <div className="text-xs text-[#777b86]">Ref: {viewingInvoice.subscriptionNumber}</div>
                  <div className="mt-1.5">{getStatusBadge(viewingInvoice)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-5 border-t border-[#ececec] text-xs">
                <div>
                  <div className="text-[11px] font-normal uppercase tracking-wider text-[#979799] mb-1">Billed To</div>
                  <div className="font-medium text-[#17191c]">{viewingInvoice.customerName}</div>
                  <div className="text-[#777b86]">{viewingInvoice.customerEmail}</div>
                </div>
                <div className="text-right space-y-1 text-[#777b86]">
                  <div>
                    <span>Invoice Date:</span>{' '}
                    <strong className="text-[#17191c] font-medium">{viewingInvoice.billingDate}</strong>
                  </div>
                  <div>
                    <span>Payment Due:</span>{' '}
                    <strong className="text-[#17191c] font-medium">{viewingInvoice.dueDate}</strong>
                  </div>
                  <div>
                    <span>Terms:</span>{' '}
                    <strong className="text-[#17191c] font-medium">{viewingInvoice.paymentTerms}</strong>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-[#ececec] rounded-[16px] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fafafb] text-[#979799] font-normal border-b border-[#ececec]">
                    <tr>
                      <th className="px-4 py-2.5">Item Description</th>
                      <th className="px-4 py-2.5 text-center">Qty</th>
                      <th className="px-4 py-2.5 text-right">Unit Price</th>
                      <th className="px-4 py-2.5 text-right">Tax</th>
                      <th className="px-4 py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2f2f3]">
                    {viewingInvoice.lines.map((l) => (
                      <tr key={l.id}>
                        <td className="px-4 py-3 font-medium text-[#17191c]">{l.description}</td>
                        <td className="px-4 py-3 text-center text-[#777b86]">{l.quantity}</td>
                        <td className="px-4 py-3 text-right font-mono text-[#777b86]">
                          ${l.unitPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[#777b86]">
                          {l.taxRate}%
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-[#17191c] font-mono">
                          ${l.lineTotal.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="flex justify-end">
                <div className="w-72 space-y-2.5 text-xs">
                  <div className="flex justify-between text-[#777b86]">
                    <span>Subtotal:</span>
                    <span className="font-mono text-[#17191c]">${viewingInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  {viewingInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-[#5d2a1a] font-medium">
                      <span>Discount:</span>
                      <span className="font-mono">-${viewingInvoice.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#777b86]">
                    <span>Taxes:</span>
                    <span className="font-mono text-[#17191c]">${viewingInvoice.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-[#ececec]" />
                  <div className="flex justify-between text-base font-normal text-[#17191c]">
                    <span className="font-serif">Total:</span>
                    <span className="font-mono font-medium">${viewingInvoice.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#777b86]">
                    <span>Amount Paid:</span>
                    <span className="font-mono text-[#17191c] font-medium">${viewingInvoice.amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-[#5d2a1a]">
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
