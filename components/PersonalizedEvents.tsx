import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Event } from '../types';
import { Sparkles, MapPin, Clock, Users, Calendar } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';
import { motion, AnimatePresence } from 'motion/react';

export const PersonalizedEvents: React.FC = () => {
  const [activeTab, setActiveTab] = useState('forYou');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);
  const { t } = useTranslations();

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 5000);

    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Map tabs to categories if needed, or just fetch all for now
        const categoryMap: Record<string, string | undefined> = {
          'forYou': undefined,
          'trending': 'entertainment',
          'nearYou': 'food',
          'friendsGoing': 'business'
        };
        const data = await api.getEvents({ category: categoryMap[activeTab] });
        if (isMounted) {
          setEvents(data);
          setVisibleCount(3);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };
    fetchEvents();
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [activeTab]);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          {t('events.personalizedTitle')}
        </h2>
        <div className="flex justify-center gap-4 mb-12 overflow-x-auto scrollbar-hide pb-4">
          {['forYou', 'trending', 'nearYou', 'friendsGoing'].map((tab) => (
            <button
              key={tab}
              className={`flex-shrink-0 px-8 py-4 rounded-2xl backdrop-blur-3xl border transition-all duration-500 font-black text-xs uppercase tracking-widest ${activeTab === tab ? 'bg-white text-black border-white shadow-glow-white scale-105' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}`}
              onClick={() => setActiveTab(tab)}
            >
              {t(`events.tabs.${tab}`)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-white/40 font-black uppercase tracking-widest animate-pulse">{t('events.scanning') || 'Scanning for events...'}</p>
          </div>
        ) : (
          <div key={activeTab} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.length === 0 ? (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-center backdrop-blur-3xl bg-white/5 rounded-[40px] border border-white/10">
                <Calendar className="w-20 h-20 text-white/10 mb-8" />
                <h3 className="text-white font-black text-2xl mb-2 uppercase tracking-tight">{t('events.noEventsTitle') || 'No Events Found'}</h3>
                <p className="text-white/40 text-base max-w-xs mx-auto font-medium">
                    {t('events.noEvents') || "We couldn't find any events matching this criteria."}
                </p>
              </div>
            ) : (
              events.slice(0, visibleCount).map((event, index) => (
                <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                    <GlassCard className="group relative overflow-hidden hover:shadow-glow-primary/20 transition-all duration-500 text-start p-0 bg-black/40 backdrop-blur-3xl border-white/10 hover:border-primary/30 rounded-[32px]">
                        <div className="relative h-64 overflow-hidden">
                            <img 
                                src={event.image} 
                                alt={event.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                            
                            {event.aiRecommended && (
                                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-primary/90 backdrop-blur-md flex items-center gap-2 border border-white/20 shadow-2xl">
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                    <span className="text-white text-[10px] font-black uppercase tracking-widest">{t('events.aiPick') || 'AI Pick'}</span>
                                </div>
                            )}

                            <div className="absolute top-4 right-4 backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-3 text-center min-w-[70px] shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                <div className="text-white font-black text-2xl leading-none mb-1">{event.date.getDate()}</div>
                                <div className="text-white/60 text-[10px] font-black uppercase tracking-widest">{event.date.toLocaleString('default', { month: 'short' })}</div>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter bg-secondary/20 text-secondary border border-secondary/30 backdrop-blur-md">
                                        {event.category || 'Event'}
                                    </span>
                                </div>
                                <h3 className="text-white font-black text-2xl tracking-tight leading-tight group-hover:text-secondary transition-colors duration-300 line-clamp-2">
                                    {event.titleKey ? t(event.titleKey) : event.title}
                                </h3>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest text-white/40">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="truncate">{event.venueKey ? t(event.venueKey) : (event.venue || event.location)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-secondary" />
                                    <span>{event.attendees} {t('events.going')}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{t('events.tickets') || 'Tickets From'}</span>
                                    <span className="text-white font-black text-xl tracking-tighter">
                                        {event.price === 0 ? t('events.free') : `${event.price.toLocaleString()} IQD`}
                                    </span>
                                </div>
                                <button className="relative overflow-hidden group/btn px-6 py-3.5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest transition-all duration-300 hover:shadow-glow-white active:scale-95">
                                    <span className="relative z-10">{t('events.viewDetails')}</span>
                                    <div className="absolute inset-0 bg-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
              ))
            )}
          </div>
        )}

        {events.length > 0 && (
          <div className="mt-10 space-y-3">
            {visibleCount < events.length ? (
              <button onClick={() => setVisibleCount((prev) => prev + 3)} className="w-full py-4 rounded-2xl bg-gradient-to-r from-secondary to-primary text-white font-bold hover:-translate-y-0.5 transition-all cursor-pointer">
                Load more events
              </button>
            ) : (
              <p className="text-center text-white/50">You reached the end</p>
            )}
            <p className="text-center text-xs uppercase tracking-widest text-white/40">Events in your selected governorate</p>
          </div>
        )}
      </div>
    </section>
  );
};
