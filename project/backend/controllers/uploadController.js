@@ .. @@
 import multer from 'multer';
 import path from 'path';
 import fs from 'fs';
 import { fileURLToPath } from 'url';

 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);

+// Ensure uploads directory exists
+const uploadsDir = path.join(__dirname, '../uploads');
+if (!fs.existsSync(uploadsDir)) {
+  fs.mkdirSync(uploadsDir, { recursive: true });
+}

 // Configure multer for file uploads
 const storage = multer.diskStorage({
   destination: (req, file, cb) => {
-    const uploadPath = path.join(__dirname, '../uploads');
-    
-    // Create directory if it doesn't exist
-    if (!fs.existsSync(uploadPath)) {
-      fs.mkdirSync(uploadPath, { recursive: true });
-    }
-    
-    cb(null, uploadPath);
+    // Create company-specific subdirectory
+    const companyDir = path.join(uploadsDir, req.user.companyId.toString());
+    if (!fs.existsSync(companyDir)) {
+      fs.mkdirSync(companyDir, { recursive: true });
+    }
+    cb(null, companyDir);
   },
   filename: (req, file, cb) => {
-    // Generate unique filename
-    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
-    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
+    // Generate secure filename with timestamp and random string
+    const timestamp = Date.now();
+    const randomString = Math.random().toString(36).substring(2, 15);
+    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
+    const extension = path.extname(sanitizedName).toLowerCase();
+    cb(null, `${timestamp}-${randomString}-${path.basename(sanitizedName, extension)}${extension}`);
   },
 });

+// File filter function
+const fileFilter = (req, file, cb) => {
+  // Check file type
+  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
+  if (!allowedTypes.includes(file.mimetype)) {
+    return cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
+  }
+  
+  // Check file extension
+  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
+  const fileExtension = path.extname(file.originalname).toLowerCase();
+  if (!allowedExtensions.includes(fileExtension)) {
+    return cb(new Error('Invalid file extension.'), false);
+  }
+  
+  cb(null, true);
+};

 const upload = multer({
   storage,
+  fileFilter,
   limits: {
     fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
+    files: 1, // Only allow 1 file per upload
   },
-  fileFilter: (req, file, cb) => {
-    // Check file type
-    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
-    if (allowedTypes.includes(file.mimetype)) {
-      cb(null, true);
-    } else {
-      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
-    }
-  },
 });

 // @desc    Upload single file
 // @route   POST /api/upload/single
 // @access  Private
 export const uploadSingle = (req, res) => {
   const uploadMiddleware = upload.single('file');
   
   uploadMiddleware(req, res, (err) => {
     if (err instanceof multer.MulterError) {
       if (err.code === 'LIMIT_FILE_SIZE') {
         return res.status(400).json({
           success: false,
           message: 'File too large. Maximum size is 5MB.',
         });
       }
+      if (err.code === 'LIMIT_FILE_COUNT') {
+        return res.status(400).json({
+          success: false,
+          message: 'Too many files. Only 1 file allowed per upload.',
+        });
+      }
       return res.status(400).json({
         success: false,
         message: err.message,
       });
     } else if (err) {
       return res.status(400).json({
         success: false,
         message: err.message,
       });
     }

     if (!req.file) {
       return res.status(400).json({
         success: false,
         message: 'No file uploaded',
       });
     }

+    // Validate file size again (double-check)
+    if (req.file.size > 5 * 1024 * 1024) {
+      // Delete the uploaded file
+      fs.unlinkSync(req.file.path);
+      return res.status(400).json({
+        success: false,
+        message: 'File too large. Maximum size is 5MB.',
+      });
+    }

     // Return file information
     res.status(200).json({
       success: true,
       message: 'File uploaded successfully',
       data: {
         fileName: req.file.originalname,
-        filePath: `/uploads/${req.file.filename}`,
+        filePath: `/uploads/${req.user.companyId}/${req.file.filename}`,
         fileType: req.file.mimetype,
         fileSize: req.file.size,
+        uploadedAt: new Date().toISOString(),
       },
     });
   });
 };

+// @desc    Delete uploaded file
+// @route   DELETE /api/upload/:filename
+// @access  Private
+export const deleteFile = (req, res) => {
+  try {
+    const { filename } = req.params;
+    
+    // Validate filename to prevent directory traversal
+    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
+      return res.status(400).json({
+        success: false,
+        message: 'Invalid filename',
+      });
+    }
+    
+    const filePath = path.join(uploadsDir, req.user.companyId.toString(), filename);
+    
+    // Check if file exists
+    if (!fs.existsSync(filePath)) {
+      return res.status(404).json({
+        success: false,
+        message: 'File not found',
+      });
+    }
+    
+    // Delete the file
+    fs.unlinkSync(filePath);
+    
+    res.status(200).json({
+      success: true,
+      message: 'File deleted successfully',
+    });
+  } catch (error) {
+    console.error('Delete file error:', error);
+    res.status(500).json({
+      success: false,
+      message: 'Failed to delete file',
+      error: error.message,
+    });
+  }
+};
+
+// @desc    Get file info
+// @route   GET /api/upload/:filename
+// @access  Private
+export const getFileInfo = (req, res) => {
+  try {
+    const { filename } = req.params;
+    
+    // Validate filename
+    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
+      return res.status(400).json({
+        success: false,
+        message: 'Invalid filename',
+      });
+    }
+    
+    const filePath = path.join(uploadsDir, req.user.companyId.toString(), filename);
+    
+    // Check if file exists
+    if (!fs.existsSync(filePath)) {
+      return res.status(404).json({
+        success: false,
+        message: 'File not found',
+      });
+    }
+    
+    const stats = fs.statSync(filePath);
+    
+    res.status(200).json({
+      success: true,
+      data: {
+        filename,
+        size: stats.size,
+        createdAt: stats.birthtime,
+        modifiedAt: stats.mtime,
+      },
+    });
+  } catch (error) {
+    console.error('Get file info error:', error);
+    res.status(500).json({
+      success: false,
+      message: 'Failed to get file information',
+      error: error.message,
+    });
+  }
+};