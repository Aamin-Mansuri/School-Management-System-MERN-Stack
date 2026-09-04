import bcrypt from 'bcryptjs';
import { db } from '../data/store.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logFromReq } from '../utils/auditLogger.js';

// @desc    Get all students with search, class filter, section filter, pagination
// @route   GET /api/students
// @access  Private
export const getStudents = asyncHandler(async (req, res) => {
  const { search, classId, sectionId, status, page = 1, limit = 15 } = req.query;

  let query = {};
  if (classId) query.classId = classId;
  if (sectionId) query.sectionId = sectionId;
  if (status) query.status = status;

  let students = await db.students.find(query);

  if (search) {
    const s = search.toLowerCase();
    students = students.filter(
      (st) =>
        st.firstName?.toLowerCase().includes(s) ||
        st.lastName?.toLowerCase().includes(s) ||
        st.admissionNumber?.toLowerCase().includes(s) ||
        st.rollNumber?.toLowerCase().includes(s) ||
        st.email?.toLowerCase().includes(s)
    );
  }

  // Sort by roll number / admission number
  students.sort((a, b) => (a.rollNumber || '').localeCompare(b.rollNumber || '', undefined, { numeric: true }));

  const total = students.length;
  const startIndex = (page - 1) * limit;
  const paginated = students.slice(startIndex, startIndex + Number(limit));

  return sendSuccess(res, 200, 'Students fetched successfully', paginated);
});

// @desc    Get student profile by ID (with comprehensive attendance, results, fees, assignments)
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = asyncHandler(async (req, res) => {
  const student = await db.students.findById(req.params.id);
  if (!student) {
    return sendError(res, 404, 'Student not found');
  }

  // Fetch student's attendance records
  const attendanceRecords = await db.attendance.find({ studentId: student._id });
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter((a) => a.status === 'Present').length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  // Fetch student's fees
  const fees = await db.fees.find({ studentId: student._id });
  const totalFeeAmount = fees.reduce((acc, f) => acc + (f.totalAmount || 0), 0);
  const paidFeeAmount = fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
  const dueFeeAmount = fees.reduce((acc, f) => acc + (f.dueAmount || 0), 0);

  // Fetch student's assignments and submissions
  const assignments = await db.assignments.find({ classId: student.classId });
  const enrichedAssignments = assignments.map((assign) => {
    const mySub = (assign.submissions || []).find((s) => s.studentId === student._id);
    return {
      ...assign,
      mySubmission: mySub || null,
    };
  });

  // Fetch student's exams & results
  const allExams = await db.exams.find({ classId: student.classId });
  const examResults = allExams.map((ex) => {
    const myRes = (ex.results || []).find((r) => r.studentId === student._id);
    return {
      examId: ex._id,
      examName: ex.name,
      term: ex.term,
      subjectName: ex.subjectName,
      examDate: ex.examDate,
      totalMarks: ex.totalMarks,
      passMarks: ex.passMarks,
      marksObtained: myRes ? myRes.marksObtained : null,
      grade: myRes ? myRes.grade : 'N/A',
      status: myRes ? myRes.status : 'Pending',
    };
  });

  return sendSuccess(res, 200, 'Student profile retrieved', {
    student,
    analytics: {
      attendance: {
        totalDays,
        presentDays,
        rate: attendanceRate,
        records: attendanceRecords.slice(-10),
      },
      fees: {
        total: totalFeeAmount,
        paid: paidFeeAmount,
        due: dueFeeAmount,
        records: fees,
      },
      academics: {
        assignments: enrichedAssignments,
        exams: examResults,
      },
    },
  });
});

