import {
  Equipment,
  BorrowingRequest,
  User,
  MaintenanceRecord,
  Notification,
  LabRoom,
} from '../types';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/backend-api';

type AuthResponse = {
  access: string;
  user: User;
};

type EquipmentPayload = Omit<Equipment, 'id' | 'createdAt' | 'lastInspectionDate'>;
type BorrowingPayload = Pick<
  BorrowingRequest,
  'purpose' | 'courseName' | 'supervisorLecturer' | 'borrowDate' | 'expectedReturnDate' | 'items'
> & { adminNotes?: string };
type MaintenancePayload = Omit<
  MaintenanceRecord,
  'id' | 'ticketNumber' | 'reportedDate' | 'equipmentName' | 'equipmentCode' | 'location'
>;

let accessToken: string | null = null;

const getAccessToken = () => accessToken;

const setAccessToken = (token: string) => {
  accessToken = token;
};

const clearTokens = () => {
  accessToken = null;
};

// The refresh token lives in an HttpOnly cookie; this endpoint only needs the
// cookie, which the browser sends automatically on a same-origin request.
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: '{}',
    });
    if (!response.ok) return false;
    const payload = (await response.json()) as { access?: string };
    if (!payload.access) return false;
    setAccessToken(payload.access);
    return true;
  } catch {
    return false;
  }
};

const request = async <T>(
  path: string,
  options: RequestInit = {},
  authenticated = true,
  retryAfterRefresh = true,
): Promise<T> => {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (authenticated) {
    const token = getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const requestInit: RequestInit = { ...options, headers };
  if (['GET', 'HEAD'].includes(requestInit.method || 'GET')) {
    delete requestInit.body;
  }
  const response = await fetch(`${API_BASE_URL}${path}`, requestInit);
  const raw = await response.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = raw;
    }
  }

  if (
    response.status === 401 &&
    authenticated &&
    retryAfterRefresh &&
    !path.startsWith('/auth/refresh/')
  ) {
    if (await refreshAccessToken()) {
      return request<T>(path, options, authenticated, false);
    }
  }

  if (!response.ok) {
    const detail =
      typeof payload === 'object' && payload !== null && 'detail' in payload
        ? String((payload as { detail: unknown }).detail)
        : `Request failed with status ${response.status}`;
    const error = new Error(detail);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return payload as T;
};

const json = (value: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(value),
});

export const hasAccessToken = () => Boolean(getAccessToken());

export const api = {
  auth: {
    getCurrentUser: () => request<User>('/auth/me/'),

    silentRefresh: refreshAccessToken,

    requestPasswordReset: (emailOrNim: string) =>
      request<{ detail: string }>('/auth/password-reset/', json({ emailOrNim }), false),

    confirmPasswordReset: (uid: string, token: string, newPassword: string) =>
      request<{ detail: string }>(
        '/auth/password-reset/confirm/',
        json({ uid, token, newPassword }),
        false,
      ),

    login: async (emailOrNim: string, password: string): Promise<User> => {
      const response = await request<AuthResponse>(
        '/auth/login/',
        json({ email: emailOrNim, emailOrNim, password }),
        false,
      );
      setAccessToken(response.access);
      return response.user;
    },

    register: async (
      userData: Omit<User, 'id' | 'status' | 'joinedDate'>,
      password: string,
    ): Promise<User> => {
      const response = await request<AuthResponse>(
        '/auth/register/',
        json({ ...userData, password }),
        false,
      );
      setAccessToken(response.access);
      return response.user;
    },

    logout: async () => {
      try {
        await request<unknown>('/auth/logout/', json({}), true, false);
      } catch {
        // Ignore errors when blacklisting a refresh token server-side.
      }
      clearTokens();
    },

    getUsers: () => request<User[]>('/users/'),

    updateUser: (user: User) =>
      request<User>('/auth/me/', {
        ...json(user),
        method: 'PATCH',
      }),
  },

  users: {
    create: (user: Omit<User, 'id' | 'joinedDate'>, password: string) => {
      const { status: _status, ...payload } = user;
      return request<User>('/users/create/', {
        ...json({ ...payload, password }),
        method: 'POST',
      });
    },

    update: (id: string, updates: Partial<User>) =>
      request<User>(`/users/${id}/`, {
        ...json(updates),
        method: 'PATCH',
      }),
  },

  equipment: {
    getAll: () => request<Equipment[]>('/equipment/'),

    getById: (id: string) => request<Equipment>(`/equipment/${id}/`),

    create: (item: EquipmentPayload) =>
      request<Equipment>('/equipment/', {
        ...json(item),
        method: 'POST',
      }),

    update: (idOrItem: string | Equipment, updates?: Partial<EquipmentPayload>) => {
      const id = typeof idOrItem === 'string' ? idOrItem : idOrItem.id;
      const payload = typeof idOrItem === 'string' ? updates : idOrItem;
      return request<Equipment>(`/equipment/${id}/`, {
        ...json(payload),
        method: 'PATCH',
      });
    },

    delete: async (id: string) => {
      await request<unknown>(`/equipment/${id}/`, { method: 'DELETE' });
      return true;
    },
  },

  borrowings: {
    getAll: () => request<BorrowingRequest[]>('/borrowings/'),

    getById: (id: string) => request<BorrowingRequest>(`/borrowings/${id}/`),

    create: (data: BorrowingPayload) =>
      request<BorrowingRequest>('/borrowings/', {
        ...json(data),
        method: 'POST',
      }),

    updateStatus: (
      id: string,
      status: BorrowingRequest['status'],
      details?: {
        rejectionReason?: string;
        adminNotes?: string;
        handoverStaffName?: string;
        returnStaffName?: string;
        fineAmount?: number;
        actualReturnDate?: string;
      },
    ) =>
      request<BorrowingRequest>(`/borrowings/${id}/update-status/`, {
        ...json({ status, ...details }),
        method: 'POST',
      }),
  },

  maintenance: {
    getAll: () => request<MaintenanceRecord[]>('/maintenance/'),

    create: (data: MaintenancePayload) =>
      request<MaintenanceRecord>('/maintenance/', {
        ...json(data),
        method: 'POST',
      }),

    updateStatus: (
      id: string,
      status: MaintenanceRecord['status'],
      notes?: string,
      cost?: number,
    ) =>
      request<MaintenanceRecord>(`/maintenance/${id}/update-status/`, {
        ...json({ status, notes, cost }),
        method: 'POST',
      }),
  },

  notifications: {
    getAll: (_userId?: string, _role?: string) => request<Notification[]>('/notifications/'),

    markAsRead: (id: string) =>
      request<Notification>(`/notifications/${id}/read/`, { method: 'POST' }),

    markAllAsRead: () => request<{ updated: number }>('/notifications/read-all/', { method: 'POST' }),
  },

  rooms: {
    getAll: () => request<LabRoom[]>('/rooms/'),
  },
};