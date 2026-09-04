import { db } from '../data/store.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// ==================== LIBRARY ====================
export const getLibraryBooks = asyncHandler(async (req, res) => {
  const { search, category, status } = req.query;
  let books = await db.libraryBooks.find({});

  if (category) books = books.filter((b) => b.category === category);
  if (status) books = books.filter((b) => b.status === status);
  if (search) {
    const s = search.toLowerCase();
    books = books.filter(
      (b) => b.title?.toLowerCase().includes(s) || b.author?.toLowerCase().includes(s) || b.isbn?.includes(s)
    );
  }
  return sendSuccess(res, 200, 'Library books fetched', books);
});

export const createLibraryBook = asyncHandler(async (req, res) => {
  const { title, author, isbn, category, quantity = 1, shelfLocation, price } = req.body;
  if (!title || !author || !isbn) {
    return sendError(res, 400, 'Title, author, and ISBN are required');
  }
  const book = await db.libraryBooks.create({
    title,
    author,
    isbn,
    category: category || 'General',
    quantity: Number(quantity),
    available: Number(quantity),
    shelfLocation: shelfLocation || 'Rack A1',
    price: Number(price) || 25,
    status: 'Available',
  });
  return sendSuccess(res, 201, 'Book added to library catalog', book);
});

export const getBookIssues = asyncHandler(async (req, res) => {
  const { studentId, status } = req.query;
  let issues = await db.bookIssues.find({});

  if (studentId) {
    issues = issues.filter((i) => i.studentId === studentId);
  }
  if (status) {
    issues = issues.filter((i) => i.status === status);
  }

  // Scoping for student role
  if (req.user && req.user.role === 'Student') {
    let studentRec = await db.students.findOne({
      $or: [{ userId: req.user._id }, { email: req.user.email }],
    });
    if (!studentRec && req.user.name) {
      const parts = req.user.name.trim().split(' ');
      studentRec = await db.students.findOne({
        firstName: { $regex: parts[0], $options: 'i' },
      });
    }
    const sid = studentRec ? studentRec._id : req.user._id;
    issues = issues.filter((i) => i.studentId === sid || i.studentName?.toLowerCase() === req.user.name?.toLowerCase());
  }

  return sendSuccess(res, 200, 'Book issues fetched', issues);
});

export const renewLibraryBook = asyncHandler(async (req, res) => {
  const { issueId } = req.params;
  const { additionalDays = 14 } = req.body;
  const issue = await db.bookIssues.findById(issueId);
  if (!issue) return sendError(res, 404, 'Issue record not found');

  const currDue = new Date(issue.dueDate || Date.now());
  const newDue = new Date(currDue.getTime() + Number(additionalDays) * 24 * 3600 * 1000).toISOString().split('T')[0];

  const updated = await db.bookIssues.findByIdAndUpdate(issueId, {
    dueDate: newDue,
    renewCount: (issue.renewCount || 0) + 1,
    status: 'Issued',
  });

  return sendSuccess(res, 200, `Book loan renewed until ${newDue}`, updated);
});

export const issueLibraryBook = asyncHandler(async (req, res) => {
  const { bookId, studentId, studentName, dueDate } = req.body;
  const book = await db.libraryBooks.findById(bookId);
  if (!book) return sendError(res, 404, 'Book not found');
  if (book.available <= 0) return sendError(res, 400, 'No available copies of this book in stock');

  let sName = studentName;
  let sid = studentId;

  if (sid && !sName) {
    const st = await db.students.findById(sid);
    if (st) sName = `${st.firstName} ${st.lastName}`;
  }

  const issueRecord = await db.bookIssues.create({
    bookId,
    bookTitle: book.title,
    author: book.author,
    isbn: book.isbn,
    category: book.category,
    shelfLocation: book.shelfLocation,
    studentId: sid || (req.user ? req.user._id : 'st-1'),
    studentName: sName || (req.user ? req.user.name : 'Student'),
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: dueDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'Issued',
    fine: 0,
    renewCount: 0,
  });

  await db.libraryBooks.findByIdAndUpdate(bookId, {
    available: book.available - 1,
    status: book.available - 1 === 0 ? 'Issued' : 'Available',
  });

  return sendSuccess(res, 200, 'Book issued successfully', issueRecord);
});

