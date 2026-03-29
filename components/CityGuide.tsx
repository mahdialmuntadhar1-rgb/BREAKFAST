import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Navigation, Mic, Trash2, Sparkles } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';
import { motion, AnimatePresence } from 'motion/react';

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

export const CityGuide: React.FC<CityGuideProps> = ({ onGovernorateSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [journeyPoints, setJourneyPoints] = useState<Waypoint[]>([]);
  const { t, lang, setLang } = useTranslations();
  
  const removeWaypoint = (index: number) => {
      setJourneyPoints(points => points.filter((_, i) => i !== index));
  }
  
  const handleGenerateJourney = async () => {
      if (!searchQuery.trim()) return;

      setIsLoading(true);
      setError(null);
      setJourneyPoints([]);
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
        const response = await ai.models.generateContent({
           model: "gemini-3-flash-preview",
           contents: `Create a travel itinerary for the following request: "${searchQuery}". The trip should be in Iraq. Provide a list of waypoints.`,
           config: {
             responseMimeType: "application/json",
             responseSchema: {
                type: Type.OBJECT,
                properties: {
                    waypoints: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: {
                              type: Type.STRING,
                              description: 'The name of the location or waypoint.',
                            },
                            address: {
                              type: Type.STRING,
                              description: 'A short address or description of the location.',
                            },
                          },
                          required: ["name", "address"],
                        },
                    }
                },
                required: ["waypoints"],
              },
           },
        });

        const jsonStr = response.text.trim();
        const plan = JSON.parse(jsonStr);
        setJourneyPoints(plan.waypoints);
          
      } catch (e) {
          console.error("Failed to generate journey:", e);
          setError(t('cityGuide.generateError'));
      } finally {
          setIsLoading(false);
      }
  }

  const handleSuggestionClick = (command: string) => {
      setSearchQuery(command);
      // If the suggestion matches a governorate name, we could trigger onGovernorateSelect
      // For now, let's just update the search query
  };

  return (
    <section className="py-32 bg-black relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Sparkles className="w-3 h-3" />
            {t('cityGuide.aiPowered') || 'AI-Powered Exploration'}
          </motion.div>
          <h2 className="text-5xl font-black text-white tracking-tighter">
            {t('cityGuide.title') || 'Mesopotamian Journey'}
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto font-medium">
            {t('cityGuide.subtitle') || 'Let our AI architect your perfect exploration through the cradle of civilization.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="h-[600px] rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/5 relative group shadow-2xl"
            >
              <InteractiveMap />
              <div className="absolute top-6 left-6 p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Current Location</p>
                <p className="text-white font-bold text-sm">Baghdad, Iraq</p>
              </div>
            </motion.div>
          </div>

          {/* Controls Section */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-white font-black text-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-secondary" />
                  </div>
                  {t('cityGuide.planJourney')}
                </h3>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder={t('cityGuide.searchPlaces') || 'Where to next?'} 
                    className="w-full pl-6 pr-16 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 outline-none focus:border-primary/50 focus:bg-white/10 transition-all duration-500 font-bold text-sm" 
                  />
                  <button 
                    onClick={handleGenerateJourney} 
                    disabled={isLoading} 
                    className="absolute right-2 top-2 bottom-2 w-12 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-secondary transition-all duration-500 shadow-lg disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                <div className="space-y-3">
                  <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">{t('cityGuide.trySaying') || 'Suggestions'}</p>
                  <div className="flex flex-wrap gap-2">
                    {(t('cityGuide.suggestions') as unknown as string[] || ['Ancient Babylon', 'Erbil Citadel', 'Marshes of Basra']).map((command, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleSuggestionClick(command)} 
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all duration-500"
                      >
                        {command}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl min-h-[300px] flex flex-col"
            >
              <h3 className="text-white font-black text-lg mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
                {t('cityGuide.yourJourney')}
              </h3>

              <div className="flex-1 space-y-4">
                {isLoading && (
                    <div className="space-y-4">
                        <WaypointSkeleton />
                        <WaypointSkeleton />
                        <WaypointSkeleton />
                    </div>
                )}

                {error && (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-red-400" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-red-400 text-sm font-black uppercase tracking-widest">{t('cityGuide.errorTitle') || "Generation Failed"}</p>
                        <p className="text-white/30 text-xs px-4 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {!isLoading && !error && journeyPoints.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-20">
                        <Navigation className="w-12 h-12 text-white" />
                        <p className="text-white text-xs font-black uppercase tracking-widest">{t('cityGuide.addWaypoints') || 'No Waypoints Yet'}</p>
                    </div>
                )}
                
                {!isLoading && !error && journeyPoints.length > 0 && (
                  <div className="space-y-3">
                    {journeyPoints.map((point, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all duration-500"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex-shrink-0 flex items-center justify-center text-white font-black text-sm shadow-lg">
                            {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm truncate">{point.name}</p>
                            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest truncate">{point.address}</p>
                        </div>
                        <button 
                            onClick={() => removeWaypoint(index)} 
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:border-red-500 text-white/40 hover:text-white flex items-center justify-center transition-all duration-500"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {journeyPoints.length > 0 && !isLoading && (
                <motion.button 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full mt-8 py-5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-glow-primary/30 transition-all duration-500"
                >
                    {t('cityGuide.startNavigation') || 'Initiate Navigation'}
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};