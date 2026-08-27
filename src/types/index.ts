export type UserRole = 'student' | 'nurse_staff' | 'admin';

export interface User {
  id: string;
  name: string;
  nim_nip: string;
  email: string;
  role: UserRole;
  department: string;
  studyProgram?: string;
  semester?: number;
  phone: string;
  avatar?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  joinedDate: string;
}

export type EquipmentCategory =
  | 'Nursing Skills'
  | 'Maternity & Child Health'
  | 'Emergency & Critical Care'
  | 'Anatomy & Physiology'
  | 'Diagnostic & Vital Signs'
  | 'Surgical & Sterile Instruments'
  | 'Pharmacology & Labware';

export type EquipmentCondition =
  | 'EXCELLENT'
  | 'GOOD'
  | 'FAIR'
  | 'MAINTENANCE_REQUIRED'
  | 'DAMAGED';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  category: EquipmentCategory;
  brand: string;
  model: string;
  description: string;
  totalQuantity: number;
  availableQuantity: number;
  borrowedQuantity: number;
  maintenanceQuantity: number;
  condition: EquipmentCondition;
  location: string;
  imageUrl: string;
  specifications: string[];
  usageGuidelines: string[];
  isConsumable: boolean;
  requiresSpecialApproval: boolean;
  qrCode: string;
  createdAt: string;
  lastInspectionDate: string;
}

export type BorrowingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'READY_TO_PICKUP'
  | 'BORROWED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'OVERDUE'
  | 'CANCELLED';

export interface BorrowingItem {
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  quantity: number;
  imageUrl: string;
  location: string;
  conditionAtBorrow?: EquipmentCondition;
  conditionAtReturn?: EquipmentCondition;
  returnNotes?: string;
}

export interface BorrowingRequest {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userNim: string;
  userDepartment: string;
  userPhone: string;
  userRole: UserRole;
  purpose: string;
  courseName: string;
  supervisorLecturer: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: BorrowingStatus;
  items: BorrowingItem[];
  rejectionReason?: string;
  adminNotes?: string;
  handoverStaffName?: string;
  returnStaffName?: string;
  signatureStudent?: string;
  signatureStaff?: string;
  fineAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  ticketNumber: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCode: string;
  location?: string;
  issueDescription: string;
  reportedBy: string;
  reportedDate: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'SCRAPPED';
  technician?: string;
  cost?: number;
  notes?: string;
  completedDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export type MaintenanceLog = MaintenanceRecord;

export interface Notification {
  id: string;
  userId?: string; // empty means broadcast/staff
  targetRole?: UserRole | 'all';
  title: string;
  message: string;
  type: 'request_status' | 'due_reminder' | 'overdue' | 'maintenance' | 'general';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface LabRoom {
  id: string;
  code: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  supervisor: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
  activeClass?: string;
}

export interface CartItem {
  equipment: Equipment;
  quantity: number;
}

export interface EquipmentFilterState {
  search: string;
  category: string;
  availability: 'all' | 'available_only' | 'low_stock';
  condition: string;
  location: string;
  sortBy: 'name_asc' | 'name_desc' | 'available_desc' | 'popular';
}
