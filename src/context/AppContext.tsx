import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, Product, Plan, Subscription, Invoice, 
  Payment, DiscountRule, TaxRule, Customer 
} from '../types';

interface AppContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  products: Product[];
  plans: Plan[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  discounts: DiscountRule[];
  taxes: TaxRule[];
  customers: Customer[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  
  // Subscription Lifecycle Actions
  pauseSubscription: (id: string) => boolean;
  resumeSubscription: (id: string) => boolean;
  closeSubscription: (id: string) => boolean;
  renewSubscription: (id: string) => boolean;
  createSubscription: (data: Partial<Subscription>) => void;
  
  // Invoicing & Payment Actions
  runBillingDay: () => void;
  sendInvoice: (id: string) => void;
  recordPayment: (payment: Omit<Payment, 'id'>) => void;
  
  // Product, Plan & Discount Actions
  createProduct: (product: Omit<Product, 'id'>) => void;
  createPlan: (plan: Omit<Plan, 'id'>) => void;
  createDiscount: (discount: Omit<DiscountRule, 'id' | 'timesUsed'>) => void;

  // Alerts
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const initialUsers: User[] = [
  { id: 'usr-1', name: 'Elena Rostova', email: 'admin@brightloop.io', role: 'admin', department: 'Executive Leadership' }
];

const initialProducts: Product[] = [
  { id: 'prod-1', name: 'BrightERP Core', type: 'SaaS', salesPrice: 1200, costPrice: 450, notes: '', variants: [{ id: 'var-odoo', brand: 'Odoo Edition', extraPrice: 560 }] },
  { id: 'prod-2', name: 'Cloud Integration Gateway', type: 'Software', salesPrice: 450, costPrice: 120, notes: '', variants: [] }
];

const initialPlans: Plan[] = [
  { id: 'plan-growth', name: 'Growth Business Tier', cost: 299, billingFrequency: 'monthly', minQuantity: 1, startDate: '2026-01-01', endDate: '2027-12-31', autoCloseOnEnd: false, canCloseEarly: true, canPause: true, canRenew: true },
  { id: 'plan-enterprise', name: 'Enterprise Annual Tier', cost: 2999, billingFrequency: 'yearly', minQuantity: 5, startDate: '2026-01-01', endDate: '2027-12-31', autoCloseOnEnd: true, canCloseEarly: false, canPause: false, canRenew: true }
];

const initialSubscriptions: Subscription[] = [
  {
    id: 'sub-1', number: 'SUB-2026-001', customerId: 'cust-1', customerName: 'Acme Corp', customerEmail: 'billing@acme.com',
    planId: 'plan-growth', planName: 'Growth Business Tier', startDate: '2026-01-01', expiryDate: '2027-01-01', paymentTerms: 'Net 30',
    status: 'Active', lines: [{ id: 'l1', productId: 'prod-1', productName: 'BrightERP Core', variantPrice: 560, quantity: 2, unitPrice: 1760, taxRate: 10, amount: 3520 }],
    subtotal: 3520, taxTotal: 352, discountTotal: 0, totalAmount: 3872, nextBillingDate: '2026-11-15', createdAt: '2026-01-01'
  },
  {
    id: 'sub-2', number: 'SUB-2026-002', customerId: 'cust-2', customerName: 'NovaTech Solutions', customerEmail: 'finance@novatech.io',
    planId: 'plan-enterprise', planName: 'Enterprise Annual Tier', startDate: '2026-02-01', expiryDate: '2027-02-01', paymentTerms: 'Net 30',
    status: 'Active', lines: [{ id: 'l2', productId: 'prod-2', productName: 'Cloud Integration Gateway', variantPrice: 0, quantity: 1, unitPrice: 450, taxRate: 10, amount: 450 }],
    subtotal: 450, taxTotal: 45, discountTotal: 0, totalAmount: 495, nextBillingDate: '2026-11-20', createdAt: '2026-02-01'
  }
];

const initialInvoices: Invoice[] = [
  {
    id: 'inv-1', number: 'INV-2026-001', subscriptionId: 'sub-1', subscriptionNumber: 'SUB-2026-001', customerId: 'cust-1',
    customerName: 'Acme Corp', customerEmail: 'billing@acme.com', billingDate: '2026-10-01', dueDate: '2026-10-15', status: 'Draft',
    lines: [{ id: 'il1', description: 'BrightERP Core', quantity: 2, unitPrice: 1760, taxRate: 10, taxAmount: 352, lineTotal: 3520 }],
    subtotal: 3520, taxAmount: 352, discountAmount: 0, total: 3872, amountPaid: 1000, paymentTerms: 'Net 30'
  }
];

const initialPayments: Payment[] = [
  { id: 'pay-1', invoiceId: 'inv-1', invoiceNumber: 'INV-2026-001', customerId: 'cust-1', customerName: 'Acme Corp', amount: 1000, method: 'Credit Card', date: '2026-10-05', note: 'Deposit', transactionRef: 'txn_123' }
];

const initialDiscounts: DiscountRule[] = [
  { id: 'disc-1', code: 'BRIGHT20', name: 'Launch 20%', type: 'percentage', value: 20, startDate: '2026-01-01', endDate: '2027-01-01', usageLimit: 100, timesUsed: 4, scope: 'whole_subscription', isActive: true }
];

const initialTaxes: TaxRule[] = [
  { id: 'tax-1', name: 'Standard Sales Tax (VAT)', rate: 10.0, description: 'Standard VAT', isDefault: true }
];

const initialCustomers: Customer[] = [
  { id: 'cust-1', name: 'Jane Doe', company: 'Acme Corp', email: 'billing@acme.com', phone: '+1-555-0199', address: '100 Market St, SF', joinedDate: '2026-01-01' },
  { id: 'cust-2', name: 'Alex Chen', company: 'NovaTech Solutions', email: 'finance@novatech.io', phone: '+1-555-0144', address: '500 Tech Blvd, Austin', joinedDate: '2026-02-01' }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [discounts, setDiscounts] = useState<DiscountRule[]>(initialDiscounts);
  const [taxes, setTaxes] = useState<TaxRule[]>(initialTaxes);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const pauseSubscription = (id: string): boolean => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return false;
    const plan = plans.find((p) => p.id === sub.planId);
    if (plan && !plan.canPause) {
      addToast('Plan "' + plan.name + '" does not permit pausing.', 'error');
      return false;
    }
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Paused' } : s))
    );
    addToast('Subscription ' + sub.number + ' paused.', 'info');
    return true;
  };

  const resumeSubscription = (id: string): boolean => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Active' } : s))
    );
    addToast('Subscription resumed to Active status.', 'success');
    return true;
  };

  const closeSubscription = (id: string): boolean => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return false;
    const plan = plans.find((p) => p.id === sub.planId);
    const today = new Date().toISOString().split('T')[0];
    if (plan && !plan.canCloseEarly && sub.expiryDate > today) {
      addToast('Early cancellation is disabled for plan "' + plan.name + '".', 'error');
      return false;
    }
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Closed' } : s))
    );
    addToast('Subscription ' + sub.number + ' closed.', 'info');
    return true;
  };

  const renewSubscription = (id: string): boolean => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return false;
    const plan = plans.find((p) => p.id === sub.planId);
    if (plan && !plan.canRenew) {
      addToast('Renewal is disabled for plan "' + plan.name + '".', 'error');
      return false;
    }
    const currentExp = new Date(sub.expiryDate);
    currentExp.setFullYear(currentExp.getFullYear() + 1);
    const nextExp = currentExp.toISOString().split('T')[0];

    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, expiryDate: nextExp, status: 'Active' } : s))
    );
    addToast('Subscription renewed through ' + nextExp + '.', 'success');
    return true;
  };

  const createSubscription = (data: Partial<Subscription>) => {
    const newSub: Subscription = {
      id: 'sub-' + Date.now(),
      number: 'SUB-2026-' + String(subscriptions.length + 1).padStart(3, '0'),
      customerId: data.customerId || 'cust-1',
      customerName: data.customerName || 'Acme Corp',
      customerEmail: data.customerEmail || 'billing@acme.com',
      planId: data.planId || plans[0]?.id || 'plan-growth',
      planName: data.planName || plans[0]?.name || 'Growth Business Tier',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      expiryDate: data.expiryDate || '2027-10-31',
      paymentTerms: data.paymentTerms || 'Net 30',
      status: data.status || 'Active',
      lines: data.lines || [],
      subtotal: data.subtotal || 0,
      taxTotal: data.taxTotal || 0,
      discountTotal: data.discountTotal || 0,
      totalAmount: data.totalAmount || 0,
      nextBillingDate: data.nextBillingDate || '2026-11-30',
      createdAt: new Date().toISOString().split('T')[0],
      ...data,
    };
    setSubscriptions((prev) => [newSub, ...prev]);
    addToast('Subscription ' + newSub.number + ' created successfully.', 'success');
  };

  const runBillingDay = () => {
    const today = new Date().toISOString().split('T')[0];
    const dueSubs = subscriptions.filter(
      (s) => s.status === 'Active' && s.nextBillingDate <= today
    );

    if (dueSubs.length === 0) {
      const active = subscriptions.find((s) => s.status === 'Active') || subscriptions[0];
      if (active) {
        const simInvoice: Invoice = {
          id: 'inv-' + Date.now(),
          number: 'INV-2026-' + String(invoices.length + 1).padStart(3, '0'),
          subscriptionId: active.id,
          subscriptionNumber: active.number,
          customerId: active.customerId,
          customerName: active.customerName,
          customerEmail: active.customerEmail,
          billingDate: today,
          dueDate: today,
          status: 'Draft',
          lines: active.lines.map((l) => ({
            id: 'line-' + Date.now(),
            description: l.productName,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            taxRate: l.taxRate,
            taxAmount: (l.amount * l.taxRate) / 100,
            lineTotal: l.amount,
          })),
          subtotal: active.subtotal,
          taxAmount: active.taxTotal,
          discountAmount: active.discountTotal,
          total: active.totalAmount,
          amountPaid: 0,
          paymentTerms: active.paymentTerms,
        };
        setInvoices((prev) => [simInvoice, ...prev]);
        addToast('Batch Billing: Generated invoice ' + simInvoice.number + '.', 'success');
        return;
      }
    }

    const newInvoices: Invoice[] = dueSubs.map((sub, idx) => ({
      id: 'inv-' + Date.now() + '-' + idx,
      number: 'INV-2026-' + String(invoices.length + idx + 1).padStart(3, '0'),
      subscriptionId: sub.id,
      subscriptionNumber: sub.number,
      customerId: sub.customerId,
      customerName: sub.customerName,
      customerEmail: sub.customerEmail,
      billingDate: today,
      dueDate: today,
      status: 'Draft',
      lines: sub.lines.map((l) => ({
        id: 'line-' + Date.now(),
        description: l.productName,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxRate: l.taxRate,
        taxAmount: (l.amount * l.taxRate) / 100,
        lineTotal: l.amount,
      })),
      subtotal: sub.subtotal,
      taxAmount: sub.taxTotal,
      discountAmount: sub.discountTotal,
      total: sub.totalAmount,
      amountPaid: 0,
      paymentTerms: sub.paymentTerms,
    }));

    setInvoices((prev) => [...newInvoices, ...prev]);
    addToast('Billing Day Complete: Created ' + newInvoices.length + ' invoices.', 'success');
  };

  const sendInvoice = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: 'Confirmed', sentAt: new Date().toISOString() } : inv
      )
    );
    addToast('Invoice confirmed and dispatched.', 'success');
  };

  const recordPayment = (paymentData: Omit<Payment, 'id'>) => {
    const payment: Payment = {
      id: 'pay-' + Date.now(),
      ...paymentData,
    };
    setPayments((prev) => [payment, ...prev]);
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === payment.invoiceId) {
          const newPaid = inv.amountPaid + payment.amount;
          return {
            ...inv,
            amountPaid: newPaid,
            status: newPaid >= inv.total ? 'Paid' : inv.status,
            paidAt: newPaid >= inv.total ? new Date().toISOString() : inv.paidAt,
          };
        }
        return inv;
      })
    );
    addToast('Payment of $' + payment.amount.toFixed(2) + ' recorded.', 'success');
  };

  const createProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = { id: 'prod-' + Date.now(), ...product };
    setProducts((prev) => [newProduct, ...prev]);
    addToast('Product "' + newProduct.name + '" created.', 'success');
  };

  const createPlan = (plan: Omit<Plan, 'id'>) => {
    const newPlan: Plan = { id: 'plan-' + Date.now(), ...plan };
    setPlans((prev) => [newPlan, ...prev]);
    addToast('Plan "' + newPlan.name + '" created.', 'success');
  };

  const createDiscount = (discount: Omit<DiscountRule, 'id' | 'timesUsed'>) => {
    const newDiscount: DiscountRule = { id: 'disc-' + Date.now(), timesUsed: 0, ...discount };
    setDiscounts((prev) => [newDiscount, ...prev]);
    addToast('Discount rule "' + newDiscount.code + '" created.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        setCurrentUser,
        users,
        products,
        plans,
        subscriptions,
        invoices,
        payments,
        discounts,
        taxes,
        customers,
        isLoading,
        refreshData,
        pauseSubscription,
        resumeSubscription,
        closeSubscription,
        renewSubscription,
        createSubscription,
        runBillingDay,
        sendInvoice,
        recordPayment,
        createProduct,
        createPlan,
        createDiscount,
        toasts,
        addToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};