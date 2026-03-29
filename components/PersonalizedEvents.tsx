import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import type { Event } from '../types';
import { Sparkles, MapPin, Users, Calendar } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';
import { motion } from 'motion/react';

interface PersonalizedEventsProps { selectedGovernorate?: string }

export const PersonalizedEvents: React.FC<PersonalizedEventsProps> = ({ selectedGovernorate = 'all' }) => {
  const [activeTab, setActiveTab] = useState('forYou');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const { t } = useTranslations();

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const categoryMap: Record<string, string | undefined> = { forYou: undefined, trending: 'entertainment', nearYou: 'food', friendsGoing: 'business' };
        const data = await api.getEvents({ category: categoryMap[activeTab] });
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [activeTab]);

  const visibleEvents = useMemo(() => events.slice(0, visibleCount), [events, visibleCount]);
  const hasMore = visibleCount < events.length;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {selectedGovernorate !== 'all' && <p className="mb-4 inline-flex px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">Events in {selectedGovernorate}</p>}
        <div className="flex justify-center gap-4 mb-10 overflow-x-auto scrollbar-hide pb-4">
          {['forYou', 'trending', 'nearYou', 'friendsGoing'].map((tab) => (
            <button key={tab} className={`flex-shrink-0 px-7 py-3 rounded-2xl border transition-all duration-300 font-black text-xs uppercase tracking-widest cursor-pointer hover:-translate-y-0.5 ${activeTab === tab ? 'bg-white text-black border-white shadow-glow-white' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}`} onClick={() => setActiveTab(tab)}>{t(`events.tabs.${tab}`)}</button>
          ))}
        </div>

        {isLoading ? <div className="py-24 flex flex-col items-center justify-center gap-4"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div> : (
          <>
            <div key={activeTab} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.length === 0 ? (
                <div className="col-span-full py-24 flex flex-col items-center justify-center text-center backdrop-blur-3xl bg-white/5 rounded-[40px] border border-white/10">
                  <Calendar className="w-20 h-20 text-white/10 mb-8" />
                  <h3 className="text-white font-black text-2xl mb-2">No events yet in your city</h3>
                  <p className="text-white/40 text-base max-w-xs mx-auto">Check back soon or switch governorate for more events.</p>
                </div>
              ) : (
                visibleEvents.map((event, index) => (
                  <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.06 }}>
                    <GlassCard className="group relative overflow-hidden transition-all duration-300 text-start p-0 bg-black/40 border-white/10 hover:border-primary/30 rounded-[32px] hover:-translate-y-1 hover:shadow-glow-primary/20 cursor-pointer">
                      <div className="relative h-64 overflow-hidden">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                        {event.aiRecommended && <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-primary/90 flex items-center gap-2 border border-white/20"><Sparkles className="w-3.5 h-3.5 text-white" /><span className="text-white text-[10px] font-black uppercase tracking-widest">AI Pick</span></div>}
                        <div className="absolute top-4 right-4 bg-white/10 border border-white/20 rounded-2xl p-3 text-center min-w-[70px]"><div className="text-white font-black text-2xl leading-none mb-1">{event.date.getDate()}</div><div className="text-white/60 text-[10px] font-black uppercase tracking-widest">{event.date.toLocaleString('default', { month: 'short' })}</div></div>
                        <div className="absolute bottom-4 left-4 right-4"><h3 className="text-white font-black text-2xl line-clamp-2">{event.titleKey ? t(event.titleKey) : event.title}</h3></div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /><span className="truncate">{event.venueKey ? t(event.venueKey) : (event.venue || event.location)}</span></div>
                          <span className="px-2 py-0.5 rounded bg-secondary/20 text-secondary border border-secondary/30">{event.category || 'Event'}</span>
                        </div>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-white/70 text-sm"><Users className="w-4 h-4 text-secondary" />{event.attendees} going</div><div className="text-white font-black">{event.price === 0 ? 'Free' : `${event.price.toLocaleString()} IQD`}</div></div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              )}
            </div>
            {events.length > 0 && <div className="mt-10">{hasMore ? <button onClick={() => setVisibleCount((v) => v + 6)} className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:-translate-y-0.5 transition-all cursor-pointer">Load more events</button> : <p className="text-center text-white/60">You reached the end</p>}</div>}
          </>
        )}
      </div>
    </section>
  );
};
