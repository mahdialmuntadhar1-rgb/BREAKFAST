import type { Business, Post, User, BusinessPostcard } from '../types';
import * as mockData from '../constants';

export type FirestoreCursor = string | undefined;

const POSTS_KEY = 'iraq-compass-posts';
const USERS_KEY = 'iraq-compass-users';
const POSTCARDS_KEY = 'iraq-compass-postcards';

const parseStore = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeStore = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

const nowIso = () => new Date().toISOString();

export const api = {
  async getBusinesses(params: { category?: string; city?: string; governorate?: string; lastDoc?: FirestoreCursor; limit?: number; featuredOnly?: boolean } = {}) {
    let filtered = [...mockData.businesses];
    if (params.featuredOnly) filtered = filtered.filter((b) => b.isFeatured);
    if (params.category && params.category !== 'all') filtered = filtered.filter((b) => b.category === params.category);
    if (params.governorate && params.governorate !== 'all') filtered = filtered.filter((b) => b.governorate === params.governorate);
    if (params.city?.trim()) {
      const needle = params.city.trim().toLowerCase();
      filtered = filtered.filter((b) => (b.city || '').toLowerCase().includes(needle));
    }

    const pageSize = params.limit || 20;
    const offset = params.lastDoc ? Number(params.lastDoc) : 0;
    const data = filtered.slice(offset, offset + pageSize);
    const nextOffset = offset + data.length;

    return {
      data,
      lastDoc: nextOffset < filtered.length ? String(nextOffset) : undefined,
      hasMore: nextOffset < filtered.length,
    };
  },

  subscribeToPosts(callback: (posts: Post[]) => void) {
    const localPosts = parseStore<Post[]>(POSTS_KEY, mockData.posts || []);
    callback(localPosts);
    return () => {};
  },

  async getDeals() {
    return mockData.deals || [];
  },

  async getStories() {
    return mockData.stories || [];
  },

  async getEvents(params: { category?: string; governorate?: string } = {}) {
    let filtered = [...mockData.events];
    if (params.category && params.category !== 'all') filtered = filtered.filter((e) => e.category === params.category);
    if (params.governorate && params.governorate !== 'all') filtered = filtered.filter((e) => e.governorate === params.governorate);
    return filtered;
  },

  async createPost(postData: Partial<Post>) {
    const posts = parseStore<Post[]>(POSTS_KEY, mockData.posts || []);
    const post: Post = {
      id: `post-${Date.now()}`,
      caption: postData.caption || 'New update',
      imageUrl: postData.imageUrl || '',
      createdAt: new Date(),
      businessId: postData.businessId || 'local-business',
      businessName: postData.businessName || 'Business',
      businessAvatar: postData.businessAvatar || '',
      likes: postData.likes || 0,
      isVerified: postData.isVerified ?? true,
    };
    const next = [post, ...posts];
    writeStore(POSTS_KEY, next);
    return { success: true, id: post.id };
  },

  async getOrCreateProfile(firebaseUser: any, requestedRole: 'user' | 'owner' = 'user') {
    const users = parseStore<Record<string, User>>(USERS_KEY, {});
    const existing = users[firebaseUser.uid];
    if (existing) return existing;

    const newUser: User = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      email: firebaseUser.email || '',
      avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
      role: requestedRole,
      businessId: requestedRole === 'owner' ? `b_${firebaseUser.uid}` : null,
    };
    users[firebaseUser.uid] = newUser;
    writeStore(USERS_KEY, users);
    return newUser;
  },

  async getProfile(userId: string, fallbackRole: 'user' | 'owner' | 'admin' = 'user') {
    const users = parseStore<Record<string, User>>(USERS_KEY, {});
    return users[userId] || { ...mockData.mockUser, id: userId, role: fallbackRole };
  },

  async updateProfile(userId: string, data: Partial<User>) {
    const users = parseStore<Record<string, User>>(USERS_KEY, {});
    const existing = users[userId] || ({ ...mockData.mockUser, id: userId } as User);
    users[userId] = { ...existing, ...data };
    writeStore(USERS_KEY, users);
    return { success: true };
  },

  async getPostcards(governorate: string) {
    const saved = parseStore<BusinessPostcard[]>(POSTCARDS_KEY, []);
    return saved.filter((p) => !governorate || p.governorate === governorate);
  },

  async upsertPostcard(postcard: BusinessPostcard) {
    const saved = parseStore<BusinessPostcard[]>(POSTCARDS_KEY, []);
    const id = postcard.id || `${postcard.title}-${Date.now()}`;
    const normalized = { ...postcard, id, updatedAt: nowIso() };
    const next = saved.some((p) => p.id === id) ? saved.map((p) => (p.id === id ? normalized : p)) : [normalized, ...saved];
    writeStore(POSTCARDS_KEY, next);
    return { success: true, id };
  },
};
