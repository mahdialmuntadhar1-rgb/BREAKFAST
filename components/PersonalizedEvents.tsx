import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Event } from '../types';
import { Sparkles, MapPin, Users, Calendar } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';
import { motion } from 'motion/react';

export const PersonalizedEvents: React.FC = () => {
  const [activeTab, setActiveTab] = useState('forYou');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const { t } = useTranslations();

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const categoryMap: Record<string, string | undefined> = {
          forYou: undefined,
          trending: 'entertainment',
          nearYou: 'food',
          friendsGoing: 'business'
        };
        const data = await api.getEvents({ category: categoryMap[activeTab] });
        setEvents(data);
        setVisibleCount(6);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [activeTab]);

  const visibleEvents = events.slice(0, visibleCount);

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <p className="text-center text-white/60 mb-8">Events in Sulaymaniyah</p>
        <div className="flex justify-center gap-4 mb-12 overflow-x-auto scrollbar-hide pb-4">
          {['forYou', 'trending', 'nearYou', 'friendsGoing'].map((tab) => (
            <button key={tab} className={`flex-shrink-0 px-8 py-4 rounded-2xl backdrop-blur-3xl border transition-all duration-300 font-black text-xs uppercase tracking-widest cursor-pointer hover:-translate-y-0.5 ${activeTab === tab ? 'bg-white text-black border-white shadow-glow-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`} onClick={() => setActiveTab(tab)}>
              {t(`events.tabs.${tab}`)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <div key={i} className="h-72 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />)}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.length === 0 ? (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-center backdrop-blur-3xl bg-white/5 rounded-[40px] border border-white/10">
                  <Calendar className="w-20 h-20 text-white/10 mb-8" />
                  <h3 className="text-white font-black text-2xl mb-2">No events found</h3>
                  <p className="text-white/40 text-base max-w-xs mx-auto">Try another category or check back later.</p>
                </div>
              ) : (
                visibleEvents.map((event, index) => (
                  <motion.div key={event.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }}>
                    <GlassCard className="group relative overflow-hidden hover:shadow-glow-primary/20 transition-all duration-500 text-start p-0 bg-black/40 backdrop-blur-3xl border-white/10 hover:border-primary/30 rounded-[24px] hover:-translate-y-1 cursor-pointer">
                      <div className="relative h-64 overflow-hidden">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                        {event.aiRecommended && <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-primary/90 backdrop-blur-md flex items-center gap-2 border border-white/20"><Sparkles className="w-3.5 h-3.5 text-white" /><span className="text-white text-[10px] font-black uppercase tracking-widest">AI Pick</span></div>}
                        <div className="absolute top-4 right-4 backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-3 text-center min-w-[70px]"><div className="text-white font-black text-2xl leading-none mb-1">{event.date.getDate()}</div><div className="text-white/60 text-[10px] font-black uppercase tracking-widest">{event.date.toLocaleString('default', { month: 'short' })}</div></div>
                        <div className="absolute bottom-4 left-4 right-4"><h3 className="text-white font-black text-2xl tracking-tight leading-tight line-clamp-2">{event.titleKey ? t(event.titleKey) : event.title}</h3></div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-white/60">
                          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /><span className="truncate">{event.venueKey ? t(event.venueKey) : (event.venue || event.location)}</span></div>
                          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-secondary" /><span>{event.attendees} going</span></div>
                        </div>
                        <div className="text-white/70 text-sm">{event.category} • {event.governorate}</div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              )}
            </div>

            {events.length > visibleCount && (
              <div className="mt-8 rounded-2xl border border-white/15 bg-white/[0.03] p-4">
                <button onClick={() => setVisibleCount(prev => prev + 3)} className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-glow-primary transition-all">Load more events</button>
              </div>
            )}
            {events.length > 0 && events.length <= visibleCount && <p className="mt-8 text-center text-white/60 text-sm">You reached the end.</p>}
          </>
        )}
      </div>
    </section>
  );
};
