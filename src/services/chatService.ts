import { db, handleFirestoreError, OperationType } from '../utils/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatThreadRecord {
  id: string;
  userId: string;
  dealId: string;
  companyName: string;
  messagesJson: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generates a valid Firestore document ID conforming to regex ^[a-zA-Z0-9_-]+$
 */
export function getChatDocId(userId: string, dealId: string = 'general'): string {
  const cleanUid = userId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 48);
  const cleanDealId = dealId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 48);
  return `chat_${cleanUid}_${cleanDealId}`;
}

/**
 * Loads persistent chat history for an authenticated user and specific deal.
 */
export async function loadChatThreadFromFirestore(
  userId: string,
  dealId: string
): Promise<ChatMessage[] | null> {
  if (!userId || userId === 'guest') return null;

  const chatId = getChatDocId(userId, dealId);
  const path = `chats/${chatId}`;

  try {
    const docRef = doc(db, 'chats', chatId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (typeof data.messagesJson === 'string') {
        const parsed = JSON.parse(data.messagesJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as ChatMessage[];
        }
      }
    }
    return null;
  } catch (err: unknown) {
    console.warn(`[chatService] Could not load chat thread ${path}:`, err);
    // Don't crash UI if offline or network glitch, but log via standardized helper
    return null;
  }
}

/**
 * Saves or updates persistent chat history for an authenticated user and deal.
 */
export async function saveChatThreadToFirestore(
  userId: string,
  dealId: string,
  companyName: string,
  messages: ChatMessage[]
): Promise<void> {
  if (!userId || userId === 'guest') return;

  const chatId = getChatDocId(userId, dealId);
  const path = `chats/${chatId}`;
  const nowIso = new Date().toISOString();

  try {
    const docRef = doc(db, 'chats', chatId);
    
    // Check if doc exists to maintain immutable createdAt
    let createdAt = nowIso;
    try {
      const existing = await getDoc(docRef);
      if (existing.exists() && existing.data()?.createdAt) {
        createdAt = existing.data().createdAt;
      }
    } catch {
      // proceed with nowIso
    }

    const payload: ChatThreadRecord = {
      id: chatId,
      userId,
      dealId: dealId.slice(0, 80),
      companyName: companyName.slice(0, 120),
      messagesJson: JSON.stringify(messages),
      createdAt,
      updatedAt: nowIso,
    };

    await setDoc(docRef, payload);
  } catch (err: unknown) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Clears/deletes a single chat thread from Firestore (e.g. when user clicks "Clear").
 */
export async function deleteChatThreadFromFirestore(
  userId: string,
  dealId: string
): Promise<void> {
  if (!userId || userId === 'guest') return;

  const chatId = getChatDocId(userId, dealId);
  const path = `chats/${chatId}`;

  try {
    const docRef = doc(db, 'chats', chatId);
    await deleteDoc(docRef);
  } catch (err: unknown) {
    console.warn(`[chatService] Failed to delete thread ${path}:`, err);
  }
}

/**
 * Purges all persistent chat threads for a user from Firestore upon sign-out.
 * "Once logout chat goes away."
 */
export async function clearAllUserChatsFromFirestore(userId: string): Promise<void> {
  if (!userId || userId === 'guest') return;

  try {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map((docItem) => deleteDoc(docItem.ref));
    await Promise.all(deletePromises);
  } catch (err: unknown) {
    console.warn('[chatService] Sign-out purge notice:', err);
  }
}
