import { Equipment, BorrowingRequest, User, MaintenanceRecord, Notification, LabRoom } from '../types';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';
type AuthResponse = { access: string; refresh: string; user: User };

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const access = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}), ...options.headers },
  });
  if (response.status === 401 && retry && localStorage.getItem('refresh_token')) {
    const refresh = await fetch(`${API_BASE_URL}/auth/refresh/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh: localStorage.getItem('refresh_token') }) });
    if (refresh.ok) {
      localStorage.setItem('access_token', (await refresh.json()).access);
      return request<T>(path, options, false);
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const error = await response.json(); message = error.detail || Object.values(error).flat().join(' ') || message; } catch { /* non-JSON error */ }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

const items = <T>(data: T[] | { results: T[] }) => Array.isArray(data) ? data : data.results;

export const api = {
  auth: {
    login: async (emailOrNim: string, password: string) => { const result = await request<AuthResponse>('/auth/login/', { method: 'POST', body: JSON.stringify({ email: emailOrNim, password }) }); localStorage.setItem('access_token', result.access); localStorage.setItem('refresh_token', result.refresh); return result.user; },
    register: async (data: Record<string, unknown>) => { const result = await request<AuthResponse>('/auth/register/', { method: 'POST', body: JSON.stringify({ ...data, role: 'student' }) }); localStorage.setItem('access_token', result.access); localStorage.setItem('refresh_token', result.refresh); return result.user; },
    getCurrentUser: () => request<User>('/auth/me/'),
    updateUser: (data: Partial<User>) => request<User>('/auth/me/', { method: 'PATCH', body: JSON.stringify(data) }),
    logout: () => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); },
  },
  equipment: {
    getAll: async (query = '') => items(await request<Equipment[] | { results: Equipment[] }>(`/equipment/${query}`)),
    getById: (id: string) => request<Equipment>(`/equipment/${id}/`),
    create: (data: Partial<Equipment>) => request<Equipment>('/equipment/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Equipment>) => request<Equipment>(`/equipment/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/equipment/${id}/`, { method: 'DELETE' }).then(() => true),
  },
  borrowings: {
    getAll: async (query = '') => items(await request<BorrowingRequest[] | { results: BorrowingRequest[] }>(`/borrowings/${query}`)),
    getById: (id: string) => request<BorrowingRequest>(`/borrowings/${id}/`),
    create: (data: Partial<BorrowingRequest>) => request<BorrowingRequest>('/borrowings/', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string, details = {}) => request<BorrowingRequest>(`/borrowings/${id}/update-status/`, { method: 'POST', body: JSON.stringify({ status, ...details }) }),
  },
  maintenance: { getAll: async () => items(await request<MaintenanceRecord[] | { results: MaintenanceRecord[] }>('/maintenance/')), create: (data: Partial<MaintenanceRecord>) => request<MaintenanceRecord>('/maintenance/', { method: 'POST', body: JSON.stringify(data) }), updateStatus: (id: string, status: string, notes?: string, cost?: number) => request<MaintenanceRecord>(`/maintenance/${id}/update-status/`, { method: 'POST', body: JSON.stringify({ status, notes, cost }) }) },
  notifications: { getAll: async () => items(await request<Notification[] | { results: Notification[] }>('/notifications/')), markAsRead: (id: string) => request<void>(`/notifications/${id}/read/`, { method: 'POST' }), markAllAsRead: () => request<void>('/notifications/read-all/', { method: 'POST' }) },
  rooms: { getAll: async () => items(await request<LabRoom[] | { results: LabRoom[] }>('/rooms/')) },
  users: { getAll: async () => items(await request<User[] | { results: User[] }>('/users/')), create: (data: Record<string, unknown>) => request<User>('/users/', { method: 'POST', body: JSON.stringify(data) }), update: (id: string, data: Partial<User>) => request<User>(`/users/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }) },
};