// @desc    Create student
// @route   POST /api/students
// @access  Private (Admin, Principal)
export const createStudent = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    role,
    password,
    phone,
    dateOfBirth,
    gender,
    bloodGroup,
    classId,
    className,
    sectionId,
    sectionName,
    rollNumber,
    admissionNumber,
    address,
    parentInfo,
    emergencyContact,
  } = req.body;

  if (!firstName || !lastName || !classId || !sectionId) {
    return sendError(res, 400, 'First name, last name, class, and section are required');
  }

  const admNo = admissionNumber || `ADM-${Date.now().toString().slice(-5)}`;
  const rollNo = rollNumber || '01';
  const cleanEmail = email ? email.toLowerCase().trim() : `${firstName.toLowerCase()}.${admNo.toLowerCase()}@school.edu`;
  const studentPassword = password && password.trim() ? password.trim() : 'Student@123';
  const assignedRole = role || 'Student';

  // Create or link login user for student with Student role automatically
  let userId = null;
  const existingUser = await db.users.findOne({ email: cleanEmail });
  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(studentPassword, salt);
    const user = await db.users.create({
      name: `${firstName} ${lastName}`,
      email: cleanEmail,
      password: hashedPassword,
      role: assignedRole,
      phone: phone || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName + lastName)}`,
      isActive: true,
      isEmailVerified: true,
    });
    userId = user._id;
  } else {
    userId = existingUser._id;
    // Update password if provided, and ensure assigned role
    const updatePayload = {
      role: assignedRole,
      name: `${firstName} ${lastName}`,
    };
    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      updatePayload.password = await bcrypt.hash(password.trim(), salt);
    }
    await db.users.findByIdAndUpdate(existingUser._id, updatePayload);
  }

  const student = await db.students.create({
    userId,
    admissionNumber: admNo,
    rollNumber: rollNo,
    firstName,
    lastName,
    email: cleanEmail,
    phone: phone || '',
    dateOfBirth: dateOfBirth || '2012-05-15',
    gender: gender || 'Male',
    bloodGroup: bloodGroup || 'O+',
    classId,
    className: className || 'Class 1',
    sectionId,
    sectionName: sectionName || 'Section A',
    academicYear: '2025-2026',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName + admNo)}`,
    address: address || { street: '123 Main St', city: 'Cityville', state: 'State', zipCode: '10001' },
    parentInfo: parentInfo || {},
    emergencyContact: emergencyContact || {},
    documents: [],
    status: 'Active',
  });

  // Also link Parent user account if parent email is provided
  if (parentInfo?.parentEmail) {
    const parentEmailClean = parentInfo.parentEmail.toLowerCase().trim();
    const existingParentUser = await db.users.findOne({ email: parentEmailClean });
    let parentUserId = existingParentUser ? existingParentUser._id : null;

    if (!existingParentUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Parent@123', salt);
      const parentUser = await db.users.create({
        name: parentInfo.fatherName || parentInfo.motherName || `${lastName} Parent`,
        email: parentEmailClean,
        password: hashedPassword,
        role: 'Parent',
        phone: parentInfo.parentPhone || '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(parentEmailClean)}`,
        isActive: true,
        isEmailVerified: true,
      });
      parentUserId = parentUser._id;
    } else if (existingParentUser.role === 'Visitor' || existingParentUser.role === 'Member') {
      await db.users.findByIdAndUpdate(existingParentUser._id, { role: 'Parent' });
    }

    // Update or create parent document
    const existingParentDoc = await db.parents.findOne({ email: parentEmailClean });
    const childRef = {
      studentId: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      className: student.className,
      sectionName: student.sectionName,
      relationship: parentInfo.fatherName ? 'Father' : 'Parent',
    };

    if (existingParentDoc) {
      const currentChildren = existingParentDoc.children || [];
      if (!currentChildren.some((c) => c.studentId === student._id)) {
        await db.parents.findByIdAndUpdate(existingParentDoc._id, {
          children: [...currentChildren, childRef],
          userId: parentUserId || existingParentDoc.userId,
        });
      }
    } else {
      await db.parents.create({
        userId: parentUserId,
        firstName: parentInfo.fatherName || parentInfo.motherName || 'Guardian',
        lastName: lastName || '',
        email: parentEmailClean,
        phone: parentInfo.parentPhone || '',
        occupation: parentInfo.occupation || '',
        children: [childRef],
        status: 'Active',
      });
    }
  }

  // Audit Log: Student Admission
  await logFromReq(req, {
    action: 'STUDENT_ENROLLED',
    category: 'Student & Guardian',
    severity: 'MEDIUM',
    target: { id: student._id, name: `${student.firstName} ${student.lastName}`, email: student.email, admissionNumber: student.admissionNumber, type: 'StudentProfile' },
    details: `Enrolled new student ${student.firstName} ${student.lastName} (Adm No: ${student.admissionNumber}, Class: ${student.className}). Login account active.`,
  });

  return sendSuccess(res, 201, 'Student created and account linked successfully', student);
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin, Principal)
export const updateStudent = asyncHandler(async (req, res) => {
  const existingStudent = await db.students.findById(req.params.id);
  const updated = await db.students.findByIdAndUpdate(req.params.id, req.body);
  if (!updated) {
    return sendError(res, 404, 'Student not found');
  }

  // Check if guardian data was cleared
  if (req.body.parentInfo && (!req.body.parentInfo.fatherName && existingStudent?.parentInfo?.fatherName)) {
    await logFromReq(req, {
      action: 'STUDENT_GUARDIAN_CLEARED',
      category: 'Student & Guardian',
      severity: 'MEDIUM',
      target: { id: updated._id, name: `${updated.firstName} ${updated.lastName}`, email: updated.email, type: 'StudentProfile' },
      details: `Cleared guardian contact details from ${updated.firstName} ${updated.lastName}'s student file.`,
    });
  }

  return sendSuccess(res, 200, 'Student updated successfully', updated);
});

// @desc    Delete/Deactivate student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
export const deleteStudent = asyncHandler(async (req, res) => {
  const existing = await db.students.findById(req.params.id);
  if (!existing) {
    return sendError(res, 404, 'Student not found');
  }

  const deleted = await db.students.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return sendError(res, 404, 'Student not found');
  }

  // Audit Log: Student Deletion (Critical Action)
  await logFromReq(req, {
    action: 'STUDENT_DELETED',
    category: 'Student & Guardian',
    severity: 'CRITICAL',
    target: { id: existing._id, name: `${existing.firstName} ${existing.lastName}`, admissionNumber: existing.admissionNumber, email: existing.email, type: 'StudentProfile' },
    details: `Permanently deleted student record for ${existing.firstName} ${existing.lastName} (Adm No: ${existing.admissionNumber || 'N/A'}).`,
  });

  return sendSuccess(res, 200, 'Student deleted successfully');
});

// @desc    Upload document for student
// @route   POST /api/students/:id/documents
// @access  Private
export const uploadStudentDocument = asyncHandler(async (req, res) => {
  const { title, fileUrl } = req.body;
  const student = await db.students.findById(req.params.id);
  if (!student) {
    return sendError(res, 404, 'Student not found');
  }

  const documents = student.documents || [];
  documents.push({
    title: title || 'Student Document',
    fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    uploadDate: new Date().toISOString().split('T')[0],
  });

  const updated = await db.students.findByIdAndUpdate(student._id, { documents });
  return sendSuccess(res, 200, 'Document uploaded successfully', updated);
});
