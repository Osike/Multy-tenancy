// MongoDB Database Initialization Script for TDMS
// Run this script in MongoDB Compass or MongoDB Shell

// 1. Create the database
use('tdms_database');

// 2. Create initial super admin user
// Note: Password will be hashed by the application, this is just for reference
db.users.insertOne({
  username: "superadmin",
  email: "admin@tdms.com",
  // Password: "admin123" (will be hashed by bcrypt in the application)
  role: "super_admin",
  fullName: "System Administrator",
  phoneNumber: "+1234567890",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 3. Create sample company
const companyId = new ObjectId();
db.companies.insertOne({
  _id: companyId,
  companyName: "Demo Logistics Co.",
  contactEmail: "contact@demologistics.com",
  address: "123 Business Street, Demo City, DC 12345",
  phoneNumber: "+1234567890",
  registrationNumber: "DLC-2024-001",
  status: "Active",
  subscriptionPlan: "Premium",
  maxUsers: 50,
  maxTrucks: 100,
  features: ["trip_management", "analytics", "customer_management"],
  createdAt: new Date(),
  updatedAt: new Date()
});

// 4. Create sample company admin
db.users.insertOne({
  companyId: companyId,
  username: "companyadmin",
  email: "admin@demologistics.com",
  // Password: "admin123" (will be hashed by bcrypt in the application)
  role: "company_admin",
  fullName: "Company Administrator",
  phoneNumber: "+1234567891",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 5. Create sample dispatcher
db.users.insertOne({
  companyId: companyId,
  username: "dispatcher1",
  email: "dispatcher@demologistics.com",
  // Password: "admin123" (will be hashed by bcrypt in the application)
  role: "dispatcher",
  fullName: "John Dispatcher",
  phoneNumber: "+1234567892",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 6. Create sample driver
const driverId = new ObjectId();
db.users.insertOne({
  _id: driverId,
  companyId: companyId,
  username: "driver1",
  email: "driver@demologistics.com",
  // Password: "admin123" (will be hashed by bcrypt in the application)
  role: "driver",
  fullName: "Mike Driver",
  phoneNumber: "+1234567893",
  licenseNumber: "DL123456789",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 7. Create sample truck
const truckId = new ObjectId();
db.trucks.insertOne({
  _id: truckId,
  companyId: companyId,
  plateNumber: "DEMO-001",
  model: "Freightliner Cascadia",
  year: 2022,
  capacity: 53,
  fuelType: "Diesel",
  status: "Available",
  mileage: 45000,
  lastMaintenanceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  nextMaintenanceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
  createdAt: new Date(),
  updatedAt: new Date()
});

// 8. Create sample customer
const customerId = new ObjectId();
db.customers.insertOne({
  _id: customerId,
  companyId: companyId,
  customerName: "ABC Manufacturing",
  contactPerson: "Jane Smith",
  email: "jane@abcmanufacturing.com",
  phoneNumber: "+1234567894",
  address: "456 Industrial Blvd, Factory City, FC 67890",
  customerType: "Corporate",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 9. Create sample trip with new structure
db.trips.insertOne({
  companyId: companyId,
  tripId: "TRP-001",
  truck: truckId,
  driver: driverId,
  tripDate: new Date(),
  fromLocation: "Mombasa Port, Kenya",
  toLocation: "Nairobi CBD, Kenya",
  // Cargo/Goods Information
  cargoDetails: {
    goodsType: "Electronics Components",
    weight: 15000,
    weightUnit: "lbs",
    description: "High-value electronic components for manufacturing",
    specialRequirements: ["Fragile", "Temperature Controlled", "Secure Transport"]
  },
  customer: customerId,
  // Revenue Section
  rate: 2500.00,
  currency: "USD",
  // Trip Expenses
  fuelCost: 400.00,
  mileageCost: 150.00,
  driverSalary: 300.00,
  roadTolls: 50.00,
  // Maintenance Expenses
  maintenanceExpenses: [
    {
      itemService: "Oil Change",
      cost: 75.00,
      serviceProvider: "AutoShop XYZ",
      date: new Date(),
      notes: "Regular maintenance service"
    },
    {
      itemService: "Tire Replacement",
      cost: 200.00,
      serviceProvider: "Tire Pro Service",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      notes: "Front tires replacement due to wear"
    }
  ],
  // Comments & Attachments
  comments: "Regular delivery route. Customer prefers morning delivery. Handle with care - fragile electronics.",
  attachments: [],
  status: "Scheduled",
  recordedBy: new ObjectId("507f1f77bcf86cd799439011"), // Will be updated with actual dispatcher ID
  createdAt: new Date(),
  updatedAt: new Date()
});

print("✅ Database initialization completed!");
print("📊 Created:");
print("   - 1 Super Admin user");
print("   - 1 Demo company");
print("   - 3 Company users (admin, dispatcher, driver)");
print("   - 1 Sample truck");
print("   - 1 Sample customer");
print("   - 1 Sample trip");
print("");
print("🔑 Default login credentials (password will be hashed by app):");
print("   Super Admin: admin@tdms.com / admin123");
print("   Company Admin: admin@demologistics.com / admin123");
print("   Dispatcher: dispatcher@demologistics.com / admin123");
print("   Driver: driver@demologistics.com / admin123");
