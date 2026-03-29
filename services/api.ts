import type { Business, Post, User, BusinessPostcard } from '../types';
import * as mockData from '../constants';

type Cursor = number;

const PAGE_DEFAULT = 20;
const businessPostcardsStore: BusinessPostcard[] = [];

const normalizeBusiness = (business: any): Business => ({
  ...business,
  isVerified: business.isVerified ?? business.verified ?? false,
});

export const api = {
  async getBusinesses(params: { category?: string; city?: string; governorate?: string; lastDoc?: Cursor; limit?: number; featuredOnly?: boolean } = {}) {
    const pageSize = params.limit || PAGE_DEFAULT;
    const cursor = params.lastDoc || 0;

    let filtered = [...mockData.businesses].map(normalizeBusiness);

    if (params.featuredOnly) filtered = filtered.filter((b) => b.isFeatured);
    if (params.category && params.category !== 'all') filtered = filtered.filter((b) => b.category === params.category);
    if (params.governorate && params.governorate !== 'all') filtered = filtered.filter((b) => b.governorate === params.governorate);
    if (params.city?.trim()) {
      const cityQuery = params.city.trim().toLowerCase();
      filtered = filtered.filter((b) => (b.city || '').toLowerCase().includes(cityQuery));
    }

    const data = filtered.slice(cursor, cursor + pageSize);
    const nextCursor = cursor + data.length;

    return {
      data,
      lastDoc: nextCursor < filtered.length ? nextCursor : undefined,
      hasMore: nextCursor < filtered.length,
    };
  },

  subscribeToPosts(callback: (posts: Post[]) => void) {
    callback(mockData.posts || []);
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

  async createPost(_postData: Partial<Post>) {
    return { success: true, id: 'mock_post_id' };
  },

  async getOrCreateProfile(firebaseUser: any, requestedRole: 'user' | 'owner' = 'user') {
    if (!firebaseUser) return null;
    return {
      ...mockData.mockUser,
      id: firebaseUser.uid || `local-${Date.now()}`,
      email: firebaseUser.email || '',
      role: requestedRole,
      businessId: requestedRole === 'owner' ? `b_${firebaseUser.uid || 'local'}` : null,
    } as User;
  },

  async upsertPostcard(postcard: BusinessPostcard) {
    const docId = postcard.id || `${postcard.title}_${postcard.city}`.replace(/\s+/g, '_').toLowerCase();
    const existingIdx = businessPostcardsStore.findIndex((p) => (p.id || `${p.title}_${p.city}`.replace(/\s+/g, '_').toLowerCase()) === docId);
    const normalized: BusinessPostcard = { ...postcard, id: docId, updatedAt: new Date() as any };

    if (existingIdx >= 0) {
      businessPostcardsStore[existingIdx] = { ...businessPostcardsStore[existingIdx], ...normalized };
    } else {
      businessPostcardsStore.unshift(normalized);
    }

    return { success: true, id: docId };
  },

  async getPostcards(governorate?: string) {
    if (!governorate || governorate === 'all') return [...businessPostcardsStore];
    return businessPostcardsStore.filter((p) => p.governorate === governorate);
  },

  async updateProfile(_userId: string, _data: Partial<User>) {
    return { success: true };
  },
};
