import {
    collection,
    getDocs,
    query,
    where,
    limit,
    orderBy,
    addDoc,
    serverTimestamp,
    doc,
    getDoc,
    setDoc,
    Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import type { Business, Post, User, BusinessPostcard, Event, Deal, Story } from '../types';
import * as mockData from '../constants';
import firebaseConfig from '../firebase-applet-config.json';
import { fetchSupabaseRows, isSupabaseConfigured } from './supabase';

const isConfigValid = firebaseConfig.projectId && !firebaseConfig.projectId.startsWith('remixed-');

export type BusinessesCursor = number;
export type BusinessesDataSource = 'supabase' | 'mock';

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

function handleSupabaseError(error: unknown, path: string) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Supabase Error (${path}): ${message}`);
}

function cleanData(data: any): any {
    if (data === null || typeof data !== 'object') return data;
    if (Array.isArray(data)) return data.map(cleanData);

    const cleaned: any = {};
    Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
            cleaned[key] = cleanData(data[key]);
        }
    });
    return cleaned;
}

function parseDate(value: unknown, fallback = new Date()): Date {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    if (value && typeof value === 'object' && 'seconds' in (value as any)) {
        return new Date(((value as any).seconds as number) * 1000);
    }
    return fallback;
}

function mapBusiness(row: any): Business {
    return {
        id: row.id,
        ...row,
        name: row.name || row.title || 'Unnamed Business',
        imageUrl: row.imageUrl || row.image_url || row.image,
        coverImage: row.coverImage || row.cover_image,
        isFeatured: row.isFeatured ?? row.is_featured ?? false,
        isPremium: row.isPremium ?? row.is_premium ?? false,
        rating: Number(row.rating ?? 0),
        reviewCount: Number(row.reviewCount ?? row.review_count ?? row.reviews ?? 0),
        category: row.category || 'other',
        isVerified: row.isVerified ?? row.verified ?? row.is_verified ?? false,
    };
}

function mapPost(row: any): Post {
    return {
        id: String(row.id),
        businessId: String(row.businessId ?? row.business_id ?? ''),
        businessName: row.businessName ?? row.business_name ?? 'Unknown business',
        businessAvatar: row.businessAvatar ?? row.business_avatar ?? row.avatar ?? 'https://picsum.photos/seed/post-avatar/120/120',
        caption: row.caption ?? '',
        imageUrl: row.imageUrl ?? row.image_url ?? '',
        createdAt: parseDate(row.createdAt ?? row.created_at),
        likes: Number(row.likes ?? 0),
        isVerified: row.isVerified ?? row.verified ?? row.is_verified ?? false,
    };
}

function mapDeal(row: any): Deal {
    return {
        id: row.id,
        discount: Number(row.discount ?? 0),
        businessLogo: row.businessLogo ?? row.business_logo ?? 'https://picsum.photos/seed/deal-logo/200/200',
        title: row.title ?? '',
        titleKey: row.titleKey ?? row.title_key,
        description: row.description ?? '',
        descriptionKey: row.descriptionKey ?? row.description_key,
        expiresIn: row.expiresIn ?? row.expires_in ?? '',
        expiresInKey: row.expiresInKey ?? row.expires_in_key,
        claimed: Number(row.claimed ?? 0),
        total: Number(row.total ?? 0),
        createdAt: row.createdAt ?? row.created_at,
    };
}

function mapStory(row: any): Story {
    const media = Array.isArray(row.media) ? row.media : (row.media ? [row.media] : []);
    return {
        id: Number(row.id),
        avatar: row.avatar ?? 'https://picsum.photos/seed/story-avatar/120/120',
        name: row.name ?? row.userName ?? row.user_name ?? 'Story',
        viewed: row.viewed ?? false,
        verified: row.verified ?? row.isVerified ?? row.is_verified ?? false,
        thumbnail: row.thumbnail ?? row.imageUrl ?? row.image_url ?? 'https://picsum.photos/seed/story-thumb/400/711',
        userName: row.userName ?? row.user_name ?? row.name ?? 'User',
        type: row.type === 'business' ? 'business' : 'community',
        aiVerified: row.aiVerified ?? row.ai_verified ?? false,
        isLive: row.isLive ?? row.is_live ?? false,
        media,
        timeAgo: row.timeAgo ?? row.time_ago ?? 'just now',
    };
}

function mapEvent(row: any): Event {
    return {
        id: row.id,
        image: row.image ?? row.imageUrl ?? row.image_url ?? 'https://picsum.photos/seed/event/640/640',
        title: row.title ?? '',
        titleKey: row.titleKey ?? row.title_key,
        aiRecommended: row.aiRecommended ?? row.ai_recommended ?? false,
        date: parseDate(row.date),
        venue: row.venue ?? row.location ?? '',
        venueKey: row.venueKey ?? row.venue_key,
        location: row.location,
        attendees: Number(row.attendees ?? 0),
        price: Number(row.price ?? 0),
        category: row.category ?? 'general',
        governorate: row.governorate ?? 'all',
        accessibility: row.accessibility,
    };
}

export const api = {
    async getBusinesses(params: { category?: string; city?: string; governorate?: string; lastDoc?: BusinessesCursor; limit?: number; featuredOnly?: boolean } = {}) {
        const fallback = () => {
            console.info('Using mock data fallback');
            let filtered = [...mockData.businesses];
            if (params.featuredOnly) filtered = filtered.filter(b => b.isFeatured);
            if (params.category && params.category !== 'all') filtered = filtered.filter(b => b.category === params.category);
            if (params.governorate && params.governorate !== 'all') filtered = filtered.filter(b => b.governorate === params.governorate);
            if (params.city) filtered = filtered.filter(b => b.city?.toLowerCase().includes(params.city!.toLowerCase()));
            return { data: filtered.slice(0, params.limit || 20), hasMore: false, lastDoc: undefined, source: 'mock' as BusinessesDataSource };
        };

        if (!isSupabaseConfigured) return fallback();

        const path = 'businesses';
        try {
            const pageSize = params.limit || 20;
            const offset = params.lastDoc ?? 0;
            const filters: string[] = [];
            if (params.category && params.category !== 'all') filters.push(`category=eq.${encodeURIComponent(params.category)}`);
            if (params.governorate && params.governorate !== 'all') filters.push(`governorate=eq.${encodeURIComponent(params.governorate)}`);
            if (params.city?.trim()) filters.push(`city=ilike.*${encodeURIComponent(params.city.trim())}*`);
            if (params.featuredOnly) filters.push('isFeatured=is.true');

            const rows = await fetchSupabaseRows<any>(path, {
                orderBy: 'name',
                ascending: true,
                limit: pageSize,
                offset,
                filters
            });
            console.log('[getBusinesses] rows returned:', rows.length);
            console.log('[getBusinesses] first row:', rows[0] ?? null);

            if (!rows.length) return fallback();
            const data = rows.map(mapBusiness);
            console.info('Using Supabase data');
            return {
                data,
                lastDoc: offset + data.length,
                hasMore: data.length === pageSize,
                source: 'supabase' as BusinessesDataSource
            };
        } catch (error) {
            handleSupabaseError(error, path);
            return fallback();
        }
    },

    subscribeToPosts(callback: (posts: Post[]) => void) {
        if (!isSupabaseConfigured) {
            callback(mockData.posts || []);
            return () => {};
        }

        const path = 'posts';
        let cancelled = false;

        const fetchPosts = async () => {
            try {
                const rows = await fetchSupabaseRows<any>(path, {
                    orderBy: 'createdAt',
                    ascending: false,
                    limit: 50
                });

                if (cancelled) return;
                if (!rows.length) {
                    callback(mockData.posts || []);
                    return;
                }

                callback(rows.map(mapPost));
            } catch (error) {
                handleSupabaseError(error, path);
                if (!cancelled) callback(mockData.posts || []);
            }
        };

        fetchPosts();
        const intervalId = window.setInterval(fetchPosts, 30000);

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    },

    async getDeals() {
        if (!isSupabaseConfigured) return mockData.deals || [];
        const path = 'deals';
        try {
            const rows = await fetchSupabaseRows<any>(path, {
                orderBy: 'createdAt',
                ascending: false,
                limit: 10
            });
            return rows.length ? rows.map(mapDeal) : (mockData.deals || []);
        } catch (error) {
            handleSupabaseError(error, path);
            return mockData.deals || [];
        }
    },

    async getStories() {
        if (!isSupabaseConfigured) return mockData.stories || [];
        const path = 'stories';
        try {
            const rows = await fetchSupabaseRows<any>(path, {
                orderBy: 'id',
                ascending: false,
                limit: 20
            });
            return rows.length ? rows.map(mapStory) : (mockData.stories || []);
        } catch (error) {
            handleSupabaseError(error, path);
            return mockData.stories || [];
        }
    },

    async getEvents(params: { category?: string; governorate?: string } = {}) {
        const fallback = () => {
            let filtered = [...mockData.events];
            if (params.category && params.category !== 'all') filtered = filtered.filter(e => e.category === params.category);
            if (params.governorate && params.governorate !== 'all') filtered = filtered.filter(e => e.governorate === params.governorate);
            return filtered;
        };

        if (!isSupabaseConfigured) return fallback();

        const path = 'events';
        try {
            const filters: string[] = [];
            if (params.category && params.category !== 'all') filters.push(`category=eq.${encodeURIComponent(params.category)}`);
            if (params.governorate && params.governorate !== 'all') filters.push(`governorate=eq.${encodeURIComponent(params.governorate)}`);

            const rows = await fetchSupabaseRows<any>(path, {
                orderBy: 'date',
                ascending: true,
                filters
            });

            return rows.length ? rows.map(mapEvent) : fallback();
        } catch (error) {
            handleSupabaseError(error, path);
            return fallback();
        }
    },

    async createPost(postData: Partial<Post>) {
        if (!isConfigValid) return { success: true, id: 'mock_post_id' };
        const path = 'posts';
        try {
            const docRef = await addDoc(collection(db, path), cleanData({
                ...postData,
                createdAt: serverTimestamp(),
                likes: 0
            }));
            return { success: true, id: docRef.id };
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
            return { success: false };
        }
    },

    async getOrCreateProfile(firebaseUser: any, requestedRole: 'user' | 'owner' = 'user') {
        if (!firebaseUser) return null;
        if (!isConfigValid) return { ...mockData.mockUser, id: firebaseUser.uid, email: firebaseUser.email || '' };

        const path = `users/${firebaseUser.uid}`;
        try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

            const adminEmail = 'safaribosafar@gmail.com';
            const isAdminEmail = firebaseUser.email === adminEmail && firebaseUser.emailVerified;

            if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                if (isAdminEmail && userData.role !== 'admin') {
                    const updatedUser = { ...userData, role: 'admin' as any };
                    await setDoc(doc(db, 'users', firebaseUser.uid), updatedUser, { merge: true });
                    return updatedUser;
                }
                return userData;
            } else {
                const newUser: User = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                    email: firebaseUser.email || '',
                    avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
                    role: isAdminEmail ? 'admin' as any : requestedRole,
                    businessId: requestedRole === 'owner' ? `b_${firebaseUser.uid}` : null
                };
                await setDoc(doc(db, 'users', firebaseUser.uid), cleanData(newUser));
                return newUser;
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
            return { ...mockData.mockUser, id: firebaseUser.uid, email: firebaseUser.email || '' };
        }
    },

    async upsertPostcard(postcard: BusinessPostcard) {
        if (!isConfigValid) return { success: true, id: 'mock_postcard_id' };
        const path = 'business_postcards';
        try {
            const docId = `${postcard.title}_${postcard.city}`.replace(/\s+/g, '_').toLowerCase();
            const docRef = doc(db, path, docId);

            await setDoc(docRef, cleanData({
                ...postcard,
                updatedAt: serverTimestamp()
            }), { merge: true });

            return { success: true, id: docId };
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
            return { success: false };
        }
    },

    async getPostcards(governorate?: string) {
        if (!isConfigValid) return [];
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
                    isVerified: data.isVerified ?? data.verified ?? false,
                    updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined
                } as unknown as BusinessPostcard;
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
            return [];
        }
    },

    async updateProfile(userId: string, data: Partial<User>) {
        if (!isConfigValid) return { success: true };
        const path = `users/${userId}`;
        try {
            await setDoc(doc(db, 'users', userId), cleanData({
                ...data,
                updatedAt: serverTimestamp()
            }), { merge: true });
            return { success: true };
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
            return { success: false };
        }
    }
};
