import {
  Equipment,
  BorrowingRequest,
  User,
  MaintenanceRecord,
  Notification,
  LabRoom,
} from '../types';
import { api, hasAccessToken } from './api';

type Cache = {
  currentUser: User | null;
  users: User[];
  equipment: Equipment[];
  requests: BorrowingRequest[];
  maintenance: MaintenanceRecord[];
  notifications: Notification[];
  rooms: LabRoom[];
};

const cache: Cache = {
  currentUser: null,
  users: [],
  equipment: [],
  requests: [],
  maintenance: [],
  notifications: [],
  rooms: [],
};

let bootstrapPromise: Promise<void> | null = null;

const replaceById = <T extends { id: string }>(items: T[], value: T) => {
  const index = items.findIndex((item) => item.id === value.id);
  if (index === -1) return [value, ...items];
  return items.map((item) => (item.id === value.id ? value : item));
};

const refreshPrivateData = async () => {
  if (!hasAccessToken()) return;

  const results = await Promise.allSettled([
    api.auth.getUsers(),
    api.equipment.getAll(),
    api.borrowings.getAll(),
    api.maintenance.getAll(),
    api.notifications.getAll(),
    api.rooms.getAll(),
  ]);

  const [users, equipment, requests, maintenance, notifications, rooms] = results;
  if (users.status === 'fulfilled') cache.users = users.value;
  if (equipment.status === 'fulfilled') cache.equipment = equipment.value;
  if (requests.status === 'fulfilled') cache.requests = requests.value;
  if (maintenance.status === 'fulfilled') cache.maintenance = maintenance.value;
  if (notifications.status === 'fulfilled') cache.notifications = notifications.value;
  if (rooms.status === 'fulfilled') cache.rooms = rooms.value;

  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.warn('Django resource request failed:', result.reason);
    }
  });
};

