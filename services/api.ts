import { 
    collection, 
    getDocs, 
    query, 
    where, 
    limit, 
    startAfter, 
    orderBy, 
    addDoc, 
    serverTimestamp, 
    doc, 
    getDoc, 
    setDoc,
    getDocFromServer,
    Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { businesses as mockBusinesses, mockUser } from '../constants';
import type { Business, Post, User, BusinessPostcard } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

export const api = {
    async getBusinesses(params: { category?: string; city?: string; page?: number; limit?: number } = {}) {
        const path = 'businesses';
        try {
            let q = query(collection(db, path), orderBy('name'));
            
            if (params.category && params.category !== 'all') {
                q = query(q, where('category', '==', params.category));
            }
            
            if (params.city) {
                // Firestore doesn't support ilike, so we'll do a simple range query for prefix matching if possible,
                // or just fetch and filter client-side for this demo if it's complex.
                // For now, let's try a simple equality if it matches exactly, or fetch all and filter.
                // In a real app, we'd use Algolia or similar for full-text search.
            }

            const pageSize = params.limit || 50;
            q = query(q, limit(pageSize));

            // Note: Real pagination with startAfter requires the last document snapshot.
            // For this simple refactor, we'll just fetch the first page or all.
            
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
            
            if (data.length === 0) {
                // Fallback to mock data if Firestore is empty
                return {
                    data: mockBusinesses.slice(0, pageSize),
                    total: mockBusinesses.length
                };
            }

            return {
                data,
                total: data.length // In a real app, you'd need a separate count or use a metadata doc
            };
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
            return { data: [], total: 0 };
        }
    },

    async getPosts() {
        const path = 'posts';
        try {
            const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(20));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data,
                    createdAt: (data.createdAt as Timestamp).toDate()
                } as Post;
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
            return [];
        }
    },

    async createPost(postData: Partial<Post>) {
        const path = 'posts';
        try {
            const docRef = await addDoc(collection(db, path), {
                ...postData,
                createdAt: serverTimestamp(),
                likes: 0
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
            return { success: false };
        }
    },

    async login(email: string, role: 'user' | 'owner') {
        // This is a simplified login for the directory. 
        // In a real app, we'd use Firebase Auth and then fetch/create the user doc.
        if (!auth.currentUser) return null;
        
        const path = `users/${auth.currentUser.uid}`;
        try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            
            // Check if this is the admin email
            const isAdminEmail = auth.currentUser.email === 'safari.bosafar@gmail.com';
            
            if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                if (isAdminEmail) {
                    return { ...userData, role: 'admin' as any };
                }
                return userData;
            } else {
                const newUser: User = {
                    id: auth.currentUser.uid,
                    name: auth.currentUser.displayName || email.split('@')[0],
                    email: auth.currentUser.email || email,
                    avatar: auth.currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser.uid}`,
                    role: isAdminEmail ? 'admin' as any : role,
                    businessId: role === 'owner' ? `b_${auth.currentUser.uid}` : undefined
                };
                await setDoc(doc(db, 'users', auth.currentUser.uid), newUser);
                return newUser;
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
            return null;
        }
    },

    async upsertPostcard(postcard: BusinessPostcard) {
        const path = 'business_postcards';
        try {
            const docId = `${postcard.title}_${postcard.city}`.replace(/\s+/g, '_').toLowerCase();
            const docRef = doc(db, path, docId);
            
            await setDoc(docRef, {
                ...postcard,
                updatedAt: serverTimestamp()
            }, { merge: true });
            
            return { success: true, id: docId };
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
            return { success: false };
        }
    },

    async getPostcards(governorate?: string) {
        const path = 'business_postcards';
        try {
            let q = query(collection(db, path), orderBy('updatedAt', 'desc'));
            if (governorate && governorate !== 'all') {
                q = query(q, where('governorate', '==', governorate));
            }
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data,
                    updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined
                } as BusinessPostcard;
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
            return [];
        }
    }
};
