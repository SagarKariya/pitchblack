import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  Terminal,
  Loader2,
  ChevronDown,
  ShieldCheck,
  Copy,
  Check,
  Mail,
  Building2,
  Fingerprint,
  BadgeCheck,
} from 'lucide-react';

export const AuthButton: React.FC = () => {
  const { currentUser, loading, openAuthModal, signOut, isAdmin, isApproved, pendingApprovalCount, openAdminModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleCopyUid = async (uid: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(uid);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = uid;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-500 font-mono animate-pulse">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
        <span>Connecting...</span>
      </div>
    );
  }

  if (currentUser) {
    // Parse Name and Designation intelligently
    let displayName = currentUser.displayName?.trim() || '';
    let designation = 'General Partner';

    if (displayName.includes('/')) {
      const parts = displayName.split('/');
      displayName = parts[0]?.trim() || '';
      designation = parts.slice(1).join('/').trim() || designation;
    } else if (displayName.includes('|')) {
      const parts = displayName.split('|');
      displayName = parts[0]?.trim() || '';
      designation = parts.slice(1).join('|').trim() || designation;
    }

    if (!displayName) {
      if (currentUser.email) {
        const localPart = currentUser.email.split('@')[0];
        displayName = localPart
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());
      } else {
        displayName = 'Venture Partner';
      }
    }

    // Avatar initials
    const initials = displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join('') || 'VP';

    const email = currentUser.email || 'partner@pitchblack.vc';
    const uid = currentUser.uid;
    const firmName = 'PitchBlack Capital Syndicate';
    const securityTier = isAdmin
      ? 'Lead Administrator Clearance'
      : isApproved
      ? 'Approved Partner Access'
      : 'Pending Administrator Review';
    const securityBadge = isAdmin ? 'ADMIN' : isApproved ? 'APPROVED' : 'PENDING';
    const securityBadgeStyle = isAdmin
      ? 'text-purple-800 bg-purple-50 border-purple-200'
      : isApproved
      ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
      : 'text-amber-800 bg-amber-50 border-amber-200';

    return (
      <div className="relative" ref={menuRef}>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="User profile and session options"
          className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border transition-all cursor-pointer group active:scale-[0.98] ${
            isOpen
              ? 'bg-zinc-100 border-zinc-300 text-zinc-900 shadow-xs'
              : 'bg-white hover:bg-zinc-50 border-zinc-200 shadow-2xs hover:shadow-xs text-zinc-900'
          }`}
        >
          {/* Avatar with status indicator */}
          <div className="relative">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={displayName}
                className="w-7 h-7 rounded-lg object-cover border border-zinc-200/90 shadow-2xs"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-mono text-[11px] font-bold flex items-center justify-center shadow-xs">
                {initials}
              </div>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"
              title="Session Active"
            />
          </div>

          {/* Name & Role on desktop */}
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span
              className={`text-xs font-semibold transition-colors truncate max-w-[120px] ${
                isOpen ? 'text-zinc-900' : 'text-zinc-900 group-hover:text-emerald-700'
              }`}
            >
              {displayName}
            </span>
            <span
              className={`text-[10px] font-mono truncate max-w-[120px] ${
                isOpen ? 'text-emerald-600' : 'text-zinc-500'
              }`}
            >
              {designation}
            </span>
          </div>

          {/* Dropdown Chevron */}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-600' : 'text-zinc-400 group-hover:text-zinc-600'
            }`}
          />
        </button>

        {/* Dropdown Popover: Clean Institutional Original Light Theme & Bento Layout */}
        {isOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-84 sm:w-96 rounded-2xl bg-white/98 backdrop-blur-2xl border border-zinc-200/90 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)] p-4.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left text-zinc-900 overflow-hidden"
            role="menu"
            aria-orientation="vertical"
          >
            {/* Ambient Radial Refraction Glow Background */}
            <div
              className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-emerald-500/8 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            {/* Top Terminal Header Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 mb-3.5 relative z-10">
              <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase text-zinc-500">
                <Terminal className="w-3 h-3 text-emerald-600" />
                <span>PitchBlack // Syndicate Access</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ONLINE</span>
              </div>
            </div>

            {/* Executive Profile Identity Card */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-gradient-to-br from-zinc-50 to-white border border-zinc-200/90 relative z-10 shadow-xs mb-3">
              <div className="relative shrink-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={displayName}
                    className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-mono text-base font-bold flex items-center justify-center border border-emerald-400/30 shadow-xs">
                    {initials}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-zinc-900 tracking-tight truncate">
                    {displayName}
                  </h4>
                  {/* Verified Badge */}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-medium text-emerald-700 shadow-2xs">
                    <BadgeCheck className="w-3 h-3 text-emerald-600 fill-emerald-600/20" />
                    <span>{isAdmin ? 'Lead Admin' : 'Verified'}</span>
                  </span>
                </div>

                <p className="text-xs font-semibold text-emerald-600 mt-0.5 truncate">
                  {designation}
                </p>

                <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-1 truncate">
                  <Building2 className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span className="truncate">{firmName}</span>
                </p>
              </div>
            </div>

            {/* Admin Approvals Shortcut for Administrator */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openAdminModal();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-semibold transition-all cursor-pointer shadow-2xs mb-3"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>User Approvals &amp; Access Gate</span>
                </div>
                {pendingApprovalCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white font-mono font-bold text-[10px] animate-pulse">
                    {pendingApprovalCount} Pending
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500 font-mono">0 Pending</span>
                )}
              </button>
            )}

            {/* Thematic Bento Information Grid */}
            <div className="space-y-2 relative z-10">
              {/* Tile 1: Registered Investor Email */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50/80 border border-zinc-200/90 hover:border-zinc-300 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-2xs">
                    <Mail className="w-3.5 h-3.5 text-zinc-600" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[9px] uppercase font-mono tracking-wider text-zinc-400 leading-none">
                      Investor Account Email
                    </span>
                    <span className="block text-xs font-mono font-medium text-zinc-800 truncate mt-0.5">
                      {email}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                  AUTHENTICATED
                </span>
              </div>

              {/* 2-Column Grid: Clearance Tier & User ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Tile 2: Security Clearance Tier */}
                <div className="p-2.5 rounded-xl bg-zinc-50/80 border border-zinc-200/90 hover:border-zinc-300 transition-colors flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px] uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Security Clearance</span>
                    </div>
                    <span className={`text-[8px] font-mono font-bold border px-1 py-0.2 rounded ${securityBadgeStyle}`}>
                      {securityBadge}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-800 truncate">
                    {securityTier}
                  </span>
                </div>

                {/* Tile 3: User ID (UID) with Copy Action */}
                <div className="p-2.5 rounded-xl bg-zinc-50/80 border border-zinc-200/90 hover:border-zinc-300 transition-colors flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px] uppercase tracking-wider">
                      <Fingerprint className="w-3 h-3 text-emerald-600" />
                      <span>User ID (UID)</span>
                    </div>
                    <button
                      onClick={() => handleCopyUid(uid)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white hover:bg-zinc-100 border border-zinc-200 text-[9px] font-mono font-medium text-zinc-700 hover:text-zinc-950 transition-all cursor-pointer shrink-0 active:scale-95 shadow-2xs"
                      title="Copy User ID"
                    >
                      {copiedId ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5 text-zinc-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-700 truncate" title={uid}>
                    {uid}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions / Sign Out Button */}
            <div className="pt-3 mt-1 relative z-10">
              <button
                onClick={async () => {
                  setIsOpen(false);
                  await signOut();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 text-rose-700 hover:text-rose-900 text-xs font-semibold transition-all cursor-pointer group active:scale-[0.99] shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600 group-hover:translate-x-0.5 transition-transform" />
                <span>Sign Out & Terminate Session</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Unauthenticated State: Sign In Button (Clean Normal Light Theme)
  return (
    <button
      onClick={() => openAuthModal()}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-[0.98]"
      title="Sign in with your Google or Investor account"
    >
      <Terminal className="w-3.5 h-3.5 text-emerald-600 group-hover:rotate-12 transition-transform" />
      <span className="font-sans font-semibold">Sign In</span>
    </button>
  );
};
