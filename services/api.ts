import { supabase, type SupabaseAuthUser } from './supabase';
import type { Business, Post, User, BusinessPostcard, Deal, Event, Story } from '../types';

const PAGE_SIZE = 20;

type BusinessQueryParams = {
  category?: string;
  city?: string;
  governorate?: string;
  page?: number;
  limit?: number;
  featuredOnly?: boolean;
};

const normalizePost = (post: any): Post => ({
  ...post,
  id: String(post.id),
  createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
  isVerified: post.isVerified ?? post.verified ?? false
});

export const api = {
  async getBusinesses(params: BusinessQueryParams = {}) {
    const page = params.page ?? 0;
    const pageSize = params.limit ?? PAGE_SIZE;

    let query = supabase.from('businesses').select('*').order('name', { ascending: true });

    if (params.featuredOnly) query = query.eq('isFeatured', true);
    if (params.category && params.category !== 'all') query = query.eq('category', params.category);
    if (params.governorate && params.governorate !== 'all') query = query.eq('governorate', params.governorate);
    if (params.city?.trim()) query = query.ilike('city', `%${params.city.trim()}%`);

    const start = page * pageSize;
    const end = start + pageSize - 1;
    const { data, error } = await query.range(start, end).execute();

    if (error) throw error;

    const businesses = (data ?? []).map((row: any) => ({
      ...row,
      id: String(row.id),
      isVerified: row.isVerified ?? row.verified ?? false
    } as Business));

    return {
      data: businesses,
      hasMore: businesses.length >= pageSize,
      page
    };
  },

  async getPosts(params: { page?: number; limit?: number } = {}) {
    const page = params.page ?? 0;
    const limit = params.limit ?? 50;
    const start = page * limit;
    const end = start + limit - 1;

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('createdAt', { ascending: false })
      .range(start, end).execute();

    if (error) throw error;

    const posts = (data ?? []).map(normalizePost);
    return { data: posts, hasMore: posts.length >= limit, page };
  },

  subscribeToPosts(callback: (posts: Post[]) => void) {
    let channel: any = null;

    const loadInitial = async () => {
      const { data } = await this.getPosts({ page: 0, limit: 50 });
      callback(data);
    };

    loadInitial().catch((error) => console.error('Failed to load posts:', error));

    channel = supabase
      .channel('posts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        loadInitial().catch((error) => console.error('Failed to refresh posts:', error));
      })
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  },

  async getDeals() {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(10).execute();

    if (error) throw error;
    return (data ?? []) as Deal[];
  },

  async getStories() {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(20).execute();

    if (error) throw error;
    return (data ?? []) as Story[];
  },

  async getEvents(params: { category?: string; governorate?: string } = {}) {
    let query = supabase.from('events').select('*').order('date', { ascending: true });

    if (params.category && params.category !== 'all') query = query.eq('category', params.category);
    if (params.governorate && params.governorate !== 'all') query = query.eq('governorate', params.governorate);

    const { data, error } = await query.execute();
    if (error) throw error;

    return (data ?? []).map((row: any) => ({ ...row, date: row.date ? new Date(row.date) : new Date() })) as Event[];
  },

  async createPost(postData: Partial<Post>) {
    const { data, error } = await supabase
      .from('posts')
      .insert({ ...postData, createdAt: new Date().toISOString(), likes: 0 })
      .select('id')
      .single().execute();

    if (error) return { success: false };
    return { success: true, id: String(data.id) };
  },

  async getOrCreateProfile(authUser: SupabaseAuthUser, requestedRole: 'user' | 'owner' = 'user') {
    const adminEmail = 'safaribosafar@gmail.com';
    const isAdminEmail = authUser.email === adminEmail;

    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle().execute();

    if (fetchError) throw fetchError;

    if (existingUser) {
      if (isAdminEmail && existingUser.role !== 'admin') {
        const { data: updated } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', authUser.id)
          .select('*')
          .single().execute();

        return updated as User;
      }
      return existingUser as User;
    }

    const newUser: User = {
      id: authUser.id,
      name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      avatar: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
      role: isAdminEmail ? 'admin' : requestedRole,
      businessId: requestedRole === 'owner' ? `b_${authUser.id}` : undefined
    };

    const { data: inserted, error: insertError } = await supabase.from('users').insert(newUser).select('*').single().execute();
    if (insertError) throw insertError;

    return inserted as User;
  },

  async upsertPostcard(postcard: BusinessPostcard) {
    const payload = {
      ...postcard,
      updatedAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('business_postcards')
      .upsert(payload, { onConflict: 'id' })
      .select('id')
      .single().execute();

    if (error) return { success: false };
    return { success: true, id: String(data.id) };
  },

  async getPostcards(governorate?: string) {
    let query = supabase.from('business_postcards').select('*').order('updatedAt', { ascending: false });

    if (governorate && governorate !== 'all') {
      query = query.eq('governorate', governorate);
    }

    const { data, error } = await query.execute();
    if (error) throw error;

    return (data ?? []).map((row: any) => ({
      ...row,
      id: String(row.id),
      verified: row.verified ?? row.isVerified ?? false,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined
    })) as BusinessPostcard[];
  },

  async updateProfile(userId: string, data: Partial<User>) {
    const { error } = await supabase
      .from('users')
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('id', userId)
      .execute();

    return { success: !error };
  }
};
