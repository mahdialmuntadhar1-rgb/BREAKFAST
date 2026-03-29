import type { Business, BusinessPostcard, Deal, Event, Post, Story, User } from '../types';
import { supabase, type SupabaseSessionUser } from './supabase';

type ListParams = { category?: string; city?: string; governorate?: string; featuredOnly?: boolean; limit?: number; offset?: number };
type PaginatedResponse<T> = { data: T[]; hasMore: boolean; nextOffset: number };

const toGov = (value?: string | null) => (value && value !== 'all' ? value.toLowerCase().replace(/\s+/g, '_') : undefined);
const toDate = (value: unknown) => (value ? new Date(value as string) : new Date());

const buildQuery = (params: Record<string, string | number | undefined>) =>
  Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');

const mapBusiness = (x: any): Business => ({ id: x.id, name: x.name ?? 'Unknown', category: x.category ?? 'other', rating: Number(x.rating ?? 0), isFeatured: !!x.is_featured, isVerified: !!x.is_verified, city: x.city, governorate: x.governorate, imageUrl: x.image_url, coverImage: x.cover_image, reviewCount: x.review_count ?? 0, nameAr: x.name_ar, nameKu: x.name_ku });
const mapPost = (x: any): Post => ({ id: x.id, businessId: x.business_id, businessName: x.business_name, businessAvatar: x.business_avatar, caption: x.caption ?? '', imageUrl: x.image_url ?? '', createdAt: toDate(x.created_at), likes: Number(x.likes ?? 0), isVerified: !!x.is_verified });
const mapStory = (x: any): Story => ({ id: Number(x.id), avatar: x.avatar, name: x.name, userName: x.user_name ?? x.name, thumbnail: x.thumbnail, type: x.type === 'business' ? 'business' : 'community', media: Array.isArray(x.media) ? x.media : [x.thumbnail].filter(Boolean), timeAgo: x.time_ago ?? 'Now', viewed: !!x.viewed, verified: !!x.verified, aiVerified: !!x.ai_verified, isLive: !!x.is_live });
const mapDeal = (x: any): Deal => ({ id: x.id, discount: Number(x.discount ?? 0), businessLogo: x.business_logo, title: x.title, description: x.description, expiresIn: x.expires_in ?? '', claimed: Number(x.claimed ?? 0), total: Number(x.total ?? 0), createdAt: x.created_at });
const mapEvent = (x: any): Event => ({ id: x.id, image: x.image, title: x.title, date: toDate(x.date), venue: x.venue, attendees: Number(x.attendees ?? 0), price: Number(x.price ?? 0), category: x.category ?? 'events_entertainment', governorate: x.governorate ?? 'all' });

const paged = <T,>(data: T[], limit: number, offset: number): PaginatedResponse<T> => ({ data, hasMore: data.length === limit, nextOffset: offset + data.length });

