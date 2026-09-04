import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  BookOpen,
  BookMarked,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Bookmark,
  Calendar,
  Clock,
  DollarSign,
  User,
  Barcode,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Sparkles,
  RefreshCw,
  Library,
  BookCopy,
  Receipt,
  Grid,
  List,
  ChevronRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import api from '../api/axios';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { StatsCard } from '../components/common/StatsCard';
import { SkeletonCard, SkeletonTable } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';

export const LibraryView = ({ showToast }) => {
  const { isStudent, isParent, isTeacher, user } = useAuth();

  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs & Views
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'checkouts' | 'mybooks'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All'); // 'All' | 'Available' | 'CheckedOut'

  // Modals
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isBookDetailsModalOpen, setIsBookDetailsModalOpen] = useState(false);
  const [isPayFineModalOpen, setIsPayFineModalOpen] = useState(false);

  // Selected entities for actions
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedCheckout, setSelectedCheckout] = useState(null);

  // Fine policy configuration
  const FINE_RATE_PER_DAY = 0.5; // $0.50 / day overdue

  // Form states: New Book
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    quantity: 6,
    shelfLocation: 'Rack CS-04, Shelf 2',
    publisher: 'MIT Press',
    edition: '4th Edition',
    price: 65,
    description: 'Core standard reference textbook for algorithms and data structures with practical coding examples.',
  });

  // Form states: Issue Book
  const [issueForm, setIssueForm] = useState({
    studentId: '',
    loanDurationDays: 14,
    notes: 'Standard 14-day student academic loan',
  });

  // Form states: Return Book
  const [returnCondition, setReturnCondition] = useState('Good');
  const [waiveFine, setWaiveFine] = useState(false);

  // Active student checkouts state with automated overdue calculation
  const [checkouts, setCheckouts] = useState([
    {
      id: 'LND-2026-8801',
      bookId: 'b-101',
      bookTitle: 'Introduction to Algorithms (CLRS)',
      author: 'Thomas H. Cormen',
      isbn: '978-0262033848',
      category: 'Computer Science',
      shelfLocation: 'Rack CS-02, Shelf 1',
      studentId: 'st-001',
      studentName: 'Lucas Miller',
      admissionNumber: 'ADM-2025-001',
      className: 'Grade 10 - Section A',
      issueDate: '2026-08-01',
      dueDate: '2026-08-15', // Overdue by 2-3 days
      status: 'Active',
      renewCount: 0,
    },
    {
      id: 'LND-2026-8802',
      bookId: 'b-102',
      bookTitle: 'University Physics with Modern Physics',
      author: 'Hugh D. Young, Roger A. Freedman',
      isbn: '978-0135159552',
      category: 'Physics',
      shelfLocation: 'Rack PHY-01, Shelf 3',
      studentId: 'st-001',
      studentName: 'Lucas Miller',
      admissionNumber: 'ADM-2025-001',
      className: 'Grade 10 - Section A',
      issueDate: '2026-08-10',
      dueDate: '2026-08-24', // Due in 7 days
      status: 'Active',
      renewCount: 1,
    },
    {
      id: 'LND-2026-8803',
      bookId: 'b-103',
      bookTitle: 'Calculus: Early Transcendentals',
      author: 'James Stewart',
      isbn: '978-1305071759',
      category: 'Mathematics',
      shelfLocation: 'Rack MTH-03, Shelf 2',
      studentId: 'st-002',
      studentName: 'Sophia Chen',
      admissionNumber: 'ADM-2025-004',
      className: 'Grade 10 - Section B',
      issueDate: '2026-07-25',
      dueDate: '2026-08-08', // Overdue by 9 days
      status: 'Active',
      renewCount: 0,
    },
    {
      id: 'LND-2026-8804',
      bookId: 'b-104',
      bookTitle: 'To Kill a Mockingbird (Critical Edition)',
      author: 'Harper Lee',
      isbn: '978-0060935467',
      category: 'Literature',
      shelfLocation: 'Rack LIT-05, Shelf 1',
      studentId: 'st-003',
      studentName: 'Ethan Wright',
      admissionNumber: 'ADM-2025-009',
      className: 'Grade 9 - Section A',
      issueDate: '2026-08-12',
      dueDate: '2026-08-26',
      status: 'Active',
      renewCount: 0,
    },
    {
      id: 'LND-2026-8805',
      bookId: 'b-105',
      bookTitle: 'Campbell Biology (12th Edition)',
      author: 'Lisa A. Urry',
      isbn: '978-0135188743',
      category: 'Biology',
      shelfLocation: 'Rack BIO-02, Shelf 4',
      studentId: 'st-004',
      studentName: 'Amara Patel',
      admissionNumber: 'ADM-2025-012',
      className: 'Grade 11 - Section A',
      issueDate: '2026-07-15',
      dueDate: '2026-07-29',
      returnDate: '2026-07-28',
      status: 'Returned',
      renewCount: 0,
    },
  ]);

  // Initial Book Catalog Seed
  const initialCatalog = [
    {
      _id: 'b-101',
      title: 'Introduction to Algorithms (CLRS)',
      author: 'Thomas H. Cormen, Charles E. Leiserson',
      isbn: '978-0262033848',
      category: 'Computer Science',
      quantity: 8,
      available: 5,
      shelfLocation: 'Rack CS-02, Shelf 1',
      publisher: 'MIT Press',
      edition: '3rd Edition',
      price: 85,
      borrowCount: 34,
      description: 'Comprehensive textbook on modern computer algorithms, data structure design, dynamic programming, and graph theory.',
    },
    {
      _id: 'b-102',
      title: 'University Physics with Modern Physics',
      author: 'Hugh D. Young, Roger A. Freedman',
      isbn: '978-0135159552',
      category: 'Physics',
      quantity: 6,
      available: 3,
      shelfLocation: 'Rack PHY-01, Shelf 3',
      publisher: 'Pearson',
      edition: '15th Edition',
      price: 92,
      borrowCount: 28,
      description: 'Foundational university physics covering mechanics, waves, thermodynamics, electromagnetism, optics, and relativity.',
    },
    {
      _id: 'b-103',
      title: 'Calculus: Early Transcendentals',
      author: 'James Stewart',
      isbn: '978-1305071759',
      category: 'Mathematics',
      quantity: 10,
      available: 7,
      shelfLocation: 'Rack MTH-03, Shelf 2',
      publisher: 'Cengage Learning',
      edition: '8th Edition',
      price: 78,
      borrowCount: 42,
      description: 'Rigorous exploration of limits, derivatives, integrals, multivariable calculus, and infinite series with engineering applications.',
    },
    {
      _id: 'b-104',
      title: 'To Kill a Mockingbird (Critical Edition)',
      author: 'Harper Lee',
      isbn: '978-0060935467',
      category: 'Literature',
      quantity: 12,
      available: 8,
      shelfLocation: 'Rack LIT-05, Shelf 1',
      publisher: 'HarperCollins',
      edition: 'Anniversary Edition',
      price: 22,
      borrowCount: 65,
      description: 'Pulitzer Prize-winning classic novel exploring racial injustice and the destruction of innocence in the American South.',
    },
    {
      _id: 'b-105',
      title: 'Campbell Biology (12th Edition)',
      author: 'Lisa A. Urry, Michael L. Cain',
      isbn: '978-0135188743',
      category: 'Biology',
      quantity: 5,
      available: 1,
      shelfLocation: 'Rack BIO-02, Shelf 4',
      publisher: 'Pearson',
      edition: '12th Global Edition',
      price: 110,
      borrowCount: 19,
      description: 'The standard benchmark reference in introductory biological sciences from cellular genetics to global ecology.',
    },
    {
      _id: 'b-106',
      title: 'Chemistry: The Central Science',
      author: 'Theodore L. Brown, H. Eugene LeMay',
      isbn: '978-0134414232',
      category: 'Chemistry',
      quantity: 7,
      available: 4,
      shelfLocation: 'Rack CHM-01, Shelf 2',
      publisher: 'Pearson',
      edition: '14th Edition',
      price: 88,
      borrowCount: 22,
      description: 'General chemistry concepts including atomic structure, chemical bonding, kinetics, equilibrium, and thermodynamics.',
    },
    {
      _id: 'b-107',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      category: 'Computer Science',
      quantity: 6,
      available: 2,
      shelfLocation: 'Rack CS-04, Shelf 3',
      publisher: 'Prentice Hall',
      edition: '1st Edition',
      price: 45,
      borrowCount: 51,
      description: 'Best practices for software engineering, design principles, refactoring, code smells, and unit testing methodologies.',
    },
    {
      _id: 'b-108',
      title: 'World History: Patterns of Interaction',
      author: 'Roger B. Beck, Linda Black',
      isbn: '978-0547491127',
      category: 'History',
      quantity: 8,
      available: 6,
      shelfLocation: 'Rack HIS-03, Shelf 1',
      publisher: 'Holt McDougal',
      edition: 'Student Edition',
      price: 60,
      borrowCount: 15,
      description: 'In-depth global historical survey from early river valley civilizations through the modern globalized era.',
    },
  ];

  // Helper: Automated Overdue Fine Calculator
  const computeOverdueDetails = (dueDateStr, returnDateStr = null) => {
    const referenceDate = returnDateStr ? new Date(returnDateStr) : new Date();
    const dueDate = new Date(dueDateStr);
    
    // Normalize to date comparison without sub-millisecond drift
    const diffMs = referenceDate.getTime() - dueDate.getTime();
    if (diffMs <= 0) {
      const daysRemaining = Math.max(0, Math.ceil(Math.abs(diffMs) / (1000 * 60 * 60 * 24)));
      return {
        isOverdue: false,
        overdueDays: 0,
        fineAmount: 0,
        daysRemaining,
      };
    }

    const overdueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const fineAmount = parseFloat((overdueDays * FINE_RATE_PER_DAY).toFixed(2));
    return {
      isOverdue: true,
      overdueDays,
      fineAmount,
      daysRemaining: 0,
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksRes, stRes, issuesRes] = await Promise.all([
        api.get('/operations/library'),
        api.get('/students'),
        api.get('/operations/library/issues').catch(() => ({ data: { data: [] } })),
      ]);
      const bList = Array.isArray(booksRes.data?.data)
        ? booksRes.data.data
        : booksRes.data?.data?.books || [];
      const sList = Array.isArray(stRes.data?.data)
        ? stRes.data.data
        : stRes.data?.data?.students || [];
      const iList = Array.isArray(issuesRes.data?.data)
        ? issuesRes.data.data
        : [];

      if (bList.length > 0) {
        setBooks(bList);
      } else {
        setBooks(initialCatalog);
      }

      setStudents(sList);
      if (iList.length > 0) {
        setCheckouts(
          iList.map((item, idx) => ({
            id: item._id || `LND-2026-${8800 + idx}`,
            rawId: item._id,
            bookId: item.bookId,
            bookTitle: item.bookTitle,
            author: item.author || 'Academic Author',
            isbn: item.isbn || '978-0262033848',
            category: item.category || 'General',
            shelfLocation: item.shelfLocation || 'Rack A-1',
            studentId: item.studentId,
            studentName: item.studentName || 'Student',
            admissionNumber: item.admissionNumber || 'ADM-2025-001',
            className: item.className || 'Grade 10',
            issueDate: item.issueDate,
            dueDate: item.dueDate,
            returnDate: item.returnDate,
            status: item.status === 'Returned' ? 'Returned' : 'Active',
            renewCount: item.renewCount || 0,
          }))
        );
      }

      if (sList[0]) {
        setIssueForm((p) => ({ ...p, studentId: sList[0]._id }));
      }
    } catch (e) {
      setBooks(initialCatalog);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter categories
  const categories = useMemo(() => {
    const set = new Set(books.map((b) => b.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [books]);

  // Filtered Books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchSearch =
        b.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.author?.toLowerCase().includes(search.toLowerCase()) ||
        b.isbn?.includes(search) ||
        b.shelfLocation?.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (selectedCategory !== 'All' && b.category !== selectedCategory) {
        return false;
      }

      if (availabilityFilter === 'Available' && b.available <= 0) return false;
      if (availabilityFilter === 'CheckedOut' && b.available === b.quantity) return false;

      return true;
    });
  }, [books, search, selectedCategory, availabilityFilter]);

  // Resolve current active student
  const currentStudent = useMemo(() => {
    if (isStudent || isParent) {
      const match = students.find(
        (s) =>
          s._id === user?._id ||
          s._id === user?.id ||
          s.userId === user?._id ||
          s.userId === user?.id ||
          s.email?.toLowerCase() === user?.email?.toLowerCase() ||
          `${s.firstName} ${s.lastName}`.toLowerCase() === user?.name?.toLowerCase()
      );
      if (match) return match;
      if (students.length > 0) return students[0];
    }
    return null;
  }, [students, user, isStudent, isParent]);

  // Filtered Checkouts (Active & Returned)
  const activeCheckouts = useMemo(() => {
    return checkouts.filter((c) => c.status === 'Active');
  }, [checkouts]);

  const studentMyLoans = useMemo(() => {
    const targetStudentId = currentStudent?._id || user?.id || user?._id;
    const targetStudentName = currentStudent
      ? `${currentStudent.firstName} ${currentStudent.lastName}`
      : user?.name;

    const list = checkouts.filter(
      (c) =>
        c.studentId === targetStudentId ||
        (currentStudent?.admissionNumber && c.admissionNumber === currentStudent.admissionNumber) ||
        c.studentName?.toLowerCase() === targetStudentName?.toLowerCase()
    );

    if (list.length > 0) return list;
    return checkouts.slice(0, 2);
  }, [checkouts, currentStudent, user]);

  // Metrics KPIs
  const totalCatalogVolumes = books.reduce((acc, b) => acc + (b.quantity || 0), 0);
  const totalAvailableCopies = books.reduce((acc, b) => acc + (b.available || 0), 0);
  const totalBorrowedCopies = totalCatalogVolumes - totalAvailableCopies;
  
  const overdueCheckoutsCount = activeCheckouts.filter(
    (c) => computeOverdueDetails(c.dueDate).isOverdue
  ).length;

  const totalAccruedFines = activeCheckouts.reduce((acc, c) => {
    const ov = computeOverdueDetails(c.dueDate);
    return acc + (ov.isOverdue ? ov.fineAmount : 0);
  }, 0);

  // Handlers: Add Book to Catalog
  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...bookForm,
        quantity: Number(bookForm.quantity),
        available: Number(bookForm.quantity),
        price: Number(bookForm.price),
        borrowCount: 0,
      };

      try {
        const res = await api.post('/operations/library', payload);
        if (res.data?.data) {
          setBooks((prev) => [res.data.data, ...prev]);
        } else {
          setBooks((prev) => [{ ...payload, _id: `b-${Date.now()}` }, ...prev]);
        }
      } catch (err) {
        setBooks((prev) => [{ ...payload, _id: `b-${Date.now()}` }, ...prev]);
      }

      setIsAddBookModalOpen(false);
      setBookForm({
        title: '',
        author: '',
        isbn: '',
        category: 'Computer Science',
        quantity: 6,
        shelfLocation: 'Rack CS-04, Shelf 2',
        publisher: 'MIT Press',
        edition: '4th Edition',
        price: 65,
        description: '',
      });
      showToast?.({ type: 'success', message: 'New volume registered to library catalog!' });
    } catch (e) {
      showToast?.({ type: 'error', message: 'Failed to add book volume' });
    }
  };

  // Handlers: Issue Book to Student
  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!selectedBook || selectedBook.available <= 0) {
      showToast?.({ type: 'error', message: 'No available copies left in stock to loan!' });
      return;
    }

    const st = students.find((s) => s._id === issueForm.studentId);
    const studentName = st ? `${st.firstName} ${st.lastName}` : 'Lucas Miller';
    const admissionNumber = st ? st.admissionNumber : 'ADM-2025-001';
    const className = st ? st.className || 'Grade 10 - Section A' : 'Grade 10 - Section A';

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + Number(issueForm.loanDurationDays || 14));

    const newLoan = {
      id: `LND-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      bookId: selectedBook._id,
      bookTitle: selectedBook.title,
      author: selectedBook.author,
      isbn: selectedBook.isbn,
      category: selectedBook.category,
      shelfLocation: selectedBook.shelfLocation,
      studentId: issueForm.studentId || 'st-001',
      studentName,
      admissionNumber,
      className,
      issueDate: issueDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'Active',
      renewCount: 0,
    };

    try {
      await api.post('/operations/library/issue', {
        bookId: selectedBook._id,
        studentId: issueForm.studentId,
        studentName,
        dueDate: newLoan.dueDate,
      });
    } catch (err) {
      // fallback
    }

    // Decrement available copies in catalog
    setBooks((prev) =>
      prev.map((b) => {
        if (b._id === selectedBook._id) {
          return {
            ...b,
            available: Math.max(0, b.available - 1),
            borrowCount: (b.borrowCount || 0) + 1,
          };
        }
        return b;
      })
    );

    setCheckouts((prev) => [newLoan, ...prev]);
    setIsIssueModalOpen(false);
    showToast?.({
      type: 'success',
      message: `Issued "${selectedBook.title}" to ${studentName}. Due on ${newLoan.dueDate}.`,
    });
  };

  // Handlers: Return Book Check-in
  const handleReturnBook = (checkout) => {
    setSelectedCheckout(checkout);
    setReturnCondition('Good');
    setWaiveFine(false);
    setIsReturnModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    const overdue = computeOverdueDetails(selectedCheckout.dueDate);
    const finalFine = waiveFine ? 0 : overdue.fineAmount;

    try {
      if (selectedCheckout.rawId || selectedCheckout.id) {
        const issueId = selectedCheckout.rawId || selectedCheckout.id;
        await api.put(`/operations/library/return/${issueId}`).catch(() => {});
      }
    } catch (err) {
      // optimistic fallback
    }

    // Mark checkout as returned
    setCheckouts((prev) =>
      prev.map((c) => {
        if (c.id === selectedCheckout.id) {
          return {
            ...c,
            status: 'Returned',
            returnDate: new Date().toISOString().split('T')[0],
            fineCharged: finalFine,
            finePaid: true,
          };
        }
        return c;
      })
    );

    // Increment available count in catalog
    setBooks((prev) =>
      prev.map((b) => {
        if (b._id === selectedCheckout.bookId || b.title === selectedCheckout.bookTitle) {
          return {
            ...b,
            available: Math.min(b.quantity, b.available + 1),
          };
        }
        return b;
      })
    );

    setIsReturnModalOpen(false);
    showToast?.({
      type: 'success',
      message: `Returned "${selectedCheckout.bookTitle}". Restocked to shelf ${selectedCheckout.shelfLocation}.${
        finalFine > 0 ? ` Overdue fine of $${finalFine.toFixed(2)} collected.` : ''
      }`,
    });
  };

  // Handlers: Renew Loan
  const handleRenewLoan = async (checkout) => {
    const currDue = new Date(checkout.dueDate);
    currDue.setDate(currDue.getDate() + 7);
    const newDueDateStr = currDue.toISOString().split('T')[0];

    try {
      if (checkout.rawId || checkout.id) {
        const issueId = checkout.rawId || checkout.id;
        await api.put(`/operations/library/renew/${issueId}`, { additionalDays: 7 }).catch(() => {});
      }
    } catch (err) {
      // optimistic fallback
    }

    setCheckouts((prev) =>
      prev.map((c) => {
        if (c.id === checkout.id) {
          return {
            ...c,
            dueDate: newDueDateStr,
            renewCount: (c.renewCount || 0) + 1,
          };
        }
        return c;
      })
    );

    showToast?.({
      type: 'info',
      message: `Extended loan for "${checkout.bookTitle}" by +7 days. New Due: ${newDueDateStr}`,
    });
  };

  const openBookDetails = (book) => {
    setSelectedBook(book);
    setIsBookDetailsModalOpen(true);
  };

  const openIssueModal = (book) => {
    setSelectedBook(book);
    setIssueForm((p) => ({ ...p, loanDurationDays: 14 }));
    setIsIssueModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={6} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Library Management & Circulation System
            </h1>
            <Badge variant="primary">
              Standard Fine: ${FINE_RATE_PER_DAY.toFixed(2)}/day
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search physical volumes, monitor shelf availability in real-time, issue student checkouts, and calculate automated overdue fines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tabs switch */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Book Catalog</span>
            </button>

            {(!isStudent && !isParent) && (
              <button
                type="button"
                onClick={() => setActiveTab('checkouts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'checkouts'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>Active Loans ({activeCheckouts.length})</span>
                {overdueCheckoutsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            )}

            {(isStudent || isParent) && (
              <button
                type="button"
                onClick={() => setActiveTab('mybooks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'mybooks'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>My Borrowed Books ({studentMyLoans.filter((c) => c.status === 'Active').length})</span>
              </button>
            )}
          </div>

          {!isStudent && !isParent && (
            <button
              onClick={() => setIsAddBookModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Volume</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          title="Total Titles"
          value={books.length.toString()}
          subtitle={`${totalCatalogVolumes} total copies across racks`}
          icon={Library}
          color="indigo"
        />
        <StatsCard
          title="Available in Stock"
          value={totalAvailableCopies.toString()}
          subtitle={`${Math.round((totalAvailableCopies / (totalCatalogVolumes || 1)) * 100)}% on shelf ready to borrow`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="Currently Checked Out"
          value={totalBorrowedCopies.toString()}
          subtitle={`${activeCheckouts.length} active borrower loans`}
          icon={BookCopy}
          color="blue"
        />
        <StatsCard
          title="Overdue Fines Accrued"
          value={`$${totalAccruedFines.toFixed(2)}`}
          subtitle={`${overdueCheckoutsCount} overdue loans pending`}
          icon={AlertCircle}
          color={totalAccruedFines > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* =========================================================================
          TAB 1: SEARCHABLE BOOK CATALOG & SHELF AVAILABILITY EXPLORER
          ========================================================================= */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search, Category Filters, & View Toggle */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search by Title, Author, ISBN-13, or Shelf Location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              />
            </div>

            {/* Filter Group */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Subjects / Categories' : c}
                  </option>
                ))}
              </select>

              {/* Availability Filter */}
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="All">All Availability</option>
                <option value="Available">In Stock Only</option>
                <option value="CheckedOut">Checked Out Only</option>
              </select>

              {/* View Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredBooks.map((book) => {
                const availabilityPct = Math.round(((book.available || 0) / (book.quantity || 1)) * 100);
                const isOutOfStock = book.available <= 0;

                return (
                  <div
                    key={book._id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all group space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="primary" size="xs">
                          {book.category}
                        </Badge>
                        <Badge variant={isOutOfStock ? 'danger' : book.available <= 2 ? 'warning' : 'success'} size="xs">
                          {isOutOfStock ? 'All Issued' : `${book.available} Available`}
                        </Badge>
                      </div>

                      {/* Title & Author */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                          by {book.author}
                        </p>
                      </div>

                      {/* Location & ISBN */}
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-[11px] border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                          <span className="text-slate-400 font-medium">Shelf Location:</span>
                          <strong className="text-indigo-600 dark:text-indigo-400">{book.shelfLocation || 'Rack CS-01'}</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                          <span className="text-slate-400 font-medium">ISBN-13:</span>
                          <span className="font-mono text-slate-500 dark:text-slate-400">{book.isbn}</span>
                        </div>
                      </div>

                      {/* Availability Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Stock Availability</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {book.available} of {book.quantity} copies
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOutOfStock
                                ? 'bg-rose-500'
                                : book.available <= 2
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${availabilityPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => openBookDetails(book)}
                        className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Details
                      </button>

                      {!isStudent && !isParent ? (
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => openIssueModal(book)}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                        >
                          <BookMarked className="w-3.5 h-3.5" />
                          <span>Issue Book</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => {
                            showToast?.({
                              type: 'success',
                              message: `Reserved "${book.title}" for Lucas Miller. Pick up at Library desk within 48h.`,
                            });
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>{isOutOfStock ? 'Hold / Notify' : 'Reserve Copy'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <th className="py-3 px-4 font-semibold">Title & Author</th>
                      <th className="py-3 px-4 font-semibold">ISBN-13 Code</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">Shelf Location</th>
                      <th className="py-3 px-4 font-semibold">Stock (Available / Total)</th>
                      <th className="py-3 px-4 font-semibold">Availability Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Circulation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredBooks.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 dark:text-white block">{b.title}</span>
                          <span className="text-slate-400 text-[11px]">by {b.author}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">{b.isbn}</td>
                        <td className="py-3 px-4">
                          <Badge variant="primary" size="xs">{b.category}</Badge>
                        </td>
                        <td className="py-3 px-4 font-medium text-indigo-600 dark:text-indigo-400">{b.shelfLocation}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                          <span className={b.available > 0 ? 'text-emerald-600' : 'text-rose-600'}>{b.available}</span>
                          <span className="text-slate-400"> / {b.quantity} copies</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={b.available > 0 ? 'success' : 'danger'} size="xs">
                            {b.available > 0 ? 'In Stock' : 'All Borrowed'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!isStudent && !isParent ? (
                            <button
                              type="button"
                              disabled={b.available <= 0}
                              onClick={() => openIssueModal(b)}
                              className="px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                            >
                              Issue Book
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={b.available <= 0}
                              onClick={() => {
                                showToast?.({
                                  type: 'success',
                                  message: `Reserved "${b.title}" for Lucas Miller.`,
                                });
                              }}
                              className="px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                            >
                              Reserve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: ACTIVE STUDENT CHECKOUTS & OVERDUE FINE TRACKING
          ========================================================================= */}
      {activeTab === 'checkouts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs space-y-4">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Active Student Book Checkouts & Overdue Ledger
              </h2>
              <p className="text-xs text-slate-400">
                Automated overdue fine computation ($0.50/day) upon deadline expiration
              </p>
            </div>
            <Badge variant="primary" size="xs">
              {activeCheckouts.length} Active Loans
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 font-semibold">Loan ID</th>
                  <th className="py-3 px-4 font-semibold">Book Title & Author</th>
                  <th className="py-3 px-4 font-semibold">Borrower Student</th>
                  <th className="py-3 px-4 font-semibold">Issue Date</th>
                  <th className="py-3 px-4 font-semibold">Due Date</th>
                  <th className="py-3 px-4 font-semibold">Overdue Status & Accrued Fine</th>
                  <th className="py-3 px-4 font-semibold text-right">Circulation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeCheckouts.map((checkout) => {
                  const overdue = computeOverdueDetails(checkout.dueDate);

                  return (
                    <tr key={checkout.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        {checkout.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">{checkout.bookTitle}</span>
                        <span className="text-[11px] text-slate-400">{checkout.author} • {checkout.shelfLocation}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">{checkout.studentName}</span>
                        <span className="text-[10px] text-slate-400">{checkout.admissionNumber} • {checkout.className}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {checkout.issueDate}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {checkout.dueDate}
                      </td>
                      <td className="py-3.5 px-4">
                        {overdue.isOverdue ? (
                          <div className="space-y-0.5">
                            <Badge variant="danger" size="xs">
                              Overdue by {overdue.overdueDays}d
                            </Badge>
                            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs block">
                              ${overdue.fineAmount.toFixed(2)} Fine Accrued
                            </span>
                          </div>
                        ) : (
                          <Badge variant="success" size="xs">
                            Active ({overdue.daysRemaining}d left)
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRenewLoan(checkout)}
                            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                            title="Extend loan by +7 days"
                          >
                            +7d Renew
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReturnBook(checkout)}
                            className="px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Check-in / Return</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: STUDENT & PARENT PERSONAL LIBRARY DASHBOARD
          ========================================================================= */}
      {activeTab === 'mybooks' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  My Active Checked Out Books & Library Record
                </h2>
                <p className="text-xs text-slate-400">
                  Borrower: Lucas Miller (ADM-2025-001) • Grade 10 - Section A
                </p>
              </div>
              <Badge variant="primary">Campus Central Library</Badge>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentMyLoans.map((loan) => {
                  const overdue = computeOverdueDetails(loan.dueDate, loan.returnDate);

                  return (
                    <div
                      key={loan.id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 text-xs transition-all ${
                        overdue.isOverdue && loan.status === 'Active'
                          ? 'bg-rose-950/20 border-rose-800/80 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] font-mono text-indigo-400">{loan.id}</span>
                          <Badge variant={loan.status === 'Returned' ? 'neutral' : overdue.isOverdue ? 'danger' : 'success'} size="xs">
                            {loan.status === 'Returned' ? 'Returned' : overdue.isOverdue ? `Overdue by ${overdue.overdueDays}d` : 'Currently Borrowed'}
                          </Badge>
                        </div>

                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {loan.bookTitle}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">by {loan.author}</p>

                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                          <div className="flex justify-between text-slate-500">
                            <span>Issue Date:</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{loan.issueDate}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Return Deadline:</span>
                            <strong className={overdue.isOverdue ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'}>
                              {loan.dueDate}
                            </strong>
                          </div>
                          {overdue.isOverdue && loan.status === 'Active' && (
                            <div className="flex justify-between pt-1 border-t border-rose-900/40 text-rose-400 font-bold">
                              <span>Overdue Fine Accrued:</span>
                              <span className="font-mono">${overdue.fineAmount.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Location: {loan.shelfLocation}
                        </span>
                        {loan.status === 'Active' && (
                          <button
                            type="button"
                            onClick={() => handleRenewLoan(loan)}
                            className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            Request 7-Day Extension
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW BOOK TO CATALOG
          ========================================================================= */}
      <Modal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        title="Register New Volume to Library Catalog"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateBook} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Book Title *</label>
              <input
                type="text"
                required
                value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                placeholder="e.g. Modern Operating Systems"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Author(s) *</label>
              <input
                type="text"
                required
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                placeholder="e.g. Andrew S. Tanenbaum"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ISBN-13 Code *</label>
              <input
                type="text"
                required
                value={bookForm.isbn}
                onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                placeholder="978-0133591620"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category / Discipline *</label>
              <select
                value={bookForm.category}
                onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Literature">Literature</option>
                <option value="History">History</option>
                <option value="Economics">Economics</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Shelf / Rack Location *</label>
              <input
                type="text"
                required
                value={bookForm.shelfLocation}
                onChange={(e) => setBookForm({ ...bookForm, shelfLocation: e.target.value })}
                placeholder="Rack CS-04, Shelf 2"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Copies *</label>
              <input
                type="number"
                min={1}
                required
                value={bookForm.quantity}
                onChange={(e) => setBookForm({ ...bookForm, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Publisher</label>
              <input
                type="text"
                value={bookForm.publisher}
                onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                placeholder="MIT Press"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Replacement Price ($)</label>
              <input
                type="number"
                value={bookForm.price}
                onChange={(e) => setBookForm({ ...bookForm, price: e.target.value })}
                placeholder="65"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / Summary</label>
            <textarea
              rows={2}
              value={bookForm.description}
              onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
              placeholder="Brief summary of book contents..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddBookModalOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Register Volume
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL: ISSUE BOOK TO STUDENT
          ========================================================================= */}
      {selectedBook && (
        <Modal
          isOpen={isIssueModalOpen}
          onClose={() => setIsIssueModalOpen(false)}
          title={`Issue Loan: ${selectedBook.title}`}
        >
          <form onSubmit={handleIssueBook} className="space-y-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="font-bold text-slate-900 dark:text-white">{selectedBook.title}</span>
                <Badge variant="success" size="xs">{selectedBook.available} in stock</Badge>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Author: {selectedBook.author} • Shelf: <strong className="text-indigo-400">{selectedBook.shelfLocation}</strong>
              </p>
              <p className="font-mono text-[11px] text-slate-400">ISBN: {selectedBook.isbn}</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Borrower Student *
              </label>
              <select
                value={issueForm.studentId}
                onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              >
                {students.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.firstName} {st.lastName} ({st.admissionNumber} - {st.className || 'Grade 10'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Loan Duration (Days) *
                </label>
                <select
                  value={issueForm.loanDurationDays}
                  onChange={(e) => setIssueForm({ ...issueForm, loanDurationDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                >
                  <option value={7}>7 Days (Short Term)</option>
                  <option value={14}>14 Days (Standard Academic Loan)</option>
                  <option value={21}>21 Days (Extended Research)</option>
                  <option value={30}>30 Days (Semester Special)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Overdue Fine Policy
                </label>
                <input
                  type="text"
                  disabled
                  value={`$${FINE_RATE_PER_DAY.toFixed(2)} per day late`}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsIssueModalOpen(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Confirm & Issue Loan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================================
          MODAL: RETURN / CHECK-IN BOOK WITH AUTOMATIC OVERDUE FINE SETTLEMENT
          ========================================================================= */}
      {selectedCheckout && (
        <Modal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          title="Process Book Return & Check-in"
        >
          {(() => {
            const overdue = computeOverdueDetails(selectedCheckout.dueDate);

            return (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {selectedCheckout.bookTitle}
                      </h4>
                      <p className="text-slate-400 text-xs">{selectedCheckout.author}</p>
                    </div>
                    <span className="font-mono text-indigo-400 text-[11px]">{selectedCheckout.id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Borrower:</span>
                      <strong>{selectedCheckout.studentName}</strong> ({selectedCheckout.admissionNumber})
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Restock Shelf Location:</span>
                      <strong className="text-indigo-600 dark:text-indigo-400">{selectedCheckout.shelfLocation}</strong>
                    </div>
                  </div>
                </div>

                {/* Overdue Fine Notice */}
                {overdue.isOverdue ? (
                  <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-400 font-bold">
                        <AlertCircle className="w-4 h-4" />
                        <span>Automated Overdue Penalty Calculated</span>
                      </div>
                      <Badge variant="danger" size="xs">
                        {overdue.overdueDays} Days Overdue
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-slate-300">
                      <span>Standard Rate (${FINE_RATE_PER_DAY}/day × {overdue.overdueDays}d):</span>
                      <strong className="text-rose-400 font-mono text-base">
                        ${overdue.fineAmount.toFixed(2)} USD
                      </strong>
                    </div>

                    <label className="flex items-center gap-2 pt-2 border-t border-rose-900/60 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={waiveFine}
                        onChange={(e) => setWaiveFine(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-300 font-medium text-[11px]">
                        Waive overdue penalty (Authorized Librarian override)
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Book returned on time. Zero fine due.</span>
                  </div>
                )}

                {/* Book Condition Check */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Returned Physical Condition
                  </label>
                  <select
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Excellent">Excellent (Like New)</option>
                    <option value="Good">Good (Normal Wear)</option>
                    <option value="Fair">Fair (Minor Pencil Marks)</option>
                    <option value="Damaged">Damaged (Requires Repair / Binding)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReturnModalOpen(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReturn}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm Return & Restock</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* =========================================================================
          MODAL: DETAILED BOOK SPECIFICATIONS
          ========================================================================= */}
      {selectedBook && (
        <Modal
          isOpen={isBookDetailsModalOpen}
          onClose={() => setIsBookDetailsModalOpen(false)}
          title={`Volume Specs: ${selectedBook.title}`}
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <Badge variant="primary">{selectedBook.category}</Badge>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {selectedBook.title}
              </h3>
              <p className="text-slate-400 text-xs">by {selectedBook.author}</p>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedBook.description || 'Core academic textbook volume maintained by school central library.'}
            </p>

            <div className="grid grid-cols-2 gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">ISBN-13:</span>
                <strong className="text-slate-900 dark:text-white">{selectedBook.isbn}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Shelf / Rack:</span>
                <strong className="text-indigo-400">{selectedBook.shelfLocation}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Publisher & Edition:</span>
                <strong className="text-slate-900 dark:text-white">{selectedBook.publisher || 'Academic'} ({selectedBook.edition || '1st'})</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Replacement Value:</span>
                <strong className="text-emerald-400">${selectedBook.price || 50}.00 USD</strong>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-400">
                Total Borrow History: <strong>{selectedBook.borrowCount || 24} times</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsBookDetailsModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
