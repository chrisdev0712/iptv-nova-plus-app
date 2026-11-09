import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  Star,
  Tv,
  Play,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Lock
} from 'lucide-react';
import { XtreamClient } from '../services/xtream';
import { XtreamCategory, XtreamLiveStream } from '../types/xtream';
import { isAdultContent, isParentalControlEnabled } from '../utils/parentalControl';
import { PinModal } from './PinModal';
import { useTranslation } from '../utils/i18n';

interface CachedLiveState {
  categories?: XtreamCategory[];
  categoryCounts?: Record<string, number>;
  totalCount?: number;
  allStreamsCache?: XtreamLiveStream[];
  selectedCatId?: string;
  streams?: XtreamLiveStream[];
  filteredStreams?: XtreamLiveStream[];
  selectedStream?: XtreamLiveStream | null;
  searchQuery?: string;
}

// Module-level cache to remember current folder/channel when returning from Player
const cachedLiveState: CachedLiveState = {};

interface LiveScreenProps {
  client: XtreamClient;
  onBack: () => void;
  onPlayStream: (stream: XtreamLiveStream, allStreams: XtreamLiveStream[]) => void;
}

export const LiveScreen: React.FC<LiveScreenProps> = ({ client, onBack, onPlayStream }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<XtreamCategory[]>(() => cachedLiveState.categories || []);
  const [selectedCatId, setSelectedCatId] = useState<string>(() => cachedLiveState.selectedCatId || 'all');
  const [streams, setStreams] = useState<XtreamLiveStream[]>(() => cachedLiveState.streams || []);
  const [filteredStreams, setFilteredStreams] = useState<XtreamLiveStream[]>(() => cachedLiveState.filteredStreams || []);
  const [selectedStream, setSelectedStream] = useState<XtreamLiveStream | null>(() => cachedLiveState.selectedStream || null);
  const [searchQuery, setSearchQuery] = useState(() => cachedLiveState.searchQuery || '');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(() => cachedLiveState.categoryCounts || {});
  const [totalCount, setTotalCount] = useState<number>(() => cachedLiveState.totalCount || 0);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('iptv_fav_live') || '[]');
    } catch {
      return [];
    }
  });
  const [epgData, setEpgData] = useState<any>(null);
  const [loading, setLoading] = useState(() => !cachedLiveState.categories || cachedLiveState.categories.length === 0);

  // Parental Control state
  const [unlockedAdult, setUnlockedAdult] = useState(false);
  const [pinPrompt, setPinPrompt] = useState<{ action: () => void; title?: string } | null>(null);

  const activeCategoryRef = useRef<HTMLButtonElement>(null);
  const activeStreamRef = useRef<HTMLDivElement>(null);

  // Scroll active elements into view when returning or selecting
  useEffect(() => {
    if (activeCategoryRef.current) {
      activeCategoryRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedCatId, categories]);

  useEffect(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedStream?.stream_id, filteredStreams]);

  // Load Categories (only if not already cached)
  useEffect(() => {
    if (cachedLiveState.categories && cachedLiveState.categories.length > 0) {
      return;
    }

    const fetchCats = async () => {
      try {
        setLoading(true);
        const cats = await client.getLiveCategories();
        setCategories(cats);
        cachedLiveState.categories = cats;
        // Load first category streams initially for fast TV performance
        const initialCatId = cats.length > 0 ? cats[0].category_id : 'all';
        setSelectedCatId(initialCatId);
        cachedLiveState.selectedCatId = initialCatId;
        const initialStreams = await client.getLiveStreams(initialCatId);
        setStreams(initialStreams);
        setFilteredStreams(initialStreams);
        cachedLiveState.streams = initialStreams;
        cachedLiveState.filteredStreams = initialStreams;
        if (initialStreams.length > 0) {
          setSelectedStream(initialStreams[0]);
          cachedLiveState.selectedStream = initialStreams[0];
        }

        // Fetch all channels in background to calculate counts for each folder
        client.getLiveStreams('all').then(allStreams => {
          if (Array.isArray(allStreams)) {
            const counts: Record<string, number> = {};
            for (const s of allStreams) {
              if (s && s.category_id) {
                counts[s.category_id] = (counts[s.category_id] || 0) + 1;
              }
            }
            cachedLiveState.categoryCounts = counts;
            cachedLiveState.totalCount = allStreams.length;
            cachedLiveState.allStreamsCache = allStreams;
            setCategoryCounts(counts);
            setTotalCount(allStreams.length);
          }
        }).catch(console.warn);

      } catch (e) {
        console.error('Error fetching live data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, [client]);

  // Handle Category selection
  const handleSelectCategory = async (catId: string) => {
    const category = categories.find(c => c.category_id === catId);
    if (category && isAdultContent(category.category_name) && isParentalControlEnabled() && !unlockedAdult) {
      setPinPrompt({
        title: 'Categoría para Adultos (+18)',
        action: () => {
          setUnlockedAdult(true);
          executeCategoryChange(catId);
        }
      });
      return;
    }
    executeCategoryChange(catId);
  };

  const executeCategoryChange = async (catId: string) => {
    setSelectedCatId(catId);
    cachedLiveState.selectedCatId = catId;
    setSearchQuery('');
    cachedLiveState.searchQuery = '';
    setLoading(true);
    try {
      if (catId === 'fav') {
        const source = cachedLiveState.allStreamsCache || streams;
        const favList = source.filter(s => favorites.includes(s.stream_id));
        setFilteredStreams(favList);
        cachedLiveState.filteredStreams = favList;
        if (favList.length > 0) {
          setSelectedStream(favList[0]);
          cachedLiveState.selectedStream = favList[0];
        }
      } else if (cachedLiveState.allStreamsCache && catId !== 'all') {
        // Fast instant filter from in-memory cache
        const catStreams = cachedLiveState.allStreamsCache.filter(s => s.category_id === catId);
        setStreams(catStreams);
        setFilteredStreams(catStreams);
        cachedLiveState.streams = catStreams;
        cachedLiveState.filteredStreams = catStreams;
        if (catStreams.length > 0) {
          setSelectedStream(catStreams[0]);
          cachedLiveState.selectedStream = catStreams[0];
        }
      } else if (cachedLiveState.allStreamsCache && catId === 'all') {
        setStreams(cachedLiveState.allStreamsCache);
        setFilteredStreams(cachedLiveState.allStreamsCache);
        cachedLiveState.streams = cachedLiveState.allStreamsCache;
        cachedLiveState.filteredStreams = cachedLiveState.allStreamsCache;
        if (cachedLiveState.allStreamsCache.length > 0) {
          setSelectedStream(cachedLiveState.allStreamsCache[0]);
          cachedLiveState.selectedStream = cachedLiveState.allStreamsCache[0];
        }
      } else {
        const streamList = await client.getLiveStreams(catId);
        setStreams(streamList);
        setFilteredStreams(streamList);
        cachedLiveState.streams = streamList;
        cachedLiveState.filteredStreams = streamList;
        if (streamList.length > 0) {
          setSelectedStream(streamList[0]);
          cachedLiveState.selectedStream = streamList[0];
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStream = (stream: XtreamLiveStream) => {
    setSelectedStream(stream);
    cachedLiveState.selectedStream = stream;
  };

  const handlePlayWithPin = (stream: XtreamLiveStream, allStreams: XtreamLiveStream[]) => {
    cachedLiveState.selectedStream = stream;
    if (isAdultContent(stream.name) && isParentalControlEnabled() && !unlockedAdult) {
      setPinPrompt({
        title: 'Canal para Adultos (+18)',
        action: () => {
          setUnlockedAdult(true);
          onPlayStream(stream, allStreams);
        }
      });
      return;
    }
    onPlayStream(stream, allStreams);
  };

  // Filter by search query (null-safe)
  useEffect(() => {
    if (!streams || !Array.isArray(streams)) {
      setFilteredStreams([]);
      return;
    }

    if (!searchQuery.trim()) {
      if (selectedCatId === 'fav') {
        setFilteredStreams(streams.filter(s => s && favorites.includes(s.stream_id)));
      } else {
        setFilteredStreams(streams);
      }
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const filtered = streams.filter(s => {
      if (!s) return false;
      const name = String(s.name || '').toLowerCase();
      const num = String(s.num || s.stream_id || '').toLowerCase();
      return name.includes(q) || num.includes(q);
    });
    setFilteredStreams(filtered);
  }, [searchQuery, streams, selectedCatId, favorites]);

  // Load EPG when stream is selected
  useEffect(() => {
    if (!selectedStream) return;
    let isMounted = true;
    client.getShortEpg(selectedStream.stream_id).then(epg => {
      if (isMounted) setEpgData(epg);
    });
    return () => {
      isMounted = false;
    };
  }, [selectedStream, client]);

  // Toggle Favorite
  const toggleFavorite = (streamId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(streamId) ? prev.filter(id => id !== streamId) : [...prev, streamId];
      localStorage.setItem('iptv_fav_live', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="relative h-screen w-screen bg-[#080d1a] text-white flex flex-col overflow-hidden select-none">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 tv-focusable"
            title={t('player_back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Tv className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">{t('live_title')}</h1>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 tv-focusable"
          />
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Categories List */}
        <div className="w-72 border-r border-slate-800/80 flex flex-col bg-slate-950/40">
          <div className="p-3 border-b border-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('categories')} ({categories.length + 2})
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* All Channels */}
            <button
              ref={selectedCatId === 'all' ? activeCategoryRef : undefined}
              onClick={() => handleSelectCategory('all')}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-all tv-focusable ${
                selectedCatId === 'all'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Layers className="w-4 h-4 shrink-0 text-cyan-300" />
                <span className="truncate">{t('all_channels')}</span>
              </div>
              {totalCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 ml-2 ${
                    selectedCatId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-800/90 text-cyan-300'
                  }`}
                >
                  {totalCount}
                </span>
              )}
            </button>

            {/* Favorites */}
            <button
              ref={selectedCatId === 'fav' ? activeCategoryRef : undefined}
              onClick={() => handleSelectCategory('fav')}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-all tv-focusable ${
                selectedCatId === 'fav'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Star className="w-4 h-4 shrink-0 text-yellow-400 fill-yellow-400" />
                <span className="truncate">{t('nav_favorites').toUpperCase()}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 ml-2 ${
                  selectedCatId === 'fav' ? 'bg-white/20 text-white' : 'bg-slate-800/90 text-amber-300'
                }`}
              >
                {favorites.length}
              </span>
            </button>

            {categories.map(cat => {
              const isAdult = isAdultContent(cat.category_name);
              const count = categoryCounts[cat.category_id];
              const isSelected = selectedCatId === cat.category_id;

              return (
                <button
                  key={cat.category_id}
                  ref={selectedCatId === cat.category_id ? activeCategoryRef : undefined}
                  onClick={() => handleSelectCategory(cat.category_id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-all tv-focusable ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    {isAdult && <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    <span className="truncate">{cat.category_name}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                    {count !== undefined && count > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                          isSelected ? 'bg-white/25 text-white' : 'bg-slate-800/80 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Channels List */}
        <div className="flex-1 border-r border-slate-800/80 flex flex-col bg-slate-900/30">
          <div className="p-3 border-b border-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
            <span>{t('categories')} ({filteredStreams.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {loading ? (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                {t('loading_channels')}
              </div>
            ) : filteredStreams.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
                <p>{t('no_channels')}</p>
              </div>
            ) : (
              filteredStreams.map(stream => {
                const isFav = favorites.includes(stream.stream_id);
                const isCurrent = selectedStream?.stream_id === stream.stream_id;

                return (
                  <div
                    key={stream.stream_id}
                    ref={isCurrent ? activeStreamRef : undefined}
                    onClick={() => handleSelectStream(stream)}
                    onDoubleClick={() => handlePlayWithPin(stream, filteredStreams)}
                    className={`group w-full p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer tv-focusable ${
                      isCurrent
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40'
                        : 'bg-slate-800/50 hover:bg-slate-800 text-slate-200 border border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      {/* Channel Icon */}
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        {stream.stream_icon ? (
                          <img
                            src={stream.stream_icon}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={e => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Tv className="w-6 h-6 text-slate-500" />
                        )}
                      </div>

                      {/* Channel Info */}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-cyan-300">
                            #{stream.num || stream.stream_id}
                          </span>
                          <span className="text-sm font-bold truncate">{stream.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={e => toggleFavorite(stream.stream_id, e)}
                        className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-yellow-400 transition-colors tv-focusable"
                        title={t('add_favorites')}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                      </button>

                      <button
                        onClick={() => handlePlayWithPin(stream, filteredStreams)}
                        className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold text-white flex items-center space-x-1.5 tv-focusable"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{t('play_now')}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: Preview & EPG Info */}
        <div className="w-96 flex flex-col bg-slate-950/60 p-5 overflow-y-auto">
          {selectedStream ? (
            <div className="space-y-5">
              {/* Channel Big Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80">
                <div className="w-full h-36 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800 mb-4">
                  {selectedStream.stream_icon ? (
                    <img
                      src={selectedStream.stream_icon}
                      alt=""
                      className="max-h-24 max-w-full object-contain"
                    />
                  ) : (
                    <Tv className="w-16 h-16 text-cyan-500/50" />
                  )}
                </div>

                <h2 className="text-lg font-black text-white">{selectedStream.name}</h2>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-xs uppercase">
                    EN VIVO
                  </span>
                  <span className="text-xs text-slate-400">Stream ID: {selectedStream.stream_id}</span>
                </div>

                <button
                  onClick={() => handlePlayWithPin(selectedStream, filteredStreams)}
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-white flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/30 tv-focusable"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>PANTALLA COMPLETA</span>
                </button>
              </div>

              {/* Guía EPG */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Programación Actual (EPG)</span>
                </div>

                {epgData?.epg_listings && epgData.epg_listings.length > 0 ? (
                  <div className="space-y-2">
                    {epgData.epg_listings.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-cyan-400 font-bold">
                          <span>{item.title}</span>
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                            {idx === 0 ? 'Ahora' : 'Siguiente'}
                          </span>
                        </div>
                        <p className="text-slate-400 leading-relaxed text-[11px] line-clamp-2">
                          {item.description || 'Sin información adicional del programa.'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                    No hay información de guía EPG disponible para este canal en este momento.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
              <Tv className="w-12 h-12 mb-3 text-slate-600" />
              <span>Selecciona un canal para previsualizar</span>
            </div>
          )}
        </div>
      </div>

      {/* Parental Control Pin Modal */}
      {pinPrompt && (
        <PinModal
          title={pinPrompt.title || 'Control Parental (+18)'}
          onSuccess={() => {
            const act = pinPrompt.action;
            setPinPrompt(null);
            act();
          }}
          onCancel={() => setPinPrompt(null)}
        />
      )}
    </div>
  );
};