export const returnLibraryBook = asyncHandler(async (req, res) => {
  const { issueId } = req.params;
  const issue = await db.bookIssues.findById(issueId);
  if (!issue) return sendError(res, 404, 'Issue record not found');

  const book = await db.libraryBooks.findById(issue.bookId);
  if (book) {
    await db.libraryBooks.findByIdAndUpdate(book._id, {
      available: (book.available || 0) + 1,
      status: 'Available',
    });
  }

  const updated = await db.bookIssues.findByIdAndUpdate(issueId, {
    returnDate: new Date().toISOString().split('T')[0],
    status: 'Returned',
  });

  return sendSuccess(res, 200, 'Book returned successfully', updated);
});

// ==================== TRANSPORT ====================
export const getTransports = asyncHandler(async (req, res) => {
  const transports = await db.transports.find({});
  // Ensure assignedStudents array and count are well-structured
  const formatted = transports.map((t) => {
    const assignedStudents = t.assignedStudents || [];
    return {
      ...t,
      assignedStudents,
      assignedStudentsCount: assignedStudents.length || t.assignedStudentsCount || 0,
    };
  });
  return sendSuccess(res, 200, 'Transport routes fetched', formatted);
});

export const getTransportById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const transport = await db.transports.findById(id);
  if (!transport) {
    return sendError(res, 404, 'Transport route not found');
  }
  const assignedStudents = transport.assignedStudents || [];
  return sendSuccess(res, 200, 'Transport route details fetched', {
    ...transport,
    assignedStudents,
    assignedStudentsCount: assignedStudents.length,
  });
});

export const createTransport = asyncHandler(async (req, res) => {
  const {
    routeName,
    routeNumber,
    startPoint,
    endPoint,
    vehicleNumber,
    vehicleModel,
    vehicleType = 'Bus',
    fuelType = 'Diesel',
    insuranceValidity,
    driverName,
    driverPhone,
    driverLicense,
    driverEmergencyPhone,
    capacity = 35,
    stops = [],
    status = 'Active',
  } = req.body;

  if (!routeName || !vehicleNumber || !driverName || !driverPhone) {
    return sendError(res, 400, 'Route name, vehicle number, driver name, and driver phone are required');
  }

  // Ensure stops have sequence numbers
  const formattedStops = (stops && stops.length > 0)
    ? stops.map((s, idx) => ({
        stopName: s.stopName || `Stop ${idx + 1}`,
        pickupTime: s.pickupTime || '07:30 AM',
        dropTime: s.dropTime || '03:30 PM',
        fare: Number(s.fare) || 50,
        sequence: s.sequence !== undefined ? Number(s.sequence) : idx + 1,
      }))
    : [
        { stopName: 'Main Campus Terminal', pickupTime: '07:00 AM', dropTime: '04:00 PM', fare: 0, sequence: 1 },
        { stopName: 'North Gate Crossing', pickupTime: '07:20 AM', dropTime: '03:40 PM', fare: 45, sequence: 2 },
        { stopName: 'Central Square Station', pickupTime: '07:40 AM', dropTime: '03:20 PM', fare: 65, sequence: 3 },
      ];

  const transport = await db.transports.create({
    routeName,
    routeNumber: routeNumber || `RT-${Math.floor(100 + Math.random() * 900)}`,
    startPoint: startPoint || 'Main Campus Terminal',
    endPoint: endPoint || 'Central Square',
    vehicleNumber,
    vehicleModel: vehicleModel || 'Standard School Transit Coach',
    vehicleType,
    fuelType,
    insuranceValidity: insuranceValidity || '2026-12-31',
    driverName,
    driverPhone,
    driverLicense: driverLicense || 'DL-COMM-2024',
    driverEmergencyPhone: driverEmergencyPhone || driverPhone,
    capacity: Number(capacity) || 35,
    stops: formattedStops,
    assignedStudents: [],
    assignedStudentsCount: 0,
    status: status || 'Active',
  });

  return sendSuccess(res, 201, 'Transport route created successfully', transport);
});

