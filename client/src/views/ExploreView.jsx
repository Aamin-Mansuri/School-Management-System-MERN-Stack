import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Award,
  BookOpen,
  GraduationCap,
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  Calculator,
  Laptop,
  Trophy,
  Star,
  ExternalLink,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

const CAMPUS_GALLERY = [
  {
    id: 'stem-lab',
    title: 'Advanced AI & STEM Research Labs',
    category: 'Innovation',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
    description: 'Equipped with robotics workstations, 3D printers, and high-performance computing clusters for student research.',
  },
  {
    id: 'library-hub',
    title: 'Central Digital Library & Study Pods',
    category: 'Academics',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80',
    description: 'Over 45,000 volumes, international academic journals, quiet study hubs, and high-speed research terminals.',
  },
  {
    id: 'sports-arena',
    title: 'Olympic-Standard Sports Complex',
    category: 'Athletics',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    description: 'Indoor heated swimming pool, synthetic running track, multi-sport courts, and professional athletic coaching.',
  },
  {
    id: 'auditorium',
    title: 'Grand Performing Arts Auditorium',
    category: 'Culture',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    description: '1,200-seat acoustically engineered amphitheater hosting international symposiums, debates, and concerts.',
  },
];

const CURRICULUM_PROGRAMS = [
  {
    id: 'primary',
    name: 'Primary Explorers (Grades 1-5)',
    tag: 'Foundation Stage',
    icon: BookOpen,
    color: 'emerald',
    description: 'Inquiry-based foundational learning focusing on conceptual numeracy, linguistic fluency, curiosity, and arts.',
    highlights: ['Bilingual Immersion', 'Singapore Math Model', 'Coding for Kids', 'Fine Arts & Music'],
  },
  {
    id: 'middle',
    name: 'Middle School STEM & Humanities (Grades 6-8)',
    tag: 'Development Stage',
    icon: Laptop,
    color: 'indigo',
    description: 'Experiential learning with specialized subject teachers, hands-on lab experiments, and digital literacy.',
    highlights: ['Robotics & Design Thinking', 'Scientific Method Lab', 'Debate & Model UN', 'Foreign Languages'],
  },
  {
    id: 'senior-science',
    name: 'Senior Secondary – Science & AI (Grades 9-12)',
    tag: 'Pre-University',
    icon: Trophy,
    color: 'cyan',
    description: 'Rigorous preparatory curriculum covering Advanced Physics, Chemistry, Calculus, Computer Science & AI.',
    highlights: ['IIT/NEET & SAT Prep', 'University Research Mentorship', 'Olympiad Training', 'Biotech Practicals'],
  },
  {
    id: 'senior-commerce',
    name: 'Senior Secondary – Commerce & Economics',
    tag: 'Pre-University',
    icon: DollarSign,
    color: 'amber',
    description: 'Applied financial accounting, micro & macro economics, business administration, and startup incubation.',
    highlights: ['Stock Market Simulation', 'Entrepreneurship Cell', 'Fintech Workshops', 'Corporate Case Studies'],
  },
];

const FACULTY_SHOWCASE = [
  {
    name: 'Eleanor Vance',
    role: 'School Principal & Academic Director',
    credentials: 'M.Ed (Harvard), Ph.D. Educational Leadership',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    experience: '22+ Years in Institutional Governance',
    quote: 'Our mission is to nurture resilient thinkers and ethical global leaders equipped for tomorrow’s frontiers.',
  },
  {
    name: 'Prof. Marcus Brody',
    role: 'Head of Mathematics & Computational Thinking',
    credentials: 'M.Sc Applied Mathematics, Cambridge Fellow',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    experience: '16 Years Experience | IMO Coach',
    quote: 'Mathematics is not about memorizing numbers, but uncovering the hidden architecture of the universe.',
  },
  {
    name: 'Dr. Clara Oswald',
    role: 'Senior Faculty – Physics & Space Sciences',
    credentials: 'Ph.D. Theoretical Physics (Oxford)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    experience: '12 Years Research & Teaching',
    quote: 'Empowering young scientists to ask daring questions and test them against experimental truth.',
  },
];

