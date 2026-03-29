import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BusinessDirectory } from './components/BusinessDirectory';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { SubcategoryModal } from './components/SubcategoryModal';
import { HomePage } from './components/HomePage';
import { api } from './services/api';
import { supabase } from './services/supabase';
import type { User, Category, Subcategory, Post } from './types';
import { TranslationProvider, useTranslations } from './hooks/useTranslations';
import { AppStateProvider, useAppState } from './hooks/useAppState';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from './constants';

const getTranslation = (key: string) => {
  const lang = (localStorage.getItem('iraq-compass-lang') as 'en' | 'ar' | 'ku') || 'en';
  const keys = key.split('.');
  let result: any = translations[lang];
  for (const k of keys) result = result?.[k];
  return result || key;
};

class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: any) { console.error('Uncaught error:', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 text-center"><div className="max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"><h2 className="text-2xl font-bold text-white mb-4">{getTranslation('error.title')}</h2><p className="text-white/60 mb-6">{getTranslation('error.unexpected')}</p><button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl bg-primary text-white font-semibold">{getTranslation('error.refresh')}</button></div></div>;
    }
    return this.props.children;
  }
}

const MainContent: React.FC = () => {
  const { t } = useTranslations();
  const { governorate, setGovernorate } = useAppState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [page, setPage] = useState<'home' | 'dashboard' | 'listing'>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [listingFilter, setListingFilter] = useState<{ categoryId?: string; city?: string; governorate?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsCursor, setPostsCursor] = useState<number | null>(0);
  const [postsHasMore, setPostsHasMore] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(true);
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('iraq-compass-high-contrast') === 'true');

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error(error);
      const sessionUser = data.session?.user;
      if (sessionUser) {
        const role = (sessionStorage.getItem('pending_role') as 'user' | 'owner' | null) || 'user';
        const profile = await api.getOrCreateProfile(sessionUser, role);
        if (mounted) {
          setCurrentUser(profile);
          setIsLoggedIn(true);
        }
        sessionStorage.removeItem('pending_role');
      }
      if (mounted) setIsAuthReady(true);
    };

    initialize();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const role = (sessionStorage.getItem('pending_role') as 'user' | 'owner' | null) || 'user';
        const profile = await api.getOrCreateProfile(session.user, role);
        setCurrentUser(profile);
        setIsLoggedIn(true);
        sessionStorage.removeItem('pending_role');
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const fetchPosts = async (loadMore = false) => {
    if (!loadMore) setIsSocialLoading(true);
    try {
      const cursor = loadMore ? postsCursor ?? 0 : 0;
      const result = await api.getPosts({ cursor, limit: 10, governorate });
      setPosts((prev) => (loadMore ? [...prev, ...result.data] : result.data));
      setPostsCursor(result.nextCursor);
      setPostsHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to fetch posts', error);
      setPosts([]);
      setPostsHasMore(false);
    } finally {
      setIsSocialLoading(false);
    }
  };

  useEffect(() => { fetchPosts(false); }, [governorate]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
      localStorage.setItem('iraq-compass-high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-contrast');
      localStorage.setItem('iraq-compass-high-contrast', 'false');
    }
  }, [highContrast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setPage('home');
  };

  const navigateTo = (targetPage: 'home' | 'dashboard') => {
    if (targetPage === 'dashboard' && !isLoggedIn) setShowAuthModal(true);
    else {
      setPage(targetPage);
      if (targetPage === 'home') setListingFilter(null);
    }
  };

  const handleCategoryClick = (category: Category) => {
    if (category.subcategories?.length) setSelectedCategory(category);
    else {
      setListingFilter({ categoryId: category.id, governorate: governorate !== 'all' ? governorate : undefined });
      setPage('listing');
    }
  };

  const handleSubcategorySelect = (category: Category, _subcategory: Subcategory) => {
    setListingFilter({ categoryId: category.id, governorate: governorate !== 'all' ? governorate : undefined });
    setPage('listing');
    setSelectedCategory(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setListingFilter({ city: query, governorate: governorate !== 'all' ? governorate : undefined });
    setPage('listing');
  };

  const handleGovernorateChange = (gov: string) => {
    setGovernorate(gov);
    if (page === 'listing') setListingFilter((prev) => ({ ...prev, governorate: gov !== 'all' ? gov : undefined }));
  };

  if (!isAuthReady) {
    return <div className="min-h-screen bg-dark-bg flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Header isLoggedIn={isLoggedIn} user={currentUser} onSignIn={() => setShowAuthModal(true)} onSignOut={handleLogout} onDashboard={() => navigateTo('dashboard')} onHome={() => navigateTo('home')} />
      <main>
        <AnimatePresence mode="wait">
          {page === 'home' && <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}><HomePage posts={posts} isSocialLoading={isSocialLoading} postsHasMore={postsHasMore} onLoadMorePosts={() => fetchPosts(true)} isLoggedIn={isLoggedIn} onProtectedAction={() => setShowAuthModal(true)} onCategoryClick={handleCategoryClick} currentPage={currentPage} setCurrentPage={setCurrentPage} onSearch={handleSearch} selectedGovernorate={governorate} onGovernorateChange={handleGovernorateChange} highContrast={highContrast} setHighContrast={setHighContrast} /></motion.div>}
          {page === 'listing' && listingFilter && <motion.div key="listing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}><BusinessDirectory initialFilter={listingFilter} onBack={() => navigateTo('home')} /></motion.div>}
          {page === 'dashboard' && currentUser && <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><Dashboard user={currentUser} onLogout={handleLogout} /></motion.div>}
        </AnimatePresence>
      </main>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onLogin={(_role) => setShowAuthModal(false)} />}
      <SubcategoryModal category={selectedCategory} onClose={() => setSelectedCategory(null)} onSubcategorySelect={handleSubcategorySelect} />
    </div>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <TranslationProvider>
      <AppStateProvider>
        <MainContent />
      </AppStateProvider>
    </TranslationProvider>
  </ErrorBoundary>
);

export default App;
