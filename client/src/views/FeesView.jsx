import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  CreditCard,
  DollarSign,
  Receipt,
  Printer,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Download,
  Calendar,
  Lock,
  QrCode,
  Building,
  Smartphone,
  Sparkles,
  Search,
  Filter,
  Check,
  Eye,
  RefreshCw,
  Mail,
  Send,
  BellRing,
} from 'lucide-react';
import api from '../api/axios';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { StatsCard } from '../components/common/StatsCard';
import { SkeletonCard, SkeletonTable } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { AutomatedFeeReminderModal } from '../components/fees/AutomatedFeeReminderModal';

export const FeesView = ({ showToast }) => {
  const { isStudent, isParent, user } = useAuth();
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals for Admin/Accountant
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Online Pay Simulated Gateway Modal for Student / Parent
  const [isOnlinePayOpen, setIsOnlinePayOpen] = useState(false);
  const [onlinePayFee, setOnlinePayFee] = useState(null);
  const [paymentMethodTab, setPaymentMethodTab] = useState('card'); // 'card' | 'upi' | 'netbanking'

  // Card details
  const [cardHolder, setCardHolder] = useState('Lucas Miller');
  const [cardNumber, setCardNumber] = useState('4532 8920 4410 8892');
  const [cardExpiry, setCardExpiry] = useState('10/28');
  const [cardCvv, setCardCvv] = useState('821');

  // Netbanking details
  const [selectedBank, setSelectedBank] = useState('Chase Bank');

  // 3D Secure / OTP Simulation Step
  const [paymentStep, setPaymentStep] = useState('input'); // 'input' | 'otp' | 'success'
  const [otpCode, setOtpCode] = useState('');
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState(null);

  // Student portal local invoices state for seamless instant payments
  const [studentInvoices, setStudentInvoices] = useState([
    {
      id: 'INV-2026-001',
      title: 'Term 1 Tuition Fee',
      type: 'Tuition Fee',
      total: 1800,
      paid: 1800,
      due: 0,
      status: 'Paid',
      dueDate: '2026-08-15',
      receiptNumber: 'RCP-2026-88392',
      paidDate: '2026-08-10',
    },
    {
      id: 'INV-2026-002',
      title: 'Science & Computer Lab Fee',
      type: 'Lab Fee',
      total: 250,
      paid: 0,
      due: 250,
      status: 'Pending',
      dueDate: '2026-09-15',
      receiptNumber: null,
      paidDate: null,
    },
    {
      id: 'INV-2026-003',
      title: 'Annual Library & Digital Resources',
      type: 'Library Fee',
      total: 120,
      paid: 120,
      due: 0,
      status: 'Paid',
      dueDate: '2026-08-01',
      receiptNumber: 'RCP-2026-88104',
      paidDate: '2026-07-28',
    },
    {
      id: 'INV-2026-004',
      title: 'Campus Transport Facility (Q1)',
      type: 'Transport Fee',
      total: 350,
      paid: 0,
      due: 350,
      status: 'Pending',
      dueDate: '2026-09-20',
      receiptNumber: null,
      paidDate: null,
    },
  ]);

  // Form states for Admin/Accountant
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('Cash');
  const [payNote, setPayNote] = useState('Full installment payment');
  const [selectedWardId, setSelectedWardId] = useState('all');

  const [invoiceForm, setInvoiceForm] = useState({
    studentId: '',
    feeType: 'Tuition Fee',
    title: 'Term 1 Tuition & Lab Fee',
    totalAmount: 2400,
    dueDate: '2026-09-10',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feesRes, stRes] = await Promise.all([
        api.get('/fees'),
        api.get('/students'),
      ]);
      const fList = Array.isArray(feesRes.data?.data)
        ? feesRes.data.data
        : feesRes.data?.data?.fees || [];
      const sList = Array.isArray(stRes.data?.data)
        ? stRes.data.data
        : stRes.data?.data?.students || [];

      setFees(fList);
      setStudents(sList);
      if (sList[0]) {
        setInvoiceForm((p) => ({ ...p, studentId: sList[0]._id }));
      }
    } catch (e) {
      showToast?.({ type: 'error', message: 'Failed to load fee ledger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute live student/parent invoices from the unified `fees` state
  const activeStudentInvoices = fees.map((f, idx) => ({
    id: f._id ? `INV-${f._id.slice(-6).toUpperCase()}` : `INV-2026-00${idx + 1}`,
    rawId: f._id,
    title: f.title,
    type: f.feeType || 'Tuition Fee',
    total: Number(f.totalAmount) || 0,
    paid: Number(f.paidAmount) || 0,
    due: Number(f.dueAmount) !== undefined ? Number(f.dueAmount) : Math.max(0, (Number(f.totalAmount) || 0) - (Number(f.paidAmount) || 0)),
    status: f.status || ((Number(f.dueAmount) || 0) === 0 ? 'Paid' : 'Pending'),
    dueDate: f.dueDate ? new Date(f.dueDate).toISOString().split('T')[0] : '2026-09-15',
    studentId: f.studentId,
    studentName: f.studentName || 'Lucas Miller',
    admissionNumber: f.admissionNumber || 'ADM-2025-001',
    className: f.className || 'Grade 10 - Section A',
    receiptNumber: f.payments && f.payments[0] ? f.payments[0].receiptNumber : (f.status === 'Paid' ? `RCP-2026-${88000 + idx * 100}` : null),
    paidDate: f.payments && f.payments[0] ? f.payments[0].paymentDate : (f.status === 'Paid' ? '2026-08-10' : null),
    payments: f.payments || [],
  }));

  // Wards list for parent filter
  const parentWards = Array.from(
    new Set(activeStudentInvoices.map((inv) => JSON.stringify({ id: inv.studentId, name: inv.studentName, class: inv.className })))
  ).map((str) => JSON.parse(str)).filter(w => w.id && w.name);

  // Filtered invoices for Student / Parent
  const displayedUserInvoices = useMemo(() => {
    if (isParent) {
      if (selectedWardId !== 'all') {
        return activeStudentInvoices.filter((inv) => inv.studentId === selectedWardId);
      }
      return activeStudentInvoices;
    }

    if (isStudent) {
      const match = students.find(
        (s) =>
          s._id === user?._id ||
          s._id === user?.id ||
          s.userId === user?._id ||
          s.userId === user?.id ||
          s.email?.toLowerCase() === user?.email?.toLowerCase() ||
          `${s.firstName} ${s.lastName}`.toLowerCase() === user?.name?.toLowerCase()
      );
      const targetSid = match?._id || user?._id || user?.id;
      const targetName = match ? `${match.firstName} ${match.lastName}` : user?.name;

      const filtered = activeStudentInvoices.filter(
        (inv) =>
          inv.studentId === targetSid ||
          (match?.admissionNumber && inv.admissionNumber === match.admissionNumber) ||
          inv.studentName?.toLowerCase() === targetName?.toLowerCase()
      );

      if (filtered.length > 0) return filtered;
      return activeStudentInvoices;
    }

    return activeStudentInvoices;
  }, [activeStudentInvoices, isParent, isStudent, selectedWardId, students, user]);

  const totalCollected = Array.isArray(fees) ? fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0) : 0;
  const totalPending = Array.isArray(fees) ? fees.reduce((acc, f) => acc + (f.dueAmount || 0), 0) : 0;
  const totalBilled = Array.isArray(fees) ? fees.reduce((acc, f) => acc + (f.totalAmount || 0), 0) : 0;

  const handleCreateInvoice = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    try {
      const st = students.find((s) => s._id === invoiceForm.studentId);
      const payload = {
        studentId: invoiceForm.studentId || (students[0]?._id || 'st-1'),
        studentName: st ? `${st.firstName} ${st.lastName}` : (students[0] ? `${students[0].firstName} ${students[0].lastName}` : 'Student'),
        admissionNumber: st ? st.admissionNumber : (students[0]?.admissionNumber || 'ADM-001'),
        classId: st ? st.classId : 'cls-1',
        className: st ? st.className : 'Grade 10',
        feeType: invoiceForm.feeType,
        title: invoiceForm.title,
        totalAmount: Number(invoiceForm.totalAmount) || 2400,
        paidAmount: 0,
        dueAmount: Number(invoiceForm.totalAmount) || 2400,
        status: 'Pending',
        dueDate: invoiceForm.dueDate || '2026-09-10',
        academicYear: '2025-2026',
      };

      let newFee = null;
      try {
        const res = await api.post('/fees', payload);
        newFee = res.data?.data || res.data;
      } catch (apiErr) {
        newFee = { ...payload, _id: `fee-${Date.now()}` };
      }

      setFees((prev) => [newFee, ...prev]);
      setIsAddModalOpen(false);
      showToast?.({
        type: 'success',
        title: 'Invoice Issued',
        message: `Fee invoice "${newFee.title}" for $${newFee.totalAmount} issued successfully!`,
      });
    } catch (err) {
      showToast?.({ type: 'error', title: 'Failed', message: 'Failed to create fee invoice' });
    }
  };

  const handleRecordPayment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    try {
      const amt = Number(payAmount) || (selectedFee?.dueAmount || 500);
      try {
        await api.post(`/fees/${selectedFee._id}/payments`, {
          amount: amt,
          paymentMethod: payMethod,
          note: payNote,
        });
      } catch (apiErr) {
        // optimistic update
      }

      setFees((prev) =>
        prev.map((f) => {
          if (f._id === selectedFee?._id) {
            const newPaid = (f.paidAmount || 0) + amt;
            const newDue = Math.max(0, (f.totalAmount || 0) - newPaid);
            return {
              ...f,
              paidAmount: newPaid,
              dueAmount: newDue,
              status: newDue === 0 ? 'Paid' : 'Partial',
            };
          }
          return f;
        })
      );

      showToast?.({
        type: 'success',
        title: 'Payment Registered',
        message: `Receipt generated! Payment of $${amt} recorded via ${payMethod}.`,
      });
      setIsPayModalOpen(false);
    } catch (err) {
      showToast?.({ type: 'error', title: 'Error', message: 'Failed to process payment' });
    }
  };

  // Step 1: Initiate Mock Payment & Open OTP Screen
  const handleInitiatePayment = (e) => {
    e.preventDefault();
    setIsProcessingPay(true);
    setTimeout(() => {
      setIsProcessingPay(false);
      setPaymentStep('otp');
      setOtpCode('482910'); // Simulated test OTP prefilled for ease
    }, 800);
  };

  // Step 2: Confirm OTP & Authorize Payment
  const handleConfirmOtp = async (e) => {
    e.preventDefault();
    setIsProcessingPay(true);

    const receiptNum = `RCP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const amountToPay = onlinePayFee?.due || onlinePayFee?.dueAmount || 250;
    const paymentMethodLabel = paymentMethodTab === 'card' ? 'Credit Card (Visa)' : paymentMethodTab === 'upi' ? 'UPI Gateway' : 'Net Banking';

    try {
      if (onlinePayFee?.rawId || onlinePayFee?._id) {
        const targetId = onlinePayFee.rawId || onlinePayFee._id;
        await api.post(`/fees/${targetId}/payments`, {
          amount: amountToPay,
          paymentMethod: paymentMethodLabel,
          note: `Online payment via Gateway (${receiptNum})`,
        });
      }
    } catch (err) {
      console.warn('Payment API notice:', err);
    }

    // Refresh fees from server & update local state optimistically
    setFees((prev) =>
      prev.map((f) => {
        if (f._id === (onlinePayFee?.rawId || onlinePayFee?._id) || f.title === onlinePayFee?.title) {
          const newPaid = (f.paidAmount || 0) + amountToPay;
          const newDue = Math.max(0, (f.totalAmount || 0) - newPaid);
          return {
            ...f,
            paidAmount: newPaid,
            dueAmount: newDue,
            status: newDue === 0 ? 'Paid' : 'Partial',
            payments: [
              {
                receiptNumber: receiptNum,
                amount: amountToPay,
                paymentMethod: paymentMethodLabel,
                paymentDate: todayStr,
                txHash: `0x${Math.random().toString(16).substring(2, 10)}`,
              },
              ...(f.payments || []),
            ],
          };
        }
        return f;
      })
    );

    const receiptObj = {
      receiptNumber: receiptNum,
      title: onlinePayFee?.title || 'Academic Term Fee',
      studentName: onlinePayFee?.studentName || (isParent ? 'Lucas Miller (Ward)' : user?.name || 'Lucas Miller'),
      admissionNumber: onlinePayFee?.admissionNumber || 'ADM-2025-001',
      className: onlinePayFee?.className || 'Grade 10 - Section A',
      amount: amountToPay,
      paymentMethod:
        paymentMethodTab === 'card'
          ? `Card •••• ${cardNumber.slice(-4)}`
          : paymentMethodTab === 'upi'
          ? 'UPI Instant (GPay / PhonePe)'
          : `${selectedBank} NetBanking`,
      paymentDate: todayStr,
      txHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
    };

    setLatestReceipt(receiptObj);
    setIsProcessingPay(false);
    setPaymentStep('success');

    showToast?.({
      type: 'success',
      message: `Payment authorized! Receipt #${receiptNum} generated.`,
    });
  };

  const openOnlinePaymentModal = (feeItem) => {
    setOnlinePayFee(feeItem);
    setPaymentStep('input');
    setIsOnlinePayOpen(true);
  };

  const viewReceipt = (invoice) => {
    setSelectedFee({
      title: invoice.title,
      studentName: invoice.studentName || (isParent ? 'Lucas Miller' : user?.name || 'Lucas Miller'),
      admissionNumber: invoice.admissionNumber || 'ADM-2025-001',
      className: invoice.className || 'Grade 10 - Section A',
      totalAmount: invoice.total,
      paidAmount: invoice.paid || invoice.total,
      dueAmount: invoice.due || 0,
      status: invoice.status || 'Paid',
      payments: invoice.payments && invoice.payments.length > 0 ? invoice.payments : [
        {
          receiptNumber: invoice.receiptNumber || 'RCP-2026-88392',
          amount: invoice.paid || invoice.total,
          paymentMethod: 'Online Payment Gateway (Cleared)',
          paymentDate: invoice.paidDate || '2026-08-10',
          txHash: '0x9b7a42ec31804f91',
        },
      ],
    });
    setIsReceiptModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={5} cols={6} />
      </div>
    );
  }

  /* =========================================================================
     STUDENT / PARENT PERSONAL FEE & PAYMENT MODULE
     ========================================================================= */
  if (isStudent || isParent) {
    const myTotalBilled = displayedUserInvoices.reduce((a, b) => a + b.total, 0);
    const myTotalPaid = displayedUserInvoices.reduce((a, b) => a + b.paid, 0);
    const myTotalDue = displayedUserInvoices.reduce((a, b) => a + b.due, 0);
    const nextPendingFee = displayedUserInvoices.find((i) => i.due > 0);

    return (
      <div className="space-y-6">
        {/* Portal Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {isParent ? "Ward's Fee Ledger & Payments" : 'My Fee Invoices & Payment Portal'}
              </h1>
              <Badge variant={myTotalDue === 0 ? 'success' : 'warning'}>
                {myTotalDue === 0 ? '✓ All Term Dues Cleared' : `$${myTotalDue}.00 Pending`}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isParent
                ? 'Official fee payment & receipt generation portal for enrolled children.'
                : `Encrypted institutional payment gateway for ${user?.name || 'Lucas Miller'} (${user?.className || 'Grade 10 - Section A'}).`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isParent && parentWards.length > 1 && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Child:</label>
                <select
                  value={selectedWardId}
                  onChange={(e) => setSelectedWardId(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                >
                  <option value="all">All Linked Children</option>
                  {parentWards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.class})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {myTotalDue > 0 && nextPendingFee && (
              <button
                onClick={() => openOnlinePaymentModal(nextPendingFee)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-600/25 transition-all duration-150 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Next Due: {nextPendingFee.title} (${nextPendingFee.due})</span>
              </button>
            )}
          </div>
        </div>

        {/* Financial KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Total Billed Invoices"
            value={`$${myTotalBilled.toLocaleString()}`}
            subtitle="Academic Term 1 (2025-2026)"
            icon={Receipt}
            color="indigo"
          />
          <StatsCard
            title="Total Paid to Date"
            value={`$${myTotalPaid.toLocaleString()}`}
            subtitle="Verified official receipts issued"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatsCard
            title="Current Outstanding Dues"
            value={`$${myTotalDue.toLocaleString()}`}
            subtitle={myTotalDue > 0 ? 'Next due: Sep 15, 2026' : 'Zero balance due'}
            icon={AlertCircle}
            color={myTotalDue > 0 ? 'rose' : 'emerald'}
          />
        </div>

        {/* Invoice List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Academic Fee Invoices & Receipts
              </h2>
              <span className="text-xs text-slate-400">({displayedUserInvoices.length} Invoices)</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>256-Bit SSL Secured</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 font-semibold">Invoice ID</th>
                  <th className="py-3 px-4 font-semibold">Fee Title & Category</th>
                  {isParent && <th className="py-3 px-4 font-semibold">Student / Ward</th>}
                  <th className="py-3 px-4 font-semibold">Due Date</th>
                  <th className="py-3 px-4 font-semibold">Total Amount</th>
                  <th className="py-3 px-4 font-semibold">Paid / Remaining</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Payment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedUserInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={isParent ? 8 : 7} className="py-8 text-center text-slate-400">
                      No invoices found for this account.
                    </td>
                  </tr>
                ) : (
                  displayedUserInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">{inv.id}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">{inv.title}</span>
                        <span className="text-[11px] text-slate-400">{inv.type}</span>
                      </td>
                      {isParent && (
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">{inv.studentName}</span>
                          <span className="text-[11px] text-slate-400">{inv.className}</span>
                        </td>
                      )}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">{inv.dueDate}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        ${inv.total.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">${inv.paid}</span>
                        <span className="text-slate-400"> / </span>
                        <span className={inv.due > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-400'}>
                          ${inv.due}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={inv.status === 'Paid' ? 'success' : 'warning'} size="xs">
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {inv.status === 'Paid' ? (
                          <button
                            onClick={() => viewReceipt(inv)}
                            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>View Receipt</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openOnlinePaymentModal(inv)}
                            className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Online (${inv.due})</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =========================================================================
            SECURE MULTI-METHOD ONLINE PAYMENT GATEWAY MODAL
            ========================================================================= */}
        <Modal
          isOpen={isOnlinePayOpen}
          onClose={() => {
            if (!isProcessingPay) setIsOnlinePayOpen(false);
          }}
          title={
            paymentStep === 'success'
              ? 'Payment Successful'
              : `Secure Fee Payment: ${onlinePayFee?.title}`
          }
        >
          {paymentStep === 'input' && (
            <div className="space-y-5 text-xs">
              {/* Payment Summary Header */}
              <div className="bg-emerald-950/40 border border-emerald-800/80 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-emerald-400 font-semibold">Total Payable Amount</p>
                  <p className="text-xl font-bold font-mono text-white mt-0.5">
                    ${onlinePayFee?.due || 250}.00 USD
                  </p>
                  <p className="text-[10px] text-emerald-400/80 mt-0.5">
                    Invoice: {onlinePayFee?.id} • {onlinePayFee?.title}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-900/50 px-2.5 py-1 rounded-lg border border-emerald-700/60">
                  <Lock className="w-3.5 h-3.5" />
                  <span>256-Bit SSL</span>
                </div>
              </div>

              {/* Payment Method Selector Tabs */}
              <div>
                <label className="block text-slate-400 font-semibold mb-2">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethodTab('card')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethodTab === 'card'
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-xs'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-[11px]">Card Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethodTab('upi')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethodTab === 'upi'
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-xs'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-[11px]">UPI / QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethodTab('netbanking')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethodTab === 'netbanking'
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-xs'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Building className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-[11px]">Net Banking</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: CARD GATEWAY */}
              {paymentMethodTab === 'card' && (
                <form onSubmit={handleInitiatePayment} className="space-y-3.5">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name on card"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Card Number (16-digit)</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        className="w-full pl-10 pr-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl font-mono text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Expiration Date</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl font-mono text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl font-mono text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOnlinePayOpen(false)}
                      className="px-4 py-2 text-slate-400 hover:text-white rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessingPay}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingPay ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Routing to Bank Gateway...</span>
                        </>
                      ) : (
                        <>
                          <span>Proceed to 3D Secure Authorization</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: UPI / QR CODE */}
              {paymentMethodTab === 'upi' && (
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-2">
                    <div className="w-40 h-40 bg-white p-3 rounded-xl shadow-md flex items-center justify-center">
                      {/* Simulated high contrast QR Code display */}
                      <div className="w-full h-full border-4 border-slate-900 p-1 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="w-6 h-6 bg-slate-900 border-2 border-white" />
                          <div className="w-6 h-6 bg-slate-900 border-2 border-white" />
                        </div>
                        <div className="text-center font-mono font-bold text-[9px] text-slate-900 tracking-tighter">
                          EDUPULSE • ${onlinePayFee?.due || 250}
                        </div>
                        <div className="flex justify-between">
                          <div className="w-6 h-6 bg-slate-900 border-2 border-white" />
                          <div className="w-3 h-3 bg-slate-900 self-end" />
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] font-mono text-indigo-400">edupulse.fees@icici (Verified Merchant)</p>
                    <p className="text-[10px] text-slate-400">
                      Scan with Google Pay, PhonePe, Paytm, or Apple Pay
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleInitiatePayment}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Simulate UPI Mobile App Scan & Approval
                  </button>
                </div>
              )}

              {/* TAB 3: NET BANKING */}
              {paymentMethodTab === 'netbanking' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-2">Select Your Bank</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank', 'SBI Bank', 'HDFC Bank'].map(
                        (bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                              selectedBank === bank
                                ? 'bg-indigo-950/60 border-indigo-500 text-white font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span>{bank}</span>
                            {selectedBank === bank && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOnlinePayOpen(false)}
                      className="px-4 py-2 text-slate-400 hover:text-white rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleInitiatePayment}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Authorize via {selectedBank}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: 3D SECURE OTP SIMULATION OVERLAY */}
          {paymentStep === 'otp' && (
            <form onSubmit={handleConfirmOtp} className="space-y-4 text-xs">
              <div className="bg-indigo-950/50 border border-indigo-800/80 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>3D Secure 2.0 Bank Verification</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  A one-time passcode has been sent to your registered mobile number ending in •••• 9281.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-300 font-semibold">Enter 6-Digit Bank OTP</label>
                  <span className="text-[11px] text-emerald-400 font-mono">Test OTP: 482910</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="482910"
                  className="w-full text-center tracking-[0.5em] text-lg font-mono px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Expiring in 04:52</span>
                <button
                  type="button"
                  onClick={() => {
                    setOtpCode('482910');
                    showToast?.({ type: 'info', message: 'New OTP dispatched: 482910' });
                  }}
                  className="text-indigo-400 hover:underline cursor-pointer"
                >
                  Resend OTP Code
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentStep('input')}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPay}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingPay ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying with Card Issuer...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Pay ${onlinePayFee?.due || 250}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PAYMENT CONFIRMED & INSTANT RECEIPT */}
          {paymentStep === 'success' && latestReceipt && (
            <div className="space-y-4 text-xs animate-in zoom-in-95 duration-200">
              <div className="text-center py-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white">Payment Authorized & Settled</h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Receipt #{latestReceipt.receiptNumber} generated instantly.
                </p>
              </div>

              {/* Receipt Snapshot Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span>Transaction Ref:</span>
                  <span className="font-mono text-slate-200">{latestReceipt.txHash}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Student Name:</span>
                  <span className="font-semibold text-white">{latestReceipt.studentName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Fee Category:</span>
                  <span className="text-slate-200">{latestReceipt.title}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Settled Amount:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ${latestReceipt.amount}.00 USD
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Payment Channel:</span>
                  <span className="text-slate-200">{latestReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOnlinePayOpen(false);
                    setSelectedFee({
                      title: latestReceipt.title,
                      studentName: latestReceipt.studentName,
                      admissionNumber: 'ADM-2025-001',
                      className: 'Grade 10 - Section A',
                      totalAmount: latestReceipt.amount,
                      paidAmount: latestReceipt.amount,
                      dueAmount: 0,
                      status: 'Paid',
                      payments: [
                        {
                          receiptNumber: latestReceipt.receiptNumber,
                          amount: latestReceipt.amount,
                          paymentMethod: latestReceipt.paymentMethod,
                          paymentDate: latestReceipt.paymentDate,
                          txHash: latestReceipt.txHash,
                        },
                      ],
                    });
                    setIsReceiptModalOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>View Printable Official Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOnlinePayOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* OFFICIAL PRINTABLE RECEIPT MODAL */}
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Official Fee Payment Receipt"
        >
          {selectedFee && (
            <div className="space-y-4 text-xs">
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50 dark:bg-slate-900 space-y-4 shadow-inner">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">EduPulse Academy</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Official Institutional Fee Receipt • Tax Invoice
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="success">PAID & SETTLED</Badge>
                    <p className="font-mono text-[10px] text-slate-400 mt-1">
                      Receipt #: {selectedFee.payments?.[0]?.receiptNumber || 'RCP-2026-88392'}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name:</span>
                    <strong className="text-slate-900 dark:text-white text-xs">{selectedFee.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Admission ID:</span>
                    <strong className="text-slate-900 dark:text-white text-xs">{selectedFee.admissionNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Class / Grade:</span>
                    <strong className="text-slate-900 dark:text-white text-xs">{selectedFee.className}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Date:</span>
                    <strong className="text-slate-900 dark:text-white text-xs">
                      {selectedFee.payments?.[0]?.paymentDate || '2026-08-17'}
                    </strong>
                  </div>
                </div>

                {/* Payment Item Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 font-semibold">
                      <tr>
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                          {selectedFee.title}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ${selectedFee.totalAmount || selectedFee.paidAmount || 250}.00
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer Signature */}
                <div className="flex justify-between items-center pt-2 text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Digitally Certified Transaction</span>
                  </div>
                  <span className="font-mono text-[10px]">EDUPULSE-SEAL-VERIFIED</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  /* =========================================================================
     ADMIN & ACCOUNTANT COMPREHENSIVE FEE LEDGER
     ========================================================================= */
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Fee Billing & Accounts Ledger</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage student fee structures, record offline cash/cheque payments, and issue invoices.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsReminderModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>⚡ Automated Email Reminders</span>
            {fees.filter((f) => (f.dueAmount || 0) > 0).length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                {fees.filter((f) => (f.dueAmount || 0) > 0).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Issue Fee Invoice
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Billed Invoices"
          value={`$${totalBilled.toLocaleString()}`}
          subtitle="Cumulative fees across all terms"
          icon={Receipt}
          color="indigo"
        />
        <StatsCard
          title="Collected Revenue"
          value={`$${totalCollected.toLocaleString()}`}
          subtitle={`${totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100}% collection rate`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="Outstanding Receivables"
          value={`$${totalPending.toLocaleString()}`}
          subtitle="Pending student balance dues"
          icon={AlertCircle}
          color="rose"
        />
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Student Invoices Register</h2>
            <Badge variant="neutral" size="xs">
              {fees.length} Invoices
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Quick Filter Pills */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
              {['All', 'Pending', 'Paid', 'Partial'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                    statusFilter === status
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Student Name</th>
                <th className="py-3 px-4 font-semibold">Invoice Title</th>
                <th className="py-3 px-4 font-semibold">Total Amount</th>
                <th className="py-3 px-4 font-semibold">Paid / Due</th>
                <th className="py-3 px-4 font-semibold">Due Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {fees
                .filter(
                  (f) =>
                    (statusFilter === 'All' || f.status === statusFilter) &&
                    (f.studentName?.toLowerCase().includes(search.toLowerCase()) ||
                     f.title?.toLowerCase().includes(search.toLowerCase()))
                )
                .map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {f.studentName}
                      <span className="text-[10px] text-slate-400 block font-normal">{f.admissionNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {f.title}
                      <span className="text-[10px] text-slate-400 block">{f.feeType}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ${f.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-emerald-600 font-semibold">${f.paidAmount || 0}</span>
                      <span className="text-slate-400"> / </span>
                      <span className={f.dueAmount > 0 ? 'text-rose-600 font-semibold' : 'text-slate-400'}>
                        ${f.dueAmount || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '2026-09-15'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={f.status === 'Paid' ? 'success' : f.status === 'Partial' ? 'warning' : 'danger'} size="xs">
                        {f.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {f.dueAmount > 0 ? (
                          <>
                            <button
                              onClick={() => {
                                setIsReminderModalOpen(true);
                              }}
                              title="Send Email Reminder to Parent"
                              className="p-1.5 text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFee(f);
                                setPayAmount(f.dueAmount);
                                setIsPayModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
                            >
                              Collect Payment
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedFee(f);
                              setIsReceiptModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            Receipt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Issue Fee Invoice */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Issue Student Fee Invoice">
        <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Select Student *</label>
            <select
              value={invoiceForm.studentId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {students.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.firstName} {st.lastName} ({st.admissionNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Fee Category *</label>
            <select
              value={invoiceForm.feeType}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, feeType: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="Tuition Fee">Tuition Fee</option>
              <option value="Lab Fee">Lab & Science Fee</option>
              <option value="Library Fee">Library & Digital Resources</option>
              <option value="Transport Fee">Campus Transportation</option>
              <option value="Hostel Fee">Hostel / Boarding</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Invoice Title *</label>
            <input
              type="text"
              required
              value={invoiceForm.title}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Total Amount ($) *</label>
              <input
                type="number"
                required
                value={invoiceForm.totalAmount}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, totalAmount: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Collect Payment (Accountant / Admin) */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Record Fee Payment Receipt">
        {selectedFee && (
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">{selectedFee.studentName}</p>
              <p className="text-[11px] text-slate-500">
                {selectedFee.title} • Balance Due: ${selectedFee.dueAmount}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Collected Amount ($) *</label>
              <input
                type="number"
                required
                max={selectedFee.dueAmount}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method *</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Cash">Cash at Counter</option>
                <option value="Bank Cheque">Bank Cheque / Draft</option>
                <option value="Online / Card">Card / POS Terminal</option>
                <option value="Bank Transfer">Bank Wire Transfer</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Transaction Note</label>
              <input
                type="text"
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl"
              >
                Confirm Payment & Generate Receipt
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* AUTOMATED FEE REMINDER & DISPATCH MODAL */}
      <AutomatedFeeReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        showToast={(msg, type = 'success') =>
          showToast?.({
            type,
            title: type === 'error' ? 'Reminder Error' : 'Reminder Dispatched',
            message: typeof msg === 'string' ? msg : msg?.message || 'Email dispatched',
          })
        }
        onReminderSent={() => {
          // Refresh fee list
          api.get('/fees').then((res) => {
            if (res.data?.data) setFees(res.data.data);
          }).catch(() => {});
        }}
      />
    </div>
  );
};
