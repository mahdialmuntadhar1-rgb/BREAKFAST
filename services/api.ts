import { supabase, type SupabaseAuthUser } from './supabase';
import type { Business, BusinessPostcard, Deal, Event, Post, Story, User } from '../types';

interface PaginatedResult<T> { data: T[]; hasMore: boolean; nextPage: number }

const paged = async <T>(table: string, page: number, limit: number, map: (row: any) => T, opts?: { filters?: string[]; order?: { column: string; ascending?: boolean } }) => {
  const from = page * limit;
  const to = from + limit;
  const rows = await supabase.db.select(table, { filters: opts?.filters, order: opts?.order, range: { from, to } });
  const data = (rows as any[]).map(map);
  return { data, hasMore: data.length > limit - 1, nextPage: page + 1 } as PaginatedResult<T>;
};

const toDate = (value: unknown) => {
  const parsed = new Date(String(value ?? Date.now()));
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export const api = {
  async getBusinesses(params: { category?: string; city?: string; governorate?: string; page?: number; limit?: number; featuredOnly?: boolean } = {}): Promise<PaginatedResult<Business>> {
    const filters: string[] = [];
    if (params.category && params.category !== 'all') filters.push(`category=eq.${encodeURIComponent(params.category)}`);
    if (params.governorate && params.governorate !== 'all') filters.push(`governorate=eq.${encodeURIComponent(params.governorate)}`);
    if (params.featuredOnly) filters.push('is_featured=eq.true');
    if (params.city?.trim()) filters.push(`city=ilike.*${encodeURIComponent(params.city.trim())}*`);

    return paged('businesses', params.page ?? 0, params.limit ?? 20, (row) => ({
      id: row.id, name: row.name, nameAr: row.name_ar, nameKu: row.name_ku, imageUrl: row.image_url, coverImage: row.cover_image,
      isPremium: row.is_premium, isFeatured: row.is_featured, category: row.category, subcategory: row.subcategory,
      rating: Number(row.rating ?? 0), distance: row.distance, status: row.status, isVerified: row.is_verified ?? false,
      reviewCount: row.review_count ?? 0, governorate: row.governorate, city: row.city, address: row.address, phone: row.phone,
      whatsapp: row.whatsapp, website: row.website, description: row.description,
    }), { filters, order: { column: 'name', ascending: true } });
  },

  async getPosts(params: { page?: number; limit?: number; governorate?: string } = {}): Promise<PaginatedResult<Post>> {
    const filters: string[] = [];
    if (params.governorate && params.governorate !== 'all') filters.push(`governorate=eq.${encodeURIComponent(params.governorate)}`);
    return paged('posts', params.page ?? 0, params.limit ?? 8, (row) => ({
      id: row.id, businessId: row.business_id, businessName: row.business_name, businessAvatar: row.business_avatar,
      caption: row.caption, imageUrl: row.image_url, createdAt: toDate(row.created_at), likes: row.likes ?? 0, isVerified: row.is_verified ?? false,
    }), { filters, order: { column: 'created_at', ascending: false } });
  },

  async getDeals(params: { page?: number; limit?: number; governorate?: string } = {}): Promise<PaginatedResult<Deal>> {
    const filters: string[] = [];
    if (params.governorate && params.governorate !== 'all') filters.push(`governorate=eq.${encodeURIComponent(params.governorate)}`);
    return paged('deals', params.page ?? 0, params.limit ?? 9, (row) => ({
      id: row.id, discount: row.discount ?? 0, businessLogo: row.business_logo, title: row.title, titleKey: row.title_key,
      description: row.description, descriptionKey: row.description_key, expiresIn: row.expires_in, expiresInKey: row.expires_in_key,
      claimed: row.claimed ?? 0, total: row.total ?? 1, createdAt: row.created_at,
    }), { filters, order: { column: 'created_at', ascending: false } });
  },

  async getStories(params: { page?: number; limit?: number; governorate?: string } = {}): Promise<PaginatedResult<Story>> {
    const filters: string[] = [];
    if (params.governorate && params.governorate !== 'all') filters.push(`governorate=eq.${encodeURIComponent(params.governorate)}`);
    return paged('stories', params.page ?? 0, params.limit ?? 12, (row) => ({
      id: row.id, avatar: row.avatar, name: row.name, viewed: row.viewed, verified: row.verified, thumbnail: row.thumbnail,
      userName: row.user_name, type: row.type, aiVerified: row.ai_verified, isLive: row.is_live, media: Array.isArray(row.media) ? row.media : [],
      timeAgo: row.time_ago ?? 'Now',
    }), { filters, order: { column: 'created_at', ascending: false } });
  },

  async getEvents(params: { category?: string; governorate?: string; page?: number; limit?: number } = {}): Promise<PaginatedResult<Event>> {
    const filters: string[] = [];
    if (params.category && params.category !== 'all') filters.push(`category=eq.${encodeURIComponent(params.category)}`);
    if (params.governorate && params.governorate !== 'all') filters.push(`governorate=eq.${encodeURIComponent(params.governorate)}`);
    return paged('events', params.page ?? 0, params.limit ?? 9, (row) => ({
      id: row.id, image: row.image, title: row.title, titleKey: row.title_key, aiRecommended: row.ai_recommended,
      date: toDate(row.date), venue: row.venue, venueKey: row.venue_key, location: row.location, attendees: row.attendees ?? 0,
      price: row.price ?? 0, category: row.category, governorate: row.governorate, accessibility: row.accessibility,
    }), { filters, order: { column: 'date', ascending: true } });
  },

  async createPost(postData: Partial<Post> & { governorate?: string }) {
    const rows = await supabase.db.insert('posts', [{
      business_id: postData.businessId, business_name: postData.businessName, business_avatar: postData.businessAvatar,
      caption: postData.caption, image_url: postData.imageUrl, likes: postData.likes ?? 0, is_verified: postData.isVerified ?? false,
      governorate: postData.governorate,
    }]);
    return { success: true, id: rows[0]?.id };
  },

  async getOrCreateProfile(authUser: SupabaseAuthUser, requestedRole: 'user' | 'owner' = 'user'): Promise<User> {
    const existing = await supabase.db.select('users', { filters: [`id=eq.${authUser.id}`], single: true });
    const adminEmail = 'safaribosafar@gmail.com';
    const isAdminEmail = authUser.email === adminEmail;

    if (existing) {
      if (isAdminEmail && existing.role !== 'admin') await supabase.db.update('users', { role: 'admin' }, [`id=eq.${authUser.id}`]);
      return { id: existing.id, name: existing.name, email: existing.email, avatar: existing.avatar, role: isAdminEmail ? 'admin' : existing.role, businessId: existing.business_id };
    }

    const newUser = {
      id: authUser.id,
      name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      avatar: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
      role: isAdminEmail ? 'admin' : requestedRole,
      business_id: requestedRole === 'owner' ? `b_${authUser.id}` : null,
    };
    await supabase.db.insert('users', [newUser]);
    return { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar, role: newUser.role as User['role'], businessId: newUser.business_id ?? undefined };
  },

  async upsertPostcard(postcard: BusinessPostcard) {
    const rows = await supabase.db.insert('business_postcards', [{ ...postcard, updated_at: new Date().toISOString() }], { upsert: true });
    return { success: true, id: rows[0]?.id };
  },

  async getPostcards(governorate?: string): Promise<BusinessPostcard[]> {
    const filters: string[] = [];
    if (governorate && governorate !== 'all') filters.push(`governorate=eq.${encodeURIComponent(governorate)}`);
    return supabase.db.select('business_postcards', { filters, order: { column: 'updated_at', ascending: false } });
  },

  async updateProfile(userId: string, data: Partial<User>) {
    await supabase.db.update('users', { name: data.name, email: data.email, avatar: data.avatar, updated_at: new Date().toISOString() }, [`id=eq.${userId}`]);
    return { success: true };
  },
};