export const updateTransport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const transport = await db.transports.findById(id);
  if (!transport) {
    return sendError(res, 404, 'Transport route not found');
  }

  const {
    routeName,
    routeNumber,
    startPoint,
    endPoint,
    vehicleNumber,
    vehicleModel,
    vehicleType,
    fuelType,
    insuranceValidity,
    driverName,
    driverPhone,
    driverLicense,
    driverEmergencyPhone,
    capacity,
    stops,
    status,
  } = req.body;

  const updateData = {};
  if (routeName !== undefined) updateData.routeName = routeName;
  if (routeNumber !== undefined) updateData.routeNumber = routeNumber;
  if (startPoint !== undefined) updateData.startPoint = startPoint;
  if (endPoint !== undefined) updateData.endPoint = endPoint;
  if (vehicleNumber !== undefined) updateData.vehicleNumber = vehicleNumber;
  if (vehicleModel !== undefined) updateData.vehicleModel = vehicleModel;
  if (vehicleType !== undefined) updateData.vehicleType = vehicleType;
  if (fuelType !== undefined) updateData.fuelType = fuelType;
  if (insuranceValidity !== undefined) updateData.insuranceValidity = insuranceValidity;
  if (driverName !== undefined) updateData.driverName = driverName;
  if (driverPhone !== undefined) updateData.driverPhone = driverPhone;
  if (driverLicense !== undefined) updateData.driverLicense = driverLicense;
  if (driverEmergencyPhone !== undefined) updateData.driverEmergencyPhone = driverEmergencyPhone;
  if (capacity !== undefined) updateData.capacity = Number(capacity);
  if (status !== undefined) updateData.status = status;
  if (stops !== undefined) {
    updateData.stops = stops.map((s, idx) => ({
      stopName: s.stopName || `Stop ${idx + 1}`,
      pickupTime: s.pickupTime || '07:30 AM',
      dropTime: s.dropTime || '03:30 PM',
      fare: Number(s.fare) || 50,
      sequence: s.sequence !== undefined ? Number(s.sequence) : idx + 1,
    }));
  }

  const updated = await db.transports.findByIdAndUpdate(id, updateData);
  return sendSuccess(res, 200, 'Transport route updated successfully', updated);
});

export const deleteTransport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const transport = await db.transports.findById(id);
  if (!transport) {
    return sendError(res, 404, 'Transport route not found');
  }

  await db.transports.findByIdAndDelete(id);
  return sendSuccess(res, 200, 'Transport route removed successfully');
});

