import React, { useState } from 'react';
import { Navigation, Sparkles } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { motion } from 'motion/react';

interface Waypoint {
  name: string;
  address: string;
}

const InteractiveMap: React.FC = () => (
  <div className="w-full h-full bg-dark-bg flex items-center justify-center text-white/50">
    <div className="text-center">
      <Navigation className="w-16 h-16 mx-auto mb-4 text-secondary/50" />
      <p>Interactive Map Placeholder</p>
    </div>
  </div>
);

const WaypointSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 p-3 rounded-xl backdrop-blur-xl bg-white/10 animate-pulse">
    <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 w-3/4 bg-white/10 rounded"></div>
      <div className="h-3 w-1/2 bg-white/10 rounded"></div>
    </div>
  </div>
);

interface CityGuideProps {
  onGovernorateSelect?: (gov: string) => void;
}

const buildLocalJourney = (query: string): Waypoint[] => {
  const base = query.trim() || 'Baghdad';
  return [
    { name: `${base} Old Quarter`, address: 'Historic center' },
    { name: `${base} River Walk`, address: 'Waterfront district' },
    { name: `${base} Market`, address: 'Local bazaar and cafes' },
  ];
};

export const CityGuide: React.FC<CityGuideProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [journeyPoints, setJourneyPoints] = useState<Waypoint[]>([]);
  const { t } = useTranslations();

  const removeWaypoint = (index: number) => {
    setJourneyPoints((points) => points.filter((_, i) => i !== index));
  };

  const handleGenerateJourney = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setJourneyPoints([]);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setJourneyPoints(buildLocalJourney(searchQuery));
    } catch (e) {
      console.error('Failed to generate journey:', e);
      setError(t('cityGuide.generateError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (command: string) => {
    setSearchQuery(command);
  };

  return (
    <section className="py-32 bg-black relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3" />
            {t('cityGuide.aiPowered') || 'Smart Exploration'}
          </motion.div>
          <h2 className="text-5xl font-black text-white tracking-tighter">{t('cityGuide.title') || 'Mesopotamian Journey'}</h2>
          <p className="text-white/40 max-w-2xl mx-auto font-medium">{t('cityGuide.subtitle') || 'Plan your path through Iraq in seconds.'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="h-[600px] rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/5 relative group shadow-2xl">
              <InteractiveMap />
            </motion.div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl space-y-8">
              <div className="relative group">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('cityGuide.searchPlaces') || 'Where to next?'} className="w-full pl-6 pr-16 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 outline-none" />
                <button onClick={handleGenerateJourney} disabled={isLoading} className="absolute right-2 top-2 bottom-2 w-12 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50">
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(t('cityGuide.suggestions') as unknown as string[] || ['Ancient Babylon', 'Erbil Citadel', 'Marshes of Basra']).map((command, i) => (
                  <button key={i} onClick={() => handleSuggestionClick(command)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest">
                    {command}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl min-h-[300px] flex flex-col">
              <div className="flex-1 space-y-4">
                {isLoading && <WaypointSkeleton />}
                {error && <p className="text-red-400 text-xs">{error}</p>}
                {!isLoading && !error && journeyPoints.length === 0 && <p className="text-white/30 text-xs">{t('cityGuide.addWaypoints') || 'No Waypoints Yet'}</p>}
                {!isLoading && !error && journeyPoints.map((point, index) => (
                  <div key={index} className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex-shrink-0 flex items-center justify-center text-white font-black text-sm">{index + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{point.name}</p>
                      <p className="text-white/30 text-[10px] font-black uppercase tracking-widest truncate">{point.address}</p>
                    </div>
                    <button onClick={() => removeWaypoint(index)} className="text-white/30 hover:text-red-400">×</button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
