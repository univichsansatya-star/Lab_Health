import {
  Equipment,
  BorrowingRequest,
  User,
  MaintenanceRecord,
  Notification,
  LabRoom,
} from '../types';
import {
  INITIAL_EQUIPMENT,
  INITIAL_BORROWING_REQUESTS,
  INITIAL_USERS,
  INITIAL_MAINTENANCE_RECORDS,
  INITIAL_NOTIFICATIONS,
  LAB_ROOMS,
} from './mockData';

const KEYS = {
  USERS: 'uis_healthlab_users',
  CURRENT_USER: 'uis_healthlab_current_user',
  EQUIPMENT: 'uis_healthlab_equipment',
  REQUESTS: 'uis_healthlab_requests',
  MAINTENANCE: 'uis_healthlab_maintenance',
  NOTIFICATIONS: 'uis_healthlab_notifications',
  ROOMS: 'uis_healthlab_rooms',
};

// Safe JSON Parse
function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

export const StorageService = {
  // Initialization
  initDefaults: () => {
    if (!localStorage.getItem(KEYS.EQUIPMENT)) {
      setStorage(KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
    }
    if (!localStorage.getItem(KEYS.REQUESTS)) {
      setStorage(KEYS.REQUESTS, INITIAL_BORROWING_REQUESTS);
    }
    if (!localStorage.getItem(KEYS.USERS)) {
      setStorage(KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(KEYS.CURRENT_USER)) {
      setStorage(KEYS.CURRENT_USER, INITIAL_USERS[0]); // Default to Siti (Student)
    }
    if (!localStorage.getItem(KEYS.MAINTENANCE)) {
      setStorage(KEYS.MAINTENANCE, INITIAL_MAINTENANCE_RECORDS);
    }
    if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
      setStorage(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!localStorage.getItem(KEYS.ROOMS)) {
      setStorage(KEYS.ROOMS, LAB_ROOMS);
    }
  },

  resetAllData: () => {
    setStorage(KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
    setStorage(KEYS.REQUESTS, INITIAL_BORROWING_REQUESTS);
    setStorage(KEYS.USERS, INITIAL_USERS);
    setStorage(KEYS.CURRENT_USER, INITIAL_USERS[0]);
    setStorage(KEYS.MAINTENANCE, INITIAL_MAINTENANCE_RECORDS);
    setStorage(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setStorage(KEYS.ROOMS, LAB_ROOMS);
  },

  resetDemoData: () => {
    StorageService.resetAllData();
  },

  // Auth / Users
  getCurrentUser: (): User => {
    return getStorage<User>(KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },

  setCurrentUser: (user: User) => {
    setStorage(KEYS.CURRENT_USER, user);
  },

  getUsers: (): User[] => {
    return getStorage<User[]>(KEYS.USERS, INITIAL_USERS);
  },

  addUser: (user: User): User => {
    const users = StorageService.getUsers();
    const updated = [user, ...users];
    setStorage(KEYS.USERS, updated);
    return user;
  },

  createUser: (user: Omit<User, 'id'>): User => {
    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}`,
    };
    return StorageService.addUser(newUser);
  },

  updateUser: (updatedUserOrId: User | string, updates?: Partial<User>): User | undefined => {
    const users = StorageService.getUsers();
    if (typeof updatedUserOrId === 'string') {
      const existing = users.find((u) => u.id === updatedUserOrId);
      if (!existing) return undefined;
      const merged: User = { ...existing, ...updates };
      const updated = users.map((u) => (u.id === updatedUserOrId ? merged : u));
      setStorage(KEYS.USERS, updated);
      const curr = StorageService.getCurrentUser();
      if (curr.id === updatedUserOrId) {
        StorageService.setCurrentUser(merged);
      }
      return merged;
    } else {
      const updated = users.map((u) => (u.id === updatedUserOrId.id ? updatedUserOrId : u));
      setStorage(KEYS.USERS, updated);
      const curr = StorageService.getCurrentUser();
      if (curr.id === updatedUserOrId.id) {
        StorageService.setCurrentUser(updatedUserOrId);
      }
      return updatedUserOrId;
    }
  },

  // Equipment
  getEquipment: (): Equipment[] => {
    return getStorage<Equipment[]>(KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
  },

  getEquipmentById: (id: string): Equipment | undefined => {
    const list = StorageService.getEquipment();
    return list.find((item) => item.id === id);
  },

  saveEquipment: (item: Equipment): Equipment => {
    const list = StorageService.getEquipment();
    const existingIndex = list.findIndex((eq) => eq.id === item.id);
    let updated: Equipment[];
    if (existingIndex >= 0) {
      updated = list.map((eq) => (eq.id === item.id ? item : eq));
    } else {
      updated = [item, ...list];
    }
    setStorage(KEYS.EQUIPMENT, updated);
    return item;
  },

  createEquipment: (item: Omit<Equipment, 'id'>): Equipment => {
    const newEq: Equipment = {
      ...item,
      id: `eq-${Date.now()}`,
    };
    return StorageService.saveEquipment(newEq);
  },

  updateEquipment: (id: string, updates: Partial<Equipment>): Equipment | undefined => {
    const list = StorageService.getEquipment();
    const existing = list.find((eq) => eq.id === id);
    if (!existing) return undefined;
    const merged: Equipment = { ...existing, ...updates };
    StorageService.saveEquipment(merged);
    return merged;
  },

  deleteEquipment: (id: string): boolean => {
    const list = StorageService.getEquipment();
    const updated = list.filter((eq) => eq.id !== id);
    setStorage(KEYS.EQUIPMENT, updated);
    return true;
  },

  // Borrowing Requests
  getRequests: (): BorrowingRequest[] => {
    return getStorage<BorrowingRequest[]>(KEYS.REQUESTS, INITIAL_BORROWING_REQUESTS);
  },

  getRequestById: (id: string): BorrowingRequest | undefined => {
    const list = StorageService.getRequests();
    return list.find((req) => req.id === id || req.ticketNumber === id);
  },

  createRequest: (req: Omit<BorrowingRequest, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>): BorrowingRequest => {
    const list = StorageService.getRequests();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const newRequest: BorrowingRequest = {
      ...req,
      id: `req-${Date.now()}`,
      ticketNumber: `REQ-${dateStr}-${randomNum}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Decrement available equipment quantity immediately or when approved
    const eqList = StorageService.getEquipment();
    const updatedEq = eqList.map((eq) => {
      const match = req.items.find((i) => i.equipmentId === eq.id);
      if (match) {
        return {
          ...eq,
          availableQuantity: Math.max(0, eq.availableQuantity - match.quantity),
          borrowedQuantity: eq.borrowedQuantity + match.quantity,
        };
      }
      return eq;
    });
    setStorage(KEYS.EQUIPMENT, updatedEq);

    const updated = [newRequest, ...list];
    setStorage(KEYS.REQUESTS, updated);

    // Add notification for staff
    StorageService.addNotification({
      targetRole: 'nurse_staff',
      title: 'Permohonan Peminjaman Masuk',
      message: `${req.userName} mengajukan peminjaman (${newRequest.ticketNumber}) untuk ${req.purpose}.`,
      type: 'request_status',
      isRead: false,
      link: `/staff/requests`,
    });

    return newRequest;
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
    fineAmountOptional?: number
  ): BorrowingRequest | undefined => {
    const list = StorageService.getRequests();
    let targetReq: BorrowingRequest | undefined;

    const detailsObj =
      typeof detailsOrNote === 'string'
        ? {
            adminNotes: detailsOrNote,
            rejectionReason: status === 'REJECTED' ? detailsOrNote : undefined,
            fineAmount: fineAmountOptional,
          }
        : detailsOrNote || {};

    const updated = list.map((req) => {
      if (req.id === id || req.ticketNumber === id) {
        targetReq = {
          ...req,
          status,
          ...detailsObj,
          updatedAt: new Date().toISOString(),
        };
        return targetReq;
      }
      return req;
    });

    if (targetReq) {
      setStorage(KEYS.REQUESTS, updated);

      // If returned or rejected or cancelled, replenish equipment quantity
      if (status === 'RETURNED' || status === 'REJECTED' || status === 'CANCELLED') {
        const eqList = StorageService.getEquipment();
        const updatedEq = eqList.map((eq) => {
          const match = targetReq!.items.find((i) => i.equipmentId === eq.id);
          if (match) {
            return {
              ...eq,
              availableQuantity: Math.min(eq.totalQuantity, eq.availableQuantity + match.quantity),
              borrowedQuantity: Math.max(0, eq.borrowedQuantity - match.quantity),
            };
          }
          return eq;
        });
        setStorage(KEYS.EQUIPMENT, updatedEq);
      }

      // Add user notification
      StorageService.addNotification({
        userId: targetReq.userId,
        title: `Status Peminjaman: ${status}`,
        message: `Tiket ${targetReq.ticketNumber} sekarang berstatus: ${status}.`,
        type: status === 'OVERDUE' ? 'overdue' : 'request_status',
        isRead: false,
        link: `/student/borrowings/${targetReq.id}`,
      });
    }

    return targetReq;
  },

  // Maintenance
  getMaintenanceRecords: (): MaintenanceRecord[] => {
    return getStorage<MaintenanceRecord[]>(KEYS.MAINTENANCE, INITIAL_MAINTENANCE_RECORDS);
  },

  getMaintenanceLogs: (): MaintenanceRecord[] => {
    return StorageService.getMaintenanceRecords();
  },

  addMaintenanceRecord: (
    record: Omit<MaintenanceRecord, 'id' | 'ticketNumber' | 'reportedDate'>
  ): MaintenanceRecord => {
    const list = StorageService.getMaintenanceRecords();
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const rand = Math.floor(10 + Math.random() * 90);
    const newRecord: MaintenanceRecord = {
      ...record,
      id: `maint-${Date.now()}`,
      ticketNumber: `MNT-${dateStr}-${rand}`,
      reportedDate: new Date().toISOString().slice(0, 10),
    };

    // Update equipment status
    const eqList = StorageService.getEquipment();
    const updatedEq = eqList.map((eq) => {
      if (eq.id === record.equipmentId) {
        return {
          ...eq,
          maintenanceQuantity: eq.maintenanceQuantity + 1,
          availableQuantity: Math.max(0, eq.availableQuantity - 1),
          condition: 'MAINTENANCE_REQUIRED' as const,
        };
      }
      return eq;
    });
    setStorage(KEYS.EQUIPMENT, updatedEq);

    const updated = [newRecord, ...list];
    setStorage(KEYS.MAINTENANCE, updated);
    return newRecord;
  },

  createMaintenanceLog: (record: any): MaintenanceRecord => {
    return StorageService.addMaintenanceRecord({
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
    });
  },

  updateMaintenanceLog: (id: string, updates: any) => {
    return StorageService.updateMaintenanceStatus(id, updates.status || 'COMPLETED', updates.description, updates.cost);
  },

  updateMaintenanceStatus: (
    id: string,
    status: MaintenanceRecord['status'],
    notes?: string,
    cost?: number
  ): MaintenanceRecord | undefined => {
    const list = StorageService.getMaintenanceRecords();
    let target: MaintenanceRecord | undefined;
    const updated = list.map((m) => {
      if (m.id === id) {
        target = {
          ...m,
          status,
          notes: notes || m.notes,
          cost: cost !== undefined ? cost : m.cost,
          completedDate: status === 'COMPLETED' ? new Date().toISOString().slice(0, 10) : m.completedDate,
        };
        return target;
      }
      return m;
    });

    if (target) {
      setStorage(KEYS.MAINTENANCE, updated);

      if (status === 'COMPLETED') {
        const eqList = StorageService.getEquipment();
        const updatedEq = eqList.map((eq) => {
          if (eq.id === target!.equipmentId) {
            return {
              ...eq,
              maintenanceQuantity: Math.max(0, eq.maintenanceQuantity - 1),
              availableQuantity: Math.min(eq.totalQuantity, eq.availableQuantity + 1),
              condition: 'GOOD' as const,
              lastInspectionDate: new Date().toISOString().slice(0, 10),
            };
          }
          return eq;
        });
        setStorage(KEYS.EQUIPMENT, updatedEq);
      }
    }

    return target;
  },

  // Notifications
  getNotifications: (): Notification[] => {
    return getStorage<Notification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  addNotification: (notif: Omit<Notification, 'id' | 'createdAt'>): Notification => {
    const list = StorageService.getNotifications();
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newNotif, ...list];
    setStorage(KEYS.NOTIFICATIONS, updated);
    return newNotif;
  },

  markNotificationAsRead: (id: string) => {
    const list = StorageService.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setStorage(KEYS.NOTIFICATIONS, updated);
  },

  markAllNotificationsAsRead: () => {
    const list = StorageService.getNotifications();
    const updated = list.map((n) => ({ ...n, isRead: true }));
    setStorage(KEYS.NOTIFICATIONS, updated);
  },

  // Rooms
  getRooms: (): LabRoom[] => {
    return getStorage<LabRoom[]>(KEYS.ROOMS, LAB_ROOMS);
  },
};