const FAQS = [
  {
    q: 'How do I apply for student admission or schedule a campus visit?',
    a: 'You can submit an admission inquiry through the Contact & Admissions form below, call our admissions office directly, or visit our administration block during open campus hours.',
  },
  {
    q: 'What is the student-to-teacher ratio?',
    a: 'We maintain a strict 12:1 student-to-faculty ratio in classrooms and 6:1 during laboratory research sessions to ensure personalized attention.',
  },
  {
    q: 'How can parents track their ward’s progress?',
    a: 'Enrolled parents get access to live GPS bus tracking, real-time period attendance, homework submissions, instant grade reports, and digital fee receipts via the Parent Portal.',
  },
  {
    q: 'What are the admission prerequisites for Grade 11 Science & Commerce?',
    a: 'Admission is granted based on Grade 10 board examination performance (minimum 80% aggregate) and an interactive scholarship aptitude test.',
  },
];

export const ExploreView = ({ showToast, onRequestRoleTab, onOpenAuthModal }) => {
  const { user, refreshUser, isMember, isAuthenticated } = useAuth();

  // Interactive Fee Estimator State
  const [selectedGrade, setSelectedGrade] = useState('10');
  const [hasTransportation, setHasTransportation] = useState(true);
  const [hasHostel, setHasHostel] = useState(false);

  // Campus Visit / Admission Enquiry Form
  const [inquiryName, setInquiryName] = useState(user?.name || '');
  const [inquiryEmail, setInquiryEmail] = useState(user?.email || '');
  const [inquiryPhone, setInquiryPhone] = useState(user?.phone || '');
  const [inquiryGrade, setInquiryGrade] = useState('Grade 10');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  const handleInquirySubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    setInquirySubmitted(true);
    showToast?.({
      type: 'success',
      title: 'Inquiry Received',
      message: 'Admission & Campus Tour inquiry received! Our admissions team will reach out within 24 hours.',
    });
  };

  // Fee calculation helper
  const getTuitionBase = (grade) => {
    const g = parseInt(grade, 10) || 10;
    if (g <= 5) return 2800;
    if (g <= 8) return 3600;
    return 4800;
  };

  const baseTuition = getTuitionBase(selectedGrade);
  const transportFee = hasTransportation ? 650 : 0;
  const hostelFee = hasHostel ? 2200 : 0;
  const labActivityFee = parseInt(selectedGrade, 10) >= 9 ? 450 : 250;
  const totalEstimatedAnnual = (baseTuition + transportFee + hostelFee + labActivityFee) * 2; // Semester x 2

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* 1. HERO HEADER WITH USER STATUS */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 text-white p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold tracking-wide">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Campus Discovery & Public Explorer</span>
            </span>
            {isAuthenticated ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Logged in as {user?.name || 'Member'} ({user?.role || 'Member'})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Public Visitor Access (No sign-in required)</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Explore EduPulse International Academy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed max-w-2xl">
            Welcome to our open campus gateway. Browse world-class STEM laboratories, academic curricula, admissions guide, transparent fee estimator, and contact resources freely without needing an account.
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <a
              href="#campus-tour"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Building2 className="w-4 h-4" />
              <span>Virtual Campus Tour</span>
            </a>
            <a
              href="#fee-estimator"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>Tuition & Fee Calculator</span>
            </a>
            <a
              href="#academics"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Academic Programs</span>
            </a>
            <a
              href="#inquiry-form"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Contact & Admissions</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. VIRTUAL CAMPUS TOUR & LABS HIGHLIGHTS */}
      <section id="campus-tour" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Campus Infrastructure & Research Facilities
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Take an interactive virtual walkthrough across our 32-acre smart sustainable campus.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Smart Interactive Classrooms</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CAMPUS_GALLERY.map((item) => (
            <div
              key={item.id}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                  {item.category}
                </span>
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Available for all enrolled students</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    Explore Details <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ACADEMIC CURRICULA & PROGRAMS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Academic Curricula & Specialized Streams
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              International benchmarked pedagogical framework designed for academic mastery.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CURRICULUM_PROGRAMS.map((prog) => {
            const Icon = prog.icon;
            return (
              <div
                key={prog.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {prog.tag}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {prog.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {prog.description}
                  </p>

                  <div className="mt-4 space-y-1.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Key Highlights:</p>
                    {prog.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. FACULTY & LEADERSHIP SPOTLIGHT */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Faculty & Academic Leadership
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Meet our distinguished mentors holding degrees from top global research universities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FACULTY_SHOWCASE.map((fac, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <img
                    src={fac.avatar}
                    alt={fac.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-xs"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{fac.name}</h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{fac.role}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{fac.credentials}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 italic border-l-2 border-indigo-500 pl-3 py-1 my-3 bg-slate-50 dark:bg-slate-850/60 rounded-r-lg">
                  "{fac.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{fac.experience}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" /> Verified Mentor
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TUITION & FEE CALCULATOR / ESTIMATOR */}
      <section id="fee-estimator" className="bg-linear-to-br from-indigo-900/10 via-slate-50 to-cyan-900/10 dark:from-indigo-950/40 dark:via-slate-900 dark:to-cyan-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Col: Controls */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Calculator className="w-4 h-4" />
                <span>Interactive Fee Estimator</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Calculate Transparent Tuition & Facilities Fee
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select student grade and elective facilities to get an instant itemized estimate for Academic Year 2025-2026.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Grade / Class Level:
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="1">Grade 1 (Primary)</option>
                  <option value="3">Grade 3 (Primary)</option>
                  <option value="6">Grade 6 (Middle School)</option>
                  <option value="8">Grade 8 (Middle School)</option>
                  <option value="10">Grade 10 (Secondary Board)</option>
                  <option value="11">Grade 11 (Senior Science/Commerce)</option>
                  <option value="12">Grade 12 (Senior Secondary)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasTransportation}
                    onChange={(e) => setHasTransportation(e.target.checked)}
                    className="rounded text-indigo-600 w-4 h-4"
                  />
                  <span>Include AC GPS School Bus Transport (+$650/term)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasHostel}
                    onChange={(e) => setHasHostel(e.target.checked)}
                    className="rounded text-indigo-600 w-4 h-4"
                  />
                  <span>Include On-Campus Boarding & Hostel (+$2,200/term)</span>
                </label>
              </div>
            </div>

            {/* Itemized breakdown cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Tuition (Term)</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">${baseTuition}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">STEM & Lab Fee</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">${labActivityFee}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Transport (Term)</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">${transportFee}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Hostel / Boarding</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">${hostelFee}</span>
              </div>
            </div>
          </div>

          {/* Right Col: Total Card */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Estimated Annual Investment
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
                ${totalEstimatedAnnual.toLocaleString()}{' '}
                <span className="text-xs text-slate-400 font-normal">/ Academic Year</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Payable in 2 equal installments per semester. Scholarships available up to 40% based on merit exam.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Per Semester Installment:</span>
                <span className="font-bold text-slate-900 dark:text-white">${(totalEstimatedAnnual / 2).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Books & Digital Tablet Access:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Included Free</span>
              </div>
              <button
                onClick={() => {
                  const elem = document.getElementById('inquiry-form');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full mt-3 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-center"
              >
                Apply for Admission with this Estimate
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ADMISSION ENQUIRY & CAMPUS VISIT FORM */}
      <section id="inquiry-form" className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            <Mail className="w-3.5 h-3.5" />
            <span>Admissions Office</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Schedule a Campus Tour or Admission Inquiry
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Our admissions counselors host guided parent tours Monday through Saturday. Fill out the quick form to receive an invitation package.
          </p>

          <div className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>742 Evergreen Terrace, Springfield, OR</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>+1 (555) 342-8900 (Admissions Line)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>admissions@edupulse.edu</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          {inquirySubmitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Inquiry Successfully Registered!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Thank you, {inquiryName}. An admission counselor has been assigned to your request and will contact you via email at {inquiryEmail}.
              </p>
              <button
                type="button"
                onClick={() => setInquirySubmitted(false)}
                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student / Parent Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. Aryan Verma"
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Grade
                  </label>
                  <select
                    value={inquiryGrade}
                    onChange={(e) => setInquiryGrade(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="Grade 1">Grade 1 (Primary)</option>
                    <option value="Grade 6">Grade 6 (Middle)</option>
                    <option value="Grade 10">Grade 10 (Secondary)</option>
                    <option value="Grade 11 Science">Grade 11 (Science Stream)</option>
                    <option value="Grade 11 Commerce">Grade 11 (Commerce Stream)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Questions or Preferred Visit Date
                </label>
                <textarea
                  rows={3}
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Would like to schedule a tour for Friday morning and discuss the robotics lab..."
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Campus Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-950/40 hover:bg-slate-100/80 dark:hover:bg-slate-850 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
