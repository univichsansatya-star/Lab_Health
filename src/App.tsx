import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { MainLayout } from './components/layout/MainLayout';
import { StaffLayout } from './components/layout/StaffLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { EquipmentCatalog } from './pages/student/EquipmentCatalog';
import { EquipmentDetail } from './pages/student/EquipmentDetail';
import { BorrowingRequestWizard } from './pages/student/BorrowingRequestWizard';
import { MyBorrowings } from './pages/student/MyBorrowings';
import { BorrowingDetailView } from './pages/student/BorrowingDetailView';
import { StudentNotifications } from './pages/student/StudentNotifications';
import { StudentProfile } from './pages/student/StudentProfile';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { InventoryManagement } from './pages/staff/InventoryManagement';
import { BorrowingRequestsManagement } from './pages/staff/BorrowingRequestsManagement';
import { StaffBorrowingDetail } from './pages/staff/StaffBorrowingDetail';
import { ReturnManagement } from './pages/staff/ReturnManagement';
import { MaintenanceManagement } from './pages/staff/MaintenanceManagement';
import { LabReports } from './pages/staff/LabReports';
import { UserManagement } from './pages/staff/UserManagement';
import { StaffSettings } from './pages/staff/StaffSettings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <Routes>
              {/* Public & Student Routes under MainLayout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/catalog" element={<EquipmentCatalog />} />
                <Route path="/catalog/:id" element={<EquipmentDetail />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Student specific portal paths */}
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/request-wizard" element={<BorrowingRequestWizard />} />
                <Route path="/student/borrowings" element={<MyBorrowings />} />
                <Route path="/student/borrowings/:id" element={<BorrowingDetailView />} />
                <Route path="/student/notifications" element={<StudentNotifications />} />
                <Route path="/student/profile" element={<StudentProfile />} />
              </Route>

              {/* Staff / Admin Routes under StaffLayout */}
              <Route path="/staff" element={<StaffLayout />}>
                <Route index element={<Navigate to="/staff/dashboard" replace />} />
                <Route path="dashboard" element={<StaffDashboard />} />
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="requests" element={<BorrowingRequestsManagement />} />
                <Route path="requests/:id" element={<StaffBorrowingDetail />} />
                <Route path="returns" element={<ReturnManagement />} />
                <Route path="maintenance" element={<MaintenanceManagement />} />
                <Route path="reports" element={<LabReports />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="settings" element={<StaffSettings />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
