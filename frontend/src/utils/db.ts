import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Query } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const apps = getApps();

if (!apps.length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const db = getFirestore();

export const dbUtils = {
  async query(
    collection: string,
    filters: { field: string; operator: string; value: any }[],
    order?: { field: string; direction: 'asc' | 'desc' },
    limitCount?: number
  ) {
    let query: Query = db.collection(collection);
    
    filters.forEach(filter => {
      query = query.where(filter.field, filter.operator as any, filter.value);
    });
    
    if (order) {
      query = query.orderBy(order.field, order.direction);
    }
    
    if (limitCount) {
      query = query.limit(limitCount);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}; 