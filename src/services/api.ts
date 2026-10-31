/**
 * Brightloop API Client — Direct Flask Backend Integration
 * Base URL: /api (proxied to http://127.0.0.1:5000)
 */

const BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config: RequestInit = {
    ...options,
    credentials: 'include', // Handles Flask session cookies
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `HTTP error ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

// 1. AUTHENTICATION API (/api/auth)
export const authApi = {
  register: (payload: { full_name: string; email: string; password: string }) =>
    request<{ success: boolean; message: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ success: boolean; message: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCurrentUser: () =>
    request<{ success: boolean; user: any }>('/auth/me', {
      method: 'GET',
    }),

  logout: () =>
    request<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    }),
};

// 2. CUSTOMERS API (/api/customers)
export const customersApi = {
  getAll: () =>
    request<{ customers: any[] }>('/customers/', {
      method: 'GET',
    }),

  getById: (id: number) =>
    request<{ customer: any }>(`/customers/${id}`, {
      method: 'GET',
    }),

  create: (payload: { full_name: string; email: string; password: string }) =>
    request<{ message: string; customer: any }>('/customers/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: Partial<{ full_name: string; email: string; password: string; is_active: boolean }>) =>
    request<{ message: string; customer: any }>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: number) =>
    request<{ message: string; customer: any }>(`/customers/${id}`, {
      method: 'DELETE',
    }),
};

// 3. PRODUCTS & VARIANTS API (/api/products)
export const productsApi = {
  getAll: () =>
    request<{ success: boolean; count: number; products: any[] }>('/products/', {
      method: 'GET',
    }),

  getById: (id: number) =>
    request<{ success: boolean; product: any }>(`/products/${id}`, {
      method: 'GET',
    }),

  create: (payload: {
    name: string;
    product_type?: string;
    sales_price: number | string;
    cost_price: number | string;
    notes?: string;
  }) =>
    request<{ success: boolean; message: string; product: any }>('/products/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getVariants: (productId: number) =>
    request<{ success: boolean; product_id: number; count: number; variants: any[] }>(
      `/products/${productId}/variants`,
      { method: 'GET' }
    ),

  createVariant: (
    productId: number,
    payload: { variant_name: string; variant_value: string; price_adjustment: number | string }
  ) =>
    request<{ success: boolean; message: string; variant: any }>(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// 4. PLANS API (/api/plans)
export const plansApi = {
  getAll: () =>
    request<{ success: boolean; count: number; plans: any[] }>('/plans/', {
      method: 'GET',
    }),

  getById: (id: number) =>
    request<{ success: boolean; plan: any }>(`/plans/${id}`, {
      method: 'GET',
    }),

  create: (payload: {
    name: string;
    billing_interval: string;
    price: number | string;
    minimum_quantity?: number;
    available_from?: string;
    available_until?: string;
    auto_close?: boolean;
    allow_early_close?: boolean;
    allow_pause?: boolean;
    allow_renewal?: boolean;
    is_active?: boolean;
  }) =>
    request<{ success: boolean; message: string; plan: any }>('/plans/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: any) =>
    request<{ success: boolean; message: string; plan: any }>(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};

// 5. SUBSCRIPTIONS API (/api/subscriptions)
export const subscriptionsApi = {
  getAll: () =>
    request<{ success: boolean; count: number; subscriptions: any[] }>('/subscriptions/', {
      method: 'GET',
    }),

  getById: (id: number) =>
    request<{ success: boolean; subscription: any }>(`/subscriptions/${id}`, {
      method: 'GET',
    }),

  create: (payload: {
    customer_id: number;
    plan_id: number;
    start_date?: string;
    expiry_date?: string;
    next_billing_date?: string;
    payment_terms_days?: number;
    status?: 'draft' | 'active' | 'paused' | 'cancelled' | 'expired';
    lines: Array<{
      product_id: number;
      variant_id?: number | null;
      quantity: number;
    }>;
  }) =>
    request<{ success: boolean; message: string; subscription: any }>('/subscriptions/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (
    id: number,
    payload: Partial<{
      status: 'draft' | 'active' | 'paused' | 'cancelled' | 'expired';
      start_date: string;
      expiry_date: string;
      next_billing_date: string;
      payment_terms_days: number;
    }>
  ) =>
    request<{ success: boolean; message: string; subscription: any }>(`/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  runAutomation: () =>
    request<{ success: boolean; message: string; result: any }>('/subscriptions/automation/run', {
      method: 'POST',
    }),
};

// 6. INVOICES API (/api/invoices)
export const invoicesApi = {
  getAll: (filters?: { status?: string; customer_id?: number; subscription_id?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.customer_id) params.append('customer_id', String(filters.customer_id));
    if (filters?.subscription_id) params.append('subscription_id', String(filters.subscription_id));
    const qs = params.toString() ? `?${params.toString()}` : '';

    return request<{ success: boolean; count: number; invoices: any[] }>(`/invoices/${qs}`, {
      method: 'GET',
    });
  },

  getById: (id: number) =>
    request<{ success: boolean; invoice: any }>(`/invoices/${id}`, {
      method: 'GET',
    }),

  create: (payload: {
    subscription_id: number;
    issue_date?: string;
    due_date?: string;
    tax_id?: number;
    discount_id?: number;
    discount_total?: number;
  }) =>
    request<{ success: boolean; message: string; invoice: any }>('/invoices/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: Partial<{ due_date: string; status: string }>) =>
    request<{ success: boolean; message: string; invoice: any }>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};

// 7. PAYMENTS API (/api/payments)
export const paymentsApi = {
  getAll: () =>
    request<{ success: boolean; count: number; payments: any[] }>('/payments/', {
      method: 'GET',
    }),

  getByInvoice: (invoiceId: number) =>
    request<{ success: boolean; invoice_id: number; count: number; payments: any[] }>(
      `/payments/invoice/${invoiceId}`,
      { method: 'GET' }
    ),

  create: (payload: {
    invoice_id: number;
    payment_method: string;
    amount: number;
    payment_date?: string;
    note?: string;
  }) =>
    request<{ success: boolean; message: string; payment: any; invoice: any }>('/payments/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// 8. TAXES & DISCOUNTS API (/api/taxes, /api/discounts)
export const taxesApi = {
  getAll: () =>
    request<{ success: boolean; taxes: any[] }>('/taxes/', {
      method: 'GET',
    }),

  create: (payload: { name: string; rate: number }) =>
    request<{ success: boolean; message: string; tax: any }>('/taxes/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const discountsApi = {
  getAll: () =>
    request<{ discounts: any[] }>('/discounts/', {
      method: 'GET',
    }),

  create: (payload: {
    name: string;
    discount_type: 'percentage' | 'fixed';
    value: number;
    minimum_purchase?: number;
    minimum_quantity?: number;
    start_date?: string;
    end_date?: string;
    maximum_uses?: number;
    product_id?: number;
  }) =>
    request<{ message: string; discount: any }>('/discounts/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// 9. DASHBOARD API (/api/dashboard)
export const dashboardApi = {
  getMetrics: () =>
    request<{
      success: boolean;
      dashboard: {
        total_customers: number;
        total_products: number;
        total_subscriptions: number;
        active_subscriptions: number;
        total_invoices: number;
        total_revenue: number;
        pending_payments: number;
        recent_subscriptions: any[];
      };
    }>('/dashboard/', {
      method: 'GET',
    }),
};