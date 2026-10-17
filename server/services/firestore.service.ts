import path from "path";
import fs from "fs";
import admin from "firebase-admin";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Initialize Firebase Admin for ID token verification
let firestoreDb: Firestore | null = null;
let firestoreHasCloudIamAuth = true;

try {
  let projectId = process.env.FIREBASE_PROJECT_ID;
  let databaseId: string | undefined = undefined;
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      projectId = projectId || parsed.projectId;
      databaseId = parsed.firestoreDatabaseId;
    } catch {
      // quiet ignore
    }
  }
  if (!admin.apps.length) {
    admin.initializeApp(projectId ? { projectId } : {});
    console.log(`[FIREBASE-ADMIN] Initialized Admin SDK with projectId: ${projectId || 'default'}`);
  }
  try {
    firestoreDb = databaseId ? getFirestore(databaseId) : getFirestore();
  } catch {
    firestoreDb = null;
  }
} catch (e) {
  console.warn("[FIREBASE-ADMIN] Initialization notice:", e);
}

export { admin, firestoreDb };

export interface AccessRequestRecord {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  role?: 'admin' | 'member';
  authProvider?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  updatedAt: string;
  decisionBy?: string;
}

// Fallback bootstrap admin email for zero-configuration initial bootstrap
export const DEFAULT_BOOTSTRAP_ADMIN = (
  process.env.ADMIN_EMAIL ||
  process.env.VITE_ADMIN_EMAIL ||
  'sbkariya99@gmail.com'
).trim().toLowerCase();

export const LEAD_ADMIN_EMAIL = DEFAULT_BOOTSTRAP_ADMIN;

// Local persistent JSON storage fallback for server process state
const STORE_PATH = path.join(process.cwd(), "server", "users_store.json");

function loadLocalStore(): Record<string, AccessRequestRecord> {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[AUTH-STORE] Notice reading local store:", err);
  }

  // Initial bootstrap state
  const initialMap: Record<string, AccessRequestRecord> = {
    [DEFAULT_BOOTSTRAP_ADMIN]: {
      id: "admin-lead-account",
      userId: "admin-lead-account",
      email: DEFAULT_BOOTSTRAP_ADMIN,
      displayName: "Lead Administrator",
      role: "admin",
      status: "APPROVED",
      requestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      decisionBy: "SYSTEM",
    },
  };
  saveLocalStore(initialMap);
  return initialMap;
}

function saveLocalStore(store: Record<string, AccessRequestRecord>): void {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.warn("[AUTH-STORE] Notice saving local store:", err);
  }
}

/**
 * Check whether a specific user UID or email address has 'admin' role.
 * Evaluates in-memory / local persistent store first, then cloud if authorized.
 */
export async function isUserAdmin(userId?: string, email?: string): Promise<boolean> {
  const normEmail = (email || '').trim().toLowerCase();
  const cleanUid = (userId || '').trim();

  // 1. Direct bootstrap super-administrator verification
  if (
    normEmail &&
    (normEmail === DEFAULT_BOOTSTRAP_ADMIN ||
      normEmail === 'sbkariya99@gmail.com' ||
      normEmail === 'admin@pitchblack.vc')
  ) {
    return true;
  }

  // 2. Local persistent store check (instant & immune to cloud IAM gaps)
  const store = loadLocalStore();
  if (normEmail && store[normEmail]?.role === 'admin') {
    return true;
  }
  if (cleanUid) {
    for (const record of Object.values(store)) {
      if ((record.userId === cleanUid || record.id === cleanUid) && record.role === 'admin') {
        return true;
      }
    }
  }

  // 3. Optional Cloud Firestore check if Cloud IAM credentials exist
  if (firestoreDb && firestoreHasCloudIamAuth) {
    try {
      if (cleanUid) {
        const userDoc = await firestoreDb.collection('users').doc(cleanUid).get();
        if (userDoc.exists && userDoc.data()?.role === 'admin') {
          return true;
        }
      }
      if (normEmail && normEmail.includes('@')) {
        const q = await firestoreDb.collection('users').where('email', '==', normEmail).limit(1).get();
        if (!q.empty && q.docs[0].data()?.role === 'admin') {
          return true;
        }
      }
    } catch (e: any) {
      // If Cloud IAM is unprovisioned, mark flag false so we do not spam attempts
      if (e?.code === 7 || (e?.message && e.message.includes('Missing or insufficient permissions'))) {
        firestoreHasCloudIamAuth = false;
      }
    }
  }

  return false;
}

