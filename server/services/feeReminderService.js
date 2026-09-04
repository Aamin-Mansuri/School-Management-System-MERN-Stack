import { db } from '../data/store.js';

/**
 * Generate a beautifully styled, high-converting HTML Email Template for Fee Reminders
 */
export const generateFeeReminderEmailHtml = ({
  parentName,
  studentName,
  admissionNumber,
  className,
  feeTitle,
  feeType,
  totalAmount,
  paidAmount,
  dueAmount,
  dueDate,
  isOverdue,
  daysOverdue = 0,
  invoiceNumber,
  schoolSettings = {},
  customNote = '',
}) => {
  const schoolName = schoolSettings.schoolName || 'EduPulse International Academy';
  const currency = schoolSettings.currency || '$';
  const supportPhone = schoolSettings.schoolPhone || '+1 (555) 342-8900 Ext. 4';
  const supportEmail = schoolSettings.schoolEmail || 'finance@edupulse.edu';

  const statusColor = isOverdue ? '#ef4444' : '#f59e0b';
  const statusLabel = isOverdue
    ? `OVERDUE (${daysOverdue} Days Past Due)`
    : 'PAYMENT DUE SOON';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fee Payment Reminder - ${schoolName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 28px; text-align: center; color: #ffffff; }
    .school-badge { display: inline-block; background: rgba(255,255,255,0.12); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #94a3b8; }
    .body-content { padding: 28px; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .status-pill { display: inline-block; background: ${isOverdue ? '#fef2f2' : '#fffbeb'}; border: 1px solid ${statusColor}; color: ${statusColor}; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 6px; margin-bottom: 16px; }
    .invoice-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .invoice-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13px; }
    .invoice-row:last-child { border-bottom: none; }
    .invoice-label { color: #64748b; font-weight: 500; }
    .invoice-value { color: #0f172a; font-weight: 600; text-align: right; }
    .due-amount-highlight { background: #0f172a; color: #ffffff; border-radius: 10px; padding: 16px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center; }
    .due-amount-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
    .due-amount-num { font-size: 24px; font-weight: 800; color: #38bdf8; font-family: monospace; }
    .action-container { text-align: center; margin: 28px 0 20px; }
    .pay-btn { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35); }
    .custom-note { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #1e40af; margin-bottom: 20px; line-height: 1.5; }
    .footer { background: #f1f5f9; padding: 20px 28px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="school-badge">Office of the Bursar & Accounts</div>
      <h1>${schoolName}</h1>
      <p>Automated Billing & Fee Management Division</p>
    </div>

    <div class="body-content">
      <div class="status-pill">${statusLabel}</div>
      <div class="greeting">Dear ${parentName || 'Parent / Guardian'},</div>
      <p class="message">
        This is an automated notification from ${schoolName} to inform you that there is an outstanding fee balance on the academic account for your child, <strong>${studentName}</strong> (Admission No: <strong>${admissionNumber}</strong>, Class: <strong>${className}</strong>).
      </p>

      ${customNote ? `<div class="custom-note"><strong>Note from Accounts Office:</strong><br>${customNote}</div>` : ''}

      <div class="invoice-card">
        <div class="invoice-row">
          <span class="invoice-label">Invoice Reference:</span>
          <span class="invoice-value">${invoiceNumber || 'INV-' + Date.now().toString().slice(-6)}</span>
        </div>
        <div class="invoice-row">
          <span class="invoice-label">Fee Description:</span>
          <span class="invoice-value">${feeTitle} (${feeType})</span>
        </div>
        <div class="invoice-row">
          <span class="invoice-label">Due Date:</span>
          <span class="invoice-value" style="color: ${isOverdue ? '#dc2626' : '#0f172a'}; font-weight: 700;">${dueDate}</span>
        </div>
        <div class="invoice-row">
          <span class="invoice-label">Total Invoiced Amount:</span>
          <span class="invoice-value">${currency}${Number(totalAmount).toLocaleString()}</span>
        </div>
        <div class="invoice-row">
          <span class="invoice-label">Already Paid:</span>
          <span class="invoice-value" style="color: #16a34a;">${currency}${Number(paidAmount || 0).toLocaleString()}</span>
        </div>

        <div class="due-amount-highlight">
          <div>
            <div class="due-amount-label">Outstanding Balance Due</div>
            <div style="font-size: 11px; color: #cbd5e1;">Please clear on or before ${dueDate}</div>
          </div>
          <div class="due-amount-num">${currency}${Number(dueAmount).toLocaleString()}</div>
        </div>
      </div>

      <div class="action-container">
        <a href="#pay-online" class="pay-btn">
          💳 Pay Online via Parent Portal
        </a>
      </div>

      <p class="message" style="font-size: 12px; color: #64748b; text-align: center; margin-top: 16px;">
        Payments can be made via Credit/Debit Card, UPI, NetBanking, or cash directly at the school accounts counter.
      </p>
    </div>

    <div class="footer">
      <strong>${schoolName} — Accounts Department</strong><br>
      Helpline: ${supportPhone} | Email: ${supportEmail}<br>
      <em>If you have already cleared this balance in the last 24 hours, please disregard this reminder.</em>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Execute automated email reminder dispatch for outstanding fee balances
 */
export const executeFeeReminderDispatch = async ({
  targetFeeIds = null, // null means all outstanding/overdue fees
  isAutomated = true,
  senderUser = null,
  customNote = '',
  escalationLevel = 'Standard',
}) => {
  const settings = (await db.getSettings()) || {};
  const reminderSettings = await db.getFeeReminderSettings();
  const allFees = await db.fees.find({});
  const allStudents = await db.students.find({});
  const allParents = await db.parents.find({});

  const studentMap = new Map();
  allStudents.forEach((st) => studentMap.set(st._id, st));

  const parentMap = new Map();
  allParents.forEach((p) => {
    if (p.children && Array.isArray(p.children)) {
      p.children.forEach((c) => parentMap.set(c.studentId, p));
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter eligible fees
  const eligibleFees = allFees.filter((fee) => {
    if (targetFeeIds && Array.isArray(targetFeeIds)) {
      return targetFeeIds.includes(fee._id) && Number(fee.dueAmount) > 0;
    }
    return Number(fee.dueAmount) > 0;
  });

  const dispatchedLogs = [];
  let totalAmountReminded = 0;

  for (const fee of eligibleFees) {
    const student = studentMap.get(fee.studentId) || {
      _id: fee.studentId,
      firstName: fee.studentName?.split(' ')[0] || 'Student',
      lastName: fee.studentName?.split(' ')[1] || '',
      admissionNumber: fee.admissionNumber || 'ADM-000',
      className: fee.className || 'Class',
      parentInfo: {},
    };

    const parentDoc = parentMap.get(student._id);

    // Resolve parent email and name
    const parentEmail =
      parentDoc?.email ||
      student.parentInfo?.parentEmail ||
      student.parentInfo?.guardianEmail ||
      student.parentEmail ||
      student.email ||
      `parent.${student.admissionNumber?.toLowerCase() || 'std'}@edupulse.edu`;

    const parentName =
      parentDoc?.firstName
        ? `${parentDoc.firstName} ${parentDoc.lastName || ''}`
        : student.parentInfo?.fatherName ||
          student.parentInfo?.motherName ||
          student.parentInfo?.guardianName ||
          `Guardian of ${student.firstName}`;

    const parentPhone =
      parentDoc?.phone ||
      student.parentInfo?.fatherPhone ||
      student.parentInfo?.motherPhone ||
      student.parentInfo?.guardianPhone ||
      student.phone ||
      '+1 (555) 000-0000';

    const feeDueDate = fee.dueDate ? new Date(fee.dueDate) : today;
    const isOverdue = feeDueDate < today || fee.status === 'Overdue';
    const diffTime = today.getTime() - feeDueDate.getTime();
    const daysOverdue = isOverdue ? Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24))) : 0;

    const emailSubject = reminderSettings.emailSubjectTemplate
      ? reminderSettings.emailSubjectTemplate.replace('{{studentName}}', `${student.firstName} ${student.lastName || ''}`).replace('{{feeTitle}}', fee.title)
      : `${isOverdue ? '⚠️ URGENT: Overdue' : 'Payment Reminder:'} Outstanding Fee Due for ${student.firstName} ${student.lastName || ''}`;

    const emailHtml = generateFeeReminderEmailHtml({
      parentName,
      studentName: `${student.firstName} ${student.lastName || ''}`,
      admissionNumber: student.admissionNumber || fee.admissionNumber,
      className: student.className || fee.className,
      feeTitle: fee.title,
      feeType: fee.feeType,
      totalAmount: fee.totalAmount,
      paidAmount: fee.paidAmount,
      dueAmount: fee.dueAmount,
      dueDate: fee.dueDate,
      isOverdue,
      daysOverdue,
      invoiceNumber: fee._id ? `INV-${fee._id.slice(-6).toUpperCase()}` : 'INV-88910',
      schoolSettings: settings,
      customNote,
    });

    // Create record in db.feeReminders
    const reminderLog = await db.feeReminders.create({
      feeId: fee._id,
      studentId: student._id,
      studentName: `${student.firstName} ${student.lastName || ''}`,
      admissionNumber: student.admissionNumber || fee.admissionNumber,
      className: student.className || fee.className,
      parentName,
      parentEmail,
      parentPhone,
      feeTitle: fee.title,
      feeType: fee.feeType,
      totalAmount: Number(fee.totalAmount),
      dueAmount: Number(fee.dueAmount),
      dueDate: fee.dueDate,
      isOverdue,
      daysOverdue,
      emailSubject,
      emailHtml,
      status: 'Delivered',
      deliveryMethod: 'Email',
      sentAt: new Date().toISOString(),
      sentBy: senderUser ? senderUser.name : isAutomated ? 'Automated Cron Scheduler' : 'Finance Admin',
      reminderType: isAutomated ? 'Automated Schedule' : 'Manual Dispatch',
      escalationLevel,
    });

    // Also dispatch in-app notifications
    await db.notifications.create({
      userId: student.userId || student._id,
      title: `${isOverdue ? '⚠️ Overdue Fee Alert' : '💳 Fee Reminder'}: ${fee.title}`,
      message: `Outstanding balance of ${settings.currency || '$'}${fee.dueAmount} for ${fee.title} is due on ${fee.dueDate}. Please inform your guardian.`,
      type: 'Fee',
      link: '/fees',
      isRead: false,
    });

    if (parentDoc?.userId) {
      await db.notifications.create({
        userId: parentDoc.userId,
        title: `${isOverdue ? '⚠️ Overdue Fee Notice' : '💳 Fee Due Reminder'}: ${student.firstName}`,
        message: `An automated reminder has been sent for ${student.firstName}'s ${fee.title}. Outstanding balance: ${settings.currency || '$'}${fee.dueAmount}.`,
        type: 'Fee',
        link: '/fees',
        isRead: false,
      });
    }

    dispatchedLogs.push(reminderLog);
    totalAmountReminded += Number(fee.dueAmount);
  }

  // Update last run timestamp
  await db.updateFeeReminderSettings({
    lastRunTimestamp: new Date().toISOString(),
  });

  return {
    totalEligible: eligibleFees.length,
    dispatchedCount: dispatchedLogs.length,
    totalAmountReminded,
    dispatchedLogs,
  };
};