const getRows = async (table: string, query: string) => {
  const res = await supabase.from(table, query);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Failed to fetch ${table}`);
  return data;
};

export const api = {
  async getBusinesses(params: ListParams = {}): Promise<PaginatedResponse<Business>> {
    const limit = params.limit ?? 12;
    const offset = params.offset ?? 0;
    const filters = [
      params.featuredOnly ? 'is_featured.eq.true' : undefined,
      params.category && params.category !== 'all' ? `category.eq.${params.category}` : undefined,
      params.city ? `city.ilike.*${params.city.trim()}*` : undefined,
      toGov(params.governorate) ? `governorate.eq.${toGov(params.governorate)}` : undefined,
    ].filter(Boolean).join('&');
    const query = `select=*&order=name.asc&limit=${limit}&offset=${offset}${filters ? `&${filters}` : ''}`;
    const data = await getRows('businesses', query);
    return paged((data ?? []).map(mapBusiness), limit, offset);
  },

  async getPosts(params: { governorate?: string; limit?: number; offset?: number } = {}): Promise<PaginatedResponse<Post>> {
    const limit = params.limit ?? 6;
    const offset = params.offset ?? 0;
    const gov = toGov(params.governorate);
    const query = `select=*&order=created_at.desc&limit=${limit}&offset=${offset}${gov ? `&governorate.eq.${gov}` : ''}`;
    return paged((await getRows('posts', query)).map(mapPost), limit, offset);
  },

  async getDeals(params: { governorate?: string; limit?: number; offset?: number } = {}): Promise<PaginatedResponse<Deal>> {
    const limit = params.limit ?? 6;
    const offset = params.offset ?? 0;
    const gov = toGov(params.governorate);
    const query = `select=*&order=created_at.desc&limit=${limit}&offset=${offset}${gov ? `&governorate.eq.${gov}` : ''}`;
    return paged((await getRows('deals', query)).map(mapDeal), limit, offset);
  },

  async getStories(params: { governorate?: string; limit?: number; offset?: number } = {}): Promise<PaginatedResponse<Story>> {
    const limit = params.limit ?? 8;
    const offset = params.offset ?? 0;
    const gov = toGov(params.governorate);
    const query = `select=*&order=created_at.desc&limit=${limit}&offset=${offset}${gov ? `&governorate.eq.${gov}` : ''}`;
    return paged((await getRows('stories', query)).map(mapStory), limit, offset);
  },

  async getEvents(params: { category?: string; governorate?: string; limit?: number; offset?: number } = {}): Promise<PaginatedResponse<Event>> {
    const limit = params.limit ?? 6;
    const offset = params.offset ?? 0;
    const gov = toGov(params.governorate);
    const query = `select=*&order=date.asc&limit=${limit}&offset=${offset}${params.category ? `&category.eq.${params.category}` : ''}${gov ? `&governorate.eq.${gov}` : ''}`;
    return paged((await getRows('events', query)).map(mapEvent), limit, offset);
  },

  async createPost(postData: Partial<Post>) {
    const payload = { business_id: postData.businessId, business_name: postData.businessName, business_avatar: postData.businessAvatar, caption: postData.caption, image_url: postData.imageUrl, likes: 0 };
    const res = await supabase.from('posts', 'select=id', { method: 'POST', body: JSON.stringify(payload), headers: { Prefer: 'return=representation' } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create post');
    return { success: true, id: data[0]?.id };
  },

  async getOrCreateProfile(authUser: SupabaseSessionUser, requestedRole: 'user' | 'owner' = 'user') {
    const found = await getRows('users', `select=*&id=eq.${authUser.id}&limit=1`);
    if (found?.length) return found[0] as User;
    const newUser: User = { id: authUser.id, name: authUser.user_metadata?.full_name ?? authUser.email?.split('@')[0] ?? 'User', email: authUser.email ?? '', avatar: authUser.user_metadata?.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`, role: requestedRole, businessId: requestedRole === 'owner' ? `b_${authUser.id}` : undefined };
    const res = await supabase.from('users', '', { method: 'POST', body: JSON.stringify(newUser) });
    if (!res.ok) throw new Error('Failed to create user profile');
    return newUser;
  },

  async upsertPostcard(postcard: BusinessPostcard) {
    const payload = { ...postcard, updated_at: new Date().toISOString() };
    const res = await supabase.from('business_postcards', 'on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to upsert postcard');
    return { success: true, id: data[0]?.id || postcard.id };
  },

  async getPostcards(governorate?: string) {
    const gov = toGov(governorate);
    const data = await getRows('business_postcards', `select=*&order=updated_at.desc${gov ? `&governorate.eq.${gov}` : ''}`);
    return (data ?? []).map((item: any) => ({ ...item, updatedAt: toDate(item.updated_at) })) as BusinessPostcard[];
  },

  async updateProfile(userId: string, data: Partial<User>) {
    const query = buildQuery({ id: `eq.${userId}` });
    const res = await supabase.from('users', query, { method: 'PATCH', body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }) });
    if (!res.ok) throw new Error('Failed to update profile');
    return { success: true };
  },
};
