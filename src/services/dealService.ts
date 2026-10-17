import { auth, db } from '../utils/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { PersistentDeal, FullDiligenceReport } from '../types';
import { PRESET_DEALS } from '../data/presets';

const STORAGE_KEY_PREFIX = 'pitchblack_deals_';

function getLocalDeals(userId: string): PersistentDeal[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalDeals(userId: string, deals: PersistentDeal[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(deals));
  } catch (e) {
    console.warn('[dealService] Local storage save notice:', e);
  }
}

export function createPresetDeals(userId: string = 'guest'): PersistentDeal[] {
  const now = new Date().toISOString();
  const cleanUserId = userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'user';
  return PRESET_DEALS.map((preset) => {
    const dealId = `deal_${preset.id.replace(/[^a-zA-Z0-9]/g, '_')}_${cleanUserId}`;
    return {
      id: dealId,
      ownerId: userId,
      companyName: preset.companyName,
      tagline: preset.tagline,
      sector: preset.sector,
      stage: preset.stage,
      targetRaise: preset.targetRaise,
      valuationClaim: preset.valuationClaim,
      deckSummary: preset.deckSummary,
      rawPitchText: preset.rawPitchText,
      signal: preset.report.signal.signal,
      convictionScore: Math.round(preset.report.signal.convictionScore),
      verdictSummary: preset.report.signal.verdictSummary,
      report: preset.report,
      reportJson: JSON.stringify(preset.report),
      isPreset: true,
      createdAt: now,
      updatedAt: now,
    };
  });
}

/**
 * Transforms a Firestore document into a typed PersistentDeal.
 */
function parseDealDoc(docSnap: any): PersistentDeal | null {
  const data = docSnap.data();
  if (!data || !data.id || !data.companyName) return null;

  let report: FullDiligenceReport;
  try {
    report = typeof data.reportJson === 'string' ? JSON.parse(data.reportJson) : data.report;
  } catch (e) {
    console.error('Failed to parse deal reportJson:', e);
    return null;
  }

  return {
    id: data.id,
    ownerId: data.ownerId,
    companyName: data.companyName,
    tagline: data.tagline || `${data.stage} • ${data.sector} Deal`,
    sector: data.sector || 'GENERAL_SAAS',
    stage: data.stage || 'Series A',
    targetRaise: data.targetRaise || report.targetRaise || '$5.0M',
    valuationClaim: data.valuationClaim || report.valuationClaim || '$25.0M',
    deckSummary: data.deckSummary || report.signal?.verdictSummary || '',
    rawPitchText: data.rawPitchText || '',
    signal: data.signal || report.signal?.signal || 'CONDITIONAL',
    convictionScore: typeof data.convictionScore === 'number' ? data.convictionScore : (report.signal?.convictionScore || 70),
    verdictSummary: data.verdictSummary || report.signal?.verdictSummary || '',
    report,
    isPreset: Boolean(data.isPreset),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

/**
 * Seeds the 4 foundational initial institutional deals directly into Firebase Firestore for the user.
 * This runs only once per user when their deals collection is empty.
 */
export async function seedInitialDealsForUser(userId: string): Promise<PersistentDeal[]> {
  const dealsRef = collection(db, 'deals');
  const seededDeals: PersistentDeal[] = [];
  const now = new Date().toISOString();
  const cleanUserId = userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'user';

  for (const preset of PRESET_DEALS) {
    const dealId = `deal_${preset.id.replace(/[^a-zA-Z0-9]/g, '_')}_${cleanUserId}`;

    const docPayload = {
      id: dealId,
      ownerId: userId,
      companyName: preset.companyName,
      tagline: preset.tagline,
      sector: preset.sector,
      stage: preset.stage,
      targetRaise: preset.targetRaise,
      valuationClaim: preset.valuationClaim,
      deckSummary: preset.deckSummary,
      rawPitchText: preset.rawPitchText,
      signal: preset.report.signal.signal,
      convictionScore: Math.round(preset.report.signal.convictionScore),
      verdictSummary: preset.report.signal.verdictSummary,
      reportJson: JSON.stringify(preset.report),
      isPreset: true,
      createdAt: now,
      updatedAt: now,
    };

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const docRef = doc(dealsRef, dealId);
        await setDoc(docRef, docPayload);
      } catch (e) {
        console.warn(`[Firestore] Could not write seed deal ${dealId} to Firestore:`, e);
      }
    }

    seededDeals.push({
      ...docPayload,
      report: preset.report,
    });
  }

  saveLocalDeals(userId, seededDeals);
  return seededDeals;
}

/**
 * Retrieves all deals owned by the current user from Firebase Firestore.
 * Automatically seeds the 4 deals into Firestore if this user doesn't have any deals yet.
 */
