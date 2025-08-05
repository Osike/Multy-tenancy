@@ .. @@
 import React, { useState } from 'react';
 import { useNavigate, Link } from 'react-router-dom';
 import { useAuth } from '../contexts/AuthContext';
 import { EyeIcon, EyeSlashIcon, TruckIcon } from '@heroicons/react/24/outline';
 import LoadingSpinner from '../components/LoadingSpinner';

 function RegisterPage() {
   const navigate = useNavigate();
   const { register } = useAuth();
   const [formData, setFormData] = useState({
     username: '',
     email: '',
     password: '',
     confirmPassword: '',
     role: 'company_admin',
     fullName: '',
     phoneNumber: '',
     companyName: '',
     contactEmail: '',
+    licenseNumber: '',
   });
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
     const { name, value } = e.target;
     setFormData(prev => ({
       ...prev,
       [name]: value,
     }));
     if (error) setError('');
   };

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);
     setError('');

+    // Basic validation
+    if (!formData.username || !formData.email || !formData.password || !formData.fullName) {
+      setError('Please fill in all required fields');
+      setLoading(false);
+      return;
+    }
+
+    if (formData.username.length < 3) {
+      setError('Username must be at least 3 characters long');
+      setLoading(false);
+      return;
+    }
+
+    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
+      setError('Username can only contain letters, numbers, and underscores');
+      setLoading(false);
+      return;
+    }
+
+    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
+      setError('Please enter a valid email address');
+      setLoading(false);
+      return;
+    }

     // Validation
     if (formData.password !== formData.confirmPassword) {
       setError('Passwords do not match');
       setLoading(false);
       return;
     }

     if (formData.password.length < 6) {
       setError('Password must be at least 6 characters long');
       setLoading(false);
       return;
     }

+    // Role-specific validation
+    if (formData.role === 'company_admin') {
+      if (!formData.companyName || !formData.contactEmail) {
+        setError('Company name and contact email are required for company administrators');
+        setLoading(false);
+        return;
+      }
+    }
+
+    if (formData.role === 'driver' && !formData.licenseNumber) {
+      setError('License number is required for drivers');
+      setLoading(false);
+      return;
+    }

     try {
       const registrationData = {
         username: formData.username,
         email: formData.email,
         password: formData.password,
         role: formData.role,
         fullName: formData.fullName,
         phoneNumber: formData.phoneNumber,
-        companyName: formData.companyName,
-        contactEmail: formData.contactEmail,
+        ...(formData.role === 'company_admin' && {
+          companyName: formData.companyName,
+          contactEmail: formData.contactEmail,
+        }),
+        ...(formData.role === 'driver' && {
+          licenseNumber: formData.licenseNumber,
+        }),
       };

       await register(registrationData);
       navigate('/dashboard');
     } catch (error: any) {
       setError(error.message || 'Registration failed. Please try again.');
     } finally {
       setLoading(false);
     }
   };

   return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
       <div className="max-w-md w-full space-y-8">
         {/* Header */}
         <div>
           <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
             <TruckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
           </div>
           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
             Create your account
           </h2>
           <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
             Join the Truck Data Management System
           </p>
         </div>

         {/* Registration Form */}
         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
           {error && (
             <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
               <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
             </div>
           )}

           <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                   Full Name *
                 </label>
                 <input
                   id="fullName"
                   name="fullName"
                   type="text"
                   required
                   value={formData.fullName}
                   onChange={handleInputChange}
+                  disabled={loading}
                   className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                   placeholder="Enter your full name"
                 />
               </div>

               <div>
                 <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                   Username *
                 </label>
                 <input
                   id="username"
                   name="username"
                   type="text"
                   required
                   value={formData.username}
                   onChange={handleInputChange}
+                  disabled={loading}
                   className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                   placeholder="Choose a username"
                 />
               </div>
             </div>

             <div>
               <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                 Email address *
               </label>
               <input
                 id="email"
                 name="email"
                 type="email"
                 autoComplete="email"
                 required
                 value={formData.email}
                 onChange={handleInputChange}
+                disabled={loading}
                 className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                 placeholder="Enter your email"
               />
             </div>

             <div>
               <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                 Phone Number
               </label>
               <input
                 id="phoneNumber"
                 name="phoneNumber"
                 type="tel"
                 value={formData.phoneNumber}
                 onChange={handleInputChange}
