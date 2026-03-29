import React, { useEffect, useState } from 'react';
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
import { AppPreferencesProvider, useAppPreferences } from './hooks/useAppPreferences';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from './constants';

const getTranslation = (key: string) => {
  const lang = (localStorage.getItem('iraq-compass-lang') as 'en' | 'ar' | 'ku') || 'en';
  const keys = key.split('.');
  let result: any = translations[lang];
  for (const k of keys) result = result?.[k];
  if (!result) {
    result = translations.en;
    for (const k of keys) result = result?.[k];
  }
  return result || key;
};

class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('Uncaught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 text-center">
          <div className="max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-white mb-4">{getTranslation('error.title')}</h2>
            <p className="text-white/60 mb-6">{getTranslation('error.unexpected')}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:shadow-glow-primary transition-all">
              {getTranslation('error.refresh')}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainContent: React.FC = () => {
  const { governorate, setGovernorate } = useAppPreferences();
  const { t } = useTranslations();
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
  const [postsOffset, setPostsOffset] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(true);
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('iraq-compass-high-contrast') === 'true');

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
      }
      const sessionUser = data.session?.user;
      if (sessionUser) {
        const pendingRole = (sessionStorage.getItem('pending_role') as 'user' | 'owner' | null) || 'user';
        const profile = await api.getOrCreateProfile(sessionUser, pendingRole);
        if (mounted) {
          setCurrentUser(profile);
          setIsLoggedIn(true);
        }
        sessionStorage.removeItem('pending_role');
      }
      if (mounted) setIsAuthReady(true);
    };

    initSession();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (!session?.user) {
        setCurrentUser(null);
        setIsLoggedIn(false);
        return;
      }
      const pendingRole = (sessionStorage.getItem('pending_role') as 'user' | 'owner' | null) || 'user';
      const profile = await api.getOrCreateProfile(session.user, pendingRole);
      setCurrentUser(profile);
      setIsLoggedIn(true);
      sessionStorage.removeItem('pending_role');
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      setIsSocialLoading(true);
      try {
        const result = await api.getPosts({ governorate, limit: 6, offset: 0 });
        setPosts(result.data);
        setPostsOffset(result.nextOffset);
        setHasMorePosts(result.hasMore);
      } catch (error) {
        console.error('Failed to load posts', error);
        setPosts([]);
        setHasMorePosts(false);
      } finally {
        setIsSocialLoading(false);
      }
    };

    loadPosts();
  }, [governorate]);

  useEffect(() => {
    document.documentElement.toggleAttribute('data-contrast', highContrast);
    localStorage.setItem('iraq-compass-high-contrast', String(highContrast));
  }, [highContrast]);

  const handleLoadMorePosts = async () => {
    if (!hasMorePosts) return;
    const result = await api.getPosts({ governorate, limit: 6, offset: postsOffset });
    setPosts((prev) => [...prev, ...result.data]);
    setPostsOffset(result.nextOffset);
    setHasMorePosts(result.hasMore);
  };

  const handleLogin = () => setShowAuthModal(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setPage('home');
  };

  const navigateTo = (targetPage: 'home' | 'dashboard') => {
    if (targetPage === 'dashboard' && !isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setPage(targetPage);
    if (targetPage === 'home') setListingFilter(null);
  };

  const handleCategoryClick = (category: Category) => {
    if (category.subcategories?.length) {
      setSelectedCategory(category);
      return;
    }
    setListingFilter({ categoryId: category.id, governorate: governorate !== 'all' ? governorate : undefined });
    setPage('listing');
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

  if (!isAuthReady) {
    return <div className="min-h-screen bg-dark-bg flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Header isLoggedIn={isLoggedIn} user={currentUser} onSignIn={() => setShowAuthModal(true)} onSignOut={handleLogout} onDashboard={() => navigateTo('dashboard')} onHome={() => navigateTo('home')} />
      <main>
        <AnimatePresence mode="wait">
          {page === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <HomePage
                posts={posts}
                isSocialLoading={isSocialLoading}
                hasMorePosts={hasMorePosts}
                onLoadMorePosts={handleLoadMorePosts}
                onRequireAuth={() => setShowAuthModal(true)}
                isLoggedIn={isLoggedIn}
                onCategoryClick={handleCategoryClick}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                onSearch={handleSearch}
                selectedGovernorate={governorate}
                onGovernorateChange={setGovernorate}
                highContrast={highContrast}
                setHighContrast={setHighContrast}
                onExploreNow={() => setPage('listing')}
                onLearnMore={() => document.getElementById('featured-section')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </motion.div>
          )}
          {page === 'listing' && listingFilter && (
            <motion.div key="listing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <BusinessDirectory initialFilter={listingFilter} onBack={() => navigateTo('home')} />
            </motion.div>
          )}
          {page === 'dashboard' && currentUser && (
            <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
              <Dashboard user={currentUser} onLogout={handleLogout} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />}
      <SubcategoryModal category={selectedCategory} onClose={() => setSelectedCategory(null)} onSubcategorySelect={handleSubcategorySelect} />
    </div>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <TranslationProvider>
      <AppPreferencesProvider>
        <MainContent />
      </AppPreferencesProvider>
    </TranslationProvider>
  </ErrorBoundary>
);

export default App;