export async function getUserDealsFromFirestore(userId: string): Promise<PersistentDeal[]> {
  if (!userId) return [];

  const localDeals = getLocalDeals(userId);
  const isFirebaseAuthUser = Boolean(auth.currentUser && auth.currentUser.uid === userId);

  // If user is not authenticated with Firebase Auth (e.g. partner session or offline)
  if (!isFirebaseAuthUser) {
    if (localDeals.length > 0) {
      return localDeals;
    }
    const seeded = createPresetDeals(userId);
    saveLocalDeals(userId, seeded);
    return seeded;
  }

  try {
    const dealsRef = collection(db, 'deals');
    const q = query(dealsRef, where('ownerId', '==', userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(`[Firestore] No deals found for user ${userId}. Seeding initial deals directly into Firestore...`);
      const seeded = await seedInitialDealsForUser(userId);
      saveLocalDeals(userId, seeded);
      return seeded;
    }

    const deals: PersistentDeal[] = [];
    snapshot.forEach((docSnap) => {
      const deal = parseDealDoc(docSnap);
      if (deal) deals.push(deal);
    });

    // Ensure the 4 foundational Seed Portfolio Pitches are always present
    const presetDeals = createPresetDeals(userId);
    const existingCompanyNames = new Set(deals.map((d) => d.companyName.toLowerCase().trim()));
    for (const preset of presetDeals) {
      if (!existingCompanyNames.has(preset.companyName.toLowerCase().trim())) {
        deals.push(preset);
      }
    }

    deals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    saveLocalDeals(userId, deals);
    return deals;
  } catch (err: any) {
    console.warn('[Firestore] Notice retrieving user deals from Firestore, using persistent cache:', err?.message || err);
    if (localDeals.length > 0) {
      return localDeals;
    }
    const fallback = createPresetDeals(userId);
    saveLocalDeals(userId, fallback);
    return fallback;
  }
}

/**
 * Automatically persists an ingested/uploaded pitch audit directly into Firebase Firestore.
 */
export async function autoSaveUploadedDealToFirestore(
  userId: string,
  report: FullDiligenceReport,
  rawPitchText?: string
): Promise<PersistentDeal> {
  const timestamp = Date.now();
  const cleanCompanyName = (report.companyName || 'deal').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20) || 'deal';
  const dealId = `deal_${cleanCompanyName}_${timestamp}`;
  const now = new Date().toISOString();

  const docPayload = {
    id: dealId,
    ownerId: userId,
    companyName: (report.companyName || 'Target Startup').slice(0, 140),
    tagline: `${report.stage || 'Series A'} • ${(report.sector || 'GENERAL_SAAS').replace(/_/g, ' ')} Audited Pitch Deck`,
    sector: report.sector || 'GENERAL_SAAS',
    stage: report.stage || 'Series A',
    targetRaise: report.targetRaise || '$5.0M',
    valuationClaim: report.valuationClaim || '$25.0M',
    deckSummary: (report.signal?.verdictSummary || report.signal?.partnerDirective || '').slice(0, 2500),
    rawPitchText: (rawPitchText || '').slice(0, 45000),
    signal: report.signal?.signal || 'CONDITIONAL',
    convictionScore: Math.round(report.signal?.convictionScore || 70),
    verdictSummary: (report.signal?.verdictSummary || '').slice(0, 2500),
    reportJson: JSON.stringify(report),
    isPreset: false,
    createdAt: now,
    updatedAt: now,
  };

  const newDeal: PersistentDeal = {
    ...docPayload,
    report,
  };

  // Immediate local cache update
  const existingLocal = getLocalDeals(userId);
  const updatedLocal = [newDeal, ...existingLocal.filter((d) => d.id !== dealId)];
  saveLocalDeals(userId, updatedLocal);

  // Sync to Firebase Firestore if authenticated
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const dealsRef = collection(db, 'deals');
      const docRef = doc(dealsRef, dealId);
      await setDoc(docRef, docPayload);
      console.log(`[Firestore] Successfully persisted deal ${dealId} to Firestore.`);
    } catch (e) {
      console.warn(`[Firestore] Could not persist deal to Firestore:`, e);
    }
  }

  return newDeal;
}

/**
 * Deletes a deal from Firebase Firestore and local persistence.
 */
export async function deleteDealFromFirestore(dealId: string, userId: string): Promise<void> {
  // Remove from local cache
  const existingLocal = getLocalDeals(userId);
  const updatedLocal = existingLocal.filter((d) => d.id !== dealId);
  saveLocalDeals(userId, updatedLocal);

  // Remove from Firestore if authenticated
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const dealDocRef = doc(db, 'deals', dealId);
      await deleteDoc(dealDocRef);
      console.log(`[Firestore] Successfully deleted deal ${dealId} from Firestore.`);
    } catch (e) {
      console.warn(`[Firestore] Could not delete deal from Firestore:`, e);
    }
  }
}