/**
 * Retrieve all registered administrator email addresses
 */
export async function getAllFirestoreAdmins(): Promise<string[]> {
  const adminEmails = new Set<string>();
  if (DEFAULT_BOOTSTRAP_ADMIN) adminEmails.add(DEFAULT_BOOTSTRAP_ADMIN);
  adminEmails.add('sbkariya99@gmail.com');

  const store = loadLocalStore();
  for (const record of Object.values(store)) {
    if (record.role === 'admin' && record.email) {
      adminEmails.add(record.email.toLowerCase().trim());
    }
  }

  return Array.from(adminEmails);
}

/**
 * Retrieve access request or user record (from local store with cloud sync)
 */
export async function getFirestoreUser(identifier: string): Promise<AccessRequestRecord | null> {
  if (!identifier) return null;
  const norm = identifier.toLowerCase().trim();

  // 1. Direct bootstrap superadmin
  if (norm === DEFAULT_BOOTSTRAP_ADMIN || norm === 'sbkariya99@gmail.com') {
    return {
      id: 'admin-lead-account',
      userId: 'admin-lead-account',
      email: norm,
      displayName: 'Lead Administrator',
      role: 'admin',
      status: 'APPROVED',
      requestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      decisionBy: 'SYSTEM',
    };
  }

  // 2. Check local store
  const store = loadLocalStore();
  if (store[norm]) {
    return store[norm];
  }
  for (const rec of Object.values(store)) {
    if (rec.userId === norm || rec.id === norm || rec.email === norm) {
      return rec;
    }
  }

  // 3. Optional Firestore query
  if (firestoreDb && firestoreHasCloudIamAuth) {
    try {
      const docRef = firestoreDb.collection('access_requests').doc(identifier);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const d = docSnap.data() as any;
        return {
          id: docSnap.id,
          userId: d.userId || docSnap.id,
          email: (d.email || '').toLowerCase().trim(),
          displayName: d.displayName || '',
          role: d.role || (norm === DEFAULT_BOOTSTRAP_ADMIN ? 'admin' : 'member'),
          authProvider: d.authProvider,
          status: d.status || 'PENDING_APPROVAL',
          requestedAt: d.requestedAt || new Date().toISOString(),
          updatedAt: d.updatedAt || new Date().toISOString(),
          decisionBy: d.decisionBy,
        };
      }
    } catch (e: any) {
      if (e?.code === 7 || (e?.message && e.message.includes('Missing or insufficient permissions'))) {
        firestoreHasCloudIamAuth = false;
      }
    }
  }

  return null;
}

/**
 * Persist access request and user record
 */
export async function saveFirestoreUserRequest(record: AccessRequestRecord): Promise<void> {
  const normEmail = record.email.toLowerCase().trim();
  const docId = record.userId || record.id;

  // Determine role
  let finalRole: 'admin' | 'member' = record.role || 'member';
  if (normEmail === DEFAULT_BOOTSTRAP_ADMIN || normEmail === 'sbkariya99@gmail.com') {
    finalRole = 'admin';
  }

  const updatedRecord: AccessRequestRecord = {
    ...record,
    email: normEmail,
    role: finalRole,
    userId: docId,
    id: docId,
  };

  // 1. Save to local store immediately
  const store = loadLocalStore();
  store[normEmail] = updatedRecord;
  if (docId) {
    store[docId] = updatedRecord;
  }
  saveLocalStore(store);

  console.log(
    `[AUTH-STORE] Persisted access record for ${normEmail} (Role: ${finalRole}, Status: ${record.status})`
  );

  // 2. Attempt Cloud Firestore background sync if authorized
  if (firestoreDb && firestoreHasCloudIamAuth) {
    try {
      await firestoreDb.collection('access_requests').doc(docId).set(
        {
          id: docId,
          userId: docId,
          email: normEmail,
          displayName: record.displayName || '',
          role: finalRole,
          status: record.status,
          authProvider: record.authProvider || 'email',
          requestedAt: record.requestedAt,
          updatedAt: record.updatedAt,
          ...(record.decisionBy ? { decisionBy: record.decisionBy } : {}),
        },
        { merge: true }
      );
      await firestoreDb.collection('users').doc(docId).set(
        {
          userId: docId,
          email: normEmail,
          displayName: record.displayName || '',
          status: record.status,
          role: finalRole,
          ...(record.authProvider ? { authProvider: record.authProvider } : {}),
          ...(record.status === 'APPROVED'
            ? { approvedAt: record.updatedAt, approvedBy: record.decisionBy || 'admin' }
            : {}),
        },
        { merge: true }
      );
    } catch (err: any) {
      if (err?.code === 7 || (err?.message && err.message.includes('Missing or insufficient permissions'))) {
        firestoreHasCloudIamAuth = false;
      }
    }
  }
}

