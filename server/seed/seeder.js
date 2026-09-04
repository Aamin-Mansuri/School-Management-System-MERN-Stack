import bcrypt from 'bcryptjs';
import { db } from '../data/store.js';

export const seedDatabase = async () => {
  // If users or students already exist in database or file, don't overwrite saved records
  const existingUsers = await db.users.countDocuments();
  if (existingUsers > 0) {
    console.log(`[Seeder] Found existing database records (${existingUsers} users). Preserving user data.`);
    return;
  }

  console.log('[Seeder] Initializing database seeding for initial setup...');
  await db.resetAll();

  // 1. Password hash
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@123', salt);
  const principalPass = await bcrypt.hash('Principal@123', salt);
  const teacherPass = await bcrypt.hash('Teacher@123', salt);
  const studentPass = await bcrypt.hash('Student@123', salt);
  const parentPass = await bcrypt.hash('Parent@123', salt);
  const accountantPass = await bcrypt.hash('Accountant@123', salt);
  const memberPass = await bcrypt.hash('Member@123', salt);

  // 2. Create Users
  const userDocs = [
    {
      name: 'Dr. Arthur Sterling',
      email: 'admin@edupulse.edu',
      password: adminPass,
      role: 'Super Admin',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true,
    },
    {
      name: 'Eleanor Vance',
      email: 'principal@edupulse.edu',
      password: principalPass,
      role: 'Principal',
      phone: '+1 (555) 345-6789',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true,
    },
    {
      name: 'Prof. Marcus Brody',
      email: 'teacher@edupulse.edu',
      password: teacherPass,
      role: 'Teacher',
      phone: '+1 (555) 456-7890',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true,
    },
    {
      name: 'Sarah Jenkins',
      email: 'accountant@edupulse.edu',
      password: accountantPass,
      role: 'Accountant',
      phone: '+1 (555) 567-8901',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true,
    },
    {
      name: 'Lucas Miller',
      email: 'student@edupulse.edu',
      password: studentPass,
      role: 'Student',
      phone: '+1 (555) 678-9012',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true,
    },
    {
      name: 'David Miller',
      email: 'parent@edupulse.edu',
      password: parentPass,
      role: 'Parent',
      phone: '+1 (555) 789-0123',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true,
    },
    {
      name: 'Aryan Verma',
      email: 'explorer@edupulse.edu',
      password: memberPass,
      role: 'Member',
      phone: '+1 (555) 890-1234',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true,
    },
    {
      name: 'Dr. Clara Oswald',
      email: 'clara.applicant@edupulse.edu',
      password: teacherPass,
      role: 'Member',
      phone: '+1 (555) 901-2345',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true,
    },
  ];

  const createdUsers = await db.users.insertMany(userDocs);
  const teacherUser = createdUsers.find((u) => u.email === 'teacher@edupulse.edu');
  const studentUser = createdUsers.find((u) => u.email === 'student@edupulse.edu');
  const parentUser = createdUsers.find((u) => u.email === 'parent@edupulse.edu');

  // 3. Classes
  const classDocs = [
    {
      name: 'Grade 10',
      code: 'CLS-10',
      numericGrade: 10,
      capacity: 40,
      academicYear: '2025-2026',
      status: 'Active',
      sections: [
        { sectionId: 'sec-10a', name: 'Section A', capacity: 35, roomNumber: 'Room 301', classTeacherName: 'Prof. Marcus Brody' },
        { sectionId: 'sec-10b', name: 'Section B', capacity: 35, roomNumber: 'Room 302', classTeacherName: 'Dr. Clara Oswald' },
      ],
    },
    {
      name: 'Grade 11',
      code: 'CLS-11',
      numericGrade: 11,
      capacity: 40,
      academicYear: '2025-2026',
      status: 'Active',
      sections: [
        { sectionId: 'sec-11a', name: 'Section A (Science)', capacity: 35, roomNumber: 'Room 401', classTeacherName: 'Dr. Alan Grant' },
        { sectionId: 'sec-11b', name: 'Section B (Commerce)', capacity: 35, roomNumber: 'Room 402', classTeacherName: 'Ms. Rebecca Hall' },
      ],
    },
    {
      name: 'Grade 12',
      code: 'CLS-12',
      numericGrade: 12,
      capacity: 40,
      academicYear: '2025-2026',
      status: 'Active',
      sections: [
        { sectionId: 'sec-12a', name: 'Section A (Advanced)', capacity: 35, roomNumber: 'Room 501', classTeacherName: 'Dr. Henry Walton' },
      ],
    },
    {
      name: 'Grade 9',
      code: 'CLS-09',
      numericGrade: 9,
      capacity: 40,
      academicYear: '2025-2026',
      status: 'Active',
      sections: [
        { sectionId: 'sec-9a', name: 'Section A', capacity: 35, roomNumber: 'Room 201', classTeacherName: 'Mr. Simon Pegg' },
      ],
    },
  ];

  const createdClasses = await db.classes.insertMany(classDocs);
  const grade10 = createdClasses.find((c) => c.code === 'CLS-10');
  const grade11 = createdClasses.find((c) => c.code === 'CLS-11');

  // 4. Teachers
  const teacherDocs = [
    {
      userId: teacherUser?._id,
      employeeId: 'TCH-1001',
      firstName: 'Marcus',
      lastName: 'Brody',
      email: 'teacher@edupulse.edu',
      phone: '+1 (555) 456-7890',
      gender: 'Male',
      joiningDate: '2020-08-15',
      qualification: 'Ph.D. in Applied Mathematics',
      experience: '9 Years',
      department: 'Mathematics & Science',
      designation: 'Head of Mathematics Department',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      salary: { basic: 55000, allowance: 10000, total: 65000 },
      assignedClasses: [
        { classId: grade10._id, className: 'Grade 10', sectionId: 'sec-10a', sectionName: 'Section A' },
        { classId: grade11._id, className: 'Grade 11', sectionId: 'sec-11a', sectionName: 'Section A (Science)' },
      ],
      status: 'Active',
    },
    {
      employeeId: 'TCH-1002',
      firstName: 'Clara',
      lastName: 'Oswald',
      email: 'clara.oswald@edupulse.edu',
      phone: '+1 (555) 456-7891',
      gender: 'Female',
      joiningDate: '2021-01-10',
      qualification: 'M.A. in English Literature (Oxford)',
      experience: '6 Years',
      department: 'Humanities & Languages',
      designation: 'Senior Lecturer',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      salary: { basic: 48000, allowance: 8000, total: 56000 },
      assignedClasses: [{ classId: grade10._id, className: 'Grade 10', sectionId: 'sec-10a', sectionName: 'Section A' }],
      status: 'Active',
    },
    {
      employeeId: 'TCH-1003',
      firstName: 'Alan',
      lastName: 'Grant',
      email: 'alan.grant@edupulse.edu',
      phone: '+1 (555) 456-7892',
      gender: 'Male',
      joiningDate: '2019-03-01',
      qualification: 'Ph.D. in Physics & Quantum Mechanics',
      experience: '12 Years',
      department: 'Physical Sciences',
      designation: 'Senior Faculty',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      salary: { basic: 60000, allowance: 12000, total: 72000 },
      assignedClasses: [{ classId: grade11._id, className: 'Grade 11', sectionId: 'sec-11a', sectionName: 'Section A (Science)' }],
      status: 'Active',
    },
    {
      employeeId: 'TCH-1004',
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena.rostova@edupulse.edu',
      phone: '+1 (555) 456-7893',
      gender: 'Female',
      joiningDate: '2022-09-01',
      qualification: 'M.S. in Computer Science',
      experience: '5 Years',
      department: 'Computer Science & AI',
      designation: 'Head of IT Curriculum',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      salary: { basic: 52000, allowance: 9000, total: 61000 },
      assignedClasses: [{ classId: grade10._id, className: 'Grade 10', sectionId: 'sec-10a', sectionName: 'Section A' }],
      status: 'Active',
    },
  ];

  const createdTeachers = await db.teachers.insertMany(teacherDocs);
  const teacherMarcus = createdTeachers[0];

  // 5. Subjects
  const subjectDocs = [
    {
      name: 'Advanced Mathematics',
      code: 'MATH-101',
      type: 'Theory',
      classId: grade10._id,
      className: 'Grade 10',
      teacherId: teacherMarcus._id,
      teacherName: 'Prof. Marcus Brody',
      totalMarks: 100,
      passMarks: 40,
      description: 'Calculus, Euclidean Geometry, Polynomials, and Matrix Algebra',
      status: 'Active',
    },
    {
      name: 'English Literature & Composition',
      code: 'ENG-101',
      type: 'Theory',
      classId: grade10._id,
      className: 'Grade 10',
      teacherId: createdTeachers[1]._id,
      teacherName: 'Clara Oswald',
      totalMarks: 100,
      passMarks: 40,
      description: 'Critical analysis of modern and classic prose and poetry',
      status: 'Active',
    },
    {
      name: 'Physics & Experimental Dynamics',
      code: 'PHY-101',
      type: 'Both',
      classId: grade10._id,
      className: 'Grade 10',
      teacherId: createdTeachers[2]._id,
      teacherName: 'Dr. Alan Grant',
      totalMarks: 100,
      passMarks: 40,
      description: 'Mechanics, Optics, Thermodynamics and Lab Practicals',
      status: 'Active',
    },
    {
      name: 'Computer Science & Algorithmic Design',
      code: 'CS-101',
      type: 'Both',
      classId: grade10._id,
      className: 'Grade 10',
      teacherId: createdTeachers[3]._id,
      teacherName: 'Elena Rostova',
      totalMarks: 100,
      passMarks: 40,
      description: 'Data Structures, Python, Web Architecture and Database Engineering',
      status: 'Active',
    },
  ];

  const createdSubjects = await db.subjects.insertMany(subjectDocs);
  const mathSubject = createdSubjects[0];
  const englishSubject = createdSubjects[1];

  // 6. Students
  const studentDocs = [
    {
      userId: studentUser?._id,
      admissionNumber: 'ADM-2025-001',
      rollNumber: '1001',
      firstName: 'Lucas',
      lastName: 'Miller',
      email: 'student@edupulse.edu',
      phone: '+1 (555) 678-9012',
      dateOfBirth: '2008-04-12',
      gender: 'Male',
      bloodGroup: 'O+',
      classId: grade10._id,
      className: 'Grade 10',
      sectionId: 'sec-10a',
      sectionName: 'Section A',
      academicYear: '2025-2026',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      address: { street: '742 Evergreen Terrace', city: 'Springfield', state: 'OR', zipCode: '97477' },
      parentInfo: {
        parentId: parentUser?._id,
        fatherName: 'David Miller',
        motherName: 'Sarah Miller',
        parentEmail: 'parent@edupulse.edu',
        parentPhone: '+1 (555) 789-0123',
        occupation: 'Software Architect',
      },
      emergencyContact: { name: 'David Miller', relationship: 'Father', phone: '+1 (555) 789-0123' },
      documents: [{ title: 'Birth Certificate', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadDate: '2025-08-01' }],
      status: 'Active',
    },
    {
      admissionNumber: 'ADM-2025-002',
      rollNumber: '1002',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@edupulse.edu',
      phone: '+1 (555) 678-9013',
      dateOfBirth: '2008-06-21',
      gender: 'Female',
      bloodGroup: 'A+',
      classId: grade10._id,
      className: 'Grade 10',
      sectionId: 'sec-10a',
      sectionName: 'Section A',
      academicYear: '2025-2026',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      address: { street: '128 Willow Creek Lane', city: 'Springfield', state: 'OR', zipCode: '97477' },
      parentInfo: { fatherName: 'Robert Smith', motherName: 'Julia Smith', parentEmail: 'robert.smith@gmail.com', parentPhone: '+1 555-4011', occupation: 'Biologist' },
      emergencyContact: { name: 'Julia Smith', relationship: 'Mother', phone: '+1 555-4011' },
      status: 'Active',
    },
    {
      admissionNumber: 'ADM-2025-003',
      rollNumber: '1003',
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.johnson@edupulse.edu',
      phone: '+1 (555) 678-9014',
      dateOfBirth: '2008-02-14',
      gender: 'Male',
      bloodGroup: 'B+',
      classId: grade10._id,
      className: 'Grade 10',
      sectionId: 'sec-10a',
      sectionName: 'Section A',
      academicYear: '2025-2026',
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
      address: { street: '450 Oak Wood St', city: 'Springfield', state: 'OR', zipCode: '97477' },
      parentInfo: { fatherName: 'William Johnson', motherName: 'Helen Johnson', parentEmail: 'william.j@gmail.com', parentPhone: '+1 555-4012', occupation: 'Civil Engineer' },
      status: 'Active',
    },
    {
      admissionNumber: 'ADM-2025-004',
      rollNumber: '1004',
      firstName: 'Maria',
      lastName: 'Perez',
      email: 'maria.perez@edupulse.edu',
      phone: '+1 (555) 678-9015',
      dateOfBirth: '2008-11-05',
      gender: 'Female',
      bloodGroup: 'AB+',
      classId: grade10._id,
      className: 'Grade 10',
      sectionId: 'sec-10a',
      sectionName: 'Section A',
      academicYear: '2025-2026',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      address: { street: '89 Sunset Blvd', city: 'Springfield', state: 'OR', zipCode: '97477' },
      parentInfo: { fatherName: 'Carlos Perez', motherName: 'Elena Perez', parentEmail: 'carlos.p@gmail.com', parentPhone: '+1 555-4013', occupation: 'Accountant' },
      status: 'Active',
    },
    {
      admissionNumber: 'ADM-2025-005',
      rollNumber: '1005',
      firstName: 'Tom',
      lastName: 'Brown',
      email: 'tom.brown@edupulse.edu',
      phone: '+1 (555) 678-9016',
      dateOfBirth: '2008-09-18',
      gender: 'Male',
      bloodGroup: 'O-',
      classId: grade10._id,
      className: 'Grade 10',
      sectionId: 'sec-10a',
      sectionName: 'Section A',
      academicYear: '2025-2026',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      address: { street: '310 Riverdale Rd', city: 'Springfield', state: 'OR', zipCode: '97477' },
      parentInfo: { fatherName: 'George Brown', motherName: 'Anna Brown', parentEmail: 'george.b@gmail.com', parentPhone: '+1 555-4014', occupation: 'Dentist' },
      status: 'Active',
    },
  ];

  const createdStudents = await db.students.insertMany(studentDocs);
  const studentLucas = createdStudents[0];

  // 7. Parents
  const parentDocs = [
    {
      userId: parentUser?._id,
      firstName: 'David',
      lastName: 'Miller',
      email: 'parent@edupulse.edu',
      phone: '+1 (555) 789-0123',
      occupation: 'Software Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      address: { street: '742 Evergreen Terrace', city: 'Springfield', state: 'OR', zipCode: '97477' },
      children: [
        {
          studentId: studentLucas._id,
          studentName: 'Lucas Miller',
          admissionNumber: 'ADM-2025-001',
          className: 'Grade 10',
          sectionName: 'Section A',
          relationship: 'Father',
        },
      ],
      status: 'Active',
    },
  ];
  await db.parents.insertMany(parentDocs);

  // 8. Attendance Records (Last 10 school days)
  const dates = ['2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07', '2026-08-08', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15'];
  const attendanceDocs = [];

  for (const date of dates) {
    for (const st of createdStudents) {
      const isAbsent = Math.random() < 0.06;
      const isLate = !isAbsent && Math.random() < 0.08;
      attendanceDocs.push({
        date,
        classId: grade10._id,
        className: 'Grade 10',
        sectionId: 'sec-10a',
        sectionName: 'Section A',
        studentId: st._id,
        studentName: `${st.firstName} ${st.lastName}`,
        rollNumber: st.rollNumber,
        status: isAbsent ? 'Absent' : isLate ? 'Late' : 'Present',
        remark: isAbsent ? 'Medical Leave' : isLate ? 'Bus delayed' : 'On time',
        markedBy: 'Prof. Marcus Brody',
      });
    }
  }
  await db.attendance.insertMany(attendanceDocs);

  // 9. Exams
  const examDocs = [
    {
      name: 'Mid-Term Assessment 2026',
      term: 'Mid Term',
      classId: grade10._id,
      className: 'Grade 10',
      subjectId: mathSubject._id,
      subjectName: 'Advanced Mathematics',
      examDate: '2026-09-12',
      startTime: '09:00 AM',
      endTime: '11:30 AM',
      totalMarks: 100,
      passMarks: 40,
      academicYear: '2025-2026',
      status: 'Completed',
      results: [
        { studentId: studentLucas._id, studentName: 'Lucas Miller', rollNumber: '1001', marksObtained: 94, totalMarks: 100, grade: 'A+', remarks: 'Outstanding analytical skills', status: 'Pass' },
        { studentId: createdStudents[1]._id, studentName: 'Alice Smith', rollNumber: '1002', marksObtained: 88, totalMarks: 100, grade: 'A', remarks: 'Strong conceptual clarity', status: 'Pass' },
        { studentId: createdStudents[2]._id, studentName: 'Robert Johnson', rollNumber: '1003', marksObtained: 76, totalMarks: 100, grade: 'B+', remarks: 'Good work', status: 'Pass' },
        { studentId: createdStudents[3]._id, studentName: 'Maria Perez', rollNumber: '1004', marksObtained: 91, totalMarks: 100, grade: 'A+', remarks: 'Excellent precision', status: 'Pass' },
        { studentId: createdStudents[4]._id, studentName: 'Tom Brown', rollNumber: '1005', marksObtained: 68, totalMarks: 100, grade: 'B', remarks: 'Satisfactory, practice trigonometry', status: 'Pass' },
      ],
    },
    {
      name: 'Unit Test II - English Literature',
      term: 'Unit Test 2',
      classId: grade10._id,
      className: 'Grade 10',
      subjectId: englishSubject._id,
      subjectName: 'English Literature & Composition',
      examDate: '2026-09-15',
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      totalMarks: 100,
      passMarks: 40,
      academicYear: '2025-2026',
      status: 'Completed',
      results: [
        { studentId: studentLucas._id, studentName: 'Lucas Miller', rollNumber: '1001', marksObtained: 90, totalMarks: 100, grade: 'A+', remarks: 'Eloquent essay writing', status: 'Pass' },
        { studentId: createdStudents[1]._id, studentName: 'Alice Smith', rollNumber: '1002', marksObtained: 95, totalMarks: 100, grade: 'A+', remarks: 'Superb literary depth', status: 'Pass' },
        { studentId: createdStudents[2]._id, studentName: 'Robert Johnson', rollNumber: '1003', marksObtained: 82, totalMarks: 100, grade: 'A', remarks: 'Well structured', status: 'Pass' },
        { studentId: createdStudents[3]._id, studentName: 'Maria Perez', rollNumber: '1004', marksObtained: 86, totalMarks: 100, grade: 'A', remarks: 'Great vocabulary', status: 'Pass' },
        { studentId: createdStudents[4]._id, studentName: 'Tom Brown', rollNumber: '1005', marksObtained: 72, totalMarks: 100, grade: 'B+', remarks: 'Good grammar', status: 'Pass' },
      ],
    },
  ];
  await db.exams.insertMany(examDocs);

  // 10. Assignments
  const assignmentDocs = [
    {
      title: 'Trigonometric Equations & Vector Spaces',
      description: 'Solve problem set 4B on page 142. Show all step-by-step vector projections and proofs.',
      classId: grade10._id,
      className: 'Grade 10',
      sectionId: 'sec-10a',
      sectionName: 'Section A',
      subjectId: mathSubject._id,
      subjectName: 'Advanced Mathematics',
      teacherId: teacherMarcus._id,
      teacherName: 'Prof. Marcus Brody',
      dueDate: '2026-08-25',
      totalMarks: 100,
      status: 'Active',
      submissions: [
        {
          studentId: studentLucas._id,
          studentName: 'Lucas Miller',
          submittedAt: '2026-08-16T14:30:00.000Z',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'Lucas_Miller_Math_Set4B.pdf',
          content: 'Attached complete proofs for Vector Projections and Trigonometric identity 14.',
          marksObtained: 96,
          feedback: 'Exceptional proofs with clean notation.',
          status: 'Graded',
        },
      ],
    },
    {
      title: 'Shakespearean Tragedy & Character Conflict Analysis',
      description: 'Write a 1200-word comparative essay on Macbeth vs King Lear exploring internal moral conflict.',
      classId: grade10._id,
      className: 'Grade 10',
      sectionId: 'sec-10a',
      sectionName: 'Section A',
      subjectId: englishSubject._id,
      subjectName: 'English Literature & Composition',
      teacherId: createdTeachers[1]._id,
      teacherName: 'Clara Oswald',
      dueDate: '2026-08-28',
      totalMarks: 100,
      status: 'Active',
      submissions: [],
    },
  ];
  await db.assignments.insertMany(assignmentDocs);

  // 11. Fees
  const feeDocs = [
    {
      studentId: studentLucas._id,
      studentName: 'Lucas Miller',
      admissionNumber: 'ADM-2025-001',
      classId: grade10._id,
      className: 'Grade 10',
      feeType: 'Tuition Fee',
      title: 'Term 1 Tuition & Laboratory Fee',
      totalAmount: 2400,
      discount: 200,
      lateFee: 0,
      paidAmount: 2200,
      dueAmount: 0,
      dueDate: '2026-08-30',
      academicYear: '2025-2026',
      status: 'Paid',
      payments: [
        {
          receiptNumber: 'REC-901824-301',
          amount: 2200,
          paymentDate: '2026-08-05',
          paymentMethod: 'Online Portal',
          transactionId: 'TXN-A89F4312',
          collectedBy: 'Sarah Jenkins (Accountant)',
          status: 'Completed',
          note: 'Full settlement for Term 1',
        },
      ],
    },
    {
      studentId: studentLucas._id,
      studentName: 'Lucas Miller',
      admissionNumber: 'ADM-2025-001',
      classId: grade10._id,
      className: 'Grade 10',
      feeType: 'Transport Fee',
      title: 'Term 1 Bus Route Fee',
      totalAmount: 450,
      discount: 0,
      lateFee: 0,
      paidAmount: 450,
      dueAmount: 0,
      dueDate: '2026-09-05',
      academicYear: '2025-2026',
      status: 'Paid',
      payments: [
        {
          receiptNumber: 'REC-901825-402',
          amount: 450,
          paymentDate: '2026-08-06',
          paymentMethod: 'Credit Card',
          transactionId: 'TXN-C77D2190',
          collectedBy: 'System Gateway',
          status: 'Completed',
          note: 'Route 4 Transport Fee',
        },
      ],
    },
    {
      studentId: createdStudents[1]._id,
      studentName: 'Alice Smith',
      admissionNumber: 'ADM-2025-002',
      classId: grade10._id,
      className: 'Grade 10',
      feeType: 'Tuition Fee',
      title: 'Term 1 Tuition & Lab Fee',
      totalAmount: 2400,
      discount: 0,
      lateFee: 0,
      paidAmount: 1200,
      dueAmount: 1200,
      dueDate: '2026-08-30',
      academicYear: '2025-2026',
      status: 'Partially Paid',
      payments: [
        {
          receiptNumber: 'REC-901826-503',
          amount: 1200,
          paymentDate: '2026-08-08',
          paymentMethod: 'Bank Transfer',
          transactionId: 'TXN-B992100',
          collectedBy: 'Sarah Jenkins',
          status: 'Completed',
          note: 'First installment paid',
        },
      ],
    },
    {
      studentId: createdStudents[2]._id,
      studentName: 'Robert Johnson',
      admissionNumber: 'ADM-2025-003',
      classId: grade10._id,
      className: 'Grade 10',
      feeType: 'Tuition Fee',
      title: 'Term 1 Tuition & Lab Fee',
      totalAmount: 2400,
      discount: 0,
      lateFee: 50,
      paidAmount: 0,
      dueAmount: 2450,
      dueDate: '2026-08-10',
      academicYear: '2025-2026',
      status: 'Overdue',
      payments: [],
    },
  ];
  await db.fees.insertMany(feeDocs);

  // 11b. Fee Reminders
  const feeReminderDocs = [
    {
      feeId: feeDocs[2]._id,
      studentId: createdStudents[2]._id,
      studentName: 'Robert Johnson',
      admissionNumber: 'ADM-2025-003',
      className: 'Grade 10',
      parentName: 'Arthur Johnson',
      parentEmail: 'parent.adm-2025-003@edupulse.edu',
      parentPhone: '+1 (555) 345-6789',
      feeTitle: 'Term 1 Tuition & Lab Fee',
      feeType: 'Tuition Fee',
      totalAmount: 2400,
      dueAmount: 2450,
      dueDate: '2026-08-10',
      isOverdue: true,
      daysOverdue: 8,
      emailSubject: '⚠️ URGENT: Overdue Outstanding Fee Due for Robert Johnson',
      status: 'Delivered',
      deliveryMethod: 'Email',
      sentAt: '2026-08-14T09:30:00.000Z',
      sentBy: 'Automated Cron Scheduler',
      reminderType: 'Automated Schedule',
      escalationLevel: 'Overdue Escalation',
    },
    {
      feeId: feeDocs[1]._id,
      studentId: createdStudents[1]._id,
      studentName: 'Alice Smith',
      admissionNumber: 'ADM-2025-002',
      className: 'Grade 10',
      parentName: 'Eleanor Smith',
      parentEmail: 'parent.adm-2025-002@edupulse.edu',
      parentPhone: '+1 (555) 234-5678',
      feeTitle: 'Term 1 Tuition & Lab Fee',
      feeType: 'Tuition Fee',
      totalAmount: 2400,
      dueAmount: 1200,
      dueDate: '2026-08-30',
      isOverdue: false,
      daysOverdue: 0,
      emailSubject: 'Payment Reminder: Outstanding Fee Due for Alice Smith',
      status: 'Delivered',
      deliveryMethod: 'Email',
      sentAt: '2026-08-16T14:15:00.000Z',
      sentBy: 'Sarah Jenkins (Accountant)',
      reminderType: 'Manual Dispatch',
      escalationLevel: 'Standard',
    },
  ];
  await db.feeReminders.insertMany(feeReminderDocs);

  // 12. Library Books
  const bookDocs = [
    { title: 'Calculus: Early Transcendentals', author: 'James Stewart', isbn: '978-1285741550', category: 'Mathematics', quantity: 12, available: 10, shelfLocation: 'Rack M-14', price: 85, status: 'Available' },
    { title: 'The Feynman Lectures on Physics', author: 'Richard P. Feynman', isbn: '978-0465023820', category: 'Physics', quantity: 8, available: 6, shelfLocation: 'Rack P-02', price: 95, status: 'Available' },
    { title: 'Introduction to Algorithms (CLRS)', author: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'Computer Science', quantity: 10, available: 7, shelfLocation: 'Rack CS-01', price: 110, status: 'Available' },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0060935467', category: 'Literature', quantity: 20, available: 15, shelfLocation: 'Rack LIT-09', price: 18, status: 'Available' },
    { title: 'Campbell Biology 12th Edition', author: 'Lisa A. Urry', isbn: '978-0135188743', category: 'Biology', quantity: 15, available: 12, shelfLocation: 'Rack BIO-03', price: 120, status: 'Available' },
  ];
  await db.libraryBooks.insertMany(bookDocs);

  // 13. Transport
  const transportDocs = [
    {
      routeName: 'Route 1 - Downtown Express',
      routeNumber: 'RT-101',
      startPoint: 'Central Metro Terminal',
      endPoint: 'Main Campus East Gate',
      vehicleNumber: 'BUS-101',
      vehicleModel: 'Mercedes Sprinter Bus 2024',
      vehicleType: 'Bus',
      fuelType: 'Diesel',
      insuranceValidity: '2026-12-31',
      driverName: 'Robert Martinez',
      driverPhone: '+1 (555) 765-4321',
      driverLicense: 'DL-982314-COMM',
      driverEmergencyPhone: '+1 (555) 765-4399',
      capacity: 35,
      stops: [
        { stopName: 'Central Metro Plaza', pickupTime: '07:10 AM', dropTime: '03:50 PM', fare: 80, sequence: 1 },
        { stopName: 'Oak Ridge Boulevard', pickupTime: '07:25 AM', dropTime: '03:35 PM', fare: 70, sequence: 2 },
        { stopName: 'Pine Crest Commons', pickupTime: '07:40 AM', dropTime: '03:20 PM', fare: 60, sequence: 3 },
        { stopName: 'Main Campus East Gate', pickupTime: '08:00 AM', dropTime: '03:00 PM', fare: 0, sequence: 4 },
      ],
      assignedStudents: [
        {
          studentId: studentLucas._id,
          studentName: 'Lucas Miller',
          rollNumber: '1001',
          admissionNumber: 'ADM-2025-001',
          className: 'Grade 10',
          sectionName: 'Section A',
          stopName: 'Central Metro Plaza',
          pickupTime: '07:10 AM',
          dropTime: '03:50 PM',
          fare: 80,
          seatNumber: 'Seat-04',
          emergencyContact: '+1 555-4010',
          assignedDate: '2025-08-20',
        },
        {
          studentId: createdStudents[1]._id,
          studentName: 'Alice Smith',
          rollNumber: '1002',
          admissionNumber: 'ADM-2025-002',
          className: 'Grade 10',
          sectionName: 'Section A',
          stopName: 'Oak Ridge Boulevard',
          pickupTime: '07:25 AM',
          dropTime: '03:35 PM',
          fare: 70,
          seatNumber: 'Seat-08',
          emergencyContact: '+1 555-4011',
          assignedDate: '2025-08-22',
        },
      ],
      assignedStudentsCount: 2,
      status: 'Active',
    },
    {
      routeName: 'Route 2 - Westside Hills',
      routeNumber: 'RT-102',
      startPoint: 'Highland Park Station',
      endPoint: 'Main Campus North Gate',
      vehicleNumber: 'BUS-102',
      vehicleModel: 'Volvo B7R School Transit',
      vehicleType: 'Bus',
      fuelType: 'CNG',
      insuranceValidity: '2027-03-15',
      driverName: "Patrick O'Connor",
      driverPhone: '+1 (555) 876-5432',
      driverLicense: 'DL-812390-COMM',
      driverEmergencyPhone: '+1 (555) 876-5499',
      capacity: 45,
      stops: [
        { stopName: 'Highland Park Station', pickupTime: '07:05 AM', dropTime: '03:55 PM', fare: 90, sequence: 1 },
        { stopName: 'Westminster Drive', pickupTime: '07:20 AM', dropTime: '03:40 PM', fare: 75, sequence: 2 },
        { stopName: 'Evergreen Terrace', pickupTime: '07:35 AM', dropTime: '03:25 PM', fare: 60, sequence: 3 },
        { stopName: 'Main Campus North Gate', pickupTime: '07:55 AM', dropTime: '03:05 PM', fare: 0, sequence: 4 },
      ],
      assignedStudents: [
        {
          studentId: createdStudents[2]._id,
          studentName: 'Robert Johnson',
          rollNumber: '1003',
          admissionNumber: 'ADM-2025-003',
          className: 'Grade 10',
          sectionName: 'Section A',
          stopName: 'Evergreen Terrace',
          pickupTime: '07:35 AM',
          dropTime: '03:25 PM',
          fare: 60,
          seatNumber: 'Seat-12',
          emergencyContact: '+1 555-4012',
          assignedDate: '2025-08-21',
        },
        {
          studentId: createdStudents[3]._id,
          studentName: 'Maria Perez',
          rollNumber: '1004',
          admissionNumber: 'ADM-2025-004',
          className: 'Grade 10',
          sectionName: 'Section A',
          stopName: 'Westminster Drive',
          pickupTime: '07:20 AM',
          dropTime: '03:40 PM',
          fare: 75,
          seatNumber: 'Seat-15',
          emergencyContact: '+1 555-4013',
          assignedDate: '2025-08-25',
        },
      ],
      assignedStudentsCount: 2,
      status: 'Active',
    },
    {
      routeName: 'Route 3 - North Suburbs & Tech Park',
      routeNumber: 'RT-103',
      startPoint: 'Innovation Blvd',
      endPoint: 'Main Campus West Gate',
      vehicleNumber: 'VAN-201',
      vehicleModel: 'Ford Transit Eco Van 2025',
      vehicleType: 'Electric Bus',
      fuelType: 'Electric',
      insuranceValidity: '2027-06-30',
      driverName: 'Elena Gilbert',
      driverPhone: '+1 (555) 432-8765',
      driverLicense: 'DL-552190-COMM',
      driverEmergencyPhone: '+1 (555) 432-8799',
      capacity: 20,
      stops: [
        { stopName: 'Innovation Blvd & Tech Park', pickupTime: '07:15 AM', dropTime: '03:45 PM', fare: 85, sequence: 1 },
        { stopName: 'Silver Lake Promenade', pickupTime: '07:30 AM', dropTime: '03:30 PM', fare: 70, sequence: 2 },
        { stopName: 'Cedar Heights Roundabout', pickupTime: '07:45 AM', dropTime: '03:15 PM', fare: 55, sequence: 3 },
      ],
      assignedStudents: [
        {
          studentId: createdStudents[4]._id,
          studentName: 'Tom Brown',
          rollNumber: '1005',
          admissionNumber: 'ADM-2025-005',
          className: 'Grade 10',
          sectionName: 'Section A',
          stopName: 'Silver Lake Promenade',
          pickupTime: '07:30 AM',
          dropTime: '03:30 PM',
          fare: 70,
          seatNumber: 'Seat-03',
          emergencyContact: '+1 555-4014',
          assignedDate: '2025-08-28',
        },
      ],
      assignedStudentsCount: 1,
      status: 'Active',
    },
  ];
  await db.transports.insertMany(transportDocs);

  // 14. Hostels
  const hostelDocs = [
    {
      buildingName: 'Newton Scholars Hall (Boys)',
      type: 'Boys',
      wardenName: 'Capt. Thomas Vance',
      wardenPhone: '+1 (555) 998-1122',
      totalRooms: 40,
      rooms: [
        { roomNumber: 'Room 101', floor: 1, capacity: 2, occupiedBeds: 2, feePerTerm: 1400, students: [] },
        { roomNumber: 'Room 102', floor: 1, capacity: 2, occupiedBeds: 1, feePerTerm: 1400, students: [] },
        { roomNumber: 'Room 201', floor: 2, capacity: 3, occupiedBeds: 3, feePerTerm: 1200, students: [] },
      ],
    },
    {
      buildingName: 'Curie Residence Hall (Girls)',
      type: 'Girls',
      wardenName: 'Dr. Margaret Hamilton',
      wardenPhone: '+1 (555) 998-3344',
      totalRooms: 40,
      rooms: [
        { roomNumber: 'Room 101', floor: 1, capacity: 2, occupiedBeds: 2, feePerTerm: 1400, students: [] },
        { roomNumber: 'Room 102', floor: 1, capacity: 2, occupiedBeds: 0, feePerTerm: 1400, students: [] },
      ],
    },
  ];
  await db.hostels.insertMany(hostelDocs);

  // 15. Notices & Circulars
  const noticeDocs = [
    {
      circularNumber: 'CIR-2026-089',
      title: 'Annual Inter-School STEM & Robotics Olympiad 2026',
      content: 'Registrations are officially open for the 2026 Annual Regional STEM and Robotics Competition. Students from Grade 8-12 are encouraged to submit their robotics project abstracts to Prof. Brody by August 30. Workshops will be held every Wednesday afternoon in the AI Robotics Lab.',
      targetAudience: 'All',
      category: 'Academic & Competition',
      priority: 'High',
      isPinned: true,
      publishDate: '2026-08-14',
      effectiveDate: '2026-08-30',
      authorName: 'Dr. Arthur Sterling',
      authorRole: 'Super Admin',
      status: 'Published',
    },
    {
      circularNumber: 'CIR-2026-088',
      title: 'Parent-Teacher Academic Progress Conference (Term 1)',
      content: 'The first term Parent-Teacher Conference will be conducted on Saturday, September 5th from 09:00 AM to 02:00 PM in the Main Academic Quadrangle. Parents are requested to adhere to their allotted time slots to discuss academic progress, attendance reports, and term goals with class educators.',
      targetAudience: 'Parents',
      category: 'Parent Governance',
      priority: 'Urgent',
      isPinned: true,
      publishDate: '2026-08-12',
      effectiveDate: '2026-09-05',
      authorName: 'Eleanor Vance',
      authorRole: 'Principal',
      status: 'Published',
    },
    {
      circularNumber: 'CIR-2026-087',
      title: 'Mid-Term Examination Schedule & Admit Card Issuance',
      content: 'The official Mid-Term Examination schedule for Grades 6 through 12 is now finalized. Hall tickets and admit cards will be distributed through the portal and class mentors starting next Monday. Students with clear attendance and fee clearance will be issued digital exam passes.',
      targetAudience: 'Students',
      category: 'Examinations',
      priority: 'Urgent',
      isPinned: true,
      publishDate: '2026-08-11',
      effectiveDate: '2026-09-12',
      authorName: 'Eleanor Vance',
      authorRole: 'Principal',
      status: 'Published',
    },
    {
      circularNumber: 'CIR-2026-086',
      title: 'Term 1 Fee Clearance & Online Settlement Deadline',
      content: 'All parents and guardians are kindly reminded that Term 1 tuition, transport, and lab fees are due by August 30, 2026. Online payments can be made directly via credit/debit card, net banking, or at the Accounts Department counter. Late fee waivers are applicable until August 25.',
      targetAudience: 'Parents',
      category: 'Finance & Accounts',
      priority: 'High',
      isPinned: false,
      publishDate: '2026-08-09',
      effectiveDate: '2026-08-30',
      authorName: 'Sarah Jenkins',
      authorRole: 'Accountant',
      status: 'Published',
    },
    {
      circularNumber: 'CIR-2026-085',
      title: 'Faculty Curriculum Review & Quarterly Academic Audit',
      content: 'All faculty members and department heads are required to submit syllabus completion matrices and internal continuous assessment records by Friday, August 28th. The academic governance committee will hold department reviews on Monday.',
      targetAudience: 'Teachers',
      category: 'Faculty & Administration',
      priority: 'Medium',
      isPinned: false,
      publishDate: '2026-08-08',
      effectiveDate: '2026-08-28',
      authorName: 'Dr. Arthur Sterling',
      authorRole: 'Super Admin',
      status: 'Published',
    },
    {
      circularNumber: 'CIR-2026-084',
      title: 'Campus Solar Energy Installation & Library Upgrades',
      content: 'We are pleased to announce the completion of Phase 1 of our campus solar grid and the addition of 250+ new volumes in the science and computer engineering libraries. The library quiet study hall hours have been extended to 07:00 PM on weekdays.',
      targetAudience: 'All',
      category: 'Campus Facilities',
      priority: 'Low',
      isPinned: false,
      publishDate: '2026-08-05',
      effectiveDate: '2026-08-15',
      authorName: 'Administration Office',
      authorRole: 'Admin',
      status: 'Published',
    },
  ];
  await db.notices.insertMany(noticeDocs);

  // 16. Events
  const eventDocs = [
    {
      title: 'Independence Day & Cultural Gala',
      description: 'Flag hoisting ceremony followed by patriotic musical symphony and student dance performances.',
      eventType: 'Cultural',
      startDate: '2026-08-20',
      endDate: '2026-08-20',
      location: 'Grand Amphitheater',
      organizer: 'Cultural Arts Council',
      audience: 'All',
    },
    {
      title: 'Mid-Term Examination Series',
      description: 'Comprehensive mid-term evaluations for Grade 6 through Grade 12.',
      eventType: 'Exam',
      startDate: '2026-09-12',
      endDate: '2026-09-22',
      location: 'Examination Halls A, B & C',
      organizer: 'Academic Controller',
      audience: 'Students',
    },
    {
      title: 'Annual Sports & Athletics Meet',
      description: 'Track and field events, inter-house relays, soccer championship and basketball finals.',
      eventType: 'Sports',
      startDate: '2026-10-05',
      endDate: '2026-10-07',
      location: 'Olympic Sports Arena & Track',
      organizer: 'Sports Department',
      audience: 'All',
    },
  ];
  await db.events.insertMany(eventDocs);

  // 17. Seed Initial Direct Messages
  const messageDocs = [
    {
      senderId: 'admin-001',
      senderName: 'Dr. Arthur Sterling',
      senderRole: 'Super Admin',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      recipientId: 'all-staff',
      recipientName: 'Faculty & Administrative Staff',
      recipientRole: 'Teacher',
      subject: 'Welcome to Term 1 Academic Planning & Syllabus Alignment',
      body: 'Dear Faculty Members, please ensure that all department lesson plans and continuous assessment schedules are uploaded by the end of the week. Let the administration know if your classroom requires updated lab materials.',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      senderId: teacherMarcus ? teacherMarcus.userId || teacherMarcus._id : 'tch-1001',
      senderName: 'Prof. Marcus Brody',
      senderRole: 'Teacher',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      recipientId: 'admin-001',
      recipientName: 'Dr. Arthur Sterling',
      recipientRole: 'Super Admin',
      subject: 'Mathematics Lab Hardware Upgrade Request',
      body: 'We would like to request 5 additional graphing computing terminals for the Grade 11 Advanced Calculus students prior to the upcoming olympiad training session.',
      isRead: true,
      createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    },
    {
      senderId: 'admin-001',
      senderName: 'Dr. Arthur Sterling',
      senderRole: 'Super Admin',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      recipientId: studentLucas ? studentLucas.userId || studentLucas._id : 'std-seed-lucas',
      recipientName: 'Lucas Miller',
      recipientRole: 'Student',
      subject: 'Congratulations on Science Olympiad Regional Qualification',
      body: 'Lucas, congratulations on qualifying for the Regional Science Olympiad. Please collect your official participation badge and travel guidelines from the Academic Office.',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    },
  ];
  await db.messages.insertMany(messageDocs);

  // 18. Seed Initial Audit Logs (Security, Deletions, Role & Permission Changes)
  const auditDocs = [
    {
      eventHash: 'LOG-SEC-8921A',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 mins ago
      actor: {
        id: 'admin-001',
        name: 'Dr. Arthur Sterling',
        email: 'admin@edupulse.edu',
        role: 'Super Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      action: 'PERMISSION_ROLE_CHANGED',
      category: 'Access & Permissions',
      severity: 'HIGH',
      target: {
        id: 'usr-98124',
        name: 'Eleanor Vance',
        email: 'principal@edupulse.edu',
        type: 'UserAccount',
        role: 'Principal',
      },
      changes: {
        before: { role: 'Teacher', permissions: ['view_classes', 'grade_entry'] },
        after: { role: 'Principal', permissions: ['academic_governance', 'faculty_management', 'notices_publish'] },
      },
      details: 'Elevated user account Eleanor Vance to Principal administrative role with academic governance privileges.',
      status: 'SUCCESS',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/127.0.0.0 Safari/537.36',
    },
    {
      eventHash: 'LOG-DEL-7419B',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
      actor: {
        id: 'admin-001',
        name: 'Dr. Arthur Sterling',
        email: 'admin@edupulse.edu',
        role: 'Super Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      action: 'USER_DELETED',
      category: 'User Management',
      severity: 'CRITICAL',
      target: {
        id: 'usr-inactive-44',
        name: 'Richard Henderson',
        email: 'r.henderson@staff.edupulse.edu',
        role: 'Teacher',
        type: 'UserAccount',
      },
      changes: null,
      details: 'Permanently removed departed faculty user account Richard Henderson and revoked all directory and portal credentials.',
      status: 'SUCCESS',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/127.0.0.0 Safari/537.36',
    },
    {
      eventHash: 'LOG-STU-3321C',
      timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), // 8 hours ago
      actor: {
        id: 'principal-001',
        name: 'Eleanor Vance',
        email: 'principal@edupulse.edu',
        role: 'Principal',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      },
      action: 'STUDENT_DELETED',
      category: 'Student & Guardian',
      severity: 'CRITICAL',
      target: {
        id: 'std-transferred-09',
        name: 'Ethan Huntley',
        admissionNumber: 'ADM-2024-0089',
        type: 'StudentProfile',
      },
      changes: null,
      details: 'Archived and removed transferred student profile Ethan Huntley (ADM-2024-0089) per official transfer certificate TC-884.',
      status: 'SUCCESS',
      ipAddress: '192.168.1.62',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36',
    },
    {
      eventHash: 'LOG-GRD-9011D',
      timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), // 14 hours ago
      actor: {
        id: 'admin-001',
        name: 'Dr. Arthur Sterling',
        email: 'admin@edupulse.edu',
        role: 'Super Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      action: 'GUARDIAN_DELETED',
      category: 'Student & Guardian',
      severity: 'CRITICAL',
      target: {
        id: 'par-old-12',
        name: 'Thomas Wayne Sr.',
        email: 't.wayne@archived.com',
        type: 'ParentGuardian',
      },
      changes: null,
      details: 'Removed obsolete guardian contact entry Thomas Wayne Sr. and decoupled student guardian links.',
      status: 'SUCCESS',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/127.0.0.0 Safari/537.36',
    },
    {
      eventHash: 'LOG-SEC-6612E',
      timestamp: new Date(Date.now() - 22 * 3600 * 1000).toISOString(), // 22 hours ago
      actor: {
        id: 'admin-001',
        name: 'Dr. Arthur Sterling',
        email: 'admin@edupulse.edu',
        role: 'Super Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      action: 'PASSWORD_RESET_ADMIN',
      category: 'System Security',
      severity: 'HIGH',
      target: {
        id: 'usr-act-88',
        name: 'Sarah Jenkins',
        email: 'accountant@edupulse.edu',
        type: 'UserAccount',
      },
      details: 'Forced administrative security credential reset for Finance Officer Sarah Jenkins.',
      status: 'SUCCESS',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/127.0.0.0 Safari/537.36',
    },
    {
      eventHash: 'LOG-USR-5521F',
      timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(), // 1 day ago
      actor: {
        id: 'admin-001',
        name: 'Dr. Arthur Sterling',
        email: 'admin@edupulse.edu',
        role: 'Super Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      action: 'USER_ACCOUNT_DEACTIVATED',
      category: 'User Management',
      severity: 'HIGH',
      target: {
        id: 'usr-tmp-22',
        name: 'Temporary Lab Assistant',
        email: 'temp.lab@edupulse.edu',
        type: 'UserAccount',
      },
      changes: {
        before: { isActive: true },
        after: { isActive: false },
      },
      details: 'Suspended login access for contract role Temporary Lab Assistant upon semester conclusion.',
      status: 'SUCCESS',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/127.0.0.0 Safari/537.36',
    },
    {
      eventHash: 'LOG-SYS-4412G',
      timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), // 1.5 days ago
      actor: {
        id: 'admin-001',
        name: 'Dr. Arthur Sterling',
        email: 'admin@edupulse.edu',
        role: 'Super Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      action: 'SYSTEM_SETTINGS_UPDATED',
      category: 'System Security',
      severity: 'MEDIUM',
      target: {
        type: 'SystemConfiguration',
        name: 'Academic Year & Currency Policy',
      },
      changes: {
        before: { academicYear: '2024-2025', timezone: 'UTC-07:00' },
        after: { academicYear: '2025-2026', timezone: 'UTC-08:00 (Pacific Time)' },
      },
      details: 'Updated institutional configuration parameters for academic year 2025-2026.',
      status: 'SUCCESS',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/127.0.0.0 Safari/537.36',
    },
    {
      eventHash: 'LOG-ENR-2211H',
      timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 2 days ago
      actor: {
        id: 'admin-001',
        name: 'Dr. Arthur Sterling',
        email: 'admin@edupulse.edu',
        role: 'Super Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      action: 'STUDENT_ENROLLED',
      category: 'Student & Guardian',
      severity: 'MEDIUM',
      target: {
        id: 'std-seed-lucas',
        name: 'Lucas Miller',
        admissionNumber: 'ADM-2026-0042',
        email: 'student@edupulse.edu',
        type: 'StudentProfile',
      },
      details: 'Registered and provisioned grade 10 student enrollment profile for Lucas Miller with student portal credentials.',
      status: 'SUCCESS',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/127.0.0.0 Safari/537.36',
    },
  ];
  await db.auditLogs.insertMany(auditDocs);

  // 17. Seed Role Requests
  const claraUser = createdUsers.find((u) => u.email === 'clara.applicant@edupulse.edu');
  const aryanUser = createdUsers.find((u) => u.email === 'explorer@edupulse.edu');

  const roleRequestDocs = [
    {
      userId: claraUser ? claraUser._id : 'seed-user-clara',
      userName: 'Dr. Clara Oswald',
      userEmail: 'clara.applicant@edupulse.edu',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      currentRole: 'Member',
      requestedRole: 'Teacher',
      reason: 'Holds Ph.D. in Physics from Oxford. Applying for Senior Secondary Physics Department Teacher role.',
      qualification: 'Ph.D. Physics, B.Ed Certified',
      department: 'Science & Physics',
      employeeOrRegId: 'FAC-APPL-2026-08',
      requiredApprover: 'Principal',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    },
    {
      userId: aryanUser ? aryanUser._id : 'seed-user-aryan',
      userName: 'Aryan Verma',
      userEmail: 'explorer@edupulse.edu',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      currentRole: 'Member',
      requestedRole: 'Student',
      reason: 'Enrolled in Grade 11 Science stream. Requesting student portal access for syllabus & attendance.',
      qualification: 'Grade 10 Board Distinction (96%)',
      department: 'Senior Secondary',
      employeeOrRegId: 'ADM-2026-APP-099',
      requiredApprover: 'Principal',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    },
    {
      userId: 'ext-user-principal-candidate',
      userName: 'Prof. Jonathan Ross',
      userEmail: 'jonathan.governance@edupulse.edu',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      currentRole: 'Member',
      requestedRole: 'Principal',
      reason: '20+ years academic leadership experience. Appointed as Associate Campus Director & Principal.',
      qualification: 'M.Ed, Ph.D. Educational Leadership',
      department: 'School Administration & Governance',
      employeeOrRegId: 'ADMIN-EXEC-004',
      requiredApprover: 'Super Admin',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
  ];

  await db.roleRequests.insertMany(roleRequestDocs);

  console.log('[Seeder] Database successfully populated with comprehensive enterprise records, role requests, and audit logs.');
};

// Run directly if invoked from CLI
if (process.argv[1]?.includes('seeder.js')) {
  seedDatabase().then(() => process.exit(0));
}
