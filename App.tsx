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
import { TranslationProvider } from './hooks/useTranslations';
import { AppSettingsProvider, useAppSettings } from './hooks/useAppSettings';
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
            <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:shadow-glow-primary transition-all">{getTranslation('error.refresh')}</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainContent: React.FC = () => {
  const { governorate, setGovernorate } = useAppSettings();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [page, setPage] = useState<'home' | 'dashboard' | 'listing'>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [listingFilter, setListingFilter] = useState<{ categoryId?: string; city?: string; governorate?: string } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [socialPage, setSocialPage] = useState(0);
  const [socialHasMore, setSocialHasMore] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(true);
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('iraq-compass-high-contrast') === 'true');

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error('Session init error:', error.message);
      const sessionUser = data.session?.user;
      if (sessionUser && isMounted) {
        const role = (sessionStorage.getItem('pending_role') as 'user' | 'owner' | null) || 'user';
        const profile = await api.getOrCreateProfile(sessionUser, role);
        if (isMounted) {
          setCurrentUser(profile);
          setIsLoggedIn(true);
        }
        sessionStorage.removeItem('pending_role');
      }
      if (isMounted) setIsAuthReady(true);
    };

    initializeSession().catch((e) => {
      console.error('Auth initialization failed:', e);
      if (isMounted) setIsAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!isMounted) return;
      try {
        if (session?.user) {
          const role = (sessionStorage.getItem('pending_role') as 'user' | 'owner' | null) || 'user';
          const profile = await api.getOrCreateProfile(session.user, role);
          if (isMounted) {
            setCurrentUser(profile);
            setIsLoggedIn(true);
          }
          sessionStorage.removeItem('pending_role');
        } else {
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchPosts = async (isLoadMore = false) => {
    setIsSocialLoading(true);
    try {
      const pageToFetch = isLoadMore ? socialPage : 0;
      const result = await api.getPosts({ page: pageToFetch, limit: 8, governorate });
      setPosts((prev) => (isLoadMore ? [...prev, ...result.data] : result.data));
      setSocialPage(result.nextPage);
      setSocialHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed loading posts:', error);
      if (!isLoadMore) setPosts([]);
    } finally {
      setIsSocialLoading(false);
    }
  };

  useEffect(() => {
    setSocialPage(0);
    fetchPosts(false);
  }, [governorate]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
      localStorage.setItem('iraq-compass-high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-contrast');
      localStorage.setItem('iraq-compass-high-contrast', 'false');
    }
  }, [highContrast]);

  const handleLogin = (_role: 'user' | 'owner') => setShowAuthModal(false);

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
    if (category.subcategories && category.subcategories.length > 0) {
      setSelectedCategory(category);
    } else {
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
          {page === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <HomePage
                posts={posts}
                isSocialLoading={isSocialLoading}
                isSocialHasMore={socialHasMore}
                onLoadMoreSocial={() => fetchPosts(true)}
                onRequireAuth={() => setShowAuthModal(true)}
                isLoggedIn={isLoggedIn}
                onCategoryClick={handleCategoryClick}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                onSearch={handleSearch}
                selectedGovernorate={governorate}
                onGovernorateChange={handleGovernorateChange}
                highContrast={highContrast}
                setHighContrast={setHighContrast}
                onHeroExplore={() => setPage('listing')}
                onHeroLearnMore={() => document.getElementById('featured-section')?.scrollIntoView({ behavior: 'smooth' })}
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
      <AppSettingsProvider>
        <MainContent />
      </AppSettingsProvider>
    </TranslationProvider>
  </ErrorBoundary>
);

export default App;