/**
 * Update user role (admin promotion / demotion)
 */
export async function updateUserRoleInFirestore(
  identifier: string,
  newRole: 'admin' | 'member',
  adminActor: string
): Promise<{ success: boolean; targetEmail?: string }> {
  const norm = identifier.trim().toLowerCase();
  const nowIso = new Date().toISOString();
  const store = loadLocalStore();

  let targetRecord: AccessRequestRecord | null = null;
  if (store[norm]) {
    targetRecord = store[norm];
  } else {
    for (const rec of Object.values(store)) {
      if (rec.userId === norm || rec.id === norm || rec.email === norm) {
        targetRecord = rec;
        break;
      }
    }
  }

  if (targetRecord) {
    targetRecord.role = newRole;
    targetRecord.updatedAt = nowIso;
    targetRecord.decisionBy = adminActor;
    store[targetRecord.email] = targetRecord;
    store[targetRecord.userId] = targetRecord;
    saveLocalStore(store);
  }

  console.log(`[AUTH-STORE] Updated role of ${norm} to "${newRole}" by ${adminActor}`);

  // Optional Cloud sync
  if (firestoreDb && firestoreHasCloudIamAuth && targetRecord) {
    try {
      await firestoreDb.collection('users').doc(targetRecord.userId).set(
        { role: newRole, updatedAt: nowIso, roleAssignedBy: adminActor },
        { merge: true }
      );
    } catch (e: any) {
      if (e?.code === 7 || (e?.message && e.message.includes('Missing or insufficient permissions'))) {
        firestoreHasCloudIamAuth = false;
      }
    }
  }

  return { success: true, targetEmail: targetRecord?.email || norm };
}

/**
 * Query all access requests
 */
export async function getAllFirestoreAccessRequests(): Promise<AccessRequestRecord[]> {
  const store = loadLocalStore();
  const uniqueMap = new Map<string, AccessRequestRecord>();

  for (const record of Object.values(store)) {
    if (record.email) {
      uniqueMap.set(record.email.toLowerCase().trim(), record);
    }
  }

  // Ensure default bootstrap admin is present
  if (!uniqueMap.has(DEFAULT_BOOTSTRAP_ADMIN)) {
    uniqueMap.set(DEFAULT_BOOTSTRAP_ADMIN, {
      id: 'admin-lead-account',
      userId: 'admin-lead-account',
      email: DEFAULT_BOOTSTRAP_ADMIN,
      displayName: 'Lead Administrator',
      role: 'admin',
      status: 'APPROVED',
      requestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      decisionBy: 'SYSTEM',
    });
  }

  return Array.from(uniqueMap.values()).sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
}

/**
 * Check if an email has an existing account/record
 */
export async function isEmailRegistered(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) return false;
  if (normalized === DEFAULT_BOOTSTRAP_ADMIN || normalized === 'sbkariya99@gmail.com') return true;
  const store = loadLocalStore();
  return Boolean(store[normalized]);
}

// Initialize and ensure Lead Administrator record exists in local store
const initialAdminRecord: AccessRequestRecord = {
  id: 'admin-lead-account',
  userId: 'admin-lead-account',
  email: DEFAULT_BOOTSTRAP_ADMIN,
  displayName: 'Lead Administrator',
  role: 'admin',
  status: 'APPROVED',
  requestedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  decisionBy: 'SYSTEM',
};
saveFirestoreUserRequest(initialAdminRecord).catch(() => {});