export const assignStudentToRoute = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    studentId,
    studentName,
    rollNumber,
    admissionNumber,
    className,
    sectionName,
    stopName,
    pickupTime,
    dropTime,
    fare,
    seatNumber,
    emergencyContact,
  } = req.body;

  if (!studentId || !stopName) {
    return sendError(res, 400, 'Student ID and Stop Name are required');
  }

  const transport = await db.transports.findById(id);
  if (!transport) {
    return sendError(res, 404, 'Transport route not found');
  }

  // Get student details if not fully provided
  let sName = studentName;
  let sRoll = rollNumber;
  let sAdm = admissionNumber;
  let sClass = className;
  let sSection = sectionName;
  let sEmergency = emergencyContact;

  if (!sName || !sAdm) {
    const student = await db.students.findById(studentId);
    if (student) {
      sName = `${student.firstName} ${student.lastName}`;
      sRoll = student.rollNumber;
      sAdm = student.admissionNumber;
      sClass = student.className;
      sSection = student.sectionName;
      sEmergency = student.emergencyContact?.phone || student.phone || student.parentInfo?.parentPhone || '';
    }
  }

  // Find stop timings if not provided
  let pTime = pickupTime;
  let dTime = dropTime;
  let sFare = Number(fare);
  if (!pTime || !dTime) {
    const stopObj = (transport.stops || []).find((s) => s.stopName === stopName);
    if (stopObj) {
      pTime = stopObj.pickupTime;
      dTime = stopObj.dropTime;
      if (isNaN(sFare) || sFare === undefined) sFare = stopObj.fare;
    }
  }

  // Remove from any previous route to avoid duplicate assignments
  const allRoutes = await db.transports.find({});
  for (const r of allRoutes) {
    if (r.assignedStudents && r.assignedStudents.some((s) => s.studentId === studentId)) {
      const filtered = r.assignedStudents.filter((s) => s.studentId !== studentId);
      await db.transports.findByIdAndUpdate(r._id, {
        assignedStudents: filtered,
        assignedStudentsCount: filtered.length,
      });
    }
  }

  // Reload the current transport
  const currentTransport = await db.transports.findById(id);
  const currentAssignments = currentTransport.assignedStudents || [];

  if (currentAssignments.length >= (currentTransport.capacity || 35)) {
    return sendError(res, 400, 'This transport route has reached maximum seating capacity');
  }

  const newAssignment = {
    studentId,
    studentName: sName || 'Assigned Student',
    rollNumber: sRoll || '',
    admissionNumber: sAdm || `ADM-${studentId.slice(-4)}`,
    className: sClass || 'Grade 10',
    sectionName: sSection || 'Section A',
    stopName,
    pickupTime: pTime || '07:30 AM',
    dropTime: dTime || '03:30 PM',
    fare: Number(sFare) || 50,
    seatNumber: seatNumber || `Seat-${currentAssignments.length + 1}`,
    emergencyContact: sEmergency || '',
    assignedDate: new Date().toISOString().split('T')[0],
  };

  const updatedAssignments = [...currentAssignments, newAssignment];
  const updatedTransport = await db.transports.findByIdAndUpdate(id, {
    assignedStudents: updatedAssignments,
    assignedStudentsCount: updatedAssignments.length,
  });

  return sendSuccess(res, 200, `${sName || 'Student'} successfully assigned to ${transport.routeName}`, {
    transport: updatedTransport,
    assignment: newAssignment,
  });
});

export const removeStudentFromRoute = asyncHandler(async (req, res) => {
  const { id, studentId } = req.params;
  const transport = await db.transports.findById(id);
  if (!transport) {
    return sendError(res, 404, 'Transport route not found');
  }

  const currentAssignments = transport.assignedStudents || [];
  const student = currentAssignments.find((s) => s.studentId === studentId);
  const filtered = currentAssignments.filter((s) => s.studentId !== studentId);

  const updatedTransport = await db.transports.findByIdAndUpdate(id, {
    assignedStudents: filtered,
    assignedStudentsCount: filtered.length,
  });

  return sendSuccess(res, 200, `${student?.studentName || 'Student'} unassigned from route`, updatedTransport);
});

export const getStudentTransport = asyncHandler(async (req, res) => {
  const { studentId } = req.query;
  const targetId = studentId || (req.user?.role === 'Student' ? req.user._id : null);

  const allRoutes = await db.transports.find({});
  let studentRoute = null;
  let studentAssignment = null;

  for (const r of allRoutes) {
    const assignment = (r.assignedStudents || []).find(
      (s) => s.studentId === targetId || s.admissionNumber === req.user?.admissionNumber
    );
    if (assignment) {
      studentRoute = r;
      studentAssignment = assignment;
      break;
    }
  }

  if (!studentRoute) {
    return sendSuccess(res, 200, 'No active route assigned', { assigned: false, route: null });
  }

  return sendSuccess(res, 200, 'Student transport route details', {
    assigned: true,
    route: studentRoute,
    assignment: studentAssignment,
  });
});

// ==================== HOSTEL ====================
export const getHostels = asyncHandler(async (req, res) => {
  const hostels = await db.hostels.find({});
  return sendSuccess(res, 200, 'Hostels fetched', hostels);
});

