import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Send,
  LogOut,
  Shield,
} from 'lucide-react';

export const TerminalAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalPrompt,
    closeAuthModal,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    checkEmailAvailable,
    sendPasswordReset,
    checkMyStatus,
    signOut,
    currentUser,
    userStatus,
    isApproved,
    error,
    clearError,
  } = useAuth();

  const [tab, setTab] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isEmailAlreadyUsed, setIsEmailAlreadyUsed] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Sign-Up Status State ('form' or 'pending')
  const [signupStep, setSignupStep] = useState<'form' | 'pending'>('form');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // If a logged-in user is pending approval and modal is open, sync to pending step
  useEffect(() => {
    if (currentUser && userStatus === 'PENDING_APPROVAL' && !isApproved) {
      setSignupStep('pending');
      if (currentUser.email) setEmail(currentUser.email);
    }
  }, [currentUser, userStatus, isApproved]);

  // Keyboard shortcut: Esc to close modal (if not strictly locked in pending)
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleTabChange = (newTab: 'signin' | 'signup' | 'reset') => {
    setTab(newTab);
    setSignupStep('form');
    clearError();
    setLocalError(null);
    setIsEmailAlreadyUsed(false);
    setResetSent(false);
    setStatusMessage(null);
  };

  const handleEmailBlur = async () => {
    if (tab !== 'signup' || !email.trim() || !email.includes('@')) return;
    try {
      setIsCheckingEmail(true);
      const check = await checkEmailAvailable(email.trim().toLowerCase());
      if (!check.available) {
        setIsEmailAlreadyUsed(true);
        setLocalError(check.message || 'An account already exists with this email address. Please switch to Sign In.');
      } else if (isEmailAlreadyUsed) {
        setIsEmailAlreadyUsed(false);
        setLocalError(null);
      }
    } catch {
      // quiet
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setLocalError(null);
    clearError();
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return;
      }
      setLocalError(err?.message || 'Google authentication was not completed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct Sign-Up: Register with Email and Password
  const handleDirectSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setIsEmailAlreadyUsed(false);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLocalError('Please enter a valid investor email address.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must contain at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Pre-check if email already has an account
      const check = await checkEmailAvailable(cleanEmail);
      if (!check.available) {
        setIsEmailAlreadyUsed(true);
        setLocalError(check.message || 'An account already exists with this email address. Please switch to Sign In.');
        setIsSubmitting(false);
        return;
      }

      await signUpWithEmail(cleanEmail, password, displayName);
      setSignupStep('pending');
      setStatusMessage('Registration complete. Access request submitted for review.');
    } catch (err: any) {
      const msg = err?.message || 'Registration failed. Please check credentials.';
      if (
        msg.toLowerCase().includes('already exists') ||
        msg.toLowerCase().includes('already in use') ||
        msg.toLowerCase().includes('already registered')
      ) {
        setIsEmailAlreadyUsed(true);
      }
      setLocalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manual status check for pending applicant
  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    setStatusMessage(null);
    try {
      const current = await checkMyStatus();
      if (current === 'APPROVED') {
        setStatusMessage('Your account has been approved! Launching workspace...');
        setTimeout(() => {
          closeAuthModal();
        }, 1200);
      } else if (current === 'REJECTED') {
        setLocalError('Access request was declined. Please contact support if you believe this is an error.');
      } else {
        setStatusMessage('Account authorization is currently under review.');
      }
    } catch {
      setStatusMessage('Unable to reach server. Please try again.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError('Please enter your investor email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (tab === 'signin') {
        if (!password) {
          setLocalError('Please enter your access password.');
          setIsSubmitting(false);
          return;
        }
        await signInWithEmail(email, password);
      } else if (tab === 'signup') {
        await handleDirectSignUp(e);
      } else if (tab === 'reset') {
        await sendPasswordReset(email);
        setResetSent(true);
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedError = localError || error;

  const modalContent = (
    <div
      id="terminal-auth-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={closeAuthModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        id="terminal-auth-modal-container"
        className="relative w-full max-w-md my-auto bg-white border border-zinc-200/90 rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col text-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Close authentication modal"
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto pr-1 mt-1 space-y-4">
          {/* Action Prompt Banner (If triggered by gated action) */}
          {authModalPrompt && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-700 block text-[11px] uppercase tracking-wider">
                  Gated Diligence Action Required
                </span>
                <p className="text-[12px] text-zinc-600 mt-0.5 leading-snug">
                  {authModalPrompt}
                </p>
              </div>
            </div>
          )}

          {/* SCREEN A: PENDING ADMINISTRATOR APPROVAL VIEW */}
          {signupStep === 'pending' || (currentUser && userStatus === 'PENDING_APPROVAL' && !isApproved) ? (
            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 animate-pulse text-amber-700" />
                </div>
                <div>
                  <h3 id="auth-modal-title" className="text-sm font-bold text-zinc-900">
                    Pending Administrator Approval
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>STATUS: PENDING_APPROVAL</span>
                  </span>
                </div>
              </div>

              {/* Informational Box */}
              <div className="p-3.5 rounded-xl bg-white border border-amber-200/90 text-xs space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Applicant Email:</span>
                  <span className="font-mono font-bold text-zinc-900">{email || currentUser?.email}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Registration Status:</span>
                  <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Submitted</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Your account registration has been submitted. A review request has been queued. Once authorized, you will have complete access to Pitch Black.
              </p>

              {statusMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {displayedError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{displayedError}</span>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCheckStatus}
                  disabled={isCheckingStatus}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-xs tracking-tight transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isCheckingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Checking Approval Status...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Check Approval Status Now</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    setSignupStep('form');
                    setTab('signin');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Sign In with Different Account</span>
                </button>
              </div>
            </div>
          ) : (
            /* SCREEN B: STANDARD SIGN-IN / SIGN-UP FORM */
            <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 bg-zinc-50/60">
              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 bg-zinc-200/60 border border-zinc-200 rounded-xl mb-4 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => handleTabChange('signin')}
                  className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${
                    tab === 'signin'
                      ? 'bg-white text-zinc-900 font-bold shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Sign In to Account
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('signup')}
                  className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${
                    tab === 'signup'
                      ? 'bg-white text-zinc-900 font-bold shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* One-Click Google Sign-In */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <span className="text-[11px] font-semibold text-zinc-600">Pre-configured Provider</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Instant Access
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 font-semibold text-xs transition-all shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-700" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center gap-3 my-3.5">
                  <div className="h-px bg-zinc-200 flex-1" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-transparent px-2">
                    or email authorization
                  </span>
                  <div className="h-px bg-zinc-200 flex-1" />
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {tab === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Partner Name &amp; Title
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Marc Andreessen / General Partner"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Investor Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (isEmailAlreadyUsed) {
                          setIsEmailAlreadyUsed(false);
                          setLocalError(null);
                        }
                      }}
                      onBlur={handleEmailBlur}
                      placeholder="partner@venturefund.com"
                      className={`w-full pl-9 ${isCheckingEmail ? 'pr-9' : 'pr-3'} py-2 bg-white border ${isEmailAlreadyUsed ? 'border-rose-400 ring-1 ring-rose-400/30' : 'border-zinc-300'} rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-colors`}
                    />
                    {isCheckingEmail && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                    {tab === 'signup' && (
                      <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                        * Once submitted, your account will be queued for review
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-zinc-700">
                        Security Password
                      </label>
                      {tab === 'signin' && (
                        <button
                          type="button"
                          onClick={() => handleTabChange('reset')}
                          className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-colors font-mono"
                      />
                    </div>
                  </div>

                {/* Error Alert */}
                {displayedError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col gap-2.5 shadow-2xs">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-snug font-medium">{displayedError}</span>
                    </div>
                    {(isEmailAlreadyUsed ||
                      displayedError.toLowerCase().includes('already exists') ||
                      displayedError.toLowerCase().includes('already in use') ||
                      displayedError.toLowerCase().includes('already registered')) && (
                      <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-rose-700 font-medium">Already have an account?</span>
                        <button
                          type="button"
                          onClick={() => handleTabChange('signin')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                        >
                          Switch to Sign In →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Success Alert on password reset */}
                {resetSent && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">
                      Password recovery requested. Please check your registered inbox or contact support.
                    </span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-xs tracking-tight transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Processing...</span>
                    </>
                  ) : tab === 'signin' ? (
                    <>
                      <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Authenticate Partner Session</span>
                    </>
                  ) : tab === 'signup' ? (
                    <>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Register &amp; Request Access</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>

                {tab === 'reset' && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => handleTabChange('signin')}
                      className="text-xs text-zinc-500 hover:text-zinc-800 cursor-pointer font-medium"
                    >
                      ← Return to Sign In
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
