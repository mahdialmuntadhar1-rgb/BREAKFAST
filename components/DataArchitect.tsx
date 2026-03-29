import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Briefcase, Navigation } from './icons';
import { api } from '../services/api';
import type { BusinessPostcard } from '../types';

const GOVERNORATES = [
  'Baghdad', 'Basra', 'Nineveh', 'Erbil', 'Sulaymaniyah', 'Duhok',
  'Kirkuk', 'Anbar', 'Babil', 'Diyala', 'Dhi Qar', 'Wasit',
  'Muthanna', 'Qadisiyyah', 'Maysan', 'Najaf', 'Karbala', 'Saladin',
];

const ALLOWED_CATEGORIES = ['Cafe', 'Restaurant', 'Bakery', 'Hotel', 'Gym', 'Salon', 'Pharmacy', 'Supermarket'];

interface PipelineReport {
  total_found: number;
  total_verified: number;
  total_rejected: number;
  flagged_businesses: { name: string; city: string; reason: string }[];
}

const buildTagline = (name: string, city: string) => `${name} · Trusted local spot in ${city}`;

export const DataArchitect: React.FC = () => {
  const [selectedGovernorate, setSelectedGovernorate] = useState(GOVERNORATES[0]);
  const [rawJson, setRawJson] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<PipelineReport | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const processPipeline = async () => {
    if (!rawJson.trim()) return;
    setIsProcessing(true);
    setReport(null);
    setLogs([]);
    addLog(`Starting pipeline for ${selectedGovernorate}...`);

    try {
      const data = JSON.parse(rawJson);
      const places = Array.isArray(data) ? data : data.places || [];
      let verifiedCount = 0;
      let rejectedCount = 0;
      const flagged: { name: string; city: string; reason: string }[] = [];

      for (const place of places) {
        const name = place.title || place.name;
        const phone = place.phone || place.phoneNumber;
        const category = place.categoryName || place.category;
        const images = place.images || place.imageUrls || [];
        const reviews = place.reviews || [];

        if (!phone || !phone.startsWith('+964')) {
          flagged.push({ name, city: selectedGovernorate, reason: 'No +964 phone number' });
          rejectedCount++;
          continue;
        }

        const matchedCategory = ALLOWED_CATEGORIES.find((c) => category?.toLowerCase().includes(c.toLowerCase()));
        if (!matchedCategory) {
          flagged.push({ name, city: selectedGovernorate, reason: `Category mismatch: ${category}` });
          rejectedCount++;
          continue;
        }

        if (images.length < 1) {
          flagged.push({ name, city: selectedGovernorate, reason: `Insufficient images (${images.length})` });
          rejectedCount++;
          continue;
        }

        const postcard: BusinessPostcard = {
          title: name,
          city: selectedGovernorate,
          neighborhood: place.neighborhood || place.sublocality || 'City Center',
          governorate: selectedGovernorate,
          category_tag: matchedCategory as any,
          phone,
          website: place.website,
          instagram: place.instagram,
          hero_image: images[0],
          image_gallery: images.slice(0, 5),
          postcard_content: buildTagline(name, selectedGovernorate),
          top_reviews: reviews.slice(0, 3).map((r: any) => r.text),
          google_maps_url: place.url || place.googleMapsUrl,
          rating: place.totalScore || place.rating || 0,
          review_count: place.reviewsCount || place.reviewCount || 0,
          verified: true,
        };

        const result = await api.upsertPostcard(postcard);
        if (result.success) {
          verifiedCount++;
          addLog(`✅ Upserted: ${name}`);
        } else {
          addLog(`❌ Failed: ${name}`);
        }
      }

      setReport({
        total_found: places.length,
        total_verified: verifiedCount,
        total_rejected: rejectedCount,
        flagged_businesses: flagged,
      });
    } catch (err) {
      addLog(`Critical Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-primary" />AI Data Architect</h2>
          <p className="text-white/60 text-sm">Collect, verify, and format business data across Iraq.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedGovernorate} onChange={(e) => setSelectedGovernorate(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white">
            {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <button onClick={processPipeline} disabled={isProcessing || !rawJson.trim()} className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Run Pipeline
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2"><Briefcase className="w-5 h-5 text-secondary" />Raw Input (JSON)</h3>
          <textarea value={rawJson} onChange={(e) => setRawJson(e.target.value)} placeholder="Paste JSON array..." className="w-full h-[400px] bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-mono text-xs" />
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2"><Navigation className="w-5 h-5 text-primary" />Pipeline Logs</h3>
          <div className="w-full h-[400px] bg-black/40 border border-white/10 rounded-2xl p-4 overflow-y-auto font-mono text-[10px] space-y-1">
            {logs.length === 0 ? <p className="text-white/20 italic">Waiting for pipeline to start...</p> : logs.map((log, i) => <p key={i} className="text-white/60">{log}</p>)}
          </div>
        </div>
      </div>

      {report && (
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-white/80 text-sm">
          Found: {report.total_found} · Verified: {report.total_verified} · Rejected: {report.total_rejected}
        </div>
      )}
    </div>
  );
};