+                disabled={loading}
                 className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                 placeholder="Enter your phone number"
               />
             </div>

+            <div>
+              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
+                Role *
+              </label>
+              <select
+                id="role"
+                name="role"
+                value={formData.role}
+                onChange={handleInputChange}
+                disabled={loading}
+                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
+              >
+                <option value="company_admin">Company Administrator</option>
+                <option value="dispatcher">Dispatcher</option>
+                <option value="driver">Driver</option>
+              </select>
+            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                   Password *
                 </label>
                 <div className="mt-1 relative">
                   <input
                     id="password"
                     name="password"
                     type={showPassword ? 'text' : 'password'}
                     autoComplete="new-password"
                     required
                     value={formData.password}
                     onChange={handleInputChange}
+                    disabled={loading}
                     className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     placeholder="Create a password"
                   />
                   <button
                     type="button"
                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
                     onClick={() => setShowPassword(!showPassword)}
+                    disabled={loading}
                   >
                     {showPassword ? (
                       <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                     ) : (
                       <EyeIcon className="h-5 w-5 text-gray-400" />
                     )}
                   </button>
                 </div>
               </div>

               <div>
                 <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                   Confirm Password *
                 </label>
                 <div className="mt-1 relative">
                   <input
                     id="confirmPassword"
                     name="confirmPassword"
                     type={showConfirmPassword ? 'text' : 'password'}
                     autoComplete="new-password"
                     required
                     value={formData.confirmPassword}
                     onChange={handleInputChange}
+                    disabled={loading}
                     className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     placeholder="Confirm your password"
                   />
                   <button
                     type="button"
                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
+                    disabled={loading}
                   >
                     {showConfirmPassword ? (
                       <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                     ) : (
                       <EyeIcon className="h-5 w-5 text-gray-400" />
                     )}
                   </button>
                 </div>
               </div>
             </div>

-            <div>
-              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
-                Company Name *
-              </label>
-              <input
-                id="companyName"
-                name="companyName"
-                type="text"
-                required
-                value={formData.companyName}
-                onChange={handleInputChange}
-                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
-                placeholder="Enter your company name"
-              />
-            </div>
-
-            <div>
-              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
-                Company Contact Email *
-              </label>
-              <input
-                id="contactEmail"
-                name="contactEmail"
-                type="email"
-                required
-                value={formData.contactEmail}
-                onChange={handleInputChange}
-                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
-                placeholder="Enter company contact email"
-              />
-            </div>
+            {/* Company Admin specific fields */}
+            {formData.role === 'company_admin' && (
+              <>
+                <div>
+                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
+                    Company Name *
+                  </label>
+                  <input
+                    id="companyName"
+                    name="companyName"
+                    type="text"
+                    required
+                    value={formData.companyName}
+                    onChange={handleInputChange}
+                    disabled={loading}
+                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
+                    placeholder="Enter your company name"
+                  />
+                </div>
+
+                <div>
+                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
+                    Company Contact Email *
+                  </label>
+                  <input
+                    id="contactEmail"
+                    name="contactEmail"
+                    type="email"
+                    required
+                    value={formData.contactEmail}
+                    onChange={handleInputChange}
+                    disabled={loading}
+                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
+                    placeholder="Enter company contact email"
+                  />
+                </div>
+              </>
+            )}
+
+            {/* Driver specific fields */}
+            {formData.role === 'driver' && (
+              <div>
+                <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
+                  License Number *
+                </label>
+                <input
+                  id="licenseNumber"
+                  name="licenseNumber"
+                  type="text"
+                  required
+                  value={formData.licenseNumber}
+                  onChange={handleInputChange}
+                  disabled={loading}
+                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
+                  placeholder="Enter your driver's license number"
+                />
+              </div>
+            )}
           </div>

           <div>
             <button
               type="submit"
               disabled={loading}
               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {loading ? (
                 <div className="flex items-center">
                   <LoadingSpinner size="sm" />
                   <span className="ml-2">Creating account...</span>
                 </div>
               ) : (
                 'Create Account'
               )}
             </button>
           </div>

           <div className="text-center">
             <Link
               to="/login"
               className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500"
             >
               Already have an account? Sign in
             </Link>
           </div>
         </form>
       </div>
     </div>
   );
 }

 export default RegisterPage;