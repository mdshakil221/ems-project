import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import EmployeeDashboard from "../pages/EmployeeDashboard";
import EmployeesPage from "../features/employees/pages/EmployeesPage";
import AttendancePage from "../features/attendance/pages/AttendancePage";
import LeavePage from "../features/leave/pages/LeavePage";
import TasksPage from "../features/tasks/pages/TasksPage";
import NotificationsPage from "../features/notifications/pages/NotificationsPage";
import Layout from "../components/layout/Layout";
import EmployeeLayout from "../components/layout/EmployeeLayout";
import SalaryPage from "../features/salary/pages/SalaryPage";
import PerformancePage from "../features/performance/pages/PerformancePage";
import ReportsPage from "../pages/ReportsPage";
import AdminProfile from "../pages/AdminProfile";
import AnnouncementsPage from "../features/announcements/pages/AnnouncementsPage";
import HolidaysPage from "../features/holidays/pages/HolidaysPage";
import DocumentsPage from "../features/documents/pages/DocumentsPage";
import ActivityLogPage from "../features/activityLog/pages/ActivityLogPage";

import MyTasksPage from "../pages/employee/MyTasksPage";
import MyLeavesPage from "../pages/employee/MyLeavesPage";
import MyProfilePage from "../pages/employee/MyProfilePage";
import MySalaryPage from "../pages/employee/MySalaryPage";
import MyPerformancePage from "../pages/employee/MyPerformancePage";


const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/employee/dashboard" replace />;
  return children;
};

const EmployeeRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "employee") return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === "admin") return <Navigate to="/" replace />;
  if (user?.role === "employee") return <Navigate to="/employee/dashboard" replace />;
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

      {/* Admin Only */}
      <Route path="/" element={<AdminRoute><Layout /></AdminRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="activity-log" element={<ActivityLogPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="salary" element={<SalaryPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="performance" element={<PerformancePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="admin-profile" element={<AdminProfile />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="holidays" element={<HolidaysPage />} />
        <Route path="documents" element={<DocumentsPage />} />
      </Route>

      {/* Employee Only */}
      <Route path="/employee" element={<EmployeeRoute><EmployeeLayout /></EmployeeRoute>}>
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="tasks" element={<MyTasksPage />} />
        <Route path="leaves" element={<MyLeavesPage />} />
        <Route path="profile" element={<MyProfilePage />} />
        <Route path="salary" element={<MySalaryPage />} />
        <Route path="performance" element={<MyPerformancePage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="holidays" element={<HolidaysPage />} />
        <Route path="documents" element={<DocumentsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}