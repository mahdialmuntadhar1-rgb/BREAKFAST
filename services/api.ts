import { supabase, type SupabaseAuthUser } from './supabase';
import type { Business, Post, User, BusinessPostcard, Deal, Story, Event } from '../types';

const PAGE_SIZE_DEFAULT = 20;

const normalizePost = (row: any): Post => ({
  ...row,
  createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
  likes: row.likes ?? 0,
  isVerified: row.isVerified ?? row.verified ?? false,
});

export const api = {
  async getBusinesses(params: { category?: string; city?: string; governorate?: string; page?: number; limit?: number; featuredOnly?: boolean } = {}) {
    const page = params.page ?? 0;
    const pageSize = params.limit ?? PAGE_SIZE_DEFAULT;
    let query = supabase.from('businesses').select('*', { count: 'exact' }).order('name', { ascending: true });

    if (params.category && params.category !== 'all') query = query.eq('category', params.category);
    if (params.city?.trim()) query = query.ilike('city', `%${params.city.trim()}%`);
    if (params.governorate && params.governorate !== 'all') query = query.eq('governorate', params.governorate);
    if (params.featuredOnly) query = query.eq('isFeatured', true);

    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return {
      data: (data ?? []).map((d) => ({ ...d, isVerified: d.isVerified ?? d.verified ?? false })) as Business[],
      hasMore: count !== null ? to + 1 < count : (data?.length ?? 0) === pageSize,
    };
  },

  subscribeToPosts(callback: (posts: Post[]) => void, page = 0, limit = 50) {
    const fetchPosts = async () => {
      const from = page * limit;
      const to = from + limit - 1;
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('createdAt', { ascending: false })
        .range(from, to);
      if (error) {
        console.error('subscribeToPosts fetch error:', error);
        callback([]);
        return;
      }
      callback((data ?? []).map(normalizePost));
    };

    fetchPosts();

    const channel = supabase.channel('posts-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        void fetchPosts();
      }).subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },

  async getDeals(page = 0, limit = 10) {
    const from = page * limit;
    const to = from + limit - 1;
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('createdAt', { ascending: false })
      .range(from, to);
    if (error) throw error;
    return (data ?? []) as Deal[];
  },

  async getStories(page = 0, limit = 20) {
    const from = page * limit;
    const to = from + limit - 1;
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('createdAt', { ascending: false })
      .range(from, to);
    if (error) throw error;
    return (data ?? []) as Story[];
  },

  async getEvents(params: { category?: string; governorate?: string; page?: number; limit?: number } = {}) {
    const page = params.page ?? 0;
    const limit = params.limit ?? 20;
    const from = page * limit;
    const to = from + limit - 1;

    let query = supabase.from('events').select('*').order('date', { ascending: true });
    if (params.category && params.category !== 'all') query = query.eq('category', params.category);
    if (params.governorate && params.governorate !== 'all') query = query.eq('governorate', params.governorate);

    const { data, error } = await query.range(from, to);
    if (error) throw error;

    return (data ?? []).map((event: any) => ({ ...event, date: event.date ? new Date(event.date) : new Date() })) as Event[];
  },

  async createPost(postData: Partial<Post>) {
    const { data, error } = await supabase
      .from('posts')
      .insert({ ...postData, likes: postData.likes ?? 0, createdAt: new Date().toISOString() });

    if (error) throw error;
    const inserted = Array.isArray(data) ? data[0] : data;
    return { success: true, id: inserted?.id as string };
  },

  async getOrCreateProfile(authUser: SupabaseAuthUser, requestedRole: 'user' | 'owner' = 'user') {
    if (!authUser) return null;

    const { data: existing, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
    if (fetchError) throw fetchError;

    const adminEmail = 'safaribosafar@gmail.com';
    const isAdminEmail = authUser.email === adminEmail;

    if (existing) {
      if (isAdminEmail && existing.role !== 'admin') {
        const updated = { ...existing, role: 'admin' as const };
        const { error } = await supabase.from('users').eq('id', authUser.id).update({ role: 'admin' });
        if (error) throw error;
        return updated as User;
      }
      return existing as User;
    }

    const newUser: User = {
      id: authUser.id,
      name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      avatar: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
      role: isAdminEmail ? 'admin' : requestedRole,
      businessId: requestedRole === 'owner' ? `b_${authUser.id}` : undefined,
    };

    const { error: insertError } = await supabase.from('users').insert(newUser);
    if (insertError) throw insertError;
    return newUser;
  },

  async upsertPostcard(postcard: BusinessPostcard) {
    const { data, error } = await supabase
      .from('business_postcards')
      .upsert({ ...postcard, updatedAt: new Date().toISOString() }, { onConflict: 'id' });
    if (error) throw error;
    const upserted = Array.isArray(data) ? data[0] : data;
    return { success: true, id: upserted?.id as string | undefined };
  },

  async getPostcards(governorate?: string) {
    let query = supabase.from('business_postcards').select('*').order('updatedAt', { ascending: false });
    if (governorate && governorate !== 'all') query = query.eq('governorate', governorate);
    const { data, error } = await query.exec();
    if (error) throw error;
    return (data ?? []) as BusinessPostcard[];
  },

  async updateProfile(userId: string, data: Partial<User>) {
    const { error } = await supabase
      .from('users')
      .eq('id', userId)
      .update({ ...data, updatedAt: new Date().toISOString() });
    if (error) throw error;
    return { success: true };
  },
};
