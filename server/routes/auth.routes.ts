import { Router } from "express";
import {
  DEFAULT_BOOTSTRAP_ADMIN,
  isUserAdmin,
  getFirestoreUser,
  saveFirestoreUserRequest,
  updateUserRoleInFirestore,
  getAllFirestoreAccessRequests,
  isEmailRegistered,
  type AccessRequestRecord,
} from "../services/firestore.service.ts";
import { sendAdminNotificationEmail, sendUserApprovalEmail } from "../services/email.service.ts";
import { requireAdminAuth } from "../middleware/auth.ts";
import { authEmailLimiter } from "../middleware/rateLimiters.ts";

const router = Router();

// Check if email already has an account / registered (Rate limited)
router.get("/check-email", authEmailLimiter, async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: "Please provide a valid email address.", exists: false });
    }

    const isRegistered = await isEmailRegistered(email);

    if (isRegistered) {
      return res.json({
        exists: true,
        message: "An account already exists with this email address. Please switch to Sign In.",
      });
    }

    return res.json({ exists: false });
  } catch (e: any) {
    console.error("[AUTH-CHECK-EMAIL] Error:", e);
    return res.status(500).json({ error: "Failed to check email availability." });
  }
});

router.post("/check-email", authEmailLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: "Please provide a valid email address.", exists: false });
    }

    const isRegistered = await isEmailRegistered(email);

    if (isRegistered) {
      return res.json({
        exists: true,
        message: "An account already exists with this email address. Please switch to Sign In.",
      });
    }

    return res.json({ exists: false });
  } catch (e: any) {
    console.error("[AUTH-CHECK-EMAIL] Error:", e);
    return res.status(500).json({ error: "Failed to check email availability." });
  }
});

