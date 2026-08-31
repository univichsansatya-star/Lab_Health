import { StorageService } from './storage';
import {
  Equipment,
  BorrowingRequest,
  User,
  MaintenanceRecord,
  Notification,
  LabRoom,
} from '../types';

// The API base URL configured via environment variable
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://api.healthlab.ichsansatya.ac.id/v1';

// Simulate slight realistic network latency for TanStack Query
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // Auth & Profile
  auth: {
    getCurrentUser: async (): Promise<User> => {
      await delay();
      return StorageService.getCurrentUser();
    },
    login: async (emailOrNim: string, _role?: string): Promise<User> => {
      await delay(200);
      const users = StorageService.getUsers();
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === emailOrNim.toLowerCase() ||
          u.nim_nip.toLowerCase() === emailOrNim.toLowerCase()
      );
      if (found) {
        StorageService.setCurrentUser(found);
        return found;
      }
      // Fallback first user if demo
      const def = users[0];
      StorageService.setCurrentUser(def);
      return def;
    },
    switchUser: async (userId: string): Promise<User> => {
      await delay(100);
      const users = StorageService.getUsers();
      const found = users.find((u) => u.id === userId) || users[0];
      StorageService.setCurrentUser(found);
      return found;
    },
    register: async (userData: Omit<User, 'id' | 'status' | 'joinedDate'>): Promise<User> => {
      await delay(300);
      const newUser: User = {
        ...userData,
        id: `usr-${Date.now()}`,
        status: 'ACTIVE',
        joinedDate: new Date().toISOString().slice(0, 10),
      };
      StorageService.addUser(newUser);
      StorageService.setCurrentUser(newUser);
      return newUser;
    },
    getUsers: async (): Promise<User[]> => {
      await delay();
      return StorageService.getUsers();
    },
    updateUser: async (user: User): Promise<User> => {
      await delay();
      return StorageService.updateUser(user);
    },
  },

  // Equipment
  equipment: {
    getAll: async (): Promise<Equipment[]> => {
      await delay(150);
      return StorageService.getEquipment();
    },
    getById: async (id: string): Promise<Equipment> => {
      await delay(100);
      const item = StorageService.getEquipmentById(id);
      if (!item) throw new Error('Equipment not found');
      return item;
    },
    create: async (item: Omit<Equipment, 'id' | 'createdAt'>): Promise<Equipment> => {
      await delay(250);
      const newEq: Equipment = {
        ...item,
        id: `eq-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return StorageService.saveEquipment(newEq);
    },
    update: async (item: Equipment): Promise<Equipment> => {
      await delay(200);
      return StorageService.saveEquipment(item);
    },
    delete: async (id: string): Promise<boolean> => {
      await delay(150);
      return StorageService.deleteEquipment(id);
    },
  },

  // Borrowing Requests
  borrowings: {
    getAll: async (userId?: string): Promise<BorrowingRequest[]> => {
      await delay(150);
      const list = StorageService.getRequests();
      if (userId) {
        return list.filter((r) => r.userId === userId);
      }
      return list;
    },
    getById: async (id: string): Promise<BorrowingRequest> => {
      await delay(100);
      const req = StorageService.getRequestById(id);
      if (!req) throw new Error('Borrowing request not found');
      return req;
    },
    create: async (
      data: Omit<BorrowingRequest, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>
    ): Promise<BorrowingRequest> => {
      await delay(300);
      return StorageService.createRequest(data);
    },
    updateStatus: async (
      id: string,
      status: BorrowingRequest['status'],
      details?: {
        rejectionReason?: string;
        adminNotes?: string;
        handoverStaffName?: string;
        returnStaffName?: string;
        fineAmount?: number;
        actualReturnDate?: string;
      }
    ): Promise<BorrowingRequest> => {
      await delay(200);
      const res = StorageService.updateRequestStatus(id, status, details);
      if (!res) throw new Error('Failed to update request');
      return res;
    },
  },

  // Maintenance
  maintenance: {
    getAll: async (): Promise<MaintenanceRecord[]> => {
      await delay(150);
      return StorageService.getMaintenanceRecords();
    },
    create: async (
      data: Omit<MaintenanceRecord, 'id' | 'ticketNumber' | 'reportedDate'>
    ): Promise<MaintenanceRecord> => {
      await delay(250);
      return StorageService.addMaintenanceRecord(data);
    },
    updateStatus: async (
      id: string,
      status: MaintenanceRecord['status'],
      notes?: string,
      cost?: number
    ): Promise<MaintenanceRecord> => {
      await delay(200);
      const res = StorageService.updateMaintenanceStatus(id, status, notes, cost);
      if (!res) throw new Error('Maintenance record not found');
      return res;
    },
  },

  // Notifications
  notifications: {
    getAll: async (userId?: string, role?: string): Promise<Notification[]> => {
      await delay(100);
      const list = StorageService.getNotifications();
      return list.filter((n) => {
        if (n.userId && userId && n.userId === userId) return true;
        if (n.targetRole && role && (n.targetRole === role || n.targetRole === 'all')) return true;
        if (!n.userId && !n.targetRole) return true;
        return false;
      });
    },
    markAsRead: async (id: string): Promise<void> => {
      StorageService.markNotificationAsRead(id);
    },
    markAllAsRead: async (): Promise<void> => {
      StorageService.markAllNotificationsAsRead();
    },
  },

  // Rooms
  rooms: {
    getAll: async (): Promise<LabRoom[]> => {
      await delay(100);
      return StorageService.getRooms();
    },
  },

  // System
  system: {
    resetDemoData: async () => {
      await delay(300);
      StorageService.resetAllData();
    },
  },
};
