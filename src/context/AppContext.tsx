import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authApi,
  customersApi,
  productsApi,
  plansApi,
  subscriptionsApi,
  invoicesApi,
  paymentsApi,
  taxesApi,
  discountsApi,
  dashboardApi
} from '../services/api';

interface AppContextType {
  currentUser: any;
  dashboardMetrics: any;
  customers: any[];
  products: any[];
  plans: any[];
  subscriptions: any[];
  invoices: any[];
  payments: any[];
  taxes: any[];
  discounts: any[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  runBillingDay: () => Promise<void>;
  createSubscription: (data: any) => Promise<boolean>;
  createInvoice: (data: any) => Promise<boolean>;
  recordPayment: (data: any) => Promise<boolean>;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>({
    id: 1,
    full_name: 'Administrator',
    email: 'admin@brightloop.io',
    role: 'admin',
  });
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
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
    try {
      const [
        dashRes,
        custRes,
        prodRes,
        planRes,
        subRes,
        invRes,
        payRes,
        taxRes,
        discRes,
      ] = await Promise.allSettled([
        dashboardApi.getMetrics(),
        customersApi.getAll(),
        productsApi.getAll(),
        plansApi.getAll(),
        subscriptionsApi.getAll(),
        invoicesApi.getAll(),
        paymentsApi.getAll(),
        taxesApi.getAll(),
        discountsApi.getAll(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.success) {
        setDashboardMetrics(dashRes.value.dashboard);
      }
      if (custRes.status === 'fulfilled' && custRes.value.customers) {
        setCustomers(custRes.value.customers);
      }
      if (prodRes.status === 'fulfilled' && prodRes.value.products) {
        setProducts(prodRes.value.products);
      }
      if (planRes.status === 'fulfilled' && planRes.value.plans) {
        setPlans(planRes.value.plans);
      }
      if (subRes.status === 'fulfilled' && subRes.value.subscriptions) {
        setSubscriptions(subRes.value.subscriptions);
      }
      if (invRes.status === 'fulfilled' && invRes.value.invoices) {
        setInvoices(invRes.value.invoices);
      }
      if (payRes.status === 'fulfilled' && payRes.value.payments) {
        setPayments(payRes.value.payments);
      }
      if (taxRes.status === 'fulfilled' && taxRes.value.taxes) {
        setTaxes(taxRes.value.taxes);
      }
      if (discRes.status === 'fulfilled' && discRes.value.discounts) {
        setDiscounts(discRes.value.discounts);
      }
    } catch (err: any) {
      addToast(err.message || 'Error connecting to backend', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    authApi
      .getCurrentUser()
      .then((res) => {
        if (res.success && res.user) setCurrentUser(res.user);
      })
      .catch(() => {})
      .finally(() => {
        refreshData();
      });
  }, [refreshData]);

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.user) {
        setCurrentUser(res.user);
        addToast(`Welcome back, ${res.user.full_name}!`, 'success');
        refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      addToast(err.message, 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setCurrentUser(null);
      addToast('Logged out successfully', 'info');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const runBillingDay = async () => {
    try {
      const res = await subscriptionsApi.runAutomation();
      if (res.success) {
        addToast(res.message || 'Billing automation completed successfully', 'success');
        refreshData();
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const createSubscription = async (data: any) => {
    try {
      const res = await subscriptionsApi.create(data);
      if (res.success) {
        addToast('Subscription created', 'success');
        refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      addToast(err.message, 'error');
      return false;
    }
  };

  const createInvoice = async (data: any) => {
    try {
      const res = await invoicesApi.create(data);
      if (res.success) {
        addToast('Invoice created', 'success');
        refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      addToast(err.message, 'error');
      return false;
    }
  };

  const recordPayment = async (data: any) => {
    try {
      const res = await paymentsApi.create(data);
      if (res.success) {
        addToast(`Payment of $${data.amount} recorded`, 'success');
        refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      addToast(err.message, 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        dashboardMetrics,
        customers,
        products,
        plans,
        subscriptions,
        invoices,
        payments,
        taxes,
        discounts,
        isLoading,
        refreshData,
        login,
        logout,
        runBillingDay,
        createSubscription,
        createInvoice,
        recordPayment,
        addToast,
        toasts,
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