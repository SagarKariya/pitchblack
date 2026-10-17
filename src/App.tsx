import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FullDiligenceReport, PersistentDeal, ReportData } from './types';
export type { ReportData };
import { runHeuristicAudit } from './data/heuristicAuditor';
import {
  getUserDealsFromFirestore,
  autoSaveUploadedDealToFirestore,
  deleteDealFromFirestore,
} from './services/dealService';
import { PulsatingDotsBackground } from './components/PulsatingDots';
import { HomePage } from './HomePage';
import { SignalPillar } from './components/SignalPillar';
import { MetricsPillar } from './components/MetricsPillar';
import { SubsectorPillar } from './components/SubsectorPillar';
import { ForensicPillar } from './components/ForensicPillar';
import { QuestionBankPillar } from './components/QuestionBankPillar';
import { SensitivityCopilotPillar } from './components/SensitivityCopilotPillar';
import { TrajectoryPillar } from './components/TrajectoryPillar';
import { GrowthVelocityPillar } from './components/GrowthVelocityPillar';
import { ScorecardRadarPillar } from './components/ScorecardRadarPillar';
import { CustomPitchModal } from './components/CustomPitchModal';
import { ExportMemoModal } from './components/ExportMemoModal';
import { DataGroundingModal } from './components/DataGroundingModal';
import { AuthButton } from './components/AuthButton';
import { TerminalAuthModal } from './components/TerminalAuthModal';
import { AdminApprovalModal } from './components/AdminApprovalModal';
import { useAuth } from './context/AuthContext';
import { db, handleFirestoreError, OperationType } from './utils/firebase';
import { BenchmarksPage, BenchmarkFramework } from './components/BenchmarksPage';
import { PitchAIChatPage } from './components/PitchAIChatPage';
import { IngestPitchPage } from './components/IngestPitchPage';
import {
  Bell,
  Clock,
  RefreshCw,
  LogOut,
  ShieldAlert,
  Shield,
  CheckCircle2,
  BarChart3,
  Layers,
  EyeOff,
  HelpCircle,
  Sliders,
  Plus,
  FileText,
  Sparkles,
  Compass,
  ArrowLeft,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  TrendingUp,
  Flame,
  Calendar,
  DollarSign,
  Cpu,
  CreditCard,
  Stethoscope,
  Radio,
  Target,
  Scale,
  Bot,
  UploadCloud,
  Command,
  Search,
  X,
  Grid,
  Bookmark,
  BookmarkCheck,
  Loader2,
  Lock,
  KeyRound,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { AmbientGlassMesh } from './components/AmbientGlassMesh';

export type AppTheme = 'original';
export type DealTab = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'chat';

export default function App() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'original');
    localStorage.setItem('pitchblack_theme', 'original');
  }, []);

  const [currentView, setCurrentView] = useState<'home' | 'deal' | 'benchmarks' | 'ingest'>('home');
  const [activeDealTab, setActiveDealTab] = useState<DealTab>(1);
  const [selectedBenchmarkFramework, setSelectedBenchmarkFramework] = useState<BenchmarkFramework>('all');
  const [userDeals, setUserDeals] = useState<PersistentDeal[]>([]);
  const [activeDealId, setActiveDealId] = useState<string>('');
  const [isLoadingDeals, setIsLoadingDeals] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isGroundingModalOpen, setIsGroundingModalOpen] = useState<boolean>(false);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [isPillarMatrixOpen, setIsPillarMatrixOpen] = useState<boolean>(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);
  const [apiErrorToast, setApiErrorToast] = useState<string | null>(null);

  const {
    currentUser,
    requireAuth,
    openAuthModal,
    isAdmin,
    isApproved,
    userStatus,
    pendingApprovalCount,
    openAdminModal,
    checkMyStatus,
    signOut,
  } = useAuth();
  const [isCheckingApproval, setIsCheckingApproval] = useState<boolean>(false);

  // Load user's persistent deals directly from Firebase Firestore (requires approved login)
  useEffect(() => {
    if (!currentUser || !isApproved) {
      setUserDeals([]);
      setActiveDealId('');
      return;
    }

    let isMounted = true;
    const loadDeals = async () => {
      setIsLoadingDeals(true);
      try {
        const deals = await getUserDealsFromFirestore(currentUser.uid);
        if (isMounted) {
          setUserDeals(deals);
          if (deals.length > 0) {
            setActiveDealId((prev) => (prev && deals.some((d) => d.id === prev) ? prev : deals[0].id));
          }
        }
      } catch (err) {
        console.error('Failed to load user deals from Firestore:', err);
      } finally {
        if (isMounted) {
          setIsLoadingDeals(false);
        }
      }
    };

    loadDeals();
    return () => {
      isMounted = false;
    };
  }, [currentUser, isApproved]);

  // Global hotkey: Cmd/Ctrl + K to toggle Pillar Matrix HUD in Deal Room & 1-9 quick-keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing when typing into an input/textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPillarMatrixOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsPillarMatrixOpen(false);
      } else if (isPillarMatrixOpen && ['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        const pillarNum = parseInt(e.key, 10);
        if (pillarNum >= 1 && pillarNum <= 9) {
          e.preventDefault();
          setActiveDealTab(pillarNum as DealTab);
          setIsPillarMatrixOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPillarMatrixOpen]);

  // Lock body scrolling when any modal HUD / memo popup is active so it remains fixed in the visible viewport
  useEffect(() => {
    if (isPillarMatrixOpen || isExportModalOpen || isCustomModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isPillarMatrixOpen, isExportModalOpen, isCustomModalOpen]);

  // Center selected pillar button inside the navigation ribbon so next pillars stay visible and easy to click
  useEffect(() => {
    const timer = setTimeout(() => {
      const btn = document.getElementById(`pillar-tab-btn-${activeDealTab}`);
      const container = document.getElementById('pillars-horizontal-strip');
      if (btn && container) {
        const containerRect = container.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        const offset = (btnRect.left + btnRect.width / 2) - (containerRect.left + containerRect.width / 2);
        container.scrollBy({ left: offset, behavior: 'smooth' });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [activeDealTab]);

  // Active report resolution from Firestore userDeals
  const activeDeal = userDeals.find((d) => d.id === activeDealId) || userDeals[0];
  const activeReport: FullDiligenceReport =
    activeDeal?.report ||
    runHeuristicAudit(
      'OptiRoute Logistics',
      'IOT_HAAS',
      'OptiRoute Logistics',
      'Series A'
    );

  const pillars = [
    {
      id: 1,
      label: 'Investment Verdict',
      icon: ShieldAlert,
      subtitle: 'Executive Verdict & MOIC Payoff',
      tag: `${activeReport.signal.convictionScore}/100`,
    },
    {
      id: 2,
      label: '5-Factor Diligence Scorecard',
      icon: Target,
      subtitle: 'Multi-Vector Conviction & Radar',
      tag: 'Radar & Hurdles',
    },
    {
      id: 3,
      label: 'Financial Trajectory',
      icon: TrendingUp,
      subtitle: 'Performance & Retention Decay',
      tag: '4-Qtr Run Rate',
    },
    {
      id: 4,
      label: 'Financial & Growth Metrics',
      icon: BarChart3,
      subtitle: 'Unit Economics & Targets',
      tag: `${activeReport.metrics.length} Metrics`,
    },
    {
      id: 5,
      label: 'Runway & Stress Test',
      icon: Sliders,
      subtitle: 'Downside Scenarios & Cash Burn',
      tag: 'Simulator',
    },
    {
      id: 6,
      label: 'Growth Velocity & Cohort',
      icon: Flame,
      subtitle: 'MoM ARR Velocity & Cohort Slicing',
      tag: 'MoM Heatmap',
    },
    {
      id: 7,
      label: 'Sector-Specific Concerns',
      icon: Layers,
      subtitle: 'Industry Risks & Hurdles',
      tag: `${activeReport.subsectorAudit.checks.length} Checks`,
    },
    {
      id: 8,
      label: 'Hidden Risks & Omissions',
      icon: EyeOff,
      subtitle: 'Missing Info & Red Flags',
      tag: `${activeReport.forensicGaps.length} Flags`,
    },
    {
      id: 9,
      label: 'Questions to Ask',
      icon: HelpCircle,
      subtitle: 'Founder Due Diligence Agenda',
      tag: `${activeReport.questionBank.length} Qs`,
    },
  ];

  // Enforce white theme permanently
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    try {
      localStorage.removeItem('pitch_black_theme');
    } catch {
      // ignore
    }
  }, []);

  const handleSelectDeal = (dealId: string) => {
    setActiveDealId(dealId);
    if (!currentUser) {
      openAuthModal('Sign in with your Google or investor account to enter the Deal Room.');
      return;
    }
    setCurrentView('deal');
    setActiveDealTab(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDeal = async (dealId: string) => {
    const userId = currentUser?.uid || 'guest';
    try {
      await deleteDealFromFirestore(dealId, userId);
      setUserDeals((prev) => prev.filter((d) => d.id !== dealId));
      if (activeDealId === dealId) {
        const remaining = userDeals.filter((d) => d.id !== dealId);
        if (remaining.length > 0) {
          setActiveDealId(remaining[0].id);
        } else {
          setActiveDealId('');
        }
      }
      setSaveSuccessToast('Deal successfully removed from your Diligence Vault.');
      setTimeout(() => setSaveSuccessToast(null), 3500);
    } catch (err) {
      console.error('Failed to delete deal from Firestore:', err);
      if (currentUser) {
        handleFirestoreError(err, OperationType.DELETE, `deals/${dealId}`);
      }
    }
  };

  const handleRunCustomAudit = async (
    pitchText: string,
    sector?: string,
    companyName?: string,
    stage?: string
  ) => {
    if (!currentUser) {
      requireAuth(
        () => handleRunCustomAudit(pitchText, sector, companyName, stage),
        'Sign in with your Google or investor account to run real-time 9-pillar startup diligence audits.'
      );
      return;
    }

    setIsAuditing(true);
    setApiErrorToast(null);
    try {
      let report: FullDiligenceReport | null = null;
      // 1. Run server-side Gemini audit (do not bypass on failure)
      try {
        const idToken = await currentUser.getIdToken();
        const resp = await fetch('/api/pitch-audit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            pitchText,
            sector,
            companyName,
            stage,
          }),
        });

        const data = await resp.json();
        if (resp.ok && data.success && data.report) {
          report = data.report;
        } else {
          const errText = data?.error || (resp.status ? `Gemini API issue(${resp.status})` : 'Gemini API issue(400)');
          setApiErrorToast(errText);
          return;
        }
      } catch (err: any) {
        const errText = err?.message && err.message.includes('Gemini API issue')
          ? err.message
          : 'Gemini API issue(400)';
        setApiErrorToast(errText);
        return;
      }

      if (!report) {
        setApiErrorToast('Gemini API issue(400)');
        return;
      }

      // 2. Auto-Persist on Ingestion: Automatically save every uploaded pitch & full 9-pillar report to Firestore
      const savedDeal = await autoSaveUploadedDealToFirestore(currentUser.uid, report, pitchText);

      // Prepend to user deals and switch to this deal
      setUserDeals((prev) => [savedDeal, ...prev.filter((d) => d.id !== savedDeal.id)]);
      setActiveDealId(savedDeal.id);

      setSaveSuccessToast(`"${report.companyName}" automatically saved to your private Firestore vault.`);
      setTimeout(() => setSaveSuccessToast(null), 5000);

      setCurrentView('deal');
      setActiveDealTab(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      const errText = err?.message && err.message.includes('Gemini API issue')
        ? err.message
        : 'Gemini API issue(400)';
      setApiErrorToast(errText);
    } finally {
      setIsAuditing(false);
      setIsCustomModalOpen(false);
    }
  };

  const getSignalBadgeColor = (sig: string) => {
    switch (sig) {
      case 'HIGH_CONVICTION':
        return 'text-emerald-700 bg-emerald-500/10 border-emerald-500/30 font-bold shadow-2xs';
      case 'CONDITIONAL':
        return 'text-blue-700 bg-blue-500/10 border-blue-500/30 font-bold shadow-2xs';
      case 'REJECT_PASS':
        return 'text-rose-700 bg-rose-500/10 border-rose-500/30 font-bold shadow-2xs';
      default:
        return 'text-zinc-700 bg-zinc-500/10 border-zinc-500/30 font-bold';
    }
  };

  const getSectorIcon = (sec: string) => {
    switch (sec) {
      case 'ENTERPRISE_AI':
        return <Cpu className="w-3.5 h-3.5 text-blue-600" />;
      case 'FINTECH':
        return <CreditCard className="w-3.5 h-3.5 text-emerald-600" />;
      case 'HEALTHTECH':
        return <Stethoscope className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Radio className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--canvas-bg)] text-[var(--ink-primary)] font-sans overflow-x-clip selection:bg-emerald-500/20 selection:text-emerald-900 flex flex-col transition-colors duration-200">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-zinc-900 focus:text-white focus:rounded-xl focus:shadow-2xl focus:ring-2 focus:ring-emerald-400 font-sans text-xs font-bold"
      >
        Skip to main content
      </a>

      {/* Ambient Vibrant Glassmorphism Backlight Mesh (active across all views for depth and refraction) */}
      <AmbientGlassMesh />

      {/* Animated Pulsating Dotted Canvas Background (Overview / Home only, disabled in Deal Room) */}
      {currentView === 'home' && (
        <PulsatingDotsBackground isDark={false} />
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top VC Institutional Navigation Bar - Frozen / Sticky during scrolling */}
        <header className="border-b border-zinc-200/90 bg-white/95 backdrop-blur-xl sticky top-0 z-50 w-full shadow-xs transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Logo & Identity */}
            <div
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 cursor-pointer origin-left group"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCurrentView('home'); } }}
              aria-label="Pitch Black Home"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse shrink-0" />
              <span className="font-serif font-bold text-xl tracking-tight text-zinc-900 group-hover:text-emerald-600 transition-colors">
                Pitch Black
              </span>
            </div>

            {/* Navigation Switch: Overview -> Ingest Pitch -> Deal Room -> Benchmarks */}
            <nav aria-label="Main Workspace Navigation" className="flex items-center bg-zinc-100/90 border border-zinc-200/80 rounded-xl p-1 backdrop-blur-md shadow-2xs">
              <button
                onClick={() => setCurrentView('home')}
                aria-label="Navigate to Overview"
                aria-current={currentView === 'home' ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  currentView === 'home'
                    ? 'bg-white text-zinc-900 font-bold shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setCurrentView('ingest')}
                aria-label="Navigate to Ingest Pitch"
                aria-current={currentView === 'ingest' ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  currentView === 'ingest'
                    ? 'bg-white text-zinc-900 font-bold shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ingest Pitch</span>
              </button>

              <button
                onClick={() => {
                  if (!currentUser) {
                    openAuthModal('Sign in with your Google or investor account to access the Deal Room.');
                    return;
                  }
                  setCurrentView('deal');
                }}
                aria-label="Navigate to Deal Room"
                aria-current={currentView === 'deal' ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  currentView === 'deal'
                    ? 'bg-white text-zinc-900 font-bold shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span>Deal Room</span>
                {!currentUser && (
                  <Lock className="w-2.5 h-2.5 text-amber-500/90 ml-0.5" />
                )}
              </button>

              <button
                onClick={() => {
                  setSelectedBenchmarkFramework('all');
                  setCurrentView('benchmarks');
                }}
                aria-label="Navigate to VC Benchmarks"
                aria-current={currentView === 'benchmarks' ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  currentView === 'benchmarks'
                    ? 'bg-white text-zinc-900 font-bold shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                <span>Benchmarks</span>
              </button>
            </nav>

            {/* Right: Auth & Sign-in Controls + Admin Notification */}
            <div className="flex items-center justify-end gap-2.5 min-w-[120px]">
              {isAdmin && (
                <button
                  type="button"
                  onClick={openAdminModal}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                    pendingApprovalCount > 0
                      ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 ring-2 ring-amber-400/30'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                  title="Administrator User Approvals"
                >
                  <Bell className={`w-3.5 h-3.5 ${pendingApprovalCount > 0 ? 'text-amber-600 animate-bounce' : 'text-zinc-500'}`} />
                  <span className="hidden sm:inline font-sans">Approvals</span>
                  {pendingApprovalCount > 0 && (
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-600 text-white font-mono text-[10px] font-bold">
                      {pendingApprovalCount}
                    </span>
                  )}
                </button>
              )}
              <AuthButton />
            </div>
          </div>
        </header>

        {/* MAIN CONTENT LANDMARK */}
        <main id="main-content" className="flex-1 flex flex-col w-full">

        {/* ACCESS GATE: LOGGED-IN APPLICANT PENDING ADMINISTRATOR APPROVAL */}
        {currentUser && !isApproved && (
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-12 text-center animate-in fade-in duration-200">
            <div className="w-full bg-white border border-zinc-200/90 rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col items-center text-zinc-900">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-md mb-6 relative">
                <Clock className="w-8 h-8 animate-pulse text-amber-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 mb-3 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {userStatus === 'REJECTED' ? 'Access Request Declined' : 'Account Authorization Pending'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 font-serif mb-2">
                {userStatus === 'REJECTED' ? 'Platform Access Declined' : 'Authorization In Progress'}
              </h1>

              <p className="text-sm text-zinc-600 max-w-lg mb-6 leading-relaxed">
                {userStatus === 'REJECTED' ? (
                  <>
                    Your access request has been reviewed and declined. If you believe this is an error, please contact support.
                  </>
                ) : (
                  <>
                    Your account (<strong className="text-zinc-900">{currentUser.email}</strong>) has been registered. Your authorization request is currently queued for review. Once activated, your workspace access will unlock automatically.
                  </>
                )}
              </p>

              <div className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-left text-xs space-y-2 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Applicant:</span>
                  <span className="font-semibold text-zinc-800">{currentUser.displayName || currentUser.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Authentication:</span>
                  <span className="font-semibold text-emerald-700 font-mono">✓ Credentials Verified</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Current Status:</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                    userStatus === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {userStatus}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {userStatus !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={async () => {
                      setIsCheckingApproval(true);
                      try {
                        const st = await checkMyStatus();
                        if (st === 'APPROVED') {
                          setSaveSuccessToast('Access approved! Welcome to Pitch Black.');
                        }
                      } finally {
                        setIsCheckingApproval(false);
                      }
                    }}
                    disabled={isCheckingApproval}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingApproval ? 'animate-spin' : ''}`} />
                    <span>Check Approval Status</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REGULAR VIEWS (WHEN APPROVED OR BROWSING PUBLIC AS GUEST) */}
        {(!currentUser || isApproved) && currentView === 'home' && (
          <HomePage
            deals={userDeals}
            isLoadingDeals={isLoadingDeals}
            onSelectDeal={handleSelectDeal}
            onDeleteDeal={handleDeleteDeal}
            onOpenCustomPitchModal={() => setCurrentView('ingest')}
            onNavigateToIngest={() => setCurrentView('ingest')}
            onNavigateToBenchmarks={(fw) => {
              if (fw) setSelectedBenchmarkFramework(fw);
              setCurrentView('benchmarks');
            }}
            onNavigateToPillarTab={(pillarId) => {
              if (!currentUser) {
                openAuthModal(`Sign in with your Google or investor account to access Pillar 0${pillarId} in the Deal Room.`);
                return;
              }
              setActiveDealTab(pillarId as DealTab);
              setCurrentView('deal');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isLoggedIn={!!currentUser}
            onOpenAuthModal={(prompt) => openAuthModal(prompt || 'Sign in with your investor account to access full institutional diligence audits.')}
          />
        )}

        {/* VIEW 2: IN-DEPTH BENCHMARKING REPOSITORY */}
        {(!currentUser || isApproved) && currentView === 'benchmarks' && (
          <BenchmarksPage
            initialFramework={selectedBenchmarkFramework}
            onSelectDeal={(dealId) => {
              handleSelectDeal(dealId);
              setCurrentView('deal');
            }}
            isLoggedIn={!!currentUser}
            onOpenAuth={(prompt) => openAuthModal(prompt || 'Sign in with your investor account to compare startup deals against institutional benchmarks.')}
          />
        )}

        {/* VIEW 3A: DEAL ROOM GATED BEHIND SIGN-IN */}
        {(!currentUser || isApproved) && currentView === 'deal' && !currentUser && (
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center animate-in fade-in duration-200">
            <div className="w-full bg-white border border-zinc-200/90 rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg mb-6 relative">
                <Lock className="w-7 h-7 text-emerald-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-3 shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Institutional Deal War-Room · Private Access</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight font-serif mb-3">
                Deal Room Access Requires Sign-In
              </h1>

              <p className="text-sm sm:text-base text-zinc-600 max-w-2xl mb-8 leading-relaxed">
                The institutional Deal Room and all startup diligence packs are strictly private. Sign in with your partner or investor account to unlock complete 9-pillar audits, sensitivity models, PitchAI copilot, and IC memos.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl text-left mb-8">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 mb-1">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>9 Diligence Pillars</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Full conviction scoring, radar hurdles, financial trajectories, and cohort heatmaps.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 mb-1">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <span>PitchAI Copilot</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Interactive senior diligence director grounded in audited filings and deal metrics.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 mb-1">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Exportable IC Memos</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Download institutional 2-page investment committee memos and save to your private vault.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => openAuthModal('Sign in with your Google or investor account to unlock the Deal Room.')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-sm font-semibold shadow-md transition-all cursor-pointer group"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Sign In to Unlock Deal Room</span>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setCurrentView('home')}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-semibold transition-all cursor-pointer"
                >
                  <span>Return to Overview</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3B: DEAL-SPECIFIC WAR-ROOM (AUTHENTICATED & APPROVED ONLY) */}
        {currentView === 'deal' && currentUser && isApproved && (
          <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Deal Room Header & Target Company Overview — Matching Ingest Pitch & Benchmarks Style */}
            <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4 w-full">
              <div className="w-full flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-3 shadow-2xs">
                  <Compass className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Institutional Deal War-Room & Diligence Audit</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight font-serif">
                    {activeReport.companyName}
                  </h1>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border font-sans tracking-normal ${getSignalBadgeColor(activeReport.signal.signal)}`}>
                    {activeReport.signal.badgeLabel || (activeReport.signal.signal === 'HIGH_CONVICTION' ? 'High Conviction' : activeReport.signal.signal === 'CONDITIONAL' ? 'Conditional' : 'Pass / Reject')}
                  </span>
                </div>
                <p className="w-full text-sm text-zinc-600 max-w-none md:max-w-3xl mt-2 leading-relaxed">
                  Institutional 9-pillar investment audit and partner war-room for <strong>{activeReport.companyName}</strong> ({activeReport.stage} · {activeReport.sector.replace(/_/g, ' ')}). Audited against Tier-1 IC thresholds across quantitative metrics, forensic omissions, and stress-tested valuation payoff.
                </p>
              </div>

              {/* Fast Switch Deal Dropdown */}
              <div className="flex items-center gap-2 self-start md:self-auto shrink-0 pt-1">
                <label htmlFor="deal-room-preset-select" className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                  Switch Active Deal:
                </label>
                <div className="relative">
                  <select
                    id="deal-room-preset-select"
                    aria-label="Switch active startup deal"
                    value={activeDealId}
                    onChange={(e) => {
                      if (e.target.value === 'ingest-new') {
                        setCurrentView('ingest');
                      } else {
                        handleSelectDeal(e.target.value);
                      }
                    }}
                    className="appearance-none bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs font-bold rounded-xl py-2 pl-3.5 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
                  >
                    {userDeals.filter((d) => !d.isPreset).length > 0 && (
                      <optgroup label="⚡ My Ingested Vault (Saved in Firestore)">
                        {userDeals
                          .filter((d) => !d.isPreset)
                          .map((deal) => (
                            <option key={deal.id} value={deal.id}>
                              ★ {deal.companyName} ({deal.convictionScore}/100 · {deal.sector})
                            </option>
                          ))}
                      </optgroup>
                    )}
                    <optgroup label="🏛️ Institutional Portfolio Deals (Stored in Firestore)">
                      {userDeals
                        .filter((d) => d.isPreset)
                        .map((deal) => (
                          <option key={deal.id} value={deal.id}>
                            {deal.companyName} ({deal.stage} · {deal.sector})
                          </option>
                        ))}
                    </optgroup>
                    <option value="ingest-new">+ Ingest New Startup Pitch...</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Quick-Jump Sticky Ribbon for 9 Pillars + Chat with PitchAI Internal Tabs + Export Memo */}
            <nav aria-label="Deal Room Pillars and Tools" className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border border-zinc-200/90 rounded-2xl p-2 mb-6 shadow-xs transition-all">
              <div className="flex items-center justify-between gap-2">
                {/* Uncanny Pillar Matrix & Fast Switcher Launch Button */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setIsPillarMatrixOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 text-white hover:bg-emerald-600 transition-all cursor-pointer shadow-xs group"
                    title="Open 9-Pillar Radar HUD Matrix (Cmd/Ctrl + K)"
                    aria-label="Open 9-pillar radar HUD matrix (Keyboard shortcut Command+K)"
                  >
                    <Grid className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="hidden sm:inline">Pillars (1-9)</span>
                    <span className="inline sm:hidden font-mono text-[11px]">9P</span>
                    <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white/20 rounded text-zinc-100 group-hover:bg-black/30">
                      ⌘K
                    </kbd>
                  </button>

                  {/* Left Scroll Step Button */}
                  <button
                    onClick={() => {
                      const container = document.getElementById('pillars-horizontal-strip');
                      if (container) container.scrollBy({ left: -220, behavior: 'smooth' });
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
                    title="Scroll pillars left"
                    aria-label="Scroll pillars ribbon left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* Horizontal Scrollable Strip for All 9 Pillars */}
                <div
                  id="pillars-horizontal-strip"
                  role="tablist"
                  aria-label="Diligence Pillars"
                  className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 mx-1 py-0.5"
                >
                  {pillars.map((pillar) => {
                    const Icon = pillar.icon;
                    const isActive = activeDealTab === pillar.id;
                    return (
                      <button
                        key={pillar.id}
                        id={`pillar-tab-btn-${pillar.id}`}
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`Pillar 0${pillar.id}: ${pillar.label}`}
                        onClick={(e) => {
                          setActiveDealTab(pillar.id as DealTab);
                          const container = document.getElementById('pillars-horizontal-strip');
                          if (container) {
                            const containerRect = container.getBoundingClientRect();
                            const btnRect = e.currentTarget.getBoundingClientRect();
                            const offset = (btnRect.left + btnRect.width / 2) - (containerRect.left + containerRect.width / 2);
                            container.scrollBy({ left: offset, behavior: 'smooth' });
                          }
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-zinc-900 text-white font-bold shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 font-medium'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                        <span className="whitespace-nowrap">0{pillar.id}. {pillar.label}</span>
                        {isActive && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded-md font-mono hidden md:inline">
                            {pillar.tag}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Internal Tab: Chat with PitchAI */}
                  <button
                    id="pillar-tab-btn-chat"
                    role="tab"
                    aria-selected={activeDealTab === 'chat'}
                    aria-label="Chat with PitchAI partner assistant"
                    onClick={(e) => {
                      setActiveDealTab('chat');
                      const container = document.getElementById('pillars-horizontal-strip');
                      if (container) {
                        const containerRect = container.getBoundingClientRect();
                        const btnRect = e.currentTarget.getBoundingClientRect();
                        const offset = (btnRect.left + btnRect.width / 2) - (containerRect.left + containerRect.width / 2);
                        container.scrollBy({ left: offset, behavior: 'smooth' });
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer shrink-0 ${
                      activeDealTab === 'chat'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs'
                        : 'bg-blue-50/90 hover:bg-blue-100 text-blue-700 border border-blue-200/80 font-semibold shadow-2xs'
                    }`}
                  >
                    <Bot className={`w-3.5 h-3.5 ${activeDealTab === 'chat' ? 'text-white' : 'text-blue-600'}`} />
                    <span className="whitespace-nowrap">Chat with PitchAI</span>
                    {!currentUser ? (
                      <Lock className="w-2.5 h-2.5 text-amber-600/80 shrink-0" />
                    ) : activeDealTab === 'chat' ? (
                      <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-md font-medium">Active</span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    )}
                  </button>
                </div>

                {/* Right Scroll & Action Strip: Right arrow + Export Memo */}
                <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-zinc-200">
                  <button
                    onClick={() => {
                      const container = document.getElementById('pillars-horizontal-strip');
                      if (container) container.scrollBy({ left: 220, behavior: 'smooth' });
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
                    title="Scroll pillars right"
                    aria-label="Scroll pillars ribbon right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      requireAuth(
                        () => setIsExportModalOpen(true),
                        'Sign in with your Google or investor account to export and download institutional 2-page IC memos.'
                      );
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 shadow-2xs transition-all cursor-pointer shrink-0"
                    title="Export 2-Page IC Memo"
                    aria-label="Export 2-page investment committee memo"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span className="whitespace-nowrap hidden sm:inline">Export Memo</span>
                  </button>
                </div>
              </div>
            </nav>

            {/* TAB CONTENT: INDIVIDUALLY RENDERED PILLAR OR CHAT */}
            <div className="pb-16 w-full">
              {activeDealTab === 1 && <SignalPillar report={activeReport} />}
              {activeDealTab === 2 && <ScorecardRadarPillar report={activeReport} />}
              {activeDealTab === 3 && <TrajectoryPillar report={activeReport} />}
              {activeDealTab === 4 && (
                <MetricsPillar
                  report={activeReport}
                  onNavigateToBenchmarks={(fw) => {
                    if (fw) setSelectedBenchmarkFramework(fw);
                    setCurrentView('benchmarks');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}
              {activeDealTab === 5 && (
                <SensitivityCopilotPillar
                  report={activeReport}
                  onNavigateToPitchAIChat={() => {
                    setActiveDealTab('chat');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}
              {activeDealTab === 6 && <GrowthVelocityPillar report={activeReport} />}
              {activeDealTab === 7 && <SubsectorPillar report={activeReport} />}
              {activeDealTab === 8 && <ForensicPillar report={activeReport} />}
              {activeDealTab === 9 && <QuestionBankPillar report={activeReport} />}
              {activeDealTab === 'chat' && (
                <PitchAIChatPage
                  activeReport={activeReport}
                  selectedPresetId={activeDealId}
                  onSelectDeal={handleSelectDeal}
                  onNavigateToDealRoom={() => {
                    setActiveDealTab(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  isEmbeddedInDealRoom={true}
                />
              )}

              {/* Tab Navigation Footer (for pillars 1-7) */}
              {typeof activeDealTab === 'number' && (
                <div className="mt-10 pt-6 border-t border-zinc-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {activeDealTab > 1 ? (
                    <button
                      onClick={() => {
                        setActiveDealTab((activeDealTab - 1) as DealTab);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 shadow-2xs transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Previous: 0{activeDealTab - 1}. {pillars[activeDealTab - 2]?.label}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsGroundingModalOpen(true)}
                      className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/80 shadow-md shadow-emerald-900/20 hover:shadow-lg hover:shadow-emerald-500/35 hover:ring-2 hover:ring-emerald-400/50 hover:ring-offset-1 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer group"
                      title="Check Data Grounding & Hallucination Evaluator"
                      aria-label="Check Data Grounding and Hallucination Evaluator"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 group-hover:text-white group-hover:scale-110 transition-all shrink-0" />
                      <span className="tracking-tight">Check Data Grounding</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2.5 flex-wrap justify-center">
                    <span className="text-xs text-zinc-500">
                      Pillar {activeDealTab} of {pillars.length}
                    </span>
                    <button
                      onClick={() => {
                        setActiveDealTab('chat');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ask PitchAI About Pillar 0{activeDealTab}</span>
                    </button>
                  </div>

                  {activeDealTab < pillars.length ? (
                    <button
                      onClick={() => {
                        setActiveDealTab((activeDealTab + 1) as DealTab);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-black text-white shadow-xs transition-all cursor-pointer"
                    >
                      <span>Next: 0{activeDealTab + 1}. {pillars[activeDealTab]?.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveDealTab('chat');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
                    >
                      <span>Proceed to Chat with PitchAI</span>
                      <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: DEDICATED INGEST PITCH WORKSPACE TAB */}
        {(!currentUser || isApproved) && currentView === 'ingest' && (
          <IngestPitchPage
            onRunAudit={handleRunCustomAudit}
            isLoading={isAuditing}
            isLoggedIn={!!currentUser}
            onOpenAuth={(prompt) => openAuthModal(prompt || 'Sign in with your Google or investor account to execute real-time AI diligence audits.')}
          />
        )}
        </main>

        {/* 9-Pillar Radar HUD Matrix Modal */}
        {isPillarMatrixOpen && typeof document !== 'undefined' && createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
            onClick={() => setIsPillarMatrixOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="matrix-modal-title"
          >
            <div
              className="relative w-full max-w-4xl my-auto bg-white border border-zinc-200/90 rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-zinc-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-md">
                    <Grid className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 id="matrix-modal-title" className="text-lg sm:text-xl font-bold text-zinc-900 font-sans tracking-tight">
                        9-Pillar Institutional Diligence Matrix
                      </h2>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {activeReport.companyName}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Press <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-zinc-100 border border-zinc-200 rounded text-zinc-700">1-9</kbd> or click any pillar tile to instantly jump to that diligence pillar.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                    <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 rounded text-zinc-600">Esc</kbd> to close
                  </span>
                  <button
                    onClick={() => setIsPillarMatrixOpen(false)}
                    aria-label="Close diligence matrix dialog"
                    className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Matrix Grid (3x3 Tiles) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 my-6 overflow-y-auto pr-1">
                {pillars.map((pillar) => {
                  const Icon = pillar.icon;
                  const isActive = activeDealTab === pillar.id;
                  return (
                    <div
                      key={pillar.id}
                      onClick={() => {
                        setActiveDealTab(pillar.id as DealTab);
                        setIsPillarMatrixOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isActive
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-md ring-2 ring-emerald-500/40'
                          : 'bg-white hover:bg-zinc-50/80 border-zinc-200/90 text-zinc-900 hover:border-emerald-500/60 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                            isActive
                              ? 'bg-white/10 text-emerald-400'
                              : 'bg-zinc-100 text-zinc-700 group-hover:bg-emerald-50 group-hover:text-emerald-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                              isActive
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-zinc-100 text-zinc-600 group-hover:bg-emerald-50 group-hover:text-emerald-700'
                            }`}
                          >
                            {pillar.tag}
                          </span>
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold ${
                              isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
                            }`}
                          >
                            0{pillar.id}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div
                          className={`text-sm font-bold tracking-tight mb-1 ${
                            isActive ? 'text-white' : 'text-zinc-900 group-hover:text-emerald-600'
                          }`}
                        >
                          {pillar.label}
                        </div>
                        <p
                          className={`text-xs line-clamp-2 leading-relaxed ${
                            isActive ? 'text-zinc-300' : 'text-zinc-500'
                          }`}
                        >
                          {pillar.subtitle}
                        </p>
                      </div>

                      <div
                        className={`mt-3 pt-2.5 border-t text-[11px] font-semibold flex items-center justify-between ${
                          isActive
                            ? 'border-white/10 text-emerald-400'
                            : 'border-zinc-100 text-zinc-400 group-hover:text-emerald-600'
                        }`}
                      >
                        <span>{isActive ? 'Current Active Pillar' : 'Jump to Pillar'}</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer with Chat Quick Switch */}
              <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="text-xs text-zinc-500">
                  Total Diligence Pillars: <strong className="text-zinc-800">9 Core Modules</strong> covering 16 Metrics, Forensics, Radar & Stress Testing
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveDealTab('chat');
                      setIsPillarMatrixOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-blue-600" />
                    <span>Open PitchAI Deal Room Assistant</span>
                  </button>

                  <button
                    onClick={() => setIsPillarMatrixOpen(false)}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 text-white hover:bg-black transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Modals */}
        <CustomPitchModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          onRunAudit={handleRunCustomAudit}
          isLoading={isAuditing}
        />

        <ExportMemoModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          report={activeReport}
        />

        <DataGroundingModal
          isOpen={isGroundingModalOpen}
          onClose={() => setIsGroundingModalOpen(false)}
          report={activeReport}
          rawPitchText={activeDeal?.rawPitchText}
          companyName={activeReport.companyName}
        />

        <TerminalAuthModal />
        <AdminApprovalModal />

        {/* Gemini API Issue Error Toast */}
        {apiErrorToast && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-zinc-950 text-white rounded-xl border border-rose-500/80 shadow-2xl text-xs font-sans animate-in slide-in-from-top-3 duration-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-bold text-rose-300 text-xs">{apiErrorToast}</span>
            <button
              onClick={() => setApiErrorToast(null)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer ml-1"
              title="Dismiss error notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Real-time Vault Sync Toast */}
        {saveSuccessToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-zinc-950 text-white rounded-xl border border-emerald-500/40 shadow-2xl text-xs font-sans animate-in slide-in-from-bottom-3 duration-200">
            <BookmarkCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{saveSuccessToast}</span>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-zinc-200 bg-white py-6 px-4 sm:px-6 lg:px-8 mt-auto text-center text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-900 font-semibold">Pitch Black Terminal</span>
              <span className="text-zinc-400">Institutional Edition</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
