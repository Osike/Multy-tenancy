@@ .. @@
   const getDashboardPath = () => {
     switch (user?.role) {
       case 'super_admin':
-        return '/super-admin';
+        return '/super-admin-dashboard';
       case 'company_admin':
-        return '/company-admin';
+        return '/company-admin-dashboard';
       case 'dispatcher':
-        return '/dispatcher';
+        return '/dispatcher-dashboard';
       case 'driver':
-        return '/driver';
+        return '/driver-dashboard';
       default:
         return '/';
     }
   };