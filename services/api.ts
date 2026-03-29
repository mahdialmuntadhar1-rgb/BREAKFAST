import { supabase } from './supabase';
import type { Business, Post, User, BusinessPostcard, Deal, Event, Story } from '../types';

const toDate = (value: string | Date | null | undefined) => (value ? new Date(value) : new Date());

export const api = {
  async getBusinesses(params: { category?: string; city?: string; governorate?: string; page?: number; limit?: number; featuredOnly?: boolean } = {}) {
    const page = params.page ?? 0;
    const pageSize = params.limit ?? 20;

    let query = supabase.from('businesses').select('*').order('name', { ascending: true });
    if (params.category && params.category !== 'all') query = query.eq('category', params.category);
    if (params.governorate && params.governorate !== 'all') query = query.eq('governorate', params.governorate);
    if (params.city?.trim()) query = query.ilike('city', `%${params.city.trim()}%`);
    if (params.featuredOnly) query = query.eq('isFeatured', true);

    const { data, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) throw error;

    return {
      data: (data ?? []) as Business[],
      hasMore: (data?.length ?? 0) === pageSize,
      page,
    };
  },

  subscribeToPosts(callback: (posts: Post[]) => void, page = 0, limit = 50) {
    const fetchPage = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('createdAt', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (!error) {
        callback((data ?? []).map((post: any) => ({ ...post, createdAt: toDate(post.createdAt) } as Post)));
      }
    };

    void fetchPage();

    const channel = supabase
      .channel(`posts:${page}:${limit}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        void fetchPage();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },

  async getDeals(params: { page?: number; limit?: number } = {}) {
    const page = params.page ?? 0;
    const limit = params.limit ?? 10;
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('createdAt', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
    if (error) throw error;
    return (data ?? []) as Deal[];
  },

  async getStories(params: { page?: number; limit?: number } = {}) {
    const page = params.page ?? 0;
    const limit = params.limit ?? 20;
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('createdAt', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
    if (error) throw error;
    return (data ?? []) as Story[];
  },

  async getEvents(params: { category?: string; governorate?: string; page?: number; limit?: number } = {}) {
    const page = params.page ?? 0;
    const limit = params.limit ?? 20;
    let query = supabase.from('events').select('*').order('date', { ascending: true });
    if (params.category && params.category !== 'all') query = query.eq('category', params.category);
    if (params.governorate && params.governorate !== 'all') query = query.eq('governorate', params.governorate);

    const { data, error } = await query.range(page * limit, (page + 1) * limit - 1);
    if (error) throw error;
    return (data ?? []).map((event: any) => ({ ...event, date: toDate(event.date) } as Event));
  },

  async createPost(postData: Partial<Post>) {
    const { data, error } = await supabase.from('posts').insert({ ...postData, likes: postData.likes ?? 0 }).select('id').single();
    if (error) throw error;
    return { success: true, id: data.id };
  },

  async getOrCreateProfile(authUser: { id: string; email?: string; user_metadata?: { full_name?: string; avatar_url?: string } } | null, requestedRole: 'user' | 'owner' = 'user') {
    if (!authUser) return null;

    const { data: existing, error: fetchError } = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();
    if (fetchError) throw fetchError;

    const adminEmail = 'safaribosafar@gmail.com';
    const isAdminEmail = authUser.email === adminEmail;

    if (existing) {
      if (isAdminEmail && existing.role !== 'admin') {
        const { data: updated, error } = await supabase.from('users').update({ role: 'admin' }).eq('id', authUser.id).select('*').single();
        if (error) throw error;
        return updated as User;
      }
      return existing as User;
    }

    const profile: User = {
      id: authUser.id,
      name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      avatar: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
      role: isAdminEmail ? 'admin' : requestedRole,
      businessId: requestedRole === 'owner' ? `b_${authUser.id}` : undefined,
    };

    const { data: inserted, error: insertError } = await supabase.from('users').insert(profile).select('*').single();
    if (insertError) throw insertError;
    return inserted as User;
  },

  async upsertPostcard(postcard: BusinessPostcard) {
    const { data, error } = await supabase.from('business_postcards').upsert(postcard).select('id').single();
    if (error) throw error;
    return { success: true, id: data.id };
  },

  async getPostcards(governorate?: string) {
    let query = supabase.from('business_postcards').select('*').order('updatedAt', { ascending: false });
    if (governorate && governorate !== 'all') query = query.eq('governorate', governorate);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as BusinessPostcard[];
  },

  async updateProfile(userId: string, data: Partial<User>) {
    const { error } = await supabase.from('users').update({ ...data, updatedAt: new Date().toISOString() }).eq('id', userId);
    if (error) throw error;
    return { success: true };
  },
};
