import type { Business, BusinessPostcard, Deal, Event, Post, Story, User } from '../types';
import { supabase } from './supabase';

type BusinessParams = {
  category?: string;
  city?: string;
  governorate?: string;
  page?: number;
  limit?: number;
  featuredOnly?: boolean;
};

const normalizeDate = (value: unknown) => {
  if (!value) return new Date();
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  if (typeof value === 'object' && value !== null && 'toDate' in (value as Record<string, unknown>)) {
    return (value as { toDate: () => Date }).toDate();
  }
  return new Date();
};

export const api = {
  async getBusinesses(params: BusinessParams = {}) {
    const page = params.page ?? 0;
    const pageSize = params.limit ?? 20;

    let query = supabase
      .from('businesses')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true });

    if (params.category && params.category !== 'all') query = query.eq('category', params.category);
    if (params.city?.trim()) query = query.ilike('city', `%${params.city.trim()}%`);
    if (params.governorate && params.governorate !== 'all') query = query.eq('governorate', params.governorate);
    if (params.featuredOnly) query = query.eq('isFeatured', true);

    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    const safeData = (data || []) as Business[];
    return {
      data: safeData,
      hasMore: (count ?? 0) > (page + 1) * pageSize,
    };
  },

  subscribeToPosts(callback: (posts: Post[]) => void, page = 0, limit = 50) {
    const fetchPage = async () => {
      const from = page * limit;
      const to = from + limit - 1;
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('createdAt', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Failed to load posts:', error);
        callback([]);
        return;
      }

      callback(
        (data || []).map((row: any) => ({
          ...row,
          createdAt: normalizeDate(row.createdAt),
        })) as Post[],
      );
    };

    fetchPage();

    const channel = supabase
      .channel(`posts-page-${page}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPage();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async getDeals(limit = 10) {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []) as Deal[];
  },

  async getStories(limit = 20) {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []) as Story[];
  },

  async getEvents(params: { category?: string; governorate?: string; page?: number; limit?: number } = {}) {
    const page = params.page ?? 0;
    const pageSize = params.limit ?? 20;

    let query = supabase.from('events').select('*', { count: 'exact' }).order('date', { ascending: true });
    if (params.category && params.category !== 'all') query = query.eq('category', params.category);
    if (params.governorate && params.governorate !== 'all') query = query.eq('governorate', params.governorate);

    const { data, error, count } = await query.range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) throw error;

    return {
      data: ((data || []).map((event: any) => ({ ...event, date: normalizeDate(event.date) })) as Event[]),
      hasMore: (count ?? 0) > (page + 1) * pageSize,
    };
  },

  async createPost(postData: Partial<Post>) {
    const { data, error } = await supabase.from('posts').insert(postData).select('id').single();
    if (error) throw error;
    return { success: true, id: data.id as string };
  },

  async getOrCreateProfile(authUser: any, requestedRole: 'user' | 'owner' = 'user') {
    if (!authUser) return null;

    const { data: existing } = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();
    if (existing) return existing as User;

    const newUser: User = {
      id: authUser.id,
      name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      avatar: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
      role: requestedRole,
      businessId: requestedRole === 'owner' ? `b_${authUser.id}` : undefined,
    };

    const { error } = await supabase.from('users').insert(newUser);
    if (error) throw error;
    return newUser;
  },

  async upsertPostcard(postcard: BusinessPostcard) {
    const { data, error } = await supabase
      .from('business_postcards')
      .upsert({ ...postcard, updatedAt: new Date().toISOString() }, { onConflict: 'id' })
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, id: String(data.id) };
  },

  async getPostcards(governorate?: string) {
    let query = supabase.from('business_postcards').select('*').order('updatedAt', { ascending: false });
    if (governorate && governorate !== 'all') query = query.eq('governorate', governorate);
    const { data, error } = await query.range(0, 999);
    if (error) throw error;
    return (data || []) as BusinessPostcard[];
  },

  async updateProfile(userId: string, data: Partial<User>) {
    const { error } = await supabase
      .from('users')
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
    return { success: true };
  },
};