export const StorageService = {
  bootstrapPublic: async () => {
    const [equipment, rooms] = await Promise.allSettled([
      api.equipment.getAll(),
      api.rooms.getAll(),
    ]);
    if (equipment.status === 'fulfilled') cache.equipment = equipment.value;
    else console.warn('Public equipment request failed:', equipment.reason);
    if (rooms.status === 'fulfilled') cache.rooms = rooms.value;
    else console.warn('Public rooms request failed:', rooms.reason);
  },

  bootstrap: async () => {
    if (bootstrapPromise) return bootstrapPromise;
    bootstrapPromise = refreshPrivateData().finally(() => {
      bootstrapPromise = null;
    });
    return bootstrapPromise;
  },

  clear: () => {
    cache.currentUser = null;
    cache.users = [];
    cache.equipment = [];
    cache.requests = [];
    cache.maintenance = [];
    cache.notifications = [];
    cache.rooms = [];
  },

  initDefaults: () => undefined,

  resetAllData: () => {
    throw new Error('Demo data reset is disabled while Django is the data source.');
  },

  resetDemoData: () => {
    throw new Error('Demo data reset is disabled while Django is the data source.');
  },

  getCurrentUser: () => cache.currentUser,

  setCurrentUser: (user: User | null) => {
    cache.currentUser = user;
  },

  getUsers: () => cache.users,

  addUser: (user: User) => {
    cache.users = replaceById(cache.users, user);
    return user;
  },

  createUser: async (user: Omit<User, 'id' | 'joinedDate'>, password: string) => {
    const created = await api.users.create(user, password);
    cache.users = replaceById(cache.users, created);
    return created;
  },

  updateUser: (updatedUserOrId: User | string, updates?: Partial<User>) => {
    const current =
      typeof updatedUserOrId === 'string'
        ? cache.users.find((user) => user.id === updatedUserOrId)
        : updatedUserOrId;
    if (!current) return undefined;
    const updated = typeof updatedUserOrId === 'string' ? { ...current, ...updates } : updatedUserOrId;
    cache.users = replaceById(cache.users, updated);
    if (cache.currentUser?.id === updated.id) cache.currentUser = updated;
    void api.users.update(updated.id, updates || updated).catch((error) => {
      console.error('Failed to update user in Django:', error);
    });
    return updated;
  },

  getEquipment: () => cache.equipment,

  getEquipmentById: (id: string) => cache.equipment.find((item) => item.id === id),

  saveEquipment: (item: Equipment) => {
    cache.equipment = replaceById(cache.equipment, item);
    void api.equipment.update(item).then((saved) => {
      cache.equipment = replaceById(cache.equipment, saved);
    }).catch((error) => {
      console.error('Failed to update equipment in Django:', error);
    });
    return item;
  },

  createEquipment: (item: Omit<Equipment, 'id'>) => {
    const pending = {
      ...item,
      id: `pending-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    cache.equipment = [pending, ...cache.equipment];
    void api.equipment.create(item).then((created) => {
      cache.equipment = replaceById(
        cache.equipment.filter((equipment) => equipment.id !== pending.id),
        created,
      );
    }).catch((error) => {
      console.error('Failed to create equipment in Django:', error);
    });
    return pending;
  },

  updateEquipment: (id: string, updates: Partial<Equipment>) => {
    const existing = cache.equipment.find((item) => item.id === id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    cache.equipment = replaceById(cache.equipment, updated);
    void api.equipment.update(updated).then((saved) => {
      cache.equipment = replaceById(cache.equipment, saved);
    }).catch((error) => {
      console.error('Failed to update equipment in Django:', error);
    });
    return updated;
  },

  deleteEquipment: (id: string) => {
    cache.equipment = cache.equipment.filter((item) => item.id !== id);
    void api.equipment.delete(id).catch((error) => {
      console.error('Failed to delete equipment in Django:', error);
    });
    return true;
  },

  getRequests: () => cache.requests,

  getRequestById: (id: string) =>
    cache.requests.find((request) => request.id === id || request.ticketNumber === id),

  createRequest: (data: Omit<BorrowingRequest, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => {
    const pending = {
      ...data,
      id: `pending-${Date.now()}`,
      ticketNumber: `PENDING-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    cache.requests = [pending, ...cache.requests];
    void api.borrowings.create(data).then((created) => {
      cache.requests = replaceById(
        cache.requests.filter((request) => request.id !== pending.id),
        created,
      );
    }).catch((error) => {
      console.error('Failed to create borrowing request in Django:', error);
    });
    return pending;
  },

  updateRequestStatus: (
    id: string,
    status: BorrowingRequest['status'],
    detailsOrNote?:
      | string
      | {
          rejectionReason?: string;
          adminNotes?: string;
          handoverStaffName?: string;
          returnStaffName?: string;
          fineAmount?: number;
          actualReturnDate?: string;
        },
    fineAmountOptional?: number,
  ) => {
    const existing = StorageService.getRequestById(id);
    if (!existing) return undefined;
    const details =
      typeof detailsOrNote === 'string'
        ? {
            adminNotes: detailsOrNote,
            rejectionReason: status === 'REJECTED' ? detailsOrNote : undefined,
            fineAmount: fineAmountOptional,
          }
        : detailsOrNote || {};
    const updated = { ...existing, status, ...details, updatedAt: new Date().toISOString() };
    cache.requests = replaceById(cache.requests, updated);
    void api.borrowings.updateStatus(existing.id, status, details).then((saved) => {
      cache.requests = replaceById(cache.requests, saved);
    }).catch((error) => {
      console.error('Failed to update borrowing request in Django:', error);
    });
    return updated;
  },

  getMaintenanceRecords: () => cache.maintenance,

  getMaintenanceLogs: () => cache.maintenance,

  addMaintenanceRecord: (data: Omit<MaintenanceRecord, 'id' | 'ticketNumber' | 'reportedDate'>) => {
    const pending = {
      ...data,
      id: `pending-${Date.now()}`,
      ticketNumber: `PENDING-${Date.now()}`,
      reportedDate: new Date().toISOString().slice(0, 10),
    };
    cache.maintenance = [pending, ...cache.maintenance];
    void api.maintenance.create(data).then((created) => {
      cache.maintenance = replaceById(
        cache.maintenance.filter((record) => record.id !== pending.id),
        created,
      );
    }).catch((error) => {
      console.error('Failed to create maintenance record in Django:', error);
    });
    return pending;
  },

  createMaintenanceLog: (record: any) =>
    StorageService.addMaintenanceRecord({
      equipmentId: record.equipmentId,
      equipmentName: record.equipmentName,
      equipmentCode: record.equipmentCode,
      reportedBy: record.performedBy || 'Petugas Laboratorium',
      issueDescription: record.description || 'Kalibrasi / Perbaikan',
      priority: 'MEDIUM',
      status: record.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
      cost: record.cost,
      notes: record.description,
      technician: record.performedBy,
    }),

  updateMaintenanceLog: (id: string, updates: any) =>
    StorageService.updateMaintenanceStatus(id, updates.status || 'COMPLETED', updates.description, updates.cost),

  updateMaintenanceStatus: (
    id: string,
    status: MaintenanceRecord['status'],
    notes?: string,
    cost?: number,
  ) => {
    const existing = cache.maintenance.find((record) => record.id === id);
    if (!existing) return undefined;
    const updated = { ...existing, status, notes: notes || existing.notes, cost };
    cache.maintenance = replaceById(cache.maintenance, updated);
    void api.maintenance.updateStatus(id, status, notes, cost).then((saved) => {
      cache.maintenance = replaceById(cache.maintenance, saved);
    }).catch((error) => {
      console.error('Failed to update maintenance record in Django:', error);
    });
    return updated;
  },

  getNotifications: () => cache.notifications,

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const pending = {
      ...notification,
      id: `pending-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    cache.notifications = [pending, ...cache.notifications];
    return pending;
  },

  markNotificationAsRead: (id: string) => {
    cache.notifications = cache.notifications.map((notification) =>
      notification.id === id ? { ...notification, isRead: true } : notification,
    );
    void api.notifications.markAsRead(id).catch((error) => {
      console.error('Failed to mark notification in Django:', error);
    });
  },

  markAllNotificationsAsRead: () => {
    cache.notifications = cache.notifications.map((notification) => ({ ...notification, isRead: true }));
    void api.notifications.markAllAsRead().catch((error) => {
      console.error('Failed to mark notifications in Django:', error);
    });
  },

  getRooms: () => cache.rooms,
};