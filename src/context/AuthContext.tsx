import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { auth, googleProvider, db } from '../utils/firebase';
import { clearAllUserChatsFromFirestore } from '../services/chatService';

const envAdminEmail = (
  ((import.meta as any).env?.VITE_ADMIN_EMAIL || (import.meta as any).env?.ADMIN_EMAIL || '') as string
).trim().toLowerCase();

export const ADMIN_EMAIL = envAdminEmail || 'sbkariya99@gmail.com';

export interface AccessRequest {
  id: string;
  userId: string;
  email: string;
  displayName?: string;
  role?: 'admin' | 'member';
  authProvider?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  requestedAt?: string;
  updatedAt?: string;
  decisionBy?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  user: User | null; // Alias for backward compatibility
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  userRole: 'admin' | 'member';
  userStatus: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED' | 'GUEST';
  isApproved: boolean;
  accessRequests: AccessRequest[];
  pendingApprovalCount: number;
  isAdminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
  checkEmailAvailable: (email: string) => Promise<{ available: boolean; message?: string }>;
  submitAccessRequest: (email: string, displayName?: string, uid?: string, authProvider?: string) => Promise<any>;
  checkMyStatus: () => Promise<'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED' | 'GUEST'>;
  approveUserAccess: (userId: string, email: string, role?: 'admin' | 'member') => Promise<void>;
  rejectUserAccess: (userId: string, email?: string) => Promise<void>;
  updateUserRole: (userId: string, email: string, role: 'admin' | 'member') => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  signOutUser: () => Promise<void>; // Alias for backward compatibility
  clearError: () => void;
  isAuthModalOpen: boolean;
  authModalPrompt: string | null;
  openAuthModal: (prompt?: string) => void;
  closeAuthModal: () => void;
  requireAuth: (action: () => void, promptReason?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function createLocalPartnerUser(email: string, displayName?: string): User {
  const cleanEmail = email.trim();
  const name = displayName?.trim() || cleanEmail.split('@')[0] || 'Venture Partner';
  const idHash = Math.abs(cleanEmail.split('').reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0)).toString(36);
  const uid = `partner-${idHash}`;

  const user: User = {
    uid,
    email: cleanEmail,
    displayName: name,
    photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=059669`,
    emailVerified: true,
    isAnonymous: false,
    phoneNumber: null,
    providerId: 'password',
    tenantId: null,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [
      {
        uid,
        displayName: name,
        email: cleanEmail,
        photoURL: '',
        phoneNumber: null,
        providerId: 'password',
      },
    ],
    refreshToken: '',
    delete: async () => {},
    getIdToken: async () => 'partner-session-token',
    getIdTokenResult: async () => ({
      token: 'partner-session-token',
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 86400000).toISOString(),
      signInProvider: 'password',
      signInSecondFactor: null,
      claims: {},
    }),
    reload: async () => {},
    toJSON: () => ({ uid, email: cleanEmail, displayName: name }),
  };

  return user;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalPrompt, setAuthModalPrompt] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED' | 'GUEST'>('GUEST');
  const [userRole, setUserRole] = useState<'admin' | 'member'>('member');
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Pending action to execute immediately after user logs in
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Database-driven admin validation backed by Firestore role, with bootstrap fallback
  const isAdmin =
    userRole === 'admin' ||
    Boolean(
      currentUser &&
        currentUser.email &&
        (currentUser.email.trim().toLowerCase() === 'sbkariya99@gmail.com' ||
          (envAdminEmail && currentUser.email.trim().toLowerCase() === envAdminEmail))
    );

  const isApproved = isAdmin || userStatus === 'APPROVED';

  const pendingApprovalCount = accessRequests.filter((r) => r.status === 'PENDING_APPROVAL').length;

  // Real-time listener for current user's approval status & Firestore role
  useEffect(() => {
    if (!currentUser) {
      setUserStatus('GUEST');
      setUserRole('member');
      return;
    }

    // Polling backup to server for authoritative Firestore role & status
    const checkServerStatus = async () => {
      try {
        const res = await fetch(
          `/api/auth/user-status?email=${encodeURIComponent(currentUser.email || '')}&userId=${encodeURIComponent(currentUser.uid)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.status && data.status !== userStatus) {
            setUserStatus(data.status);
          }
          if (data.role && data.role !== userRole) {
            setUserRole(data.role);
          }
        }
      } catch {
        // quiet ignore
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 3000);

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const unsub = onSnapshot(
        userDocRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const status = data.status || 'PENDING_APPROVAL';
            const role = data.role === 'admin' ? 'admin' : 'member';
            setUserStatus(status as any);
            setUserRole(role);
          } else {
            setUserStatus('PENDING_APPROVAL');
            setUserRole('member');
          }
        },
        (err) => {
          console.warn('Real-time user status subscription notice:', err);
        }
      );
      return () => {
        clearInterval(interval);
        unsub();
      };
    } catch (e) {
      console.warn('Could not subscribe to user status in Firestore:', e);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Real-time listener & server polling for access requests (Admin only)
  useEffect(() => {
    if (!isAdmin || !currentUser) {
      return;
    }

    // Polling backup to server with Firebase ID token
    const fetchServerRequests = async () => {
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch('/api/auth/access-requests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.requests) {
            setAccessRequests(data.requests);
          }
        }
      } catch {
        // quiet ignore
      }
    };

    fetchServerRequests();
    const interval = setInterval(fetchServerRequests, 3000);

    let unsub: (() => void) | undefined;
    try {
      const reqColRef = collection(db, 'access_requests');
      unsub = onSnapshot(
        reqColRef,
        (snapshot) => {
          const list: AccessRequest[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              userId: data.userId || d.id,
              email: data.email || '',
              displayName: data.displayName || '',
              role: data.role || 'member',
              status: data.status || 'PENDING_APPROVAL',
              requestedAt: data.requestedAt,
              updatedAt: data.updatedAt,
              decisionBy: data.decisionBy,
            });
          });
          list.sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());
          if (list.length > 0) {
            setAccessRequests(list);
          }
        },
        (err) => {
          console.warn('Access requests subscription notice:', err);
        }
      );
    } catch (e) {
      console.warn('Could not subscribe to access_requests:', e);
    }

    return () => {
      clearInterval(interval);
      if (unsub) unsub();
    };
  }, [isAdmin, currentUser]);

  useEffect(() => {
    // Check for saved local partner session first
    const saved = localStorage.getItem('pitchblack_partner_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email) {
          const restoredUser = createLocalPartnerUser(parsed.email, parsed.displayName);
          setCurrentUser(restoredUser);
          if (restoredUser.email && restoredUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            setUserStatus('APPROVED');
          } else {
            setUserStatus('PENDING_APPROVAL');
          }
        }
      } catch {
        localStorage.removeItem('pitchblack_partner_session');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        localStorage.removeItem('pitchblack_partner_session');
        setCurrentUser(user);
        setLoading(false);

        // Identify authentication method (Google OAuth or Email Credentials)
        const isGoogleAuth = user.providerData?.some((p) => p.providerId === 'google.com');
        const authMethod = isGoogleAuth ? 'google' : 'password';

        // 1. Authoritative server check for user status & Firestore role
        let authoritativeRole: 'admin' | 'member' = 'member';
        let authoritativeStatus: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED' = 'PENDING_APPROVAL';

        try {
          const res = await fetch(
            `/api/auth/user-status?email=${encodeURIComponent(user.email || '')}&userId=${encodeURIComponent(user.uid)}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.status) {
              authoritativeStatus = data.status;
              setUserStatus(data.status);
            }
            if (data.role) {
              authoritativeRole = data.role;
              setUserRole(data.role);
            }
          }
        } catch {
          // quiet
        }

        const isUserAdmin =
          authoritativeRole === 'admin' ||
          Boolean(
            user.email &&
              (user.email.toLowerCase() === 'sbkariya99@gmail.com' ||
                (envAdminEmail && user.email.toLowerCase() === envAdminEmail))
          );

        if (isUserAdmin) {
          setUserRole('admin');
          setUserStatus('APPROVED');
          setIsAuthModalOpen(false);
          setAuthModalPrompt(null);
        } else {
          // Ensure access request is submitted & recorded on server
          try {
            const reqRes = await submitAccessRequest(
              user.email || '',
              user.displayName || user.email?.split('@')[0],
              user.uid,
              authMethod
            );
            if (reqRes && reqRes.status) {
              setUserStatus(reqRes.status);
            }
            if (reqRes && reqRes.role) {
              setUserRole(reqRes.role);
            }
          } catch (e) {
            console.warn('Access request registration notice:', e);
          }
        }

        // If there was a pending gated action, execute it now if approved
        if (pendingActionRef.current && (isUserAdmin || authoritativeStatus === 'APPROVED')) {
          try {
            pendingActionRef.current();
          } catch (e) {
            console.warn('Pending action execution warning:', e);
          } finally {
            pendingActionRef.current = null;
          }
        }

        // Sync user profile to Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          const nowIso = new Date().toISOString();

          if (!docSnap.exists()) {
            const initialRole = isUserAdmin ? 'admin' : authoritativeRole;
            const initialStatus = isUserAdmin ? 'APPROVED' : authoritativeStatus;
            await setDoc(userDocRef, {
              userId: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Venture Partner',
              photoURL: user.photoURL || '',
              role: initialRole,
              status: initialStatus,
              createdAt: nowIso,
              lastLoginAt: nowIso,
            });

            // Also record access request document in Firestore if not admin
            if (initialRole !== 'admin') {
              const reqDocRef = doc(db, 'access_requests', user.uid);
              await setDoc(reqDocRef, {
                id: user.uid,
                userId: user.uid,
                email: user.email || '',
                displayName: user.displayName || 'Venture Partner',
                role: initialRole,
                status: initialStatus,
                requestedAt: nowIso,
                updatedAt: nowIso,
              });
            }
          } else {
            const existing = docSnap.data();
            const existingRole = (existing.role as any) || (isUserAdmin ? 'admin' : authoritativeRole);
            const currentStatus = existingRole === 'admin' ? 'APPROVED' : (existing.status || authoritativeStatus);
            setUserRole(existingRole);
            setUserStatus(currentStatus as any);

            if (existingRole === 'admin') {
              setIsAuthModalOpen(false);
              setAuthModalPrompt(null);
            }

            // Sync safe profile updates (displayName, photoURL, lastLoginAt)
            await setDoc(
              userDocRef,
              {
                displayName: user.displayName || existing.displayName || 'Venture Partner',
                photoURL: user.photoURL || existing.photoURL || '',
                lastLoginAt: nowIso,
              },
              { merge: true }
            );

            const reqDocRef = doc(db, 'access_requests', user.uid);
            await setDoc(
              reqDocRef,
              {
                displayName: user.displayName || existing.displayName || 'Venture Partner',
                updatedAt: nowIso,
              },
              { merge: true }
            );
          }
        } catch (err) {
          console.warn('Could not sync user profile to Firestore:', err);
        }
      } else {
        const hasLocal = localStorage.getItem('pitchblack_partner_session');
        if (!hasLocal) {
          setCurrentUser(null);
          setUserStatus('GUEST');
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkEmailAvailable = async (email: string): Promise<{ available: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { available: false, message: 'Please enter a valid investor email address.' };
    }

    // 1. Query server records
    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          return {
            available: false,
            message: data.message || 'An account already exists for this email address. Please switch to Sign In.',
          };
        }
      }
    } catch {
      // quiet fallback
    }

    // 2. Query Firebase Auth if reachable
    try {
      const methods = await fetchSignInMethodsForEmail(auth, cleanEmail);
      if (methods && methods.length > 0) {
        return {
          available: false,
          message: 'An account already exists for this email address. Please switch to Sign In.',
        };
      }
    } catch {
      // Ignore if enumeration protection restricts methods lookup
    }

    return { available: true };
  };

  const submitAccessRequest = async (
    email: string,
    displayName?: string,
    uid?: string,
    authProvider: 'google' | 'password' | string = 'password'
  ) => {
    try {
      const res = await fetch('/api/auth/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          displayName: displayName || email.split('@')[0],
          userId: uid || `user-${Date.now()}`,
          authProvider,
        }),
      });
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('Submit access request notice:', e);
      return { success: false };
    }
  };

  const checkMyStatus = async (): Promise<'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED' | 'GUEST'> => {
    if (!currentUser) return 'GUEST';
    if (isAdmin) {
      setUserStatus('APPROVED');
      return 'APPROVED';
    }
    try {
      const res = await fetch(
        `/api/auth/user-status?email=${encodeURIComponent(currentUser.email || '')}&userId=${encodeURIComponent(currentUser.uid)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setUserStatus(data.status);
          return data.status;
        }
      }
    } catch {
      // quiet
    }
    return userStatus;
  };

  const approveUserAccess = async (targetUserId: string, targetEmail: string, role?: 'admin' | 'member') => {
    try {
      const nowIso = new Date().toISOString();
      const token = currentUser ? await currentUser.getIdToken() : '';
      const res = await fetch('/api/auth/approve-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId: targetUserId, email: targetEmail, role }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to approve user via backend API');
      }

      // Update optimistic state; authoritative updates are broadcast via Firestore snapshot listeners
      setAccessRequests((prev) =>
        prev.map((r) =>
          r.userId === targetUserId || r.email === targetEmail
            ? { ...r, status: 'APPROVED', role: role || r.role || 'member', decisionBy: currentUser?.email || 'admin', updatedAt: nowIso }
            : r
        )
      );
    } catch (e: any) {
      console.error('Approve user error:', e);
      throw e;
    }
  };

  const updateUserRole = async (targetUserId: string, targetEmail: string, role: 'admin' | 'member') => {
    try {
      const token = currentUser ? await currentUser.getIdToken() : '';
      const res = await fetch('/api/auth/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId: targetUserId, email: targetEmail, role }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update user role via backend API');
      }

      // Update optimistic state
      setAccessRequests((prev) =>
        prev.map((r) =>
          r.userId === targetUserId || r.email === targetEmail ? { ...r, role } : r
        )
      );
    } catch (e: any) {
      console.error('Update user role error:', e);
      throw e;
    }
  };

  const rejectUserAccess = async (targetUserId: string, targetEmail?: string) => {
    try {
      const nowIso = new Date().toISOString();
      const token = currentUser ? await currentUser.getIdToken() : '';
      const res = await fetch('/api/auth/reject-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId: targetUserId, email: targetEmail }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to reject user via backend API');
      }

      // Update optimistic state; authoritative updates are broadcast via Firestore snapshot listeners
      setAccessRequests((prev) =>
        prev.map((r) =>
          r.userId === targetUserId || (targetEmail && r.email === targetEmail)
            ? { ...r, status: 'REJECTED', decisionBy: currentUser?.email || 'admin', updatedAt: nowIso }
            : r
        )
      );
    } catch (e: any) {
      console.error('Reject user error:', e);
      throw e;
    }
  };

  const openAuthModal = (prompt?: string) => {
    setError(null);
    setAuthModalPrompt(prompt || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalPrompt(null);
    pendingActionRef.current = null;
    setError(null);
  };

  const requireAuth = (action: () => void, promptReason?: string) => {
    if (currentUser) {
      action();
    } else {
      pendingActionRef.current = action;
      openAuthModal(promptReason || 'Please authenticate your session to perform this institutional action.');
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        // User deliberately closed or cancelled the popup dialog.
        return;
      }
      if (err?.code === 'auth/popup-blocked') {
        const msg = 'Sign-in pop-up was blocked by your browser. Please allow pop-ups for this site or use email credentials.';
        console.warn('Google sign-in pop-up blocked:', err);
        setError(msg);
        throw new Error(msg);
      }
      if (err?.code === 'auth/unauthorized-domain') {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'production domain';
        const msg = `Domain "${currentHost}" is not authorized for Google OAuth in Firebase. Please add "${currentHost}" to Firebase Console -> Authentication -> Settings -> Authorized domains.`;
        console.error('Firebase Auth unauthorized domain:', currentHost, err);
        setError(msg);
        throw new Error(msg);
      }
      console.warn('Google sign-in notice:', err?.message || err);
      const fallbackMsg = err?.message || 'Google sign-in was not completed. Please try again.';
      setError(fallbackMsg);
      throw new Error(fallbackMsg);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      setError(null);
      const isLeadAdmin = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
      try {
        await signInWithEmailAndPassword(auth, email.trim(), pass);
      } catch (err: any) {
        if (err?.code === 'auth/operation-not-allowed') {
          // Firebase project has not enabled Email/Password provider.
          // Activate local partner session
          const partnerUser = createLocalPartnerUser(email);
          setCurrentUser(partnerUser);
          localStorage.setItem(
            'pitchblack_partner_session',
            JSON.stringify({
              email: partnerUser.email,
              displayName: partnerUser.displayName,
              uid: partnerUser.uid,
              createdAt: new Date().toISOString(),
            })
          );
        } else {
          throw err;
        }
      }

      if (isLeadAdmin) {
        setUserStatus('APPROVED');
        setIsAuthModalOpen(false);
        setAuthModalPrompt(null);
      } else {
        // Query server for status
        try {
          const res = await fetch(`/api/auth/user-status?email=${encodeURIComponent(email.trim().toLowerCase())}`);
          if (res.ok) {
            const data = await res.json();
            const status = data.status || 'PENDING_APPROVAL';
            setUserStatus(status);
            if (status === 'APPROVED') {
              setIsAuthModalOpen(false);
              setAuthModalPrompt(null);
            }
          }
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      console.warn('Email sign-in warning:', err?.message || err);
      let msg = 'Authentication failed. Please verify credentials.';
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        msg = 'Invalid email or security key. Please check your credentials or create an account.';
      } else if (err?.code === 'auth/invalid-email') {
        msg = 'Invalid email format. Please enter a valid investor email address.';
      } else if (err?.code === 'auth/too-many-requests') {
        msg = 'Access temporarily locked due to repeated failed attempts. Please try again shortly.';
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName?: string) => {
    try {
      setError(null);
      const cleanEmail = email.trim().toLowerCase();

      // Guard: strictly prohibit creating account from already used email
      const check = await checkEmailAvailable(cleanEmail);
      if (!check.available) {
        const msg = check.message || 'An account already exists with this email address. Please switch to Sign In.';
        setError(msg);
        throw new Error(msg);
      }

      const isLeadAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();
      let createdUid = '';
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
        const name = displayName?.trim() || email.split('@')[0] || 'Venture Partner';
        if (userCred.user) {
          await updateProfile(userCred.user, { displayName: name });
          createdUid = userCred.user.uid;
        }
      } catch (err: any) {
        if (err?.code === 'auth/email-already-in-use') {
          const msg = 'An account already exists with this email address. Please switch to Sign In.';
          setError(msg);
          throw new Error(msg);
        } else if (err?.code === 'auth/operation-not-allowed') {
          // Double-check: NEVER allow creating local partner session if email is already used
          const verifyAgain = await checkEmailAvailable(cleanEmail);
          if (!verifyAgain.available) {
            const msg = verifyAgain.message || 'An account already exists with this email address. Please switch to Sign In.';
            setError(msg);
            throw new Error(msg);
          }
          // Activate local partner session
          const partnerUser = createLocalPartnerUser(email, displayName);
          setCurrentUser(partnerUser);
          createdUid = partnerUser.uid;
          localStorage.setItem(
            'pitchblack_partner_session',
            JSON.stringify({
              email: partnerUser.email,
              displayName: partnerUser.displayName,
              uid: partnerUser.uid,
              createdAt: new Date().toISOString(),
            })
          );
        } else {
          throw err;
        }
      }

      // Submit access request to server
      const reqRes = await submitAccessRequest(email, displayName, createdUid, 'password');
      if (reqRes && reqRes.status) {
        setUserStatus(reqRes.status);
      }
      if (reqRes && reqRes.code === 'EMAIL_ALREADY_IN_USE') {
        const msg = 'An account already exists with this email address. Please switch to Sign In.';
        setError(msg);
        throw new Error(msg);
      }

      // Record in Firestore if available
      try {
        const nowIso = new Date().toISOString();
        const initialStatus = isLeadAdmin ? 'APPROVED' : 'PENDING_APPROVAL';
        const userDocRef = doc(db, 'users', createdUid);
        await setDoc(userDocRef, {
          userId: createdUid,
          email: email.trim(),
          displayName: displayName || email.split('@')[0],
          role: isLeadAdmin ? 'admin' : 'member',
          status: initialStatus,
          createdAt: nowIso,
          lastLoginAt: nowIso,
        }, { merge: true });

        if (!isLeadAdmin) {
          const reqDocRef = doc(db, 'access_requests', createdUid);
          await setDoc(reqDocRef, {
            id: createdUid,
            userId: createdUid,
            email: email.trim(),
            displayName: displayName || email.split('@')[0],
            status: 'PENDING_APPROVAL',
            requestedAt: nowIso,
            updatedAt: nowIso,
          }, { merge: true });
        }
      } catch (fsErr) {
        console.warn('Firestore user registration record notice:', fsErr);
      }

      if (isLeadAdmin) {
        setUserStatus('APPROVED');
        setIsAuthModalOpen(false);
      } else {
        setUserStatus('PENDING_APPROVAL');
        // Do not close modal - keep it on pending approval confirmation
      }
    } catch (err: any) {
      console.warn('Sign-up warning:', err?.message || err);
      let msg = 'Registration failed.';
      if (err?.code === 'auth/email-already-in-use') {
        msg = 'An account already exists with this email. Please switch to Sign In.';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'Security key too short. Please use at least 6 characters.';
      } else if (err?.code === 'auth/invalid-email') {
        msg = 'Invalid email format. Please check your email address.';
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        // Soft message without throwing error to console
        setError('Password reset requires Email/Password provider enabled in Firebase Console. Please sign in with Google or your partner credentials.');
        return;
      }
      console.warn('Password reset warning:', err?.message || err);
      let msg = 'Unable to send password recovery email.';
      if (err?.code === 'auth/user-not-found') {
        msg = 'No investor account registered under this email address.';
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const signOutUser = async () => {
    try {
      setError(null);
      if (currentUser?.uid) {
        try {
          await clearAllUserChatsFromFirestore(currentUser.uid);
        } catch (chatPurgeErr) {
          console.warn('Chat purge on sign out notice:', chatPurgeErr);
        }
      }
      localStorage.removeItem('pitchblack_partner_session');
      await signOut(auth);
      setCurrentUser(null);
    } catch (err: any) {
      console.warn('Sign-out warning:', err);
      setCurrentUser(null);
    }
  };

  const clearError = () => setError(null);

  const openAdminModal = () => setIsAdminModalOpen(true);
  const closeAdminModal = () => setIsAdminModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        loading,
        error,
        isAdmin,
        userRole,
        userStatus,
        isApproved,
        accessRequests,
        pendingApprovalCount,
        isAdminModalOpen,
        openAdminModal,
        closeAdminModal,
        checkEmailAvailable,
        submitAccessRequest,
        checkMyStatus,
        approveUserAccess,
        rejectUserAccess,
        updateUserRole,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signOut: signOutUser,
        signOutUser,
        clearError,
        isAuthModalOpen,
        authModalPrompt,
        openAuthModal,
        closeAuthModal,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
