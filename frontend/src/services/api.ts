import {
  User,
  Transaction,
  Budget,
  BudgetSpendingResponse,
  Goal,
  ChatMessage,
  DashboardData,
  EMICalculationResult,
  GoalCalculationResult,
  DTICalculationResult,
} from '../types';

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg);
    (error as any).code = data.code;
    (error as any).status = res.status;
    throw error;
  }
  return data;
};

export const api = {
  // Authentication & Profile
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return handleResponse(res);
    },
    register: async (userData: any) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return handleResponse(res);
    },
    getProfile: async (): Promise<{ success: boolean; data: User }> => {
      const res = await fetch(`${API_BASE}/users/profile`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updateProfile: async (userData: Partial<User>): Promise<{ success: boolean; data: User }> => {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });
      return handleResponse(res);
    },
  },

  // Transactions
  transactions: {
    getAll: async (params?: { type?: string; category?: string; startDate?: string; endDate?: string }): Promise<{ success: boolean; data: Transaction[] }> => {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/transactions${query ? `?${query}` : ''}`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (tx: Partial<Transaction>): Promise<{ success: boolean; data: Transaction }> => {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(tx),
      });
      return handleResponse(res);
    },
    update: async (id: string, tx: Partial<Transaction>): Promise<{ success: boolean; data: Transaction }> => {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(tx),
      });
      return handleResponse(res);
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Budget
  budget: {
    get: async (month?: number, year?: number): Promise<{ success: boolean; data: BudgetSpendingResponse }> => {
      const query = new URLSearchParams();
      if (month) query.set('month', String(month));
      if (year) query.set('year', String(year));
      const res = await fetch(`${API_BASE}/budget${query.toString() ? `?${query.toString()}` : ''}`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    save: async (budgetData: Partial<Budget>): Promise<{ success: boolean; data: Budget }> => {
      const res = await fetch(`${API_BASE}/budget`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(budgetData),
      });
      return handleResponse(res);
    },
  },

  // Goals
  goals: {
    getAll: async (): Promise<{ success: boolean; data: Goal[] }> => {
      const res = await fetch(`${API_BASE}/goals`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (goalData: Partial<Goal>): Promise<{ success: boolean; data: Goal }> => {
      const res = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(goalData),
      });
      return handleResponse(res);
    },
    update: async (id: string, goalData: Partial<Goal>): Promise<{ success: boolean; data: Goal }> => {
      const res = await fetch(`${API_BASE}/goals/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(goalData),
      });
      return handleResponse(res);
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      const res = await fetch(`${API_BASE}/goals/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Dashboard
  dashboard: {
    get: async (): Promise<{ success: boolean; data: DashboardData }> => {
      const res = await fetch(`${API_BASE}/dashboard`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Calculators
  calculations: {
    emi: async (payload: { principal: number; annualInterestRate: number; tenureMonths: number }): Promise<{ success: boolean; data: EMICalculationResult }> => {
      const res = await fetch(`${API_BASE}/calculations/emi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },
    goal: async (payload: { targetAmount: number; currentAmount: number; targetDate: string }): Promise<{ success: boolean; data: GoalCalculationResult }> => {
      const res = await fetch(`${API_BASE}/calculations/goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },
    dti: async (payload: { monthlyDebtPayments: number; monthlyIncome: number }): Promise<{ success: boolean; data: DTICalculationResult }> => {
      const res = await fetch(`${API_BASE}/calculations/dti`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },
    emergency: async (payload: { monthlyExpenses: number; targetMonths: number }): Promise<{ success: boolean; data: { targetAmount: number; targetMonths: number; monthlyExpenseBasis: number } }> => {
      const res = await fetch(`${API_BASE}/calculations/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },
  },

  // AI Adviser
  ai: {
    sendMessage: async (message: string): Promise<{ success: boolean; data: { reply: string; contextSummary: any } }> => {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message }),
      });
      return handleResponse(res);
    },
    getHistory: async (): Promise<{ success: boolean; data: ChatMessage[] }> => {
      const res = await fetch(`${API_BASE}/ai/history`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    clearHistory: async (): Promise<{ success: boolean }> => {
      const res = await fetch(`${API_BASE}/ai/history`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },
};
