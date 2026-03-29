import type { Business, BusinessPostcard, Deal, Event, Post, Story, User } from '../types';
import { supabase } from './supabase';

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: number | null;
  hasMore: boolean;
}

const PAGE_SIZE_DEFAULT = 20;

const normalizeBusiness = (row: any): Business => ({
  id: row.id,
  name: row.name ?? 'Unknown Business',
  nameAr: row.name_ar ?? undefined,
  nameKu: row.name_ku ?? undefined,
  imageUrl: row.image_url ?? row.cover_image ?? undefined,
  coverImage: row.cover_image ?? undefined,
  isPremium: Boolean(row.is_premium),
  isFeatured: Boolean(row.is_featured),
  category: row.category ?? 'other',
  subcategory: row.subcategory ?? undefined,
  rating: Number(row.rating ?? 0),
  distance: row.distance ? Number(row.distance) : undefined,
  status: row.status ?? 'open',
  isVerified: Boolean(row.is_verified),
  reviewCount: Number(row.review_count ?? 0),
  governorate: row.governorate ?? undefined,
  city: row.city ?? undefined,
  address: row.address ?? undefined,
  phone: row.phone ?? undefined,
  whatsapp: row.whatsapp ?? undefined,
  website: row.website ?? undefined,
  description: row.description ?? undefined,
  descriptionAr: row.description_ar ?? undefined,
  descriptionKu: row.description_ku ?? undefined,
  openHours: row.open_hours ?? undefined,
  priceRange: row.price_range ?? undefined,
  tags: row.tags ?? undefined,
  lat: row.lat ? Number(row.lat) : undefined,
  lng: row.lng ? Number(row.lng) : undefined,
});

const normalizePost = (row: any): Post => ({
  id: row.id,
  businessId: row.business_id ?? '',
  businessName: row.business_name ?? 'Business',
  businessAvatar: row.business_avatar ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=business',
  caption: row.caption ?? '',
  imageUrl: row.image_url ?? '',
  createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  likes: Number(row.likes ?? 0),
  isVerified: Boolean(row.is_verified),
});

const normalizeStory = (row: any): Story => ({
  id: Number(row.id),
  avatar: row.avatar ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=story',
  name: row.name ?? row.user_name ?? 'User',
  viewed: Boolean(row.viewed),
  verified: Boolean(row.verified),
  thumbnail: row.thumbnail ?? row.media?.[0] ?? 'https://picsum.photos/seed/story/400/700',
  userName: row.user_name ?? row.name ?? 'User',
  type: row.type === 'community' ? 'community' : 'business',
  aiVerified: Boolean(row.ai_verified),
  isLive: Boolean(row.is_live),
  media: Array.isArray(row.media) && row.media.length > 0 ? row.media : [row.thumbnail ?? 'https://picsum.photos/seed/story/400/700'],
  timeAgo: row.time_ago ?? 'Just now',
});

const normalizeDeal = (row: any): Deal => ({
  id: row.id,
  discount: Number(row.discount ?? 0),
  businessLogo: row.business_logo ?? 'https://picsum.photos/seed/deal/100/100',
  title: row.title ?? 'Deal',
  titleKey: row.title_key ?? undefined,
  description: row.description ?? '',
  descriptionKey: row.description_key ?? undefined,
  expiresIn: row.expires_in ?? 'Limited time',
  expiresInKey: row.expires_in_key ?? undefined,
  claimed: Number(row.claimed ?? 0),
  total: Number(row.total ?? 100),
  createdAt: row.created_at,
});

const normalizeEvent = (row: any): Event => ({
  id: row.id,
  image: row.image ?? 'https://picsum.photos/seed/event/600/400',
  title: row.title ?? 'Event',
  titleKey: row.title_key ?? undefined,
  aiRecommended: Boolean(row.ai_recommended),
  date: row.date ? new Date(row.date) : new Date(),
  venue: row.venue ?? row.location ?? 'Iraq',
  venueKey: row.venue_key ?? undefined,
  location: row.location ?? undefined,
  attendees: Number(row.attendees ?? 0),
  price: Number(row.price ?? 0),
  category: row.category ?? 'general',
  governorate: row.governorate ?? 'all',
  accessibility: row.accessibility ?? undefined,
});

