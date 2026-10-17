import React from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Users,
  X,
  Mail,
  Fingerprint,
  Calendar,
  Loader2,
  AlertCircle,
  BadgeCheck,
} from 'lucide-react';

export const AdminApprovalModal: React.FC = () => {
  const {
    isAdminModalOpen,
    closeAdminModal,
    accessRequests,
    approveUserAccess,
    rejectUserAccess,
    updateUserRole,
    currentUser,
  } = useAuth();

  const [processingId, setProcessingId] = React.useState<string | null>(null);

  if (!isAdminModalOpen) return null;

  const pendingRequests = accessRequests.filter((r) => r.status === 'PENDING_APPROVAL');
  const approvedRequests = accessRequests.filter((r) => r.status === 'APPROVED');
  const rejectedRequests = accessRequests.filter((r) => r.status === 'REJECTED');

  const handleApprove = async (userId: string, email: string) => {
    try {
      setProcessingId(userId);
      await approveUserAccess(userId, email);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string, email?: string) => {
    try {
      setProcessingId(userId);
      await rejectUserAccess(userId, email);
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleRole = async (userId: string, email: string, newRole: 'admin' | 'member') => {
    try {
      setProcessingId(userId);
      await updateUserRole(userId, email, newRole);
    } finally {
      setProcessingId(null);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={closeAdminModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <div
        className="bg-white border border-zinc-200/90 rounded-3xl w-full max-w-2xl max-h-[88vh] my-auto flex flex-col shadow-2xl relative overflow-hidden text-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="admin-modal-title" className="text-base font-bold text-zinc-900 tracking-tight font-sans">
                  Partner Access Gate // User Approvals
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  Administrator
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Review applicants (Google OAuth & Email) and authorize account access for Pitch Black.
              </p>
            </div>
          </div>

          <button
            onClick={closeAdminModal}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-3 gap-3 px-5 py-3.5 bg-zinc-100/50 border-b border-zinc-200 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-zinc-200 shadow-2xs">
            <Clock className="w-4 h-4 text-amber-600" />
            <div>
              <div className="text-[10px] text-zinc-500 font-medium">Pending Approval</div>
              <div className="text-sm font-bold text-amber-700 font-mono">{pendingRequests.length}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-zinc-200 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="text-[10px] text-zinc-500 font-medium">Approved Users</div>
              <div className="text-sm font-bold text-emerald-700 font-mono">{approvedRequests.length}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-zinc-200 shadow-2xs">
            <Users className="w-4 h-4 text-zinc-600" />
            <div>
              <div className="text-[10px] text-zinc-500 font-medium">Total Applicants</div>
              <div className="text-sm font-bold text-zinc-800 font-mono">{accessRequests.length}</div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {accessRequests.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50">
              <UserCheck className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-zinc-700">No Access Requests Yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                When new users register via Email or Google, their access approval requests will appear here for your authorization.
              </p>
            </div>
          ) : (
            accessRequests.map((req) => {
              const isPending = req.status === 'PENDING_APPROVAL';
              const isApproved = req.status === 'APPROVED';
              const isRejected = req.status === 'REJECTED';
              const isProcessing = processingId === req.userId;

              const initials = (req.displayName || req.email)
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={req.id || req.userId}
                  className={`p-4 rounded-2xl border transition-all ${
                    isPending
                      ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                      : isApproved
                      ? 'bg-white border-zinc-200 shadow-2xs'
                      : 'bg-zinc-50/60 border-zinc-200 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* User Info */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-zinc-900 truncate">
                            {req.displayName || 'Venture Applicant'}
                          </span>
                          {req.authProvider === 'google' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-medium">
                              Google OAuth
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 text-[10px] font-mono font-medium">
                              Email Registration
                            </span>
                          )}
                          {req.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-mono font-bold">
                              <ShieldCheck className="w-3 h-3 text-purple-700" />
                              ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 text-[10px] font-mono font-medium">
                              MEMBER
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                              isPending
                                ? 'bg-amber-100/80 text-amber-900 border-amber-300'
                                : isApproved
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-rose-100 text-rose-900 border-rose-300'
                            }`}
                          >
                            {isPending ? 'PENDING APPROVAL' : isApproved ? 'APPROVED' : 'REJECTED'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-1 flex-wrap font-mono">
                          <span className="flex items-center gap-1 text-zinc-700 font-medium">
                            <Mail className="w-3 h-3 text-zinc-400" />
                            {req.email}
                          </span>
                          {req.requestedAt && (
                            <span className="flex items-center gap-1 text-zinc-400">
                              <Calendar className="w-3 h-3" />
                              {new Date(req.requestedAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(req.userId, req.email)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReject(req.userId)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-rose-50 text-zinc-600 hover:text-rose-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : isApproved ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {req.role === 'admin' ? 'Administrator' : 'Active Member'}
                          </span>
                          {req.email !== currentUser?.email && (
                            <button
                              type="button"
                              onClick={() => handleToggleRole(req.userId, req.email, req.role === 'admin' ? 'member' : 'admin')}
                              disabled={isProcessing}
                              className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
                              title={req.role === 'admin' ? 'Demote to Member' : 'Promote to Admin in Firestore'}
                            >
                              {req.role === 'admin' ? 'Demote to Member' : 'Make Admin'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleReject(req.userId)}
                            disabled={isProcessing}
                            className="text-[10px] text-zinc-400 hover:text-rose-600 underline cursor-pointer"
                            title="Revoke access"
                          >
                            Revoke
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApprove(req.userId, req.email)}
                          disabled={isProcessing}
                          className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                        >
                          Re-Approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 text-[11px] text-zinc-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
            <span>Admin decisions sync instantly in real-time to the applicant's browser session.</span>
          </div>
          <button
            type="button"
            onClick={closeAdminModal}
            className="px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null;
};
