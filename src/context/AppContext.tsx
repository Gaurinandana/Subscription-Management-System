
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
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  addStaffMember: (name: string, email: string, department: string) => boolean;

  customers: Customer[];
  addCustomer: (
    cust: Omit<Customer, 'id' | 'joinedDate'>,
    password: string
  ) => Promise<Customer>;

  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;

  plans: Plan[];
  addPlan: (plan: Omit<Plan, 'id'>) => void;

  templates: QuotationTemplate[];
  addTemplate: (template: Omit<QuotationTemplate, 'id'>) => void;

  subscriptions: Subscription[];
  createSubscription: (subData: Partial<Subscription>) => Subscription;
  updateSubscriptionStatus: (id: string, status: SubscriptionStatus) => void;
  pauseSubscription: (id: string) => boolean;
  resumeSubscription: (id: string) => boolean;
  renewSubscription: (id: string, monthsToAdd?: number) => boolean;
  closeSubscription: (id: string) => boolean;

  invoices: Invoice[];
  runBillingDay: () => { generatedCount: number; message: string };
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  sendInvoice: (id: string) => void;
  cancelInvoice: (id: string) => void;

  payments: Payment[];
  recordPayment: (payment: Omit<Payment, 'id' | 'transactionRef'>) => boolean;

  discounts: DiscountRule[];
  addDiscountRule: (rule: Omit<DiscountRule, 'id' | 'timesUsed'>) => void;

  taxRules: TaxRule[];
  addTaxRule: (rule: Omit<TaxRule, 'id'>) => void;

  toasts: ToastNotification[];
  addToast: (
    type: ToastNotification['type'],
    title: string,
    message: string
  ) => void;
  removeToast: (id: string) => void;

  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const loadState = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(`brightloop_${key}`);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch {
    return fallback;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>(() =>
    loadState('users', initialUsers)
  );

  const [currentUser, setCurrentUser] = useState<User>(
    () => users[0] || initialUsers[0]
  );

  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadState('customers', initialCustomers)
  );

  const [products, setProducts] = useState<Product[]>(() =>
    loadState('products', initialProducts)
  );

  const [plans, setPlans] = useState<Plan[]>(() =>
    loadState('plans', initialPlans)
  );

  const [templates, setTemplates] = useState<QuotationTemplate[]>(() =>
    loadState('templates', initialQuotationTemplates)
  );

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    loadState('subscriptions', initialSubscriptions)
  );

  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadState('invoices', initialInvoices)
  );

  const [payments, setPayments] = useState<Payment[]>(() =>
    loadState('payments', initialPayments)
  );

  const [discounts, setDiscounts] = useState<DiscountRule[]>(() =>
    loadState('discounts', initialDiscountRules)
  );

  const [taxRules, setTaxRules] = useState<TaxRule[]>(() =>
    loadState('taxRules', initialTaxRules)
  );

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Toast notifications
  const addToast = (
    type: ToastNotification['type'],
    title: string,
    message: string
  ) => {
    const id = Math.random().toString(36).substring(2, 9);

    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Load customers from Flask backend
  useEffect(() => {
    let cancelled = false;

    const loadCustomersFromBackend = async () => {
      try {
        const response = await fetch('/api/customers/');

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.error || data.message || 'Could not load customers'
          );
        }

        const backendCustomers = Array.isArray(data)
          ? data
          : data.customers || [];

        const mappedCustomers: Customer[] = backendCustomers.map(
          (c: any) => ({
            id: String(c.id),
            name: c.full_name || c.name || '',
            company: c.company || c.full_name || c.name || '',
            email: c.email || '',
            phone: c.phone || '',
            address: c.address || '',
            joinedDate: (
              c.created_at ||
              c.joined_date ||
              ''
            ).split('T')[0],
          })
        );

        if (!cancelled) {
          setCustomers(mappedCustomers);
        }
      } catch (error) {
        console.error('Customer API error:', error);

        if (!cancelled) {
          addToast(
            'warning',
            'Backend Connection',
            'Could not load customers. Showing saved customer data.'
          );
        }
      }
    };

    loadCustomersFromBackend();

    return () => {
      cancelled = true;
    };
  }, []);

  // Save frontend state
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

  // Role switching
  const switchRole = (role: UserRole) => {
    const target = users.find((user) => user.role === role);

    if (target) {
      setCurrentUser(target);
      addToast(
        'info',
        'Role Switched',
        `Now viewing as ${target.name} (${target.role.toUpperCase()})`
      );
    }
  };

  // Add staff member
  const addStaffMember = (
    name: string,
    email: string,
    department: string
  ): boolean => {
    if (currentUser.role !== 'admin') {
      addToast('error', 'Unauthorized', 'Only administrators can add staff.');
      return false;
    }

    if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      addToast('error', 'Duplicate Email', 'This email is already registered.');
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
    addToast('success', 'Staff Added', `Welcome ${name} to Brightloop!`);

    return true;
  };

  // Create customer through Flask backend
  const addCustomer = async (
    custData: Omit<Customer, 'id' | 'joinedDate'>,
    password: string
  ): Promise<Customer> => {
    const response = await fetch('/api/customers/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: custData.name,
        email: custData.email,
        password,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error || data.message || 'Customer registration failed'
      );
    }

    const c = data.customer || data;

    if (!c.id) {
      throw new Error('Customer API returned an invalid response.');
    }

    const newCustomer: Customer = {
      id: String(c.id),
      name: c.full_name || c.name || custData.name,
      company: custData.company,
      email: c.email || custData.email,
      phone: c.phone || custData.phone,
      address: c.address || custData.address,
      joinedDate: (
        c.created_at ||
        new Date().toISOString()
      ).split('T')[0],
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    addToast(
      'success',
      'Customer Registered',
      `Created account for ${newCustomer.name}`
    );

    return newCustomer;
  };

  // Add product
  const addProduct = (productData: Omit<Product, 'id'>) => {
    if (currentUser.role !== 'admin') {
      addToast('error', 'Unauthorized', 'Only admin can add products.');
      return;
    }

    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };

    setProducts((prev) => [...prev, newProduct]);
    addToast('success', 'Product Launched', `Added product "${newProduct.name}"`);
  };

  // Add plan
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
    addToast('success', 'Plan Launched', `New plan "${newPlan.name}" created.`);
  };

  // Add quotation template
  const addTemplate = (templateData: Omit<QuotationTemplate, 'id'>) => {
    const newTemplate: QuotationTemplate = {
      ...templateData,
      id: `template-${Date.now()}`,
    };

    setTemplates((prev) => [...prev, newTemplate]);
    addToast('success', 'Template Created', `Template "${newTemplate.name}" saved.`);
  };

  // Create subscription (currently local)
  const createSubscription = (subData: Partial<Subscription>): Subscription => {
    const newSubscription: Subscription = {
      id: `sub-${Date.now()}`,
      number: `SUB-2026-${String(subscriptions.length + 1).padStart(3, '0')}`,
      customerId: subData.customerId || customers[0]?.id || 'cust-1',
      customerName: subData.customerName || customers[0]?.name || 'Customer',
      customerEmail: subData.customerEmail || customers[0]?.email || 'customer@example.com',
      planId: subData.planId || plans[0]?.id || 'plan-1',
      planName: subData.planName || plans[0]?.name || 'Standard Plan',
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

    setSubscriptions((prev) => [newSubscription, ...prev]);
    addToast('success', 'Subscription Created', `${newSubscription.number} created.`);

    return newSubscription;
  };

  const updateSubscriptionStatus = (
    id: string,
    status: SubscriptionStatus
  ) => {
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status } : sub))
    );

    addToast('info', 'Status Updated', `Subscription transitioned to "${status}"`);
  };

  const pauseSubscription = (id: string): boolean => {
    const sub = subscriptions.find((item) => item.id === id);
    if (!sub) return false;

    const plan = plans.find((item) => item.id === sub.planId);

    if (plan && !plan.canPause) {
      addToast('error', 'Plan Restriction', `Plan "${plan.name}" does not allow pausing.`);
      return false;
    }

    updateSubscriptionStatus(id, 'Paused');
    return true;
  };

  const resumeSubscription = (id: string): boolean => {
    if (!subscriptions.some((sub) => sub.id === id)) return false;

    updateSubscriptionStatus(id, 'Active');
    return true;
  };

  const renewSubscription = (id: string, monthsToAdd = 12): boolean => {
    const sub = subscriptions.find((item) => item.id === id);
    if (!sub) return false;

    const plan = plans.find((item) => item.id === sub.planId);

    if (plan && !plan.canRenew) {
      addToast('error', 'Plan Restriction', `Plan "${plan.name}" does not support renewal.`);
      return false;
    }

    const expiry = new Date(sub.expiryDate);
    expiry.setMonth(expiry.getMonth() + monthsToAdd);

    const newExpiry = expiry.toISOString().split('T')[0];

    setSubscriptions((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, expiryDate: newExpiry, status: 'Active' }
          : item
      )
    );

    addToast('success', 'Subscription Renewed', `${sub.number} extended to ${newExpiry}`);

    return true;
  };

  const closeSubscription = (id: string): boolean => {
    const sub = subscriptions.find((item) => item.id === id);
    if (!sub) return false;

    const plan = plans.find((item) => item.id === sub.planId);

    if (plan && !plan.canCloseEarly && new Date(sub.expiryDate) > new Date()) {
      addToast('error', 'Plan Restriction', `Plan "${plan.name}" cannot be closed early.`);
      return false;
    }

    updateSubscriptionStatus(id, 'Closed');
    return true;
  };

  // Billing day (currently local)
  const runBillingDay = () => {
    const today = new Date().toISOString().split('T')[0];

    const dueSubscriptions = subscriptions.filter(
      (sub) => sub.status === 'Active' && sub.nextBillingDate <= today
    );

    if (dueSubscriptions.length === 0) {
      addToast('info', 'Billing Up to Date', 'No subscriptions are due for billing.');

      return {
        generatedCount: 0,
        message: 'All active subscriptions are already billed.',
      };
    }

    let generatedCount = 0;
    const newInvoices: Invoice[] = [];

    const updatedSubscriptions = subscriptions.map((sub) => {
      if (sub.status === 'Active' && sub.nextBillingDate <= today) {
        const invoiceNumber =
          `INV-2026-${String(invoices.length + generatedCount + 1).padStart(3, '0')}`;

        const dueDateObject = new Date();
        dueDateObject.setDate(
          dueDateObject.getDate() +
            (sub.paymentTerms === 'Due on Receipt' ? 0 : 30)
        );

        const invoiceLines = sub.lines.map((line, index) => ({
          id: `iline-${Date.now()}-${index}`,
          description: `${line.productName} ${line.variantName ? `(${line.variantName})` : ''}`,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          taxAmount: (line.amount * line.taxRate) / 100,
          lineTotal: line.amount,
        }));

        const newInvoice: Invoice = {
          id: `inv-${Date.now()}-${generatedCount}`,
          number: invoiceNumber,
          subscriptionId: sub.id,
          subscriptionNumber: sub.number,
          customerId: sub.customerId,
          customerName: sub.customerName,
          customerEmail: sub.customerEmail,
          billingDate: today,
          dueDate: dueDateObject.toISOString().split('T')[0],
          status: 'Draft',
          lines: invoiceLines,
          subtotal: sub.subtotal,
          taxAmount: sub.taxTotal,
          discountAmount: sub.discountTotal,
          discountNote: sub.appliedDiscountCode
            ? `Discount Code: ${sub.appliedDiscountCode}`
            : undefined,
          total: sub.totalAmount,
          amountPaid: 0,
          paymentTerms: sub.paymentTerms,
        };

        newInvoices.push(newInvoice);
        generatedCount++;

        const nextDate = new Date(sub.nextBillingDate);
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
    setSubscriptions(updatedSubscriptions);

    addToast(
      'success',
      'Billing Day Complete',
      `Generated ${generatedCount} invoices.`
    );

    return {
      generatedCount,
      message: `Successfully processed ${generatedCount} subscriptions.`,
    };
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, status } : invoice
      )
    );

    addToast('info', 'Invoice Updated', `Invoice status changed to "${status}"`);
  };

  const sendInvoice = (id: string) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id
          ? {
              ...invoice,
              status: invoice.status === 'Draft' ? 'Confirmed' : invoice.status,
              sentAt: new Date().toISOString(),
            }
          : invoice
      )
    );

    addToast('success', 'Invoice Sent', 'Invoice marked as sent.');
  };

  const cancelInvoice = (id: string) => {
    updateInvoiceStatus(id, 'Cancelled');
  };

  // Record payment (currently local)
  const recordPayment = (
    paymentData: Omit<Payment, 'id' | 'transactionRef'>
  ): boolean => {
    const invoice = invoices.find((item) => item.id === paymentData.invoiceId);

    if (!invoice) {
      addToast('error', 'Invoice Not Found', 'Could not locate invoice for payment.');
      return false;
    }

    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      transactionRef: `txn_${paymentData.method.toLowerCase().replace(/\s+/g, '')}_${Math.random().toString(36).substring(2, 9)}`,
    };

    const newPaidAmount = invoice.amountPaid + paymentData.amount;
    const isFullyPaid = newPaidAmount >= invoice.total;

    setPayments((prev) => [newPayment, ...prev]);

    setInvoices((prev) =>
      prev.map((item) =>
        item.id === invoice.id
          ? {
              ...item,
              amountPaid: newPaidAmount,
              status: isFullyPaid ? 'Paid' : item.status,
              paidAt: isFullyPaid ? new Date().toISOString() : item.paidAt,
            }
          : item
      )
    );

    addToast('success', 'Payment Recorded', 'Payment recorded successfully.');

    return true;
  };

  const addDiscountRule = (
    ruleData: Omit<DiscountRule, 'id' | 'timesUsed'>
  ) => {
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
    addToast('success', 'Discount Created', `Code "${newRule.code}" created.`);
  };

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
    addToast('success', 'Tax Rule Added', `Added rule "${newTax.name}".`);
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

    addToast('info', 'Demo Data Reset', 'Restored default demo data.');
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