export const createHostel = asyncHandler(async (req, res) => {
  const { buildingName, type, wardenName, wardenPhone, totalRooms, rooms } = req.body;
  if (!buildingName || !wardenName) {
    return sendError(res, 400, 'Building name and warden name are required');
  }
  const hostel = await db.hostels.create({
    buildingName,
    type: type || 'Boys',
    wardenName,
    wardenPhone: wardenPhone || '+1 555-0144',
    totalRooms: Number(totalRooms) || 20,
    rooms: rooms || [
      { roomNumber: '101', floor: 1, capacity: 3, occupiedBeds: 2, feePerTerm: 1200, students: [] },
      { roomNumber: '102', floor: 1, capacity: 3, occupiedBeds: 3, feePerTerm: 1200, students: [] },
      { roomNumber: '201', floor: 2, capacity: 2, occupiedBeds: 1, feePerTerm: 1500, students: [] },
    ],
  });
  return sendSuccess(res, 201, 'Hostel created', hostel);
});

// ==================== LEAVE MANAGEMENT ====================
export const getLeaves = asyncHandler(async (req, res) => {
  const { applicantId, status } = req.query;
  let query = {};
  if (applicantId) query.applicantId = applicantId;
  if (status) query.status = status;

  const leaves = await db.leaves.find(query);
  return sendSuccess(res, 200, 'Leaves fetched', leaves);
});

export const createLeave = asyncHandler(async (req, res) => {
  const { applicantId, applicantName, applicantRole, leaveType, startDate, endDate, totalDays, reason } = req.body;
  if (!leaveType || !startDate || !endDate || !reason) {
    return sendError(res, 400, 'Leave type, start date, end date, and reason are required');
  }

  const appName = applicantName || (req.user ? req.user.name : 'Applicant');
  const appRole = applicantRole || (req.user ? req.user.role : 'Student');
  const appId = applicantId || (req.user ? req.user._id : 'app-1');

  const leave = await db.leaves.create({
    applicantId: appId,
    applicantName: appName,
    applicantRole: appRole,
    leaveType,
    startDate,
    endDate,
    totalDays: Number(totalDays) || 1,
    reason,
    status: 'Pending',
  });

  return sendSuccess(res, 201, 'Leave application submitted', leave);
});

export const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { status, adminRemark } = req.body;
  const leave = await db.leaves.findById(req.params.id);
  if (!leave) return sendError(res, 404, 'Leave request not found');

  const updated = await db.leaves.findByIdAndUpdate(leave._id, {
    status,
    adminRemark: adminRemark || '',
    actionBy: req.user ? req.user.name : 'Administrator',
    actionDate: new Date().toISOString().split('T')[0],
  });

  return sendSuccess(res, 200, `Leave request marked as ${status}`, updated);
});

// ==================== NOTICES & CIRCULARS ====================
export const getNotices = asyncHandler(async (req, res) => {
  const { audience, priority, category, search } = req.query;
  let notices = await db.notices.find({});
  if (audience && audience !== 'All') {
    notices = notices.filter((n) => n.targetAudience === 'All' || n.targetAudience === audience);
  }
  if (priority && priority !== 'All') {
    notices = notices.filter((n) => n.priority === priority);
  }
  if (category && category !== 'All') {
    notices = notices.filter((n) => n.category === category);
  }
  if (search) {
    const s = search.toLowerCase();
    notices = notices.filter(
      (n) =>
        n.title?.toLowerCase().includes(s) ||
        n.content?.toLowerCase().includes(s) ||
        n.circularNumber?.toLowerCase().includes(s) ||
        n.authorName?.toLowerCase().includes(s)
    );
  }
  return sendSuccess(res, 200, 'Notices and circulars fetched successfully', notices);
});

