import { supabase } from './supabase';
import type { Business, Post, User, BusinessPostcard, Deal, Story, Event } from '../types';

type PageResult<T> = { data: T[]; nextCursor?: string; hasMore: boolean };
const encode = encodeURIComponent;

const asDate = (v: any) => (v ? new Date(v) : new Date());

const qs = (params: Record<string, string | undefined>) => {
  const parts = Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}=${v}`);
  return parts.length ? `?${parts.join('&')}` : '';
};

export const api = {
  async getBusinesses(params: { category?: string; city?: string; governorate?: string; cursor?: string; limit?: number; featuredOnly?: boolean } = {}): Promise<PageResult<Business>> {
    const limit = params.limit || 12;
    const query = qs({ select: '*', order: 'id.asc', limit: String(limit + 1), ...(params.category && params.category !== 'all' ? { category: `eq.${encode(params.category)}` } : {}), ...(params.governorate && params.governorate !== 'all' ? { governorate: `eq.${encode(params.governorate)}` } : {}), ...(params.featuredOnly ? { is_featured: 'eq.true' } : {}), ...(params.city ? { city: `ilike.*${encode(params.city)}*` } : {}), ...(params.cursor ? { id: `gt.${encode(params.cursor)}` } : {}) });
    const rows = await supabase.rest('businesses', 'GET', { query });
    const data = (rows || []).map((r: any) => ({ id: r.id, name: r.name, category: r.category || 'other', rating: Number(r.rating || 0), governorate: r.governorate, city: r.city, imageUrl: r.image_url || r.image, reviewCount: r.review_count || 0, isVerified: !!(r.is_verified ?? r.verified), nameAr: r.name_ar, nameKu: r.name_ku } as Business));
    const hasMore = data.length > limit;
    const sliced = hasMore ? data.slice(0, limit) : data;
    return { data: sliced, hasMore, nextCursor: hasMore ? String(sliced[sliced.length - 1].id) : undefined };
  },

  async getPosts(params: { governorate?: string; cursor?: string; limit?: number } = {}): Promise<PageResult<Post>> {
    const limit = params.limit || 8;
    const query = qs({ select: '*', order: 'created_at.desc', limit: String(limit + 1), ...(params.governorate && params.governorate !== 'all' ? { governorate: `eq.${encode(params.governorate)}` } : {}), ...(params.cursor ? { created_at: `lt.${encode(params.cursor)}` } : {}) });
    const rows = await supabase.rest('posts', 'GET', { query });
    const data = (rows || []).map((r: any) => ({ id: r.id, businessId: r.business_id, businessName: r.business_name, businessAvatar: r.business_avatar, caption: r.caption, imageUrl: r.image_url, createdAt: asDate(r.created_at), likes: Number(r.likes || 0), isVerified: !!(r.is_verified ?? r.verified) } as Post));
    const hasMore = data.length > limit;
    const sliced = hasMore ? data.slice(0, limit) : data;
    return { data: sliced, hasMore, nextCursor: hasMore ? sliced[sliced.length - 1].createdAt.toISOString() : undefined };
  },

  async getDeals(params: { governorate?: string; cursor?: string; limit?: number } = {}): Promise<PageResult<Deal>> {
    const limit = params.limit || 6;
    const query = qs({ select: '*', order: 'created_at.desc', limit: String(limit + 1), ...(params.governorate && params.governorate !== 'all' ? { governorate: `eq.${encode(params.governorate)}` } : {}), ...(params.cursor ? { created_at: `lt.${encode(params.cursor)}` } : {}) });
    const rows = await supabase.rest('deals', 'GET', { query });
    const data = (rows || []).map((r: any) => ({ id: r.id, discount: Number(r.discount || 0), businessLogo: r.business_logo, title: r.title, description: r.description, expiresIn: r.expires_in || 'soon', claimed: Number(r.claimed || 0), total: Number(r.total || 0), titleKey: r.title_key, descriptionKey: r.description_key, expiresInKey: r.expires_in_key } as Deal));
    const hasMore = data.length > limit;
    const sliced = hasMore ? data.slice(0, limit) : data;
    return { data: sliced, hasMore, nextCursor: hasMore ? (rows[limit - 1]?.created_at as string) : undefined };
  },

  async getStories(params: { governorate?: string; cursor?: string; limit?: number } = {}): Promise<PageResult<Story>> {
    const limit = params.limit || 12;
    const query = qs({ select: '*', order: 'created_at.desc', limit: String(limit + 1), ...(params.governorate && params.governorate !== 'all' ? { governorate: `eq.${encode(params.governorate)}` } : {}), ...(params.cursor ? { created_at: `lt.${encode(params.cursor)}` } : {}) });
    const rows = await supabase.rest('stories', 'GET', { query });
    const data = (rows || []).map((r: any) => ({ id: Number(r.id), avatar: r.avatar, name: r.name || r.user_name, viewed: !!r.viewed, verified: !!r.verified, thumbnail: r.thumbnail, userName: r.user_name, type: r.type || 'community', aiVerified: !!r.ai_verified, isLive: !!r.is_live, media: r.media || [r.thumbnail], timeAgo: r.time_ago || 'now' } as Story));
    const hasMore = data.length > limit;
    const sliced = hasMore ? data.slice(0, limit) : data;
    return { data: sliced, hasMore, nextCursor: hasMore ? (rows[limit - 1]?.created_at as string) : undefined };
  },

  async getEvents(params: { category?: string; governorate?: string; cursor?: string; limit?: number } = {}): Promise<PageResult<Event>> {
    const limit = params.limit || 6;
    const query = qs({ select: '*', order: 'date.asc', limit: String(limit + 1), ...(params.category && params.category !== 'all' ? { category: `eq.${encode(params.category)}` } : {}), ...(params.governorate && params.governorate !== 'all' ? { governorate: `eq.${encode(params.governorate)}` } : {}), ...(params.cursor ? { date: `gt.${encode(params.cursor)}` } : {}) });
    const rows = await supabase.rest('events', 'GET', { query });
    const data = (rows || []).map((r: any) => ({ id: r.id, image: r.image, title: r.title, titleKey: r.title_key, aiRecommended: !!r.ai_recommended, date: asDate(r.date), venue: r.venue || r.location, venueKey: r.venue_key, location: r.location, attendees: Number(r.attendees || 0), price: Number(r.price || 0), category: r.category || 'general', governorate: r.governorate || 'all' } as Event));
    const hasMore = data.length > limit;
    const sliced = hasMore ? data.slice(0, limit) : data;
    return { data: sliced, hasMore, nextCursor: hasMore ? sliced[sliced.length - 1].date.toISOString() : undefined };
  },

  async createPost(postData: Partial<Post>) {
    const payload = [{ business_id: postData.businessId, business_name: postData.businessName, business_avatar: postData.businessAvatar, caption: postData.caption, image_url: postData.imageUrl, likes: 0 }];
    const data = await supabase.rest('posts', 'POST', { body: payload, query: '?select=id' });
    return { success: true, id: data?.[0]?.id };
  },

  async getOrCreateProfile(user: { id: string; email?: string; user_metadata?: Record<string, any> }, requestedRole: 'user' | 'owner' = 'user') {
    const existing = await supabase.rest('users', 'GET', { query: `?id=eq.${encode(user.id)}&select=*` });
    if (existing?.[0]) return existing[0] as User;

    const payload = [{ id: user.id, email: user.email || '', name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User', avatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`, role: requestedRole, business_id: requestedRole === 'owner' ? `b_${user.id}` : null }];
    const inserted = await supabase.rest('users', 'POST', { query: '?select=*', body: payload });
    return inserted[0] as User;
  },

  async upsertPostcard(postcard: BusinessPostcard) {
    const data = await supabase.rest('business_postcards', 'POST', { body: [{ ...postcard, updated_at: new Date().toISOString() }], query: '?on_conflict=id&select=id' });
    return { success: true, id: data?.[0]?.id };
  },

  async getPostcards(governorate?: string) {
    const query = governorate && governorate !== 'all' ? `?governorate=eq.${encode(governorate)}&select=*&order=updated_at.desc` : '?select=*&order=updated_at.desc';
    return await supabase.rest('business_postcards', 'GET', { query }) as BusinessPostcard[];
  },

  async updateProfile(userId: string, data: Partial<User>) {
    await supabase.rest('users', 'PATCH', { query: `?id=eq.${encode(userId)}`, body: { name: data.name, email: data.email, avatar: data.avatar, updated_at: new Date().toISOString() } });
    return { success: true };
  },
};
