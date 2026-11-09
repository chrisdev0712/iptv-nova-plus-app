import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  Star,
  Clapperboard,
  Play,
  X,
  Layers,
  Calendar,
  Clock,
  Tv,
  Lock,
  Film,
  ChevronRight
} from 'lucide-react';
import { XtreamClient } from '../services/xtream';
import { XtreamCategory, XtreamSeries, XtreamSeriesInfo } from '../types/xtream';
import { isAdultContent, isParentalControlEnabled } from '../utils/parentalControl';
import { useTranslation } from '../utils/i18n';
import { PinModal } from './PinModal';
import { TrailerModal } from './TrailerModal';

interface CachedSeriesState {
  categories?: XtreamCategory[];
  categoryCounts?: Record<string, number>;
  totalCount?: number;
  allSeriesCache?: XtreamSeries[];
  selectedCatId?: string;
  seriesList?: XtreamSeries[];
  filteredSeries?: XtreamSeries[];
  searchQuery?: string;
}

const cachedSeriesState: CachedSeriesState = {};

interface SeriesScreenProps {
  client: XtreamClient;
  onBack: () => void;
  onPlayEpisode: (series: XtreamSeries, seasonNum: string, episode: any) => void;
}

export const SeriesScreen: React.FC<SeriesScreenProps> = ({ client, onBack, onPlayEpisode }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<XtreamCategory[]>(() => cachedSeriesState.categories || []);
  const [selectedCatId, setSelectedCatId] = useState<string>(() => cachedSeriesState.selectedCatId || 'all');
  const [seriesList, setSeriesList] = useState<XtreamSeries[]>(() => cachedSeriesState.seriesList || []);
  const [filteredSeries, setFilteredSeries] = useState<XtreamSeries[]>(() => cachedSeriesState.filteredSeries || []);
  const [searchQuery, setSearchQuery] = useState(() => cachedSeriesState.searchQuery || '');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(() => cachedSeriesState.categoryCounts || {});
  const [totalCount, setTotalCount] = useState<number>(() => cachedSeriesState.totalCount || 0);
  const [selectedSeries, setSelectedSeries] = useState<XtreamSeries | null>(null);
  const [seriesInfo, setSeriesInfo] = useState<XtreamSeriesInfo | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('1');
  const [showTrailer, setShowTrailer] = useState<{ title: string; url: string } | null>(null);
  const [loading, setLoading] = useState(() => !cachedSeriesState.categories || cachedSeriesState.categories.length === 0);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('iptv_fav_series') || '[]');
    } catch {
      return [];
    }
  });

  // Parental Control state
  const [unlockedAdult, setUnlockedAdult] = useState(false);
  const [pinPrompt, setPinPrompt] = useState<{ action: () => void; title?: string } | null>(null);

  const activeCategoryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeCategoryRef.current) {
      activeCategoryRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedCatId, categories]);

  // Function to reliably calculate series category counts
  const loadSeriesCategoryCounts = async (catsList: XtreamCategory[]) => {
    if (!catsList || catsList.length === 0) return;

    // Check if server directly returns category counts in get_series_categories
    const directCounts: Record<string, number> = {};
    let hasDirectCounts = false;
    for (const c of catsList) {
      const cnt = (c as any).category_count ?? (c as any).count ?? (c as any).total ?? (c as any).series_count;
      if (cnt !== undefined && !isNaN(Number(cnt))) {
        directCounts[String(c.category_id).trim()] = Number(cnt);
        hasDirectCounts = true;
      }
    }

    if (hasDirectCounts) {
      setCategoryCounts(prev => ({ ...prev, ...directCounts }));
      cachedSeriesState.categoryCounts = { ...(cachedSeriesState.categoryCounts || {}), ...directCounts };
      const sum = Object.values(directCounts).reduce((a, b) => a + b, 0);
      setTotalCount(sum);
      cachedSeriesState.totalCount = sum;
      return;
    }

    // Try fetching all series at once (with 4 second timeout)
    let allSeriesLoaded = false;
    try {
      const timeoutPromise = new Promise<XtreamSeries[]>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout on all series')), 4000)
      );
      const allSeries = await Promise.race([client.getSeries('all'), timeoutPromise]);
      if (Array.isArray(allSeries) && allSeries.length > 0) {
        allSeriesLoaded = true;
        const counts: Record<string, number> = {};
        for (const s of allSeries) {
          if (s && s.category_id !== undefined) {
            const cid = String(s.category_id).trim();
            counts[cid] = (counts[cid] || 0) + 1;
          }
        }
        setCategoryCounts(prev => ({ ...prev, ...counts }));
        setTotalCount(allSeries.length);
        cachedSeriesState.categoryCounts = counts;
        cachedSeriesState.totalCount = allSeries.length;
        cachedSeriesState.allSeriesCache = allSeries;
        return;
      }
    } catch {
      // Continue to batch loader
    }

    // Fallback: Query category by category in concurrent batches of 4
    if (!allSeriesLoaded) {
      const counts: Record<string, number> = { ...(cachedSeriesState.categoryCounts || {}) };
      const batchSize = 4;
      for (let i = 0; i < catsList.length; i += batchSize) {
        const batch = catsList.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async cat => {
            const cid = String(cat.category_id).trim();
            if (counts[cid] !== undefined) return;
            try {
              const list = await client.getSeries(cat.category_id);
              if (Array.isArray(list)) {
                counts[cid] = list.length;
                setCategoryCounts(prev => ({ ...prev, [cid]: list.length }));
              }
            } catch {
              // Ignore single category error
            }
          })
        );
      }
      cachedSeriesState.categoryCounts = counts;
      const sum = Object.values(counts).reduce((a, b) => a + b, 0);
      if (sum > 0) {
        setTotalCount(sum);
        cachedSeriesState.totalCount = sum;
      }
    }
  };

  // Load Categories & initial series
  useEffect(() => {
    // If categories are already cached, but counts are missing, load counts
    if (cachedSeriesState.categories && cachedSeriesState.categories.length > 0) {
      const hasCounts = cachedSeriesState.categoryCounts && Object.keys(cachedSeriesState.categoryCounts).length > 0;
      if (!hasCounts) {
        loadSeriesCategoryCounts(cachedSeriesState.categories);
      }
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const cats = await client.getSeriesCategories();
        setCategories(cats);
        cachedSeriesState.categories = cats;
        // Load first series category initially
        const initialCatId = cats.length > 0 ? cats[0].category_id : 'all';
        setSelectedCatId(initialCatId);
        cachedSeriesState.selectedCatId = initialCatId;
        const list = await client.getSeries(initialCatId);
        setSeriesList(list);
        setFilteredSeries(list);
        cachedSeriesState.seriesList = list;
        cachedSeriesState.filteredSeries = list;

        // Record initial count
        const initCid = String(initialCatId).trim();
        setCategoryCounts(prev => ({ ...prev, [initCid]: list.length }));
        cachedSeriesState.categoryCounts = { ...(cachedSeriesState.categoryCounts || {}), [initCid]: list.length };

        // Fetch counts for all series categories in background
        loadSeriesCategoryCounts(cats);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [client]);

  // Select Category
  const handleSelectCategory = async (catId: string) => {
    const category = categories.find(c => c.category_id === catId);
    if (category && isAdultContent(category.category_name) && isParentalControlEnabled() && !unlockedAdult) {
      setPinPrompt({
        title: 'Series para Adultos (+18)',
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
    cachedSeriesState.selectedCatId = catId;
    setSearchQuery('');
    cachedSeriesState.searchQuery = '';
    setLoading(true);
    try {
      if (catId === 'fav') {
        const source = cachedSeriesState.allSeriesCache || seriesList;
        const favList = source.filter(s => favorites.includes(s.series_id));
        setFilteredSeries(favList);
        cachedSeriesState.filteredSeries = favList;
      } else if (cachedSeriesState.allSeriesCache && catId !== 'all') {
        // Fast instant filter from in-memory cache
        const catSeries = cachedSeriesState.allSeriesCache.filter(s => s.category_id === catId);
        setSeriesList(catSeries);
        setFilteredSeries(catSeries);
        cachedSeriesState.seriesList = catSeries;
        cachedSeriesState.filteredSeries = catSeries;
      } else if (cachedSeriesState.allSeriesCache && catId === 'all') {
        setSeriesList(cachedSeriesState.allSeriesCache);
        setFilteredSeries(cachedSeriesState.allSeriesCache);
        cachedSeriesState.seriesList = cachedSeriesState.allSeriesCache;
        cachedSeriesState.filteredSeries = cachedSeriesState.allSeriesCache;
      } else {
        const list = await client.getSeries(catId);
        setSeriesList(list);
        setFilteredSeries(list);
        cachedSeriesState.seriesList = list;
        cachedSeriesState.filteredSeries = list;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (seriesId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(seriesId) ? prev.filter(id => id !== seriesId) : [...prev, seriesId];
      localStorage.setItem('iptv_fav_series', JSON.stringify(next));
      return next;
    });
  };

  const handlePlayEpisodeWithPin = (series: XtreamSeries, seasonNum: string, ep: any) => {
    if ((isAdultContent(series.name) || isAdultContent(ep.title)) && isParentalControlEnabled() && !unlockedAdult) {
      setPinPrompt({
        title: 'Serie para Adultos (+18)',
        action: () => {
          setUnlockedAdult(true);
          setSelectedSeries(null);
          onPlayEpisode(series, seasonNum, ep);
        }
      });
      return;
    }
    setSelectedSeries(null);
    onPlayEpisode(series, seasonNum, ep);
  };

  // Search filter (null-safe)
  useEffect(() => {
    if (!seriesList || !Array.isArray(seriesList)) {
      setFilteredSeries([]);
      return;
    }

    if (!searchQuery.trim()) {
      setFilteredSeries(seriesList);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const filtered = seriesList.filter(s => {
      if (!s) return false;
      const name = String(s.name || '').toLowerCase();
      return name.includes(q);
    });
    setFilteredSeries(filtered);
  }, [searchQuery, seriesList]);

  // Open Series Details
  const handleOpenDetails = async (series: XtreamSeries) => {
    setSelectedSeries(series);
    setLoadingInfo(true);
    try {
      const info = await client.getSeriesInfo(series.series_id);
      setSeriesInfo(info);
      if (info.seasons && info.seasons.length > 0) {
        setSelectedSeason(String(info.seasons[0].season_number || 1));
      } else if (info.episodes) {
        const firstSeason = Object.keys(info.episodes)[0] || '1';
        setSelectedSeason(firstSeason);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInfo(false);
    }
  };

  return (
    <div className="relative h-screen w-screen bg-[#080d1a] text-white flex flex-col overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 tv-focusable"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Clapperboard className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">{t('series_seasons_episodes')}</h1>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder={t('search_series')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 tv-focusable"
          />
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Categories Sidebar */}
        <div className="w-72 border-r border-slate-800/80 flex flex-col bg-slate-950/40">
          <div className="p-3 border-b border-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('categories_label')} ({categories.length + 1})
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <button
              ref={selectedCatId === 'all' ? activeCategoryRef : undefined}
              onClick={() => handleSelectCategory('all')}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-all tv-focusable ${
                selectedCatId === 'all'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Layers className="w-4 h-4 text-purple-300 shrink-0" />
                <span className="truncate">{t('all_series')}</span>
              </div>
              {totalCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 ml-2 ${
                    selectedCatId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-800/90 text-purple-300'
                  }`}
                >
                  {totalCount}
                </span>
              )}
            </button>

            <button
              ref={selectedCatId === 'fav' ? activeCategoryRef : undefined}
              onClick={() => handleSelectCategory('fav')}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-all tv-focusable ${
                selectedCatId === 'fav'
                  ? 'bg-yellow-600 text-white shadow-md shadow-yellow-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Star className="w-4 h-4 text-yellow-300 fill-yellow-300 shrink-0" />
                <span className="truncate">{t('fav_series_tab').toUpperCase()}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 ml-2 ${
                  selectedCatId === 'fav' ? 'bg-white/20 text-white' : 'bg-slate-800/90 text-yellow-300'
                }`}
              >
                {favorites.length}
              </span>
            </button>

            {categories.map(cat => {
              const isAdult = isAdultContent(cat.category_name);
              const count = categoryCounts[String(cat.category_id).trim()] ?? categoryCounts[cat.category_id];
              const isSelected = selectedCatId === cat.category_id;

              return (
                <button
                  key={cat.category_id}
                  ref={selectedCatId === cat.category_id ? activeCategoryRef : undefined}
                  onClick={() => handleSelectCategory(cat.category_id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-all tv-focusable ${
                    isSelected
                      ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30 font-semibold'
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

        {/* Series Posters Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/20">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              {t('loading_series')}
            </div>
          ) : filteredSeries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Clapperboard className="w-12 h-12 mb-3 text-slate-600" />
              <span>{t('no_series')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {filteredSeries.map(series => (
                <div
                  key={series.series_id}
                  onClick={() => handleOpenDetails(series)}
                  className="group relative flex flex-col rounded-2xl bg-slate-800/60 border border-slate-700/60 overflow-hidden cursor-pointer hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/20 transition-all tv-focusable"
                >
                  {/* Poster Image */}
                  <div className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden">
                    {series.cover ? (
                      <img
                        src={series.cover}
                        alt={series.name}
                        className="w-full h-full object-cover group-hover:scale-105 group-focus:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Clapperboard className="w-12 h-12 text-slate-700" />
                      </div>
                    )}

                    {/* Rating and Favorite Badges */}
                    <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-bold text-purple-300 flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{series.rating || '8.5'}</span>
                      </span>

                      <button
                        onClick={e => toggleFavorite(series.series_id, e)}
                        className="p-1.5 rounded-md bg-black/70 backdrop-blur-md pointer-events-auto hover:bg-black text-slate-300 hover:text-yellow-400"
                        title="Favorito"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            favorites.includes(series.series_id) ? 'text-yellow-400 fill-yellow-400' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Hover play */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/50">
                        <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="p-3">
                    <h3 className="font-bold text-xs line-clamp-1 group-hover:text-purple-300">
                      {series.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {series.releaseDate || '2024'} &bull; TV Series
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SERIES DETAIL MODAL */}
      {selectedSeries && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-10">
          <div className="relative w-full max-w-5xl h-[85vh] bg-[#0d1322] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setSelectedSeries(null)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 border border-white/20 hover:bg-white/20 text-white tv-focusable"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="p-6 border-b border-slate-800 flex space-x-6 shrink-0 bg-slate-900/40">
              <img
                src={selectedSeries.cover}
                alt=""
                className="w-24 h-36 rounded-xl object-cover shrink-0 shadow-lg"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-xs uppercase">
                    {t('series_title')}
                  </span>
                  <div className="flex items-center space-x-1 text-yellow-400 font-bold text-sm">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                    <span>{seriesInfo?.info.rating || selectedSeries.rating || '8.8'}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {seriesInfo?.info.releaseDate || selectedSeries.releaseDate || '2023'}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white">{selectedSeries.name}</h2>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {seriesInfo?.info.plot || selectedSeries.plot || ''}
                </p>
                {seriesInfo?.info.cast && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    <span className="text-slate-300 font-semibold">{t('cast')}: </span>
                    {seriesInfo.info.cast}
                  </p>
                )}

                {/* Quick Trailer & Favorite buttons */}
                <div className="flex items-center space-x-3 mt-3">
                  {(selectedSeries.youtube_trailer || (seriesInfo as any)?.info?.youtube_trailer) && (
                    <button
                      onClick={() =>
                        setShowTrailer({
                          title: selectedSeries.name,
                          url: selectedSeries.youtube_trailer || (seriesInfo as any)?.info?.youtube_trailer
                        })
                      }
                      className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white text-xs flex items-center space-x-1.5 shadow-md shadow-red-600/30 tv-focusable"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>{t('watch_trailer').toUpperCase()}</span>
                    </button>
                  )}

                  <button
                    onClick={e => toggleFavorite(selectedSeries.series_id, e)}
                    className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-slate-200 text-xs flex items-center space-x-1.5 tv-focusable"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        favorites.includes(selectedSeries.series_id) ? 'text-yellow-400 fill-yellow-400' : ''
                      }`}
                    />
                    <span>
                      {favorites.includes(selectedSeries.series_id) ? t('in_favorites') : t('add_favorites')}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom: Seasons & Episodes */}
            <div className="flex-1 flex overflow-hidden">
              {/* Seasons Selector Sidebar */}
              <div className="w-56 border-r border-slate-800 p-4 space-y-2 overflow-y-auto bg-slate-950/30">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  {t('seasons')}
                </span>
                {seriesInfo?.seasons && seriesInfo.seasons.length > 0 ? (
                  seriesInfo.seasons.map(s => (
                    <button
                      key={s.season_number}
                      onClick={() => setSelectedSeason(String(s.season_number))}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all tv-focusable ${
                        selectedSeason === String(s.season_number)
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {t('season')} {s.season_number}
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => setSelectedSeason('1')}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white"
                  >
                    {t('season')} 1
                  </button>
                )}
              </div>

              {/* Episodes List */}
              <div className="flex-1 p-6 overflow-y-auto space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  {t('episodes_of_season')} {selectedSeason}
                </span>

                {seriesInfo?.episodes && seriesInfo.episodes[selectedSeason] ? (
                  seriesInfo.episodes[selectedSeason].map(ep => (
                    <div
                      key={ep.id}
                      onClick={() => handlePlayEpisodeWithPin(selectedSeries, selectedSeason, ep)}
                      className="group p-3.5 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between cursor-pointer transition-all tv-focusable"
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-sm shrink-0">
                          {ep.episode_num}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white group-hover:text-purple-300 truncate">
                            {ep.title || `${t('episode_singular')} ${ep.episode_num}`}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {ep.info?.plot || ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        {ep.info?.duration && (
                          <span className="text-xs text-slate-400 font-mono">{ep.info.duration}</span>
                        )}
                        <button className="p-2 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform">
                          <Play className="w-4 h-4 fill-white" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    {t('no_episodes')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Trailer Modal */}
      {showTrailer && (
        <TrailerModal
          title={showTrailer.title}
          trailerIdOrUrl={showTrailer.url}
          onClose={() => setShowTrailer(null)}
        />
      )}

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

