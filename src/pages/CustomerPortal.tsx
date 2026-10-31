import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Invoice, PaymentMethod, Subscription } from '../types';
import {
  Compass,
  Repeat,
  Receipt,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Pause,
  Play,
  RotateCw,
  XCircle,
  Printer,
  Eye,
  Sparkles,
  ShieldCheck,
  Building,
  Mail,
  X,
  DollarSign,
} from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const {
    currentUser,
    customers,
    subscriptions,
    invoices,
    plans,
    pauseSubscription,
    resumeSubscription,
    renewSubscription,
    closeSubscription,
    recordPayment,
    addToast,
  } = useApp();

  // Resolve customer entity
  const targetCustomer =
    customers.find((c) => c.id === currentUser.customerId || c.email === currentUser.email) ||
    customers[0];

  // Scoped strictly to this customer (Scene 1: "customers see only their own subscriptions and invoices")
  const mySubscriptions = subscriptions.filter(
    (s) => s.customerId === targetCustomer.id || s.customerEmail === targetCustomer.email
  );

  const myInvoices = invoices.filter(
    (inv) => inv.customerId === targetCustomer.id || inv.customerEmail === targetCustomer.email
  );

  // States
  const [activeTab, setActiveTab] = useState<'subs' | 'invoices'>('subs');
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Payment form
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');

  const todayStr = new Date().toISOString().split('T')[0];

  const totalMonthlySpend = mySubscriptions
    .filter((s) => s.status === 'Active')
    .reduce((acc, s) => acc + s.totalAmount, 0);

  const totalOutstanding = myInvoices
    .filter((inv) => inv.status === 'Confirmed')
    .reduce((acc, inv) => acc + (inv.total - inv.amountPaid), 0);

  const handlePayInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;

    const amountToPay = paymentModalInvoice.total - paymentModalInvoice.amountPaid;
    recordPayment({
      invoiceId: paymentModalInvoice.id,
      invoiceNumber: paymentModalInvoice.number,
      customerId: targetCustomer.id,
      customerName: targetCustomer.name,
      amount: amountToPay,
      method: paymentMethod,
      date: todayStr,
      note: `Customer self-service portal payment via ${paymentMethod}`,
    });

    setPaymentModalInvoice(null);
  };

  const getPlan = (planId: string) => plans.find((p) => p.id === planId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Customer Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Customer Self-Service Portal (Scene 1)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {targetCustomer.company}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-purple-200">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-purple-400" />
                Contact: {targetCustomer.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                {targetCustomer.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
              <span className="text-[10px] text-purple-200 uppercase font-bold block">
                Active Contracts
              </span>
              <span className="text-xl font-extrabold text-white">
                {mySubscriptions.filter((s) => s.status === 'Active').length}
              </span>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
              <span className="text-[10px] text-purple-200 uppercase font-bold block">
                Balance Due
              </span>
              <span className="text-xl font-extrabold text-white font-mono">
                ${totalOutstanding.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-2 gap-2 border shadow-2xs">
        <button
          onClick={() => setActiveTab('subs')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'subs'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>My Subscriptions ({mySubscriptions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'invoices'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Invoices & Billing History ({myInvoices.length})</span>
        </button>
      </div>

      {/* Tab 1: Customer Subscriptions */}
      {activeTab === 'subs' && (
        <div className="space-y-4">
          {mySubscriptions.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No subscriptions found for your account.
            </div>
          ) : (
            mySubscriptions.map((sub) => {
              const plan = getPlan(sub.planId);
              return (
                <div
                  key={sub.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-purple-200 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-base">{sub.planName}</h3>
                        <span className="font-mono text-xs text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                          {sub.number}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            sub.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.status === 'Paused'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Term: {sub.startDate} &rarr; {sub.expiryDate} • Next renewal:{' '}
                        <strong>{sub.nextBillingDate}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black text-slate-900 font-mono">
                        ${sub.totalAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Recurring ({sub.paymentTerms})
                      </span>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Included Modules & Services
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sub.lines.map((l) => (
                        <div
                          key={l.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{l.productName}</span>
                            {l.variantName && (
                              <span className="text-[10px] text-purple-700 block">
                                {l.variantName}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-slate-600">Qty: {l.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Self-Service Actions (Permitted by plan rules) */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <span>
                        Plan Permissions:{' '}
                        {plan?.canPause ? 'Pause allowed • ' : 'No pausing • '}
                        {plan?.canRenew ? 'Renewal allowed' : 'No renewal'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {sub.status === 'Active' && plan?.canPause && (
                        <button
                          onClick={() => pauseSubscription(sub.id)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause Subscription</span>
                        </button>
                      )}

                      {sub.status === 'Paused' && (
                        <button
                          onClick={() => resumeSubscription(sub.id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Resume Subscription</span>
                        </button>
                      )}

                      {plan?.canRenew && (
                        <button
                          onClick={() => renewSubscription(sub.id, 12)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Renew for 1 Year</span>
                        </button>
                      )}

                      {plan?.canCloseEarly && sub.status !== 'Closed' && (
                        <button
                          onClick={() => closeSubscription(sub.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Plan</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Customer Invoices */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-5 py-3.5">Contract Ref</th>
                  <th className="px-5 py-3.5">Billed Date</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-center">Self-Service Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                      No invoices found on record.
                    </td>
                  </tr>
                ) : (
                  myInvoices.map((inv) => {
                    const isOverdue =
                      inv.status === 'Confirmed' && inv.dueDate < todayStr && inv.amountPaid < inv.total;
                    const isUnpaid = inv.status === 'Confirmed' && inv.amountPaid < inv.total;

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-4 font-bold text-slate-900">{inv.number}</td>
                        <td className="px-5 py-4 font-mono text-purple-700">{inv.subscriptionNumber}</td>
                        <td className="px-5 py-4 text-slate-600">{inv.billingDate}</td>
                        <td className="px-5 py-4 text-slate-600">{inv.dueDate}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : isOverdue
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isOverdue ? 'Payment Overdue' : inv.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900 text-right">
                          ${inv.total.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Pay Now Button */}
                            {isUnpaid && (
                              <button
                                onClick={() => setPaymentModalInvoice(inv)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-2xs"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Pay Now</span>
                              </button>
                            )}

                            {/* View / Print Receipt */}
                            <button
                              onClick={() => setViewingInvoice(inv)}
                              className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                              title="View & Print Official Receipt"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
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
      )}

      {/* Customer Pay Now Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Settle Invoice {paymentModalInvoice.number}
                  </h3>
                  <p className="text-[11px] text-slate-500">Secure 256-bit Encrypted Checkout</p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalInvoice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePayInvoice} className="p-6 space-y-4">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex justify-between items-center text-xs">
                <span className="text-purple-800 font-semibold">Total Amount Due:</span>
                <span className="font-mono text-base font-extrabold text-purple-900">
                  ${(paymentModalInvoice.total - paymentModalInvoice.amountPaid).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Credit Card', 'Stripe'] as PaymentMethod[]).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        paymentMethod === m
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{m}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Card Details</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry</label>
                  <input
                    type="text"
                    defaultValue="08/28"
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CVC / CVV</label>
                  <input
                    type="password"
                    defaultValue="888"
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Authorize & Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Printable View Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-sm text-slate-900">
                Official Receipt: {viewingInvoice.number}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-slate-900">BRIGHTLOOP</h3>
                  <p className="text-slate-500">Subscription Platform & Services</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900">{viewingInvoice.number}</div>
                  <div className="text-slate-400">Date: {viewingInvoice.billingDate}</div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingInvoice.lines.map((l) => (
                      <tr key={l.id}>
                        <td className="p-2.5 font-medium">{l.description}</td>
                        <td className="p-2.5 text-center">{l.quantity}</td>
                        <td className="p-2.5 text-right font-mono">${l.unitPrice}</td>
                        <td className="p-2.5 text-right font-mono font-bold">${l.lineTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex justify-end">
                <div className="w-48 space-y-1 text-right">
                  <div className="flex justify-between text-slate-500">
                    <span>Tax:</span>
                    <span className="font-mono">${viewingInvoice.taxAmount}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                    <span>Paid Total:</span>
                    <span className="font-mono text-purple-700">${viewingInvoice.total}</span>
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
