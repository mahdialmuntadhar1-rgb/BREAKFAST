import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Event } from '../types';
import { Sparkles, MapPin, Clock, Users, Calendar } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';
import { useAppPreferences } from '../hooks/useAppPreferences';

export const PersonalizedEvents: React.FC = () => {
  const [activeTab, setActiveTab] = useState('forYou');
  const { governorate } = useAppPreferences();
  const [events, setEvents] = useState<Event[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslations();

  const categoryMap: Record<string, string | undefined> = {
    forYou: undefined,
    trending: 'events_entertainment',
    nearYou: 'food_dining',
    friendsGoing: 'business_services',
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      const result = await api.getEvents({ category: categoryMap[activeTab], governorate, limit: 6, offset: 0 });
      setEvents(result.data);
      setOffset(result.nextOffset);
      setHasMore(result.hasMore);
      setIsLoading(false);
    };
    fetchEvents();
  }, [activeTab, governorate]);

  const loadMore = async () => {
    const result = await api.getEvents({ category: categoryMap[activeTab], governorate, limit: 6, offset });
    setEvents((prev) => [...prev, ...result.data]);
    setOffset(result.nextOffset);
    setHasMore(result.hasMore);
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">{t('events.personalizedTitle')}</h2>
        <div className="flex justify-center gap-3 mb-8 overflow-x-auto scrollbar-hide">{['forYou', 'trending', 'nearYou', 'friendsGoing'].map((tab) => <button key={tab} className={`flex-shrink-0 px-6 py-3 rounded-full backdrop-blur-xl border ${activeTab === tab ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-white/70'}`} onClick={() => setActiveTab(tab)}>{t(`events.tabs.${tab}`)}</button>)}</div>

        {isLoading ? <div className="py-16 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{events.length === 0 ? <div className="col-span-full py-12 text-center opacity-50"><Calendar className="w-12 h-12 text-white/20 mb-4 mx-auto" /><p className="text-white/60 text-sm">{t('events.noEvents')}</p></div> : events.map((event) => <GlassCard key={event.id} className="group relative overflow-hidden text-start p-0"><div className="relative h-56 overflow-hidden"><img src={event.image} alt={event.title} className="w-full h-full object-cover" />{event.aiRecommended && <div className="absolute top-3 start-3 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center gap-1"><Sparkles className="w-3 h-3 text-white" /><span className="text-white text-xs font-medium">{t('events.aiPick')}</span></div>}</div><div className="p-5"><h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">{event.title}</h3><div className="space-y-2 text-sm text-white/60 mb-4"><div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{event.venue || event.location}</div><div className="flex items-center gap-2"><Clock className="w-4 h-4" />{event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div><div className="flex items-center gap-2"><Users className="w-4 h-4" />{event.attendees} {t('events.going')}</div></div></div></GlassCard>)}</div>}
        {hasMore && <div className="text-center mt-8"><button onClick={loadMore} className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20">{t('directory.loadMore')}</button></div>}
      </div>
    </section>
  );
};
