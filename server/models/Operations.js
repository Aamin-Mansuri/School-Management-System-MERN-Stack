import mongoose from 'mongoose';

// Library Book Schema
const libraryBookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    available: { type: Number, required: true, default: 1 },
    shelfLocation: String,
    price: Number,
    status: { type: String, enum: ['Available', 'Issued', 'Lost', 'Damaged'], default: 'Available' },
  },
  { timestamps: true }
);

// Transport Schema
const transportSchema = new mongoose.Schema(
  {
    routeName: { type: String, required: true },
    routeNumber: { type: String, default: 'RT-01' },
    startPoint: { type: String, default: 'Campus Gate' },
    endPoint: { type: String, default: 'City Center' },
    vehicleNumber: { type: String, required: true },
    vehicleModel: { type: String, default: 'Standard Bus' },
    vehicleType: { type: String, enum: ['Bus', 'Mini-Bus', 'Van', 'Electric Bus'], default: 'Bus' },
    fuelType: { type: String, enum: ['Diesel', 'Electric', 'CNG', 'Petrol'], default: 'Diesel' },
    insuranceValidity: { type: String, default: '2026-12-31' },
    driverName: { type: String, required: true },
    driverPhone: { type: String, required: true },
    driverLicense: { type: String, default: 'DL-982314' },
    driverEmergencyPhone: String,
    capacity: { type: Number, default: 35 },
    stops: [
      {
        stopName: String,
        pickupTime: String,
        dropTime: String,
        fare: Number,
        sequence: Number,
      },
    ],
    assignedStudents: [
      {
        studentId: String,
        studentName: String,
        rollNumber: String,
        admissionNumber: String,
        className: String,
        sectionName: String,
        stopName: String,
        pickupTime: String,
        dropTime: String,
        fare: Number,
        seatNumber: String,
        emergencyContact: String,
        assignedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
      },
    ],
    assignedStudentsCount: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Maintenance', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

// Hostel Schema
const hostelSchema = new mongoose.Schema(
  {
    buildingName: { type: String, required: true },
    type: { type: String, enum: ['Boys', 'Girls', 'Co-ed'], default: 'Boys' },
    wardenName: { type: String, required: true },
    wardenPhone: { type: String, required: true },
    totalRooms: { type: Number, required: true },
    rooms: [
      {
        roomNumber: String,
        floor: Number,
        capacity: Number,
        occupiedBeds: Number,
        feePerTerm: Number,
        students: [
          {
            studentId: String,
            studentName: String,
            admissionNumber: String,
            bedNumber: Number,
            checkInDate: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// Leave Request Schema
const leaveSchema = new mongoose.Schema(
  {
    applicantId: { type: String, required: true },
    applicantName: { type: String, required: true },
    applicantRole: { type: String, enum: ['Student', 'Teacher', 'Staff', 'Principal', 'Admin', 'Super Admin', 'School Admin', 'Accountant', 'Receptionist', 'Member'], required: true },
    leaveType: {
      type: String,
      enum: ['Sick Leave', 'Casual Leave', 'Emergency Leave', 'Vacation', 'Maternity/Paternity'],
      required: true,
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true },
    attachmentUrl: String,
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    actionBy: String,
    actionDate: String,
    adminRemark: String,
  },
  { timestamps: true }
);

// Notice Schema
const noticeSchema = new mongoose.Schema(
  {
    circularNumber: { type: String, default: '' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: 'General Circular' },
    targetAudience: {
      type: String,
      enum: ['All', 'Teachers', 'Students', 'Parents', 'Class Specific'],
      default: 'All',
    },
    targetClassId: String,
    targetClassName: String,
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    publishDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    effectiveDate: { type: String, default: '' },
    expiryDate: String,
    authorName: { type: String, required: true },
    authorRole: { type: String, default: 'Admin' },
    attachmentUrl: String,
    isPinned: { type: Boolean, default: false },
    status: { type: String, enum: ['Published', 'Draft', 'Archived'], default: 'Published' },
  },
  { timestamps: true }
);

// Event Schema
const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    eventType: {
      type: String,
      enum: ['Academic', 'Holiday', 'Sports', 'Cultural', 'Exam', 'Meeting', 'Workshop'],
      default: 'Academic',
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    location: String,
    organizer: String,
    audience: {
      type: String,
      enum: ['All', 'Teachers', 'Students', 'Parents'],
      default: 'All',
    },
  },
  { timestamps: true }
);

// Notification Schema
const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // target user or 'ALL'
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['Assignment', 'Attendance', 'Exam', 'Fee', 'Notice', 'Event', 'System', 'Leave'],
      default: 'System',
    },
    link: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Internal Message Schema
const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, required: true },
    senderAvatar: String,
    recipientId: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientRole: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    parentMessageId: String,
  },
  { timestamps: true }
);

export const LibraryBook = mongoose.models.LibraryBook || mongoose.model('LibraryBook', libraryBookSchema);
export const Transport = mongoose.models.Transport || mongoose.model('Transport', transportSchema);
export const Hostel = mongoose.models.Hostel || mongoose.model('Hostel', hostelSchema);
export const Leave = mongoose.models.Leave || mongoose.model('Leave', leaveSchema);
export const Notice = mongoose.models.Notice || mongoose.model('Notice', noticeSchema);
export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

// Book Issue Schema
const bookIssueSchema = new mongoose.Schema(
  {
    bookId: { type: String, required: true },
    bookTitle: { type: String, required: true },
    author: String,
    isbn: String,
    category: String,
    shelfLocation: String,
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    returnDate: String,
    status: { type: String, enum: ['Issued', 'Returned', 'Overdue', 'Lost'], default: 'Issued' },
    fine: { type: Number, default: 0 },
    renewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Fee Reminder Log Schema
const feeReminderSchema = new mongoose.Schema(
  {
    feeId: { type: String, required: true },
    studentId: String,
    studentName: String,
    admissionNumber: String,
    className: String,
    parentName: String,
    parentEmail: String,
    parentPhone: String,
    feeTitle: String,
    feeType: String,
    totalAmount: Number,
    dueAmount: Number,
    dueDate: String,
    isOverdue: { type: Boolean, default: false },
    daysOverdue: { type: Number, default: 0 },
    emailSubject: String,
    emailHtml: String,
    status: { type: String, enum: ['Delivered', 'Failed', 'Pending'], default: 'Delivered' },
    deliveryMethod: { type: String, default: 'Email' },
    sentAt: { type: String, default: () => new Date().toISOString() },
    sentBy: String,
    reminderType: { type: String, enum: ['Automated Schedule', 'Manual Dispatch'], default: 'Manual Dispatch' },
    escalationLevel: { type: String, default: 'Standard' },
  },
  { timestamps: true }
);

export const BookIssue = mongoose.models.BookIssue || mongoose.model('BookIssue', bookIssueSchema);
export const FeeReminder = mongoose.models.FeeReminder || mongoose.model('FeeReminder', feeReminderSchema);
