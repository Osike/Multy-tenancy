@@ .. @@
 // Dashboard Router Component
 function DashboardRouter() {
   const { user } = useAuth();

   if (!user) return <Navigate to="/login" replace />;

   switch (user.role) {
     case 'super_admin':
-      return <Navigate to="/super-admin" replace />;
+      return <Navigate to="/super-admin-dashboard" replace />;
     case 'company_admin':
-      return <Navigate to="/company-admin" replace />;
+      return <Navigate to="/company-admin-dashboard" replace />;
     case 'dispatcher':
-      return <Navigate to="/dispatcher" replace />;
+      return <Navigate to="/dispatcher-dashboard" replace />;
     case 'driver':
-      return <Navigate to="/driver" replace />;
+      return <Navigate to="/driver-dashboard" replace />;
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
-                path="/super-admin"
+                path="/super-admin-dashboard"
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
-                path="/company-admin"
+                path="/company-admin-dashboard"
                 element={
                   <ProtectedRoute allowedRoles={['company_admin']}>
                     <CompanyAdminDashboard />
                   </ProtectedRoute>
                 }
               />

               {/* Dispatcher Routes */}
               <Route
-                path="/dispatcher"
+                path="/dispatcher-dashboard"
                 element={
                   <ProtectedRoute allowedRoles={['dispatcher']}>
                     <DispatcherDashboard />
                   </ProtectedRoute>
                 }
               />

               {/* Driver Routes */}
               <Route
-                path="/driver"
+                path="/driver-dashboard"
                 element={
                   <ProtectedRoute allowedRoles={['driver']}>
                     <DriverDashboard />
                   </ProtectedRoute>
                 }
               />