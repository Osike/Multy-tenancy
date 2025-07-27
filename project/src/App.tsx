import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import CompanyAdminDashboard from './pages/CompanyAdminDashboard';
import DispatcherDashboard from './pages/DispatcherDashboard';
import DriverDashboard from './pages/DriverDashboard';
import CompanyList from './pages/CompanyList';
import CompanyForm from './pages/CompanyForm';
import UserList from './pages/UserList';
import UserForm from './pages/UserForm';
import TruckList from './pages/TruckList';
import TruckForm from './pages/TruckForm';
import CustomerList from './pages/CustomerList';
import CustomerForm from './pages/CustomerForm';
import TripList from './pages/TripList';
import TripForm from './pages/TripForm';
import TripDetail from './pages/TripDetail';
import Analytics from './pages/Analytics';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
}

// Dashboard Router Component
function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'super_admin':
      return <Navigate to="/super-admin" replace />;
    case 'company_admin':
      return <Navigate to="/company-admin" replace />;
    case 'dispatcher':
      return <Navigate to="/dispatcher" replace />;
    case 'driver':
      return <Navigate to="/driver" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Dashboard Redirect */}
              <Route path="/dashboard" element={<DashboardRouter />} />

              {/* Super Admin Routes */}
              <Route
                path="/super-admin"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/companies"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <CompanyList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/companies/new"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <CompanyForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/companies/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <CompanyForm />
                  </ProtectedRoute>
                }
              />

              {/* Company Admin Routes */}
              <Route
                path="/company-admin"
                element={
                  <ProtectedRoute allowedRoles={['company_admin']}>
                    <CompanyAdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Dispatcher Routes */}
              <Route
                path="/dispatcher"
                element={
                  <ProtectedRoute allowedRoles={['dispatcher']}>
                    <DispatcherDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Driver Routes */}
              <Route
                path="/driver"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverDashboard />
                  </ProtectedRoute>
                }
              />

              {/* User Management Routes */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['company_admin']}>
                    <UserList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/new"
                element={
                  <ProtectedRoute allowedRoles={['company_admin']}>
                    <UserForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['company_admin']}>
                    <UserForm />
                  </ProtectedRoute>
                }
              />

              {/* Truck Management Routes */}
              <Route
                path="/trucks"
                element={
                  <ProtectedRoute allowedRoles={['company_admin']}>
                    <TruckList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trucks/new"
                element={
                  <ProtectedRoute allowedRoles={['company_admin']}>
                    <TruckForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trucks/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['company_admin']}>
                    <TruckForm />
                  </ProtectedRoute>
                }
              />

              {/* Customer Management Routes */}
              <Route
                path="/customers"
                element={
                  <ProtectedRoute allowedRoles={['company_admin', 'dispatcher']}>
                    <CustomerList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers/new"
                element={
                  <ProtectedRoute allowedRoles={['company_admin', 'dispatcher']}>
                    <CustomerForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['company_admin', 'dispatcher']}>
                    <CustomerForm />
                  </ProtectedRoute>
                }
              />

              {/* Trip Management Routes */}
              <Route
                path="/trips"
                element={
                  <ProtectedRoute allowedRoles={['company_admin', 'dispatcher', 'driver']}>
                    <TripList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/new"
                element={
                  <ProtectedRoute allowedRoles={['company_admin', 'dispatcher']}>
                    <TripForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:id"
                element={
                  <ProtectedRoute allowedRoles={['company_admin', 'dispatcher', 'driver']}>
                    <TripDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['company_admin', 'dispatcher', 'driver']}>
                    <TripForm />
                  </ProtectedRoute>
                }
              />

              {/* Analytics Routes */}
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={['company_admin', 'dispatcher']}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;