import "express";

declare global {
  namespace Express {
    interface Request {
      authUser?: import("firebase-admin/auth").DecodedIdToken;
      adminUser?: import("firebase-admin/auth").DecodedIdToken;
      userRecord?: import("../server/services/firestore.service.ts").AccessRequestRecord;
    }
  }
}

export {};