export const createNotice = asyncHandler(async (req, res) => {
  const {
    title,
    content,
    targetAudience = 'All',
    category = 'General Circular',
    priority = 'Medium',
    isPinned = false,
    effectiveDate,
    expiryDate,
    circularNumber,
  } = req.body;

  if (!title || !content) {
    return sendError(res, 400, 'Title and content are required');
  }

  const generatedCirNo = circularNumber || `CIR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const notice = await db.notices.create({
    circularNumber: generatedCirNo,
    title,
    content,
    targetAudience,
    category,
    priority,
    isPinned: Boolean(isPinned),
    publishDate: new Date().toISOString().split('T')[0],
    effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
    expiryDate: expiryDate || '',
    authorName: req.user ? req.user.name : 'Principal Office',
    authorRole: req.user ? req.user.role : 'Admin',
    status: 'Published',
  });

  // Create notifications for everyone
  await db.notifications.create({
    userId: 'ALL',
    title: `[Circular ${generatedCirNo}] ${title}`,
    message: content.slice(0, 80) + '...',
    type: 'Notice',
    isRead: false,
  });

  return sendSuccess(res, 201, 'Notice and circular published successfully', notice);
});

export const deleteNotice = asyncHandler(async (req, res) => {
  const deleted = await db.notices.findByIdAndDelete(req.params.id);
  if (!deleted) return sendError(res, 404, 'Notice not found');
  return sendSuccess(res, 200, 'Notice deleted successfully');
});

// ==================== EVENTS ====================
export const getEvents = asyncHandler(async (req, res) => {
  const events = await db.events.find({});
  return sendSuccess(res, 200, 'Events fetched', events);
});

export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, eventType = 'Academic', startDate, endDate, location, organizer } = req.body;
  if (!title || !startDate) {
    return sendError(res, 400, 'Event title and start date are required');
  }
  const event = await db.events.create({
    title,
    description: description || '',
    eventType,
    startDate,
    endDate: endDate || startDate,
    location: location || 'School Main Auditorium',
    organizer: organizer || (req.user ? req.user.name : 'Event Committee'),
    audience: 'All',
  });
  return sendSuccess(res, 201, 'Event scheduled successfully', event);
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const deleted = await db.events.findByIdAndDelete(req.params.id);
  if (!deleted) return sendError(res, 404, 'Event not found');
  return sendSuccess(res, 200, 'Event deleted successfully');
});

// ==================== NOTIFICATIONS ====================
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user._id : 'all';
  const notifications = await db.notifications.find({});
  const filtered = notifications.filter((n) => n.userId === 'ALL' || n.userId === userId);
  return sendSuccess(res, 200, 'Notifications fetched', filtered);
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const updated = await db.notifications.findByIdAndUpdate(req.params.id, { isRead: true });
  return sendSuccess(res, 200, 'Notification marked as read', updated);
});

// ==================== MESSAGING ====================
export const getMessages = asyncHandler(async (req, res) => {
  const userId = req.user ? String(req.user._id) : 'guest';
  const userRole = req.user ? req.user.role : 'Guest';
  const allMessages = await db.messages.find({});

  // Super Admin and Principals have administrative visibility into campus communications
  if (userRole === 'Super Admin' || userRole === 'School Admin' || userRole === 'Principal') {
    return sendSuccess(res, 200, 'Messages retrieved', allMessages);
  }

  // Filter messages relevant to the current user (sent by user, addressed to user, or addressed to all/role)
  const myMessages = allMessages.filter(
    (m) =>
      String(m.senderId) === userId ||
      String(m.recipientId) === userId ||
      m.recipientId === 'all-staff' ||
      m.recipientId === 'admin-1' ||
      m.recipientId === 'all' ||
      m.recipientRole === userRole
  );
  return sendSuccess(res, 200, 'Messages retrieved', myMessages);
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, recipientName, recipientRole, subject, body } = req.body;
  if (!subject || !body) {
    return sendError(res, 400, 'Subject and message body are required');
  }

  const senderId = req.user ? req.user._id : 'admin-001';
  const senderName = req.user ? req.user.name : 'Administrator';
  const senderRole = req.user ? req.user.role : 'Super Admin';

  const msg = await db.messages.create({
    senderId,
    senderName,
    senderRole,
    senderAvatar: req.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    recipientId: recipientId || 'admin-001',
    recipientName: recipientName || 'Campus Administration',
    recipientRole: recipientRole || 'Super Admin',
    subject,
    body,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return sendSuccess(res, 201, 'Message sent successfully', msg);
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const deleted = await db.messages.findByIdAndDelete(req.params.id);
  if (!deleted) return sendError(res, 404, 'Message not found');
  return sendSuccess(res, 200, 'Message deleted successfully');
});