// Access Request submission endpoint (handles Email Registration and Google OAuth, triggers SMTP notification)
router.post("/request-access", authEmailLimiter, async (req, res) => {
  try {
    const { userId, email, displayName, authProvider = 'email' } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: "A valid email address is required." });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = (displayName && displayName.trim()) || normalizedEmail.split('@')[0];

    // Query existing record from Cloud Firestore
    const existing = (await getFirestoreUser(normalizedEmail)) || (userId ? await getFirestoreUser(userId) : null);
    const isAdminUser = await isUserAdmin(userId, normalizedEmail);

    // 1. Database-driven Admin: automatically grant approved status and admin role
    if (isAdminUser) {
      const adminRec: AccessRequestRecord = {
        id: userId || existing?.id || 'admin-account',
        userId: userId || existing?.userId || 'admin-account',
        email: normalizedEmail,
        displayName: cleanName || 'Administrator',
        role: 'admin',
        authProvider,
        status: 'APPROVED',
        requestedAt: existing?.requestedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        decisionBy: 'SYSTEM',
      };
      await saveFirestoreUserRequest(adminRec);
      return res.json({
        success: true,
        status: 'APPROVED',
        role: 'admin',
        request: adminRec,
        message: "Administrator access active.",
      });
    }

    // 2. If user already has an APPROVED status in Cloud Firestore, retain approval
    if (existing && existing.status === 'APPROVED') {
      return res.json({
        success: true,
        status: 'APPROVED',
        role: existing.role || 'member',
        request: existing,
        message: "Account is already approved.",
      });
    }

    const id = userId || existing?.id || `user-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const isInitialRequest = !existing || existing.status !== 'PENDING_APPROVAL';

    const record: AccessRequestRecord = {
      id,
      userId: id,
      email: normalizedEmail,
      displayName: cleanName,
      role: existing?.role || 'member',
      authProvider,
      status: existing?.status || 'PENDING_APPROVAL',
      requestedAt: existing?.requestedAt || nowIso,
      updatedAt: nowIso,
      decisionBy: existing?.decisionBy,
    };

    // Persist directly to Cloud Firestore
    await saveFirestoreUserRequest(record);

    console.log(
      `[AUTH-ACCESS-REQUEST] Access request registered for ${normalizedEmail} in Cloud Firestore (Role: ${record.role}, Status: ${record.status}). Admins notified.`
    );

    // Send immediate email notification to all database administrators
    if (isInitialRequest) {
      sendAdminNotificationEmail({
        displayName: cleanName,
        email: normalizedEmail,
        authProvider,
        requestedAt: record.requestedAt,
        id,
      }).catch((err) => console.warn('[AUTH-ACCESS-REQUEST] Admin notification error:', err));
    }

    return res.json({
      success: true,
      status: record.status,
      role: record.role || 'member',
      request: {
        id: record.id,
        userId: record.userId,
        email: record.email,
        displayName: record.displayName,
        status: record.status,
      },
      message: `Access request submitted. Your request has been queued for review.`,
    });
  } catch (e: any) {
    console.error("[AUTH-ACCESS-REQUEST] Error:", e);
    return res.status(500).json({ error: "Failed to record access request." });
  }
});

// Get all access requests directly from Cloud Firestore (Protected: Admin review only)
router.get("/access-requests", requireAdminAuth, async (req, res) => {
  try {
    const list = await getAllFirestoreAccessRequests();
    return res.json({ success: true, requests: list });
  } catch (e: any) {
    console.error("[AUTH-ACCESS-REQUESTS] Fetch error:", e);
    return res.status(500).json({ error: "Failed to retrieve access requests." });
  }
});

// Admin Approve User endpoint in Cloud Firestore (Protected: Administrator only)
router.post("/approve-user", requireAdminAuth, async (req, res) => {
  try {
    const { userId, email, role } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();
    const nowIso = new Date().toISOString();
    const adminEmail = req.adminUser?.email || DEFAULT_BOOTSTRAP_ADMIN;

    let targetRecord = await getFirestoreUser(userId || normalizedEmail);
    if (!targetRecord && normalizedEmail) {
      targetRecord = {
        id: userId || `user-${Date.now()}`,
        userId: userId || `user-${Date.now()}`,
        email: normalizedEmail,
        displayName: normalizedEmail.split('@')[0],
        role: role === 'admin' ? 'admin' : 'member',
        status: 'APPROVED',
        requestedAt: nowIso,
        updatedAt: nowIso,
        decisionBy: adminEmail,
      };
    }

    if (targetRecord) {
      targetRecord.status = 'APPROVED';
      if (role === 'admin' || role === 'member') {
        targetRecord.role = role;
      }
      targetRecord.updatedAt = nowIso;
      targetRecord.decisionBy = adminEmail;
      await saveFirestoreUserRequest(targetRecord);

      // Dispatch approval confirmation email to applicant
      sendUserApprovalEmail(targetRecord.email, targetRecord.displayName).catch((err) =>
        console.warn('[AUTH-APPROVE] User notification error:', err)
      );
    }

    console.log(`[AUTH-APPROVE] User approved by admin (${adminEmail}) in Cloud Firestore: ${normalizedEmail || userId} (Role: ${targetRecord?.role || 'member'})`);
    return res.json({
      success: true,
      message: `Access approved for ${normalizedEmail || userId}.`,
      role: targetRecord?.role || 'member',
    });
  } catch (e: unknown) {
    console.error("[AUTH-APPROVE] Error:", e);
    return res.status(500).json({ error: "Failed to approve user." });
  }
});

// Admin Reject User endpoint in Cloud Firestore (Protected: Administrator only)
router.post("/reject-user", requireAdminAuth, async (req, res) => {
  try {
    const { userId, email } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();
    const nowIso = new Date().toISOString();
    const adminEmail = req.adminUser?.email || DEFAULT_BOOTSTRAP_ADMIN;

    let targetRecord = await getFirestoreUser(userId || normalizedEmail);
    if (targetRecord) {
      targetRecord.status = 'REJECTED';
      targetRecord.updatedAt = nowIso;
      targetRecord.decisionBy = adminEmail;
      await saveFirestoreUserRequest(targetRecord);
    }

    console.log(`[AUTH-REJECT] User access rejected by admin (${adminEmail}) in Cloud Firestore: ${normalizedEmail || userId}`);
    return res.json({ success: true, message: `Access rejected for ${normalizedEmail || userId}.` });
  } catch (e: any) {
    console.error("[AUTH-REJECT] Error:", e);
    return res.status(500).json({ error: "Failed to reject user." });
  }
});

// Admin Set User Role endpoint (Protected: Administrator only)
router.post("/set-role", requireAdminAuth, async (req, res) => {
  try {
    const { userId, email, role } = req.body;
    if (!role || (role !== 'admin' && role !== 'member')) {
      return res.status(400).json({ error: "Invalid role specified. Must be 'admin' or 'member'." });
    }

    const adminActor = req.adminUser?.email || 'admin';
    const target = userId || email;
    if (!target) {
      return res.status(400).json({ error: "User ID or email is required." });
    }

    const result = await updateUserRoleInFirestore(target, role, adminActor);
    return res.json({
      success: true,
      role,
      message: `User role updated to "${role}" for ${result.targetEmail || target}.`,
    });
  } catch (e: any) {
    console.error("[AUTH-SET-ROLE] Error:", e);
    return res.status(500).json({ error: e?.message || "Failed to update user role." });
  }
});

// Get User Status directly from Cloud Firestore
router.get("/user-status", async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    const userId = String(req.query.userId || '').trim();

    const isAdminCaller = await isUserAdmin(userId, email);
    if (isAdminCaller) {
      return res.json({ status: 'APPROVED', role: 'admin' });
    }

    const record = await getFirestoreUser(userId || email);
    if (record) {
      return res.json({
        status: record.status,
        role: record.role || 'member',
        requestedAt: record.requestedAt,
        updatedAt: record.updatedAt,
      });
    }

    return res.json({ status: 'PENDING_APPROVAL', role: 'member' });
  } catch (e: any) {
    console.error("[AUTH-STATUS] Error:", e);
    return res.status(500).json({ error: "Failed to check status." });
  }
});

export const authRouter = router;