const normalizeUser = (row: any): User => ({
  id: row.id,
  name: row.name ?? 'User',
  email: row.email ?? '',
  avatar: row.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.id}`,
  role: row.role ?? 'user',
  businessId: row.business_id ?? undefined,
  updatedAt: row.updated_at,
});

async function fetchPage<T>(
  query: any,
  limit: number,
  offset: number,
  mapper: (row: any) => T,
): Promise<PaginatedResult<T>> {
  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) throw error;
  const mapped = (data ?? []).map(mapper);
  return {
    data: mapped,
    nextCursor: mapped.length === limit ? offset + limit : null,
    hasMore: mapped.length === limit,
  };
}

export const api = {
  async getBusinesses(params: { category?: string; city?: string; governorate?: string; cursor?: number; limit?: number; featuredOnly?: boolean } = {}) {
    const limit = params.limit ?? PAGE_SIZE_DEFAULT;
    const offset = params.cursor ?? 0;

    let query = supabase.from('businesses').select('*').order('name', { ascending: true });

    if (params.city?.trim()) query = query.ilike('city', `%${params.city.trim()}%`);
    if (params.category && params.category !== 'all') query = query.eq('category', params.category);
    if (params.governorate && params.governorate !== 'all') query = query.eq('governorate', params.governorate);
    if (params.featuredOnly) query = query.eq('is_featured', true);

    return fetchPage(query, limit, offset, normalizeBusiness);
  },

  async getPosts(params: { cursor?: number; limit?: number; governorate?: string } = {}) {
    const limit = params.limit ?? PAGE_SIZE_DEFAULT;
    const offset = params.cursor ?? 0;

    let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (params.governorate && params.governorate !== 'all') {
      query = query.eq('governorate', params.governorate);
    }

    return fetchPage(query, limit, offset, normalizePost);
  },

  async getDeals(params: { cursor?: number; limit?: number; governorate?: string } = {}) {
    const limit = params.limit ?? 9;
    const offset = params.cursor ?? 0;

    let query = supabase.from('deals').select('*').order('created_at', { ascending: false });
    if (params.governorate && params.governorate !== 'all') {
      query = query.eq('governorate', params.governorate);
    }

    return fetchPage(query, limit, offset, normalizeDeal);
  },

  async getStories(params: { cursor?: number; limit?: number; governorate?: string } = {}) {
    const limit = params.limit ?? 12;
    const offset = params.cursor ?? 0;

    let query = supabase.from('stories').select('*').order('created_at', { ascending: false });
    if (params.governorate && params.governorate !== 'all') {
      query = query.eq('governorate', params.governorate);
    }

    return fetchPage(query, limit, offset, normalizeStory);
  },

  async getEvents(params: { category?: string; governorate?: string; cursor?: number; limit?: number } = {}) {
    const limit = params.limit ?? 9;
    const offset = params.cursor ?? 0;

    let query = supabase.from('events').select('*').order('date', { ascending: true });

    if (params.category && params.category !== 'all') query = query.eq('category', params.category);
    if (params.governorate && params.governorate !== 'all') query = query.eq('governorate', params.governorate);

    return fetchPage(query, limit, offset, normalizeEvent);
  },

  async createPost(postData: Partial<Post>) {
    const payload = {
      business_id: postData.businessId,
      business_name: postData.businessName,
      business_avatar: postData.businessAvatar,
      caption: postData.caption,
      image_url: postData.imageUrl,
      likes: 0,
    };

    const { data, error } = await supabase.from('posts').insert(payload).select('id').single();
    if (error) throw error;
    return { success: true, id: data.id as string };
  },

  async getOrCreateProfile(authUser: { id: string; email?: string; user_metadata?: any }, requestedRole: 'user' | 'owner' = 'user') {
    const { data: existing, error: fetchError } = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();
    if (fetchError) throw fetchError;

    if (existing) return normalizeUser(existing);

    const nameFromMeta = authUser.user_metadata?.full_name || authUser.user_metadata?.name;
    const avatarFromMeta = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture;

    const payload = {
      id: authUser.id,
      name: nameFromMeta || authUser.email?.split('@')[0] || 'User',
      email: authUser.email ?? '',
      avatar: avatarFromMeta || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
      role: requestedRole,
      business_id: requestedRole === 'owner' ? `b_${authUser.id}` : null,
    };

    const { data, error } = await supabase.from('users').insert(payload).select('*').single();
    if (error) throw error;
    return normalizeUser(data);
  },

  async updateProfile(userId: string, updates: Partial<Pick<User, 'name' | 'email'>>) {
    const payload = {
      ...(updates.name ? { name: updates.name } : {}),
      ...(updates.email ? { email: updates.email } : {}),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('users').update(payload).eq('id', userId);
    if (error) throw error;
    return { success: true };
  },

  async upsertPostcard(postcard: BusinessPostcard) {
    const payload = {
      ...postcard,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('business_postcards').upsert(payload, { onConflict: 'id' }).select('id').single();
    if (error) throw error;
    return { success: true, id: String(data.id) };
  },

  async getPostcards(governorate?: string) {
    let query = supabase.from('business_postcards').select('*').order('updated_at', { ascending: false });
    if (governorate && governorate !== 'all') query = query.eq('governorate', governorate);

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },
};
