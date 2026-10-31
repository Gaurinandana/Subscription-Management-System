import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Customer,
  DiscountRule,
  Invoice,
  Payment,
  Plan,
  Product,
  QuotationTemplate,
  Subscription,
  SubscriptionStatus,
  InvoiceStatus,
  TaxRule,
  User,
  UserRole,
} from '../types';
import {
  initialCustomers,
  initialDiscountRules,
  initialInvoices,
  initialPayments,
  initialPlans,
  initialProducts,
  initialQuotationTemplates,
  initialSubscriptions,
  initialTaxRules,
  initialUsers,
} from '../data/seedData';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  // Current user & Auth
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  addStaffMember: (name: string, email: string, department: string) => boolean;

  // Customers
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'joinedDate'>) => Customer;

  // Products & Plans
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  plans: Plan[];
  addPlan: (plan: Omit<Plan, 'id'>) => void;

  // Quotation Templates
  templates: QuotationTemplate[];
  addTemplate: (template: Omit<QuotationTemplate, 'id'>) => void;

  // Subscriptions
  subscriptions: Subscription[];
  createSubscription: (subData: Partial<Subscription>) => Subscription;
  updateSubscriptionStatus: (id: string, status: SubscriptionStatus) => void;
  pauseSubscription: (id: string) => boolean;
  resumeSubscription: (id: string) => boolean;
  renewSubscription: (id: string, monthsToAdd?: number) => boolean;
  closeSubscription: (id: string) => boolean;

  // Invoices & Billing
  invoices: Invoice[];
  runBillingDay: () => { generatedCount: number; message: string };
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  sendInvoice: (id: string) => void;
  cancelInvoice: (id: string) => void;

  // Payments
  payments: Payment[];
  recordPayment: (payment: Omit<Payment, 'id' | 'transactionRef'>) => boolean;

  // Discounts & Taxes
  discounts: DiscountRule[];
  addDiscountRule: (rule: Omit<DiscountRule, 'id' | 'timesUsed'>) => void;
  taxRules: TaxRule[];
  addTaxRule: (rule: Omit<TaxRule, 'id'>) => void;

  // Toast notifications
  toasts: ToastNotification[];
  addToast: (type: ToastNotification['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Demo helpers
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Helper to load or initialize from localStorage
  const loadState = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(`brightloop_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const [users, setUsers] = useState<User[]>(() => loadState('users', initialUsers));
  const [currentUser, setCurrentUser] = useState<User>(() => users[0] || initialUsers[0]);
  const [customers, setCustomers] = useState<Customer[]>(() => loadState('customers', initialCustomers));
  const [products, setProducts] = useState<Product[]>(() => loadState('products', initialProducts));
  const [plans, setPlans] = useState<Plan[]>(() => loadState('plans', initialPlans));
  const [templates, setTemplates] = useState<QuotationTemplate[]>(() => loadState('templates', initialQuotationTemplates));
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => loadState('subscriptions', initialSubscriptions));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadState('invoices', initialInvoices));
  const [payments, setPayments] = useState<Payment[]>(() => loadState('payments', initialPayments));
  const [discounts, setDiscounts] = useState<DiscountRule[]>(() => loadState('discounts', initialDiscountRules));
  const [taxRules, setTaxRules] = useState<TaxRule[]>(() => loadState('taxRules', initialTaxRules));

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('brightloop_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('brightloop_customers', JSON.stringify(customers));
  }, [customers]);
  useEffect(() => {
    localStorage.setItem('brightloop_products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem('brightloop_plans', JSON.stringify(plans));
  }, [plans]);
  useEffect(() => {
    localStorage.setItem('brightloop_templates', JSON.stringify(templates));
  }, [templates]);
  useEffect(() => {
    localStorage.setItem('brightloop_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);
  useEffect(() => {
    localStorage.setItem('brightloop_invoices', JSON.stringify(invoices));
  }, [invoices]);
  useEffect(() => {
    localStorage.setItem('brightloop_payments', JSON.stringify(payments));
  }, [payments]);
  useEffect(() => {
    localStorage.setItem('brightloop_discounts', JSON.stringify(discounts));
  }, [discounts]);
  useEffect(() => {
    localStorage.setItem('brightloop_taxRules', JSON.stringify(taxRules));
  }, [taxRules]);

  const addToast = (type: ToastNotification['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchRole = (role: UserRole) => {
    const target = users.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
      addToast('info', 'Role Switched', `Now viewing as ${target.name} (${target.role.toUpperCase()})`);
    }
  };

  const addStaffMember = (name: string, email: string, department: string): boolean => {
    if (currentUser.role !== 'admin') {
      addToast('error', 'Unauthorized', 'Only administrators can add new members of staff.');
      return false;
    }
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      addToast('error', 'Duplicate Email', 'A staff member or user with this email already exists.');
      return false;
    }

    const newStaff: User = {
      id: `user-staff-${Date.now()}`,
      name,
      email,
      role: 'staff',
      department,
      avatar: `https://images.unsplash.com/photo-${1535713875002 + (users.length % 5)}?w=150`,
    };

    setUsers((prev) => [...prev, newStaff]);
    addToast('success', 'Staff Added', `Welcome ${name} to Brightloop team!`);
    return true;
  };

  const addCustomer = (custData: Omit<Customer, 'id' | 'joinedDate'>): Customer => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [...prev, newCust]);
    addToast('success', 'Customer Registered', `Created account for ${newCust.name} (${newCust.company})`);
    return newCust;
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    if (currentUser.role !== 'admin') {
      addToast('error', 'Unauthorized', 'Only admin can add new products.');
      return;
    }
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProd]);
    addToast('success', 'Product Launched', `Added product "${newProd.name}"`);
  };

  const addPlan = (planData: Omit<Plan, 'id'>) => {
    if (currentUser.role !== 'admin') {
      addToast('error', 'Unauthorized', 'Only admin can create plans.');
      return;
    }
    const newPlan: Plan = {
      ...planData,
      id: `plan-${Date.now()}`,
    };
    setPlans((prev) => [...prev, newPlan]);
    addToast('success', 'Plan Launched', `New subscription plan "${newPlan.name}" is now live!`);
  };

  const addTemplate = (tplData: Omit<QuotationTemplate, 'id'>) => {
    const newTpl: QuotationTemplate = {
      ...tplData,
      id: `template-${Date.now()}`,
    };
    setTemplates((prev) => [...prev, newTpl]);
    addToast('success', 'Template Created', `Quotation template "${newTpl.name}" saved.`);
  };

  const createSubscription = (subData: Partial<Subscription>): Subscription => {
    const nextNum = `SUB-2026-${String(subscriptions.length + 1).padStart(3, '0')}`;
    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      number: nextNum,
      customerId: subData.customerId || 'cust-1',
      customerName: subData.customerName || 'Customer',
      customerEmail: subData.customerEmail || 'customer@example.com',
      planId: subData.planId || (plans[0]?.id ?? 'plan-1'),
      planName: subData.planName || (plans[0]?.name ?? 'Standard Plan'),
      startDate: subData.startDate || new Date().toISOString().split('T')[0],
      expiryDate: subData.expiryDate || '2027-10-31',
      paymentTerms: subData.paymentTerms || 'Net 30',
      status: subData.status || 'Draft',
      lines: subData.lines || [],
      subtotal: subData.subtotal || 0,
      taxTotal: subData.taxTotal || 0,
      discountTotal: subData.discountTotal || 0,
      totalAmount: subData.totalAmount || 0,
      appliedDiscountCode: subData.appliedDiscountCode,
      nextBillingDate: subData.nextBillingDate || new Date().toISOString().split('T')[0],
      quotationValidityDays: subData.quotationValidityDays || 30,
      quotationExpiresAt: subData.quotationExpiresAt,
      createdAt: new Date().toISOString().split('T')[0],
      notes: subData.notes,
    };

    setSubscriptions((prev) => [newSub, ...prev]);
    addToast('success', 'Subscription Created', `${newSub.number} created in status "${newSub.status}"`);
    return newSub;
  };

  const updateSubscriptionStatus = (id: string, status: SubscriptionStatus) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          return { ...sub, status };
        }
        return sub;
      })
    );
    addToast('info', 'Status Updated', `Subscription transitioned to "${status}"`);
  };

  const pauseSubscription = (id: string): boolean => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return false;
    const plan = plans.find((p) => p.id === sub.planId);
    if (plan && !plan.canPause) {
      addToast('error', 'Plan Restriction', `Plan "${plan.name}" does not allow pausing.`);
      return false;
    }
    updateSubscriptionStatus(id, 'Paused');
    addToast('warning', 'Subscription Paused', `${sub.number} paused. Recurring billing is on hold.`);
    return true;
  };

  const resumeSubscription = (id: string): boolean => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return false;
    updateSubscriptionStatus(id, 'Active');
    addToast('success', 'Subscription Resumed', `${sub.number} is now Active again.`);
    return true;
  };

  const renewSubscription = (id: string, monthsToAdd: number = 12): boolean => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return false;
    const plan = plans.find((p) => p.id === sub.planId);
    if (plan && !plan.canRenew) {
      addToast('error', 'Plan Restriction', `Plan "${plan.name}" does not support renewal.`);
      return false;
    }

    const currentExpiry = new Date(sub.expiryDate);
    currentExpiry.setMonth(currentExpiry.getMonth() + monthsToAdd);
    const newExpiry = currentExpiry.toISOString().split('T')[0];

    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, expiryDate: newExpiry, status: 'Active' } : s))
    );
    addToast('success', 'Subscription Renewed', `${sub.number} extended to ${newExpiry}`);
    return true;
  };

  const closeSubscription = (id: string): boolean => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return false;
    const plan = plans.find((p) => p.id === sub.planId);
    if (plan && !plan.canCloseEarly && new Date(sub.expiryDate) > new Date()) {
      addToast('error', 'Plan Restriction', `Plan "${plan.name}" cannot be closed early before expiry.`);
      return false;
    }

    updateSubscriptionStatus(id, 'Closed');
    addToast('info', 'Subscription Closed', `${sub.number} marked as Closed.`);
    return true;
  };

  // Scene 4: Billing Day
  // "Hundreds of subscriptions are due at once. Nobody should be typing invoices by hand.
  // Each one should be created from its subscription, with customer details, product lines,
  // taxes and totals already filled in. Nothing should be billed twice or skipped."
  const runBillingDay = () => {
    const today = new Date().toISOString().split('T')[0];
    const dueSubscriptions = subscriptions.filter(
      (sub) => sub.status === 'Active' && sub.nextBillingDate <= today
    );

    if (dueSubscriptions.length === 0) {
      addToast('info', 'Billing Up to Date', 'No active subscriptions are currently due for billing today.');
      return { generatedCount: 0, message: 'All active subscriptions are already billed.' };
    }

    let generatedCount = 0;
    const newInvoices: Invoice[] = [];
    const updatedSubs = subscriptions.map((sub) => {
      if (sub.status === 'Active' && sub.nextBillingDate <= today) {
        // Prevent duplicate billing for this period
        const invoiceNum = `INV-2026-${String(invoices.length + generatedCount + 1).padStart(3, '0')}`;
        
        // Calculate due date (30 days from billing date or payment terms)
        const dueDateObj = new Date();
        dueDateObj.setDate(dueDateObj.getDate() + (sub.paymentTerms === 'Due on Receipt' ? 0 : 30));
        const dueDate = dueDateObj.toISOString().split('T')[0];

        const invoiceLines = sub.lines.map((line, idx) => ({
          id: `iline-${Date.now()}-${idx}`,
          description: `${line.productName} ${line.variantName ? `(${line.variantName})` : ''}`,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          taxAmount: (line.amount * line.taxRate) / 100,
          lineTotal: line.amount,
        }));

        const newInv: Invoice = {
          id: `inv-${Date.now()}-${generatedCount}`,
          number: invoiceNum,
          subscriptionId: sub.id,
          subscriptionNumber: sub.number,
          customerId: sub.customerId,
          customerName: sub.customerName,
          customerEmail: sub.customerEmail,
          billingDate: today,
          dueDate,
          status: 'Draft', // Moves from Draft -> Confirmed -> Paid
          lines: invoiceLines,
          subtotal: sub.subtotal,
          taxAmount: sub.taxTotal,
          discountAmount: sub.discountTotal,
          discountNote: sub.appliedDiscountCode ? `Discount Code: ${sub.appliedDiscountCode}` : undefined,
          total: sub.totalAmount,
          amountPaid: 0,
          paymentTerms: sub.paymentTerms,
        };

        newInvoices.push(newInv);
        generatedCount++;

        // Advance next billing date by 1 month (or frequency)
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + 1);

        return {
          ...sub,
          lastBilledDate: today,
          nextBillingDate: nextDate.toISOString().split('T')[0],
        };
      }
      return sub;
    });

    setInvoices((prev) => [...newInvoices, ...prev]);
    setSubscriptions(updatedSubs);

    addToast(
      'success',
      'Billing Day Run Complete!',
      `Generated ${generatedCount} invoices automatically with pre-filled taxes and discount rules.`
    );

    return {
      generatedCount,
      message: `Successfully processed ${generatedCount} subscriptions. Zero duplicate billings.`,
    };
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
    addToast('info', 'Invoice Updated', `Invoice status changed to "${status}"`);
  };

  const sendInvoice = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          return {
            ...inv,
            status: inv.status === 'Draft' ? 'Confirmed' : inv.status,
            sentAt: new Date().toISOString(),
          };
        }
        return inv;
      })
    );
    addToast('success', 'Invoice Sent', 'Invoice emailed to customer portal & registered address.');
  };

  const cancelInvoice = (id: string) => {
    updateInvoiceStatus(id, 'Cancelled');
  };

  // Scene 6: The Money Comes In
  const recordPayment = (paymentData: Omit<Payment, 'id' | 'transactionRef'>): boolean => {
    const targetInvoice = invoices.find((inv) => inv.id === paymentData.invoiceId);
    if (!targetInvoice) {
      addToast('error', 'Invoice Not Found', 'Could not locate invoice for payment.');
      return false;
    }

    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      transactionRef: `txn_${paymentData.method.toLowerCase().replace(/\s+/g, '')}_${Math.random().toString(36).substring(2, 9)}`,
    };

    const newPaidAmount = targetInvoice.amountPaid + paymentData.amount;
    const isFullyPaid = newPaidAmount >= targetInvoice.total;

    setPayments((prev) => [newPayment, ...prev]);
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === targetInvoice.id
          ? {
              ...inv,
              amountPaid: newPaidAmount,
              status: isFullyPaid ? 'Paid' : inv.status,
              paidAt: isFullyPaid ? new Date().toISOString() : inv.paidAt,
            }
          : inv
      )
    );

    addToast(
      'success',
      'Payment Recorded',
      `Received $${paymentData.amount.toLocaleString()} via ${paymentData.method}. Invoice is ${isFullyPaid ? 'Fully Paid' : 'Partially Paid'}.`
    );

    return true;
  };

  // Scene 5: Admin Discount Rules
  const addDiscountRule = (ruleData: Omit<DiscountRule, 'id' | 'timesUsed'>) => {
    if (currentUser.role !== 'admin') {
      addToast('error', 'Unauthorized', 'Only admin can configure discount rules.');
      return;
    }

    const newRule: DiscountRule = {
      ...ruleData,
      id: `disc-${Date.now()}`,
      timesUsed: 0,
    };

    setDiscounts((prev) => [newRule, ...prev]);
    addToast('success', 'Discount Created', `Code "${newRule.code}" is now active!`);
  };

  // Tax Rules
  const addTaxRule = (taxData: Omit<TaxRule, 'id'>) => {
    if (currentUser.role !== 'admin') {
      addToast('error', 'Unauthorized', 'Only admin can modify tax rules.');
      return;
    }
    const newTax: TaxRule = {
      ...taxData,
      id: `tax-${Date.now()}`,
    };
    setTaxRules((prev) => [...prev, newTax]);
    addToast('success', 'Tax Rule Added', `Added rule "${newTax.name}" (${newTax.rate}%)`);
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setUsers(initialUsers);
    setCurrentUser(initialUsers[0]);
    setCustomers(initialCustomers);
    setProducts(initialProducts);
    setPlans(initialPlans);
    setTemplates(initialQuotationTemplates);
    setSubscriptions(initialSubscriptions);
    setInvoices(initialInvoices);
    setPayments(initialPayments);
    setDiscounts(initialDiscountRules);
    setTaxRules(initialTaxRules);
    addToast('info', 'Demo Data Reset', 'Restored default Brightloop Software demo scenarios.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser,
        switchRole,
        addStaffMember,
        customers,
        addCustomer,
        products,
        addProduct,
        plans,
        addPlan,
        templates,
        addTemplate,
        subscriptions,
        createSubscription,
        updateSubscriptionStatus,
        pauseSubscription,
        resumeSubscription,
        renewSubscription,
        closeSubscription,
        invoices,
        runBillingDay,
        updateInvoiceStatus,
        sendInvoice,
        cancelInvoice,
        payments,
        recordPayment,
        discounts,
        addDiscountRule,
        taxRules,
        addTaxRule,
        toasts,
        addToast,
        removeToast,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
