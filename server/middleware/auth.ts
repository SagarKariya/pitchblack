import type { RequestHandler } from "express";
import { admin, getFirestoreUser, isUserAdmin } from "../services/firestore.service.ts";

/**
 * Express authentication middleware verifying Firebase ID token and Firestore Database 'admin' role
 */
export const requireAdminAuth: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized: Missing or invalid Authorization header. Expected Bearer token.",
      });
    }

    const idToken = authHeader.substring(7).trim();
    if (!idToken) {
      return res.status(401).json({
        error: "Unauthorized: Empty bearer token provided.",
      });
    }

    // Verify Firebase ID token using firebase-admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const tokenEmail = (decodedToken.email || "").trim().toLowerCase();
    const tokenUid = (decodedToken.uid || "").trim();

    // Verify caller holds 'admin' role in Cloud Firestore (Database-Driven Roles)
    const isAdminCaller = await isUserAdmin(tokenUid, tokenEmail);
    if (!isAdminCaller) {
      return res.status(403).json({
        error: `Forbidden: Caller (${tokenEmail || tokenUid}) is not authorized with administrator privileges in Firestore.`,
      });
    }

    req.adminUser = decodedToken;
    return next();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn("[AUTH-ADMIN-MIDDLEWARE] ID token verification rejected:", errorMsg);
    return res.status(401).json({
      error: "Unauthorized: Invalid or expired administrator session token.",
    });
  }
};

/**
 * Express authentication middleware verifying Firebase ID token and ensuring user is APPROVED
 */
export const requireApprovedUserAuth: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized: Missing or invalid Authorization header. Expected Bearer token.",
      });
    }

    const idToken = authHeader.substring(7).trim();
    if (!idToken) {
      return res.status(401).json({
        error: "Unauthorized: Empty bearer token provided.",
      });
    }

    // Verify Firebase ID token using firebase-admin
    let decodedToken: import("firebase-admin/auth").DecodedIdToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (tokenErr: unknown) {
      const errorMsg = tokenErr instanceof Error ? tokenErr.message : String(tokenErr);
      console.warn("[AUTH-USER-MIDDLEWARE] ID token verification rejected:", errorMsg);
      return res.status(401).json({
        error: "Unauthorized: Invalid or expired session token. Please sign in again.",
      });
    }

    const tokenEmail = (decodedToken.email || "").trim().toLowerCase();
    const tokenUid = (decodedToken.uid || "").trim();

    // 1. Users with 'admin' role in Firestore are always authorized
    const isAdminCaller = await isUserAdmin(tokenUid, tokenEmail);
    if (isAdminCaller) {
      req.authUser = decodedToken;
      return next();
    }

    // 2. Query user status from Cloud Firestore
    const userRecord = (await getFirestoreUser(tokenEmail)) || (tokenUid ? await getFirestoreUser(tokenUid) : null);

    if (!userRecord || userRecord.status !== "APPROVED") {
      const currentStatus = userRecord?.status || "PENDING_APPROVAL";
      return res.status(403).json({
        error: `Forbidden: Access to AI diligence endpoints requires an approved account. Current status: ${currentStatus}.`,
        status: currentStatus,
      });
    }

    req.authUser = decodedToken;
    req.userRecord = userRecord;
    return next();
  } catch (err: unknown) {
    console.error("[AUTH-USER-MIDDLEWARE] Unexpected auth error:", err);
    return res.status(500).json({
      error: "Authentication service encountered an unexpected error.",
    });
  }
};
