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

  // Scoped strictly to this customer (Scene 1)
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
    <div className="space-y-8 animate-in fade-in duration-300 text-[#17191c]">
      {/* Customer Header Banner — Editorial Style */}
      <div className="bg-[#fafafb] p-6 sm:p-8 rounded-[24px] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.05)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="text-[12px] font-normal text-[#979799] uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#17191c]" />
              <span>Customer Portal • Scene 1 Self-Service</span>
            </div>
            <h1 className="font-serif text-[36px] sm:text-[40px] leading-[1.2] text-[#17191c] font-normal">
              {targetCustomer.company}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#777b86]">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#979799]" />
                Contact: {targetCustomer.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#979799]" />
                {targetCustomer.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 bg-[#ffffff] rounded-[16px] border border-[#ececec] text-center min-w-[120px] shadow-xs">
              <span className="text-[10px] text-[#979799] uppercase font-normal block">
                Active Contracts
              </span>
              <span className="font-serif text-2xl text-[#17191c] font-normal">
                {mySubscriptions.filter((s) => s.status === 'Active').length}
              </span>
            </div>
            <div className="p-4 bg-[#ffffff] rounded-[16px] border border-[#ececec] text-center min-w-[120px] shadow-xs">
              <span className="text-[10px] text-[#979799] uppercase font-normal block">
                Balance Due
              </span>
              <span className="font-serif text-2xl text-[#17191c] font-normal">
                ${totalOutstanding.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#fafafb] rounded-full p-1.5 gap-2 border border-[#ececec] w-fit">
        <button
          onClick={() => setActiveTab('subs')}
          className={`px-5 py-2 text-xs rounded-full transition flex items-center justify-center gap-2 ${
            activeTab === 'subs'
              ? 'bg-[#17191c] text-[#ffffff] font-medium'
              : 'text-[#777b86] hover:text-[#17191c] font-normal'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>My Subscriptions ({mySubscriptions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-5 py-2 text-xs rounded-full transition flex items-center justify-center gap-2 ${
            activeTab === 'invoices'
              ? 'bg-[#17191c] text-[#ffffff] font-medium'
              : 'text-[#777b86] hover:text-[#17191c] font-normal'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Invoices & Receipts ({myInvoices.length})</span>
        </button>
      </div>

      {/* Tab 1: Customer Subscriptions */}
      {activeTab === 'subs' && (
        <div className="space-y-5">
          {mySubscriptions.length === 0 ? (
            <div className="bg-[#ffffff] p-8 rounded-[24px] border border-[#ececec] text-center text-[#a3a6af] text-xs">
              No subscriptions found for your account.
            </div>
          ) : (
            mySubscriptions.map((sub) => {
              const plan = getPlan(sub.planId);
              return (
                <div
                  key={sub.id}
                  className="bg-[#ffffff] p-6 rounded-[24px] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] space-y-4 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f2f2f3] pb-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-serif text-xl text-[#17191c] font-normal">{sub.planName}</h3>
                        <span className="font-mono text-xs text-[#17191c] bg-[#f2f2f3] px-2.5 py-0.5 rounded-full font-medium">
                          {sub.number}
                        </span>
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs ${
                            sub.status === 'Active'
                              ? 'bg-[#17191c] text-[#ffffff]'
                              : sub.status === 'Paused'
                              ? 'bg-[#fbe1d1] text-[#5d2a1a]'
                              : 'bg-[#fafafb] text-[#777b86] border border-[#ececec]'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#777b86] mt-1">
                        Term: {sub.startDate} &rarr; {sub.expiryDate} • Next renewal:{' '}
                        <strong className="text-[#17191c] font-medium">{sub.nextBillingDate}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-serif text-2xl text-[#17191c] font-normal">
                        ${sub.totalAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#979799] block">
                        Recurring ({sub.paymentTerms})
                      </span>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-normal text-[#979799] uppercase tracking-wider">
                      Included Modules & Services
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {sub.lines.map((l) => (
                        <div
                          key={l.id}
                          className="p-3.5 rounded-[14px] bg-[#fafafb] border border-[#ececec] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-medium text-[#17191c]">{l.productName}</span>
                            {l.variantName && (
                              <span className="text-[11px] text-[#777b86] block">
                                {l.variantName}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[#777b86]">Qty: {l.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Self-Service Actions */}
                  <div className="pt-4 border-t border-[#f2f2f3] flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] text-[#777b86] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#17191c]" />
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
                          className="px-4 py-1.5 border border-[#17191c] hover:bg-[#f2f2f3] text-[#17191c] text-xs font-normal rounded-full transition flex items-center gap-1.5"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause Subscription</span>
                        </button>
                      )}

                      {sub.status === 'Paused' && (
                        <button
                          onClick={() => resumeSubscription(sub.id)}
                          className="px-4 py-1.5 bg-[#17191c] hover:bg-black text-[#ffffff] text-xs font-normal rounded-full transition flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 text-[#fbe1d1]" />
                          <span>Resume Subscription</span>
                        </button>
                      )}

                      {plan?.canRenew && (
                        <button
                          onClick={() => renewSubscription(sub.id, 12)}
                          className="px-4 py-1.5 border border-[#17191c] hover:bg-[#f2f2f3] text-[#17191c] text-xs font-normal rounded-full transition flex items-center gap-1.5"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Renew for 1 Year</span>
                        </button>
                      )}

                      {plan?.canCloseEarly && sub.status !== 'Closed' && (
                        <button
                          onClick={() => closeSubscription(sub.id)}
                          className="px-4 py-1.5 text-[#5d2a1a] hover:bg-[#fbe1d1] text-xs font-normal rounded-full transition flex items-center gap-1.5"
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
        <div className="bg-[#ffffff] rounded-[24px] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafafb] text-[#979799] uppercase tracking-wider font-normal border-b border-[#ececec]">
                <tr>
                  <th className="px-6 py-3.5">Invoice #</th>
                  <th className="px-6 py-3.5">Contract Ref</th>
                  <th className="px-6 py-3.5">Billed Date</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5 text-center">Self-Service Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f2f3]">
                {myInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#a3a6af]">
                      No invoices found on record.
                    </td>
                  </tr>
                ) : (
                  myInvoices.map((inv) => {
                    const isOverdue =
                      inv.status === 'Confirmed' && inv.dueDate < todayStr && inv.amountPaid < inv.total;
                    const isUnpaid = inv.status === 'Confirmed' && inv.amountPaid < inv.total;

                    return (
                      <tr key={inv.id} className="hover:bg-[#fafafb] transition">
                        <td className="px-6 py-4 font-medium text-[#17191c]">{inv.number}</td>
                        <td className="px-6 py-4 font-mono text-[#777b86]">{inv.subscriptionNumber}</td>
                        <td className="px-6 py-4 text-[#777b86]">{inv.billingDate}</td>
                        <td className="px-6 py-4 text-[#777b86]">{inv.dueDate}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-0.5 rounded-full text-xs font-normal ${
                              inv.status === 'Paid'
                                ? 'bg-[#17191c] text-[#ffffff]'
                                : isOverdue
                                ? 'bg-[#fbe1d1] text-[#5d2a1a] border border-[#5d2a1a]/20'
                                : 'bg-[#f2f2f3] text-[#17191c]'
                            }`}
                          >
                            {isOverdue ? 'Payment Overdue' : inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-[#17191c] text-right font-mono">
                          ${inv.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Pay Now Button */}
                            {isUnpaid && (
                              <button
                                onClick={() => setPaymentModalInvoice(inv)}
                                className="px-4 py-1.5 bg-[#17191c] hover:bg-black text-[#ffffff] font-medium text-xs rounded-full transition flex items-center gap-1.5 shadow-xs"
                              >
                                <CreditCard className="w-3.5 h-3.5 text-[#fbe1d1]" />
                                <span>Pay Now</span>
                              </button>
                            )}

                            {/* View / Print Receipt */}
                            <button
                              onClick={() => setViewingInvoice(inv)}
                              className="p-1.5 text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] rounded-full transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191c]/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#ffffff] rounded-[24px] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] max-w-md w-full border border-[#ececec] overflow-hidden text-[#17191c]">
            <div className="p-6 border-b border-[#ececec] flex items-center justify-between bg-[#fafafb]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#f2f2f3] rounded-full text-[#17191c]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#17191c] font-normal">
                    Settle Invoice {paymentModalInvoice.number}
                  </h3>
                  <p className="text-[11px] text-[#777b86]">Secure 256-bit Encrypted Checkout</p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalInvoice(null)}
                className="p-2 text-[#777b86] hover:text-[#17191c] rounded-full hover:bg-[#f2f2f3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePayInvoice} className="p-6 space-y-4">
              <div className="p-4 bg-[#fafafb] rounded-[16px] border border-[#ececec] flex justify-between items-center text-xs">
                <span className="text-[#777b86]">Total Amount Due:</span>
                <span className="font-mono text-base font-medium text-[#17191c]">
                  ${(paymentModalInvoice.total - paymentModalInvoice.amountPaid).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Credit Card', 'Stripe'] as PaymentMethod[]).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded-full border text-xs font-normal transition flex items-center justify-center gap-2 ${
                        paymentMethod === m
                          ? 'border-[#17191c] bg-[#17191c] text-[#ffffff] font-medium'
                          : 'border-[#ececec] bg-[#fafafb] text-[#777b86] hover:bg-[#f2f2f3]'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{m}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">Card Details</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 font-mono focus:outline-none focus:border-[#17191c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">Expiry</label>
                  <input
                    type="text"
                    defaultValue="08/28"
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 font-mono focus:outline-none focus:border-[#17191c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">CVC / CVV</label>
                  <input
                    type="password"
                    defaultValue="888"
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 font-mono focus:outline-none focus:border-[#17191c]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-4 py-2 text-xs font-normal text-[#777b86] hover:bg-[#f2f2f3] rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#17191c] hover:bg-black text-[#ffffff] font-medium text-xs rounded-full shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191c]/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#ffffff] rounded-[24px] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] max-w-xl w-full border border-[#ececec] overflow-hidden flex flex-col max-h-[85vh] text-[#17191c]">
            <div className="p-5 border-b border-[#ececec] flex items-center justify-between bg-[#fafafb]">
              <span className="font-serif text-lg text-[#17191c] font-normal">
                Official Receipt: {viewingInvoice.number}
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 border border-[#17191c] hover:bg-[#ffffff] text-[#17191c] text-xs font-normal rounded-full flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="p-2 text-[#777b86] hover:text-[#17191c] rounded-full hover:bg-[#f2f2f3]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-xl tracking-tight text-[#17191c] font-normal">Brightloop Software</h3>
                  <p className="text-[#777b86]">Subscription Platform & Services</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-medium text-[#17191c]">{viewingInvoice.number}</div>
                  <div className="text-[#777b86]">Date: {viewingInvoice.billingDate}</div>
                </div>
              </div>

              <div className="border border-[#ececec] rounded-[16px] overflow-hidden mt-4">
                <table className="w-full text-left">
                  <thead className="bg-[#fafafb] text-[#979799] border-b border-[#ececec]">
                    <tr>
                      <th className="p-3">Item</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2f2f3]">
                    {viewingInvoice.lines.map((l) => (
                      <tr key={l.id}>
                        <td className="p-3 font-medium text-[#17191c]">{l.description}</td>
                        <td className="p-3 text-center text-[#777b86]">{l.quantity}</td>
                        <td className="p-3 text-right font-mono text-[#777b86]">${l.unitPrice}</td>
                        <td className="p-3 text-right font-mono font-medium text-[#17191c]">${l.lineTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex justify-end">
                <div className="w-52 space-y-1.5 text-right">
                  <div className="flex justify-between text-[#777b86]">
                    <span>Tax:</span>
                    <span className="font-mono text-[#17191c]">${viewingInvoice.taxAmount}</span>
                  </div>
                  <div className="flex justify-between font-medium text-sm text-[#17191c] pt-2 border-t border-[#ececec]">
                    <span>Paid Total:</span>
                    <span className="font-mono font-medium">${viewingInvoice.total}</span>
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
