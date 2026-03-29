import type { Business, Post, User, BusinessPostcard } from '../types';
import * as mockData from '../constants';

const POSTS_STORAGE_KEY = 'iraq-compass-posts';
const PROFILES_STORAGE_KEY = 'iraq-compass-profiles';
const POSTCARDS_STORAGE_KEY = 'iraq-compass-postcards';

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeStorage = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

const hydratePosts = (): Post[] => {
  const stored = readStorage<Post[]>(POSTS_STORAGE_KEY, []);
  if (stored.length > 0) {
    return stored.map((post) => ({ ...post, createdAt: new Date(post.createdAt) }));
  }
  return (mockData.posts || []).map((post) => ({ ...post, createdAt: new Date(post.createdAt) }));
};

export const api = {
  async getBusinesses(params: { category?: string; city?: string; governorate?: string; lastDoc?: number; limit?: number; featuredOnly?: boolean } = {}) {
    let filtered = [...mockData.businesses] as Business[];

    if (params.featuredOnly) filtered = filtered.filter((b) => b.isFeatured);
    if (params.category && params.category !== 'all') filtered = filtered.filter((b) => b.category === params.category);
    if (params.governorate && params.governorate !== 'all') filtered = filtered.filter((b) => b.governorate === params.governorate);
    if (params.city?.trim()) {
      const search = params.city.trim().toLowerCase();
      filtered = filtered.filter((b) => (b.city || '').toLowerCase().includes(search));
    }

    const pageSize = params.limit || 20;
    const start = params.lastDoc || 0;
    const data = filtered.slice(start, start + pageSize);
    const nextCursor = start + data.length;

    return {
      data,
      lastDoc: data.length ? nextCursor : undefined,
      hasMore: nextCursor < filtered.length,
    };
  },

  subscribeToPosts(callback: (posts: Post[]) => void) {
    callback(hydratePosts().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
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
    const posts = hydratePosts();
    const newPost: Post = {
      id: crypto.randomUUID(),
      businessId: postData.businessId || 'unknown',
      businessName: postData.businessName || 'Business',
      businessAvatar: postData.businessAvatar || 'https://picsum.photos/seed/business/80/80',
      caption: postData.caption || '',
      imageUrl: postData.imageUrl || 'https://picsum.photos/seed/post/600/400',
      createdAt: new Date(),
      likes: 0,
      isVerified: true,
    };

    const updated = [newPost, ...posts];
    writeStorage(POSTS_STORAGE_KEY, updated);
    return { success: true, id: newPost.id };
  },

  async getOrCreateProfile(sessionUser: { id: string; name: string; email: string; avatar: string } | null, requestedRole: 'user' | 'owner' = 'user') {
    if (!sessionUser) return null;

    const profiles = readStorage<Record<string, User>>(PROFILES_STORAGE_KEY, {});
    const existing = profiles[sessionUser.id];
    if (existing) {
      return existing;
    }

    const isAdminEmail = sessionUser.email === 'safaribosafar@gmail.com';
    const newUser: User = {
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      avatar: sessionUser.avatar,
      role: isAdminEmail ? 'admin' : requestedRole,
      businessId: requestedRole === 'owner' ? `b_${sessionUser.id}` : undefined,
    };

    profiles[sessionUser.id] = newUser;
    writeStorage(PROFILES_STORAGE_KEY, profiles);
    return newUser;
  },

  async upsertPostcard(postcard: BusinessPostcard) {
    const postcards = readStorage<BusinessPostcard[]>(POSTCARDS_STORAGE_KEY, []);
    const id = postcard.id || `${postcard.title}_${postcard.city}`.replace(/\s+/g, '_').toLowerCase();
    const next = { ...postcard, id, updatedAt: new Date().toISOString() };
    const idx = postcards.findIndex((p) => p.id === id);

    if (idx >= 0) postcards[idx] = next;
    else postcards.unshift(next);

    writeStorage(POSTCARDS_STORAGE_KEY, postcards);
    return { success: true, id };
  },

  async getPostcards(governorate?: string) {
    const postcards = readStorage<BusinessPostcard[]>(POSTCARDS_STORAGE_KEY, []).map((p) => ({
      ...p,
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
    }));

    if (!governorate || governorate === 'all') return postcards;
    return postcards.filter((p) => p.governorate === governorate);
  },

  async updateProfile(userId: string, data: Partial<User>) {
    const profiles = readStorage<Record<string, User>>(PROFILES_STORAGE_KEY, {});
    const existing = profiles[userId];
    if (!existing) return { success: false };

    profiles[userId] = { ...existing, ...data, updatedAt: new Date().toISOString() };
    writeStorage(PROFILES_STORAGE_KEY, profiles);
    return { success: true };
  },
};
