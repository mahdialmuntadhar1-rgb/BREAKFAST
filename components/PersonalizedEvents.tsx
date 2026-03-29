import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Event } from '../types';
import { Sparkles, MapPin, Clock, Users, Calendar } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';
import { useAppSettings } from '../hooks/useAppSettings';

export const PersonalizedEvents: React.FC = () => {
  const [activeTab, setActiveTab] = useState('forYou');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const { governorate } = useAppSettings();
  const { t } = useTranslations();

  const categoryMap: Record<string, string | undefined> = { forYou: undefined, trending: 'entertainment', nearYou: 'food', friendsGoing: 'business' };

  const fetchEvents = async (loadMore = false) => {
    setIsLoading(true);
    try {
      const result = await api.getEvents({ category: categoryMap[activeTab], governorate, page: loadMore ? page : 0, limit: 9 });
      setEvents((prev) => (loadMore ? [...prev, ...result.data] : result.data));
      setPage(result.nextPage);
      setHasMore(result.hasMore);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchEvents(false);
  }, [activeTab, governorate]);

  return (
    <section className="py-16"><div className="container mx-auto px-4"><h2 className="text-3xl font-bold text-white mb-8 text-center">{t('events.personalizedTitle')}</h2><div className="flex justify-center gap-3 mb-8 overflow-x-auto scrollbar-hide">{['forYou', 'trending', 'nearYou', 'friendsGoing'].map((tab) => <button key={tab} className={`flex-shrink-0 px-6 py-3 rounded-full backdrop-blur-xl border transition-all duration-200 ${activeTab === tab ? 'bg-primary border-primary text-white shadow-glow-primary' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`} onClick={() => setActiveTab(tab)}>{t(`events.tabs.${tab}`)}</button>)}</div>{isLoading && events.length === 0 ? <div className="py-16 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{events.length === 0 ? <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-50"><Calendar className="w-12 h-12 text-white/20 mb-4" /><p className="text-white/60 text-sm">{t('events.noEvents') || 'No events found for this category.'}</p></div> : events.map((event) => <GlassCard key={event.id} className="group relative overflow-hidden text-start p-0"><div className="relative h-56 overflow-hidden"><img src={event.image} alt={event.title} className="w-full h-full object-cover" />{event.aiRecommended && <div className="absolute top-3 start-3 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary backdrop-blur-sm flex items-center gap-1"><Sparkles className="w-3 h-3 text-white" /><span className="text-white text-xs font-medium">{t('events.aiPick')}</span></div>}</div><div className="p-5"><h3 className="text-white font-semibold text-lg mb-2">{event.titleKey ? t(event.titleKey) : event.title}</h3><div className="space-y-2 text-sm text-white/60 mb-4"><div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{event.venueKey ? t(event.venueKey) : (event.venue || event.location)}</div><div className="flex items-center gap-2"><Clock className="w-4 h-4" />{event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div><div className="flex items-center gap-2"><Users className="w-4 h-4" />{event.attendees} {t('events.going')}</div></div></div></GlassCard>)}</div>}{hasMore && <div className="flex justify-center mt-8"><button onClick={() => fetchEvents(true)} className="px-6 py-3 rounded-xl bg-primary text-white font-semibold">{isLoading ? t('directory.loading') : t('directory.loadMore')}</button></div>}</div></section>
  );
};
