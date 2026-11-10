import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Star,
  Film,
  Play,
  X,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  Lock,
  Check,
  Filter,
  ChevronRight
} from 'lucide-react';
import { XtreamClient } from '../services/xtream';
import { XtreamCategory, XtreamVodStream, XtreamVodInfo } from '../types/xtream';
import { useTranslation } from '../utils/i18n';
import { isAdultContent, isParentalControlEnabled } from '../utils/parentalControl';
import {
  normalizeMovieTitle,
  extractMovieQuality,
  findMovieVariants,
  groupMoviesByTitle,
  findSimilarMovies,
  GroupedMovie
} from '../utils/movieUtils';
import { PinModal } from './PinModal';
import { TrailerModal } from './TrailerModal';

interface CachedMoviesState {
  categories?: XtreamCategory[];
  categoryCounts?: Record<string, number>;
  totalCount?: number;
  allVodCache?: XtreamVodStream[];
  selectedCatId?: string;
  movies?: XtreamVodStream[];
  filteredMovies?: XtreamVodStream[];
  searchQuery?: string;
}

const cachedMoviesState: CachedMoviesState = {};

interface MoviesScreenProps {
  client: XtreamClient;
  onBack: () => void;
  onPlayMovie: (movie: XtreamVodStream) => void;
}

export const MoviesScreen: React.FC<MoviesScreenProps> = ({ client, onBack, onPlayMovie }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<XtreamCategory[]>(() => cachedMoviesState.categories || []);
  const [selectedCatId, setSelectedCatId] = useState<string>(() => cachedMoviesState.selectedCatId || 'all');
  const [movies, setMovies] = useState<XtreamVodStream[]>(() => cachedMoviesState.movies || []);
  const [filteredMovies, setFilteredMovies] = useState<XtreamVodStream[]>(() => cachedMoviesState.filteredMovies || []);
  const [searchQuery, setSearchQuery] = useState(() => cachedMoviesState.searchQuery || '');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(() => cachedMoviesState.categoryCounts || {});
  const [totalCount, setTotalCount] = useState<number>(() => cachedMoviesState.totalCount || 0);
  const [selectedMovie, setSelectedMovie] = useState<XtreamVodStream | null>(null);
  const [movieInfo, setMovieInfo] = useState<XtreamVodInfo | null>(null);
  const [showTrailer, setShowTrailer] = useState<{ title: string; url: string } | null>(null);
  const [loading, setLoading] = useState(() => !cachedMoviesState.categories || cachedMoviesState.categories.length === 0);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('iptv_fav_movies') || '[]');
    } catch {
      return [];
    }
  });

  // Group movies by title to combine multiple qualities (4K, 1080p, 720p) into one entry
  const [groupByQuality, setGroupByQuality] = useState<boolean>(() => {
    return localStorage.getItem('iptv_group_movies') !== 'false';
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

  // Function to reliably calculate category counts on any IPTV server
  const loadCategoryCounts = async (catsList: XtreamCategory[]) => {
    if (!catsList || catsList.length === 0) return;

    // Check if server directly returns category counts in get_vod_categories
    const directCounts: Record<string, number> = {};
    let hasDirectCounts = false;
    for (const c of catsList) {
      const cnt = (c as any).category_count ?? (c as any).count ?? (c as any).total ?? (c as any).stream_count;
      if (cnt !== undefined && !isNaN(Number(cnt))) {
        directCounts[String(c.category_id).trim()] = Number(cnt);
        hasDirectCounts = true;
      }
    }

    if (hasDirectCounts) {
      setCategoryCounts(prev => ({ ...prev, ...directCounts }));
      cachedMoviesState.categoryCounts = { ...(cachedMoviesState.categoryCounts || {}), ...directCounts };
      const sum = Object.values(directCounts).reduce((a, b) => a + b, 0);
      setTotalCount(sum);
      cachedMoviesState.totalCount = sum;
      return;
    }

    // Try fetching all movies at once (with 4 second timeout in case server has 30,000+ movies)
    let allMoviesLoaded = false;
    try {
      const timeoutPromise = new Promise<XtreamVodStream[]>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout on all vod')), 4000)
      );
      const allVod = await Promise.race([client.getVodStreams('all'), timeoutPromise]);
      if (Array.isArray(allVod) && allVod.length > 0) {
        allMoviesLoaded = true;
        const counts: Record<string, number> = {};
        for (const m of allVod) {
          if (m && m.category_id !== undefined) {
            const cid = String(m.category_id).trim();
            counts[cid] = (counts[cid] || 0) + 1;
          }
        }
        setCategoryCounts(prev => ({ ...prev, ...counts }));
        setTotalCount(allVod.length);
        cachedMoviesState.categoryCounts = counts;
        cachedMoviesState.totalCount = allVod.length;
        cachedMoviesState.allVodCache = allVod;
        return;
      }
    } catch {
      // Server timed out or rejected 'all', continue to category-by-category batch loader
    }

    // Fallback: Query category by category in concurrent batches of 4
    if (!allMoviesLoaded) {
      const counts: Record<string, number> = { ...(cachedMoviesState.categoryCounts || {}) };
      const batchSize = 4;
      for (let i = 0; i < catsList.length; i += batchSize) {
        const batch = catsList.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async cat => {
            const cid = String(cat.category_id).trim();
            if (counts[cid] !== undefined) return;
            try {
              const list = await client.getVodStreams(cat.category_id);
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
      cachedMoviesState.categoryCounts = counts;
      const sum = Object.values(counts).reduce((a, b) => a + b, 0);
      if (sum > 0) {
        setTotalCount(sum);
        cachedMoviesState.totalCount = sum;
      }
    }
  };

  // Load Categories & initial movies
  useEffect(() => {
    // If categories are already cached, but counts are missing, load counts
    if (cachedMoviesState.categories && cachedMoviesState.categories.length > 0) {
      const hasCounts = cachedMoviesState.categoryCounts && Object.keys(cachedMoviesState.categoryCounts).length > 0;
      if (!hasCounts) {
        loadCategoryCounts(cachedMoviesState.categories);
      }
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const cats = await client.getVodCategories();
        setCategories(cats);
        cachedMoviesState.categories = cats;

        // Load first category initially
        const initialCatId = cats.length > 0 ? cats[0].category_id : 'all';
        setSelectedCatId(initialCatId);
        cachedMoviesState.selectedCatId = initialCatId;
        const vodList = await client.getVodStreams(initialCatId);
        setMovies(vodList);
        setFilteredMovies(vodList);
        cachedMoviesState.movies = vodList;
        cachedMoviesState.filteredMovies = vodList;

        // Immediately record initial category count
        const initCid = String(initialCatId).trim();
        setCategoryCounts(prev => ({ ...prev, [initCid]: vodList.length }));
        cachedMoviesState.categoryCounts = { ...(cachedMoviesState.categoryCounts || {}), [initCid]: vodList.length };

        // Fetch counts for all categories in background
        loadCategoryCounts(cats);

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
        title: 'Películas para Adultos (+18)',
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
    cachedMoviesState.selectedCatId = catId;
    setSearchQuery('');
    cachedMoviesState.searchQuery = '';
    setLoading(true);
    try {
      if (catId === 'fav') {
        const source = cachedMoviesState.allVodCache || movies;
        const favList = source.filter(m => favorites.includes(m.stream_id));
        setFilteredMovies(favList);
        cachedMoviesState.filteredMovies = favList;
      } else if (cachedMoviesState.allVodCache && catId !== 'all') {
        // Fast instant filter from in-memory cache
        const catMovies = cachedMoviesState.allVodCache.filter(m => String(m.category_id).trim() === String(catId).trim());
        setMovies(catMovies);
        setFilteredMovies(catMovies);
        cachedMoviesState.movies = catMovies;
        cachedMoviesState.filteredMovies = catMovies;
        // Record count
        const cid = String(catId).trim();
        setCategoryCounts(prev => ({ ...prev, [cid]: catMovies.length }));
      } else if (cachedMoviesState.allVodCache && catId === 'all') {
        setMovies(cachedMoviesState.allVodCache);
        setFilteredMovies(cachedMoviesState.allVodCache);
        cachedMoviesState.movies = cachedMoviesState.allVodCache;
        cachedMoviesState.filteredMovies = cachedMoviesState.allVodCache;
      } else {
        const vodList = await client.getVodStreams(catId);
        setMovies(vodList);
        setFilteredMovies(vodList);
        cachedMoviesState.movies = vodList;
        cachedMoviesState.filteredMovies = vodList;
        // Record count
        const cid = String(catId).trim();
        setCategoryCounts(prev => ({ ...prev, [cid]: vodList.length }));
        cachedMoviesState.categoryCounts = { ...(cachedMoviesState.categoryCounts || {}), [cid]: vodList.length };
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayMovieWithPin = (movie: XtreamVodStream) => {
    if (isAdultContent(movie.name) && isParentalControlEnabled() && !unlockedAdult) {
      setPinPrompt({
        title: 'Película para Adultos (+18)',
        action: () => {
          setUnlockedAdult(true);
          setSelectedMovie(null);
          onPlayMovie(movie);
        }
      });
      return;
    }
    setSelectedMovie(null);
    onPlayMovie(movie);
  };

  // Search filter (null-safe)
  useEffect(() => {
    if (!movies || !Array.isArray(movies)) {
      setFilteredMovies([]);
      return;
    }

    if (!searchQuery.trim()) {
      if (selectedCatId === 'fav') {
        setFilteredMovies(movies.filter(m => m && favorites.includes(m.stream_id)));
      } else {
        setFilteredMovies(movies);
      }
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const filtered = movies.filter(m => {
      if (!m) return false;
      const name = String(m.name || '').toLowerCase();
      return name.includes(q);
    });
    setFilteredMovies(filtered);
  }, [searchQuery, movies, selectedCatId, favorites]);

  // Open Movie Details
  const handleOpenDetails = async (movie: XtreamVodStream) => {
    setSelectedMovie(movie);
    setLoadingInfo(true);
    try {
      const info = await client.getVodInfo(movie.stream_id);
      setMovieInfo(info);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInfo(false);
    }
  };

  // Toggle Favorite
  const toggleFavorite = (streamId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(streamId) ? prev.filter(id => id !== streamId) : [...prev, streamId];
      localStorage.setItem('iptv_fav_movies', JSON.stringify(next));
      return next;
    });
  };

  // Grouped movies list (combines 4K, 1080p, 720p of the same movie)
  const groupedMovies: GroupedMovie[] = useMemo(() => {
    return groupMoviesByTitle(filteredMovies);
  }, [filteredMovies]);

  // Available quality variants of the selected movie
  const variants = useMemo(() => {
    if (!selectedMovie) return [];
    return findMovieVariants(selectedMovie, movies);
  }, [selectedMovie, movies]);

  // Similar movies recommendation based on genre, director and rating
  const similarMovies = useMemo(() => {
    if (!selectedMovie) return [];
    return findSimilarMovies(selectedMovie, movieInfo, movies, 10);
  }, [selectedMovie, movieInfo, movies]);

  return (
    <div className="relative h-screen w-screen bg-[#080d1a] text-white flex flex-col overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-12 sm:h-15 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between bg-slate-900/60 backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 tv-focusable"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Film className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight">{t('movies_title')}</h1>
          </div>
        </div>

        {/* Header Right: Grouping Toggle & Search Input */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <button
            onClick={() => {
              setGroupByQuality(prev => {
                const next = !prev;
                localStorage.setItem('iptv_group_movies', String(next));
                return next;
              });
            }}
            className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all tv-focusable ${
              groupByQuality
                ? 'bg-gradient-to-r from-amber-500/25 to-rose-500/25 border border-amber-400/50 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-slate-800/90 border border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Agrupa películas repetidas en diferentes calidades"
          >
            <Sparkles className={`w-3.5 h-3.5 ${groupByQuality ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="hidden md:inline">{groupByQuality ? t('grouped_qualities') : t('all_qualities_separated')}</span>
          </button>

          {/* Search Input */}
          <div className="relative w-48 sm:w-64 md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder={t('search_movies')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 tv-focusable"
            />
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Categories Sidebar */}
        <div className="w-48 sm:w-60 lg:w-72 border-r border-slate-800/80 flex flex-col bg-slate-950/40 shrink-0">
          <div className="p-2.5 sm:p-3 border-b border-slate-800/80 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('genres_categories')} ({categories.length + 2})
          </div>
          <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-1">
            <button
              ref={selectedCatId === 'all' ? activeCategoryRef : undefined}
              onClick={() => handleSelectCategory('all')}
              className={`w-full text-left px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all tv-focusable ${
                selectedCatId === 'all'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Layers className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="truncate">{t('all_movies')}</span>
              </div>
              {totalCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold shrink-0 ml-1.5 ${
                    selectedCatId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-800/90 text-amber-300'
                  }`}
                >
                  {totalCount}
                </span>
              )}
            </button>

            <button
              ref={selectedCatId === 'fav' ? activeCategoryRef : undefined}
              onClick={() => handleSelectCategory('fav')}
              className={`w-full text-left px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all tv-focusable ${
                selectedCatId === 'fav'
                  ? 'bg-yellow-600 text-white shadow-md shadow-yellow-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Star className="w-4 h-4 text-yellow-300 fill-yellow-300 shrink-0" />
                <span className="truncate">{t('fav_movies_tab').toUpperCase()}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold shrink-0 ml-1.5 ${
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
                  className={`w-full text-left px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-all tv-focusable ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    {isAdult && <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    <span className="truncate">{cat.category_name}</span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 ml-1.5">
                    {count !== undefined && (
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold ${
                          isSelected ? 'bg-white/25 text-white' : 'bg-slate-800/80 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0 hidden sm:inline" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Movies Grid (5 columns on Mobile Landscape like IPTV Smarters) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-900/20">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              {t('loading_movies')}
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Film className="w-12 h-12 mb-3 text-slate-600" />
              <span>{t('no_movies')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-4">
              {groupByQuality ? (
                groupedMovies.map(gm => {
                  const movie = gm.primaryMovie;
                  const isFav = favorites.includes(movie.stream_id);
                  const hasMulti = gm.variants.length > 1;

                  return (
                    <div
                      key={gm.id}
                      onClick={() => handleOpenDetails(movie)}
                      className="group relative flex flex-col rounded-2xl bg-slate-800/60 border border-slate-700/60 overflow-hidden cursor-pointer hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/20 transition-all tv-focusable"
                    >
                      {/* Poster Image */}
                      <div className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden">
                        {movie.stream_icon ? (
                          <img
                            src={movie.stream_icon}
                            alt={gm.cleanTitle}
                            className="w-full h-full object-cover group-hover:scale-105 group-focus:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={e => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-12 h-12 text-slate-700" />
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
                          <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[11px] font-bold text-amber-400 flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{movie.rating || '8.0'}</span>
                          </span>

                          <button
                            onClick={e => toggleFavorite(movie.stream_id, e)}
                            className="p-1.5 rounded-md bg-black/70 backdrop-blur-md pointer-events-auto hover:bg-black text-slate-300 hover:text-yellow-400"
                            title="Favorito"
                          >
                            <Star className={`w-3.5 h-3.5 ${isFav ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                          </button>
                        </div>

                        {/* Multi-Quality Badge Bottom of Poster */}
                        {hasMulti ? (
                          <div className="absolute bottom-2 inset-x-2 pointer-events-none">
                            <span className="w-full py-1 px-2 rounded-lg bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center space-x-1 shadow-lg shadow-black/50">
                              <Sparkles className="w-3 h-3 text-yellow-300 shrink-0" />
                              <span className="truncate">{gm.variants.length} Calidades ({gm.availableQualities.join(' • ')})</span>
                            </span>
                          </div>
                        ) : (
                          <div className="absolute bottom-2 right-2 pointer-events-none">
                            <span className="py-0.5 px-2 rounded-md bg-black/80 backdrop-blur-md text-cyan-300 text-[10px] font-black uppercase border border-cyan-500/30">
                              {gm.availableQualities[0] || 'HD'}
                            </span>
                          </div>
                        )}

                        {/* Play overlay on hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus:opacity-100 flex items-center justify-center transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/50">
                            <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Movie Title */}
                      <div className="p-3">
                        <h3 className="font-bold text-xs line-clamp-1 group-hover:text-amber-300">
                          {gm.cleanTitle}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider flex items-center justify-between">
                          <span>{gm.year || movie.container_extension?.toUpperCase() || 'PELÍCULA'}</span>
                          {hasMulti && (
                            <span className="text-[10px] text-amber-400 font-bold">
                              +{gm.variants.length} versiones
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                filteredMovies.map(movie => {
                  const isFav = favorites.includes(movie.stream_id);
                  const q = extractMovieQuality(movie.name);
                  return (
                    <div
                      key={movie.stream_id}
                      onClick={() => handleOpenDetails(movie)}
                      className="group relative flex flex-col rounded-2xl bg-slate-800/60 border border-slate-700/60 overflow-hidden cursor-pointer hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/20 transition-all tv-focusable"
                    >
                      {/* Poster Image */}
                      <div className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden">
                        {movie.stream_icon ? (
                          <img
                            src={movie.stream_icon}
                            alt={movie.name}
                            className="w-full h-full object-cover group-hover:scale-105 group-focus:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={e => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-12 h-12 text-slate-700" />
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
                          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-bold text-amber-400 flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{movie.rating || '8.0'}</span>
                          </span>

                          <button
                            onClick={e => toggleFavorite(movie.stream_id, e)}
                            className="p-1.5 rounded-md bg-black/70 backdrop-blur-md pointer-events-auto hover:bg-black text-slate-300 hover:text-yellow-400"
                            title="Favorito"
                          >
                            <Star className={`w-3.5 h-3.5 ${isFav ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                          </button>
                        </div>

                        {/* Quality pill bottom right */}
                        <div className="absolute bottom-2 right-2 pointer-events-none">
                          <span className="py-0.5 px-2 rounded-md bg-black/80 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase border border-amber-500/30">
                            {q.badge}
                          </span>
                        </div>

                        {/* Play overlay on hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus:opacity-100 flex items-center justify-center transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/50">
                            <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Movie Title */}
                      <div className="p-3">
                        <h3 className="font-bold text-xs line-clamp-1 group-hover:text-amber-300">
                          {movie.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider">
                          {movie.container_extension || 'MP4'} &bull; {q.badge}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* MOVIE DETAIL MODAL */}
      {selectedMovie && (() => {
        const cleanInfo = normalizeMovieTitle(selectedMovie.name);
        const activeQuality = extractMovieQuality(selectedMovie.name);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-3 sm:p-6">
            <div className="relative w-full max-w-5xl max-h-[94dvh] bg-[#0e172a] border border-slate-700/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-row">
              {/* Close Button */}
              <button
                onClick={() => setSelectedMovie(null)}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 border border-white/20 hover:bg-white/20 text-white tv-focusable"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Poster Left */}
              <div className="w-36 sm:w-56 md:w-72 shrink-0 bg-slate-950/60 p-3 sm:p-5 flex flex-col items-center justify-start border-r border-slate-800">
                <img
                  src={selectedMovie.stream_icon}
                  alt={cleanInfo.cleanDisplayName}
                  className="w-full rounded-xl sm:rounded-2xl shadow-2xl object-cover aspect-[2/3] border border-slate-700/60"
                  onError={e => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="mt-2 sm:mt-4 text-center hidden sm:block">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800/90 text-cyan-300 font-mono text-[10px] sm:text-xs font-bold border border-cyan-500/30">
                    ID #{selectedMovie.stream_id} &bull; {selectedMovie.container_extension?.toUpperCase() || 'MP4'}
                  </span>
                </div>
              </div>

              {/* Details Right */}
              <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col overflow-y-auto max-h-[94dvh] space-y-3 sm:space-y-5">
                <div>
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500/30 to-rose-500/30 text-amber-300 font-black text-xs uppercase border border-amber-400/50 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{activeQuality.label}</span>
                    </span>

                    <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-black/50 text-amber-400 font-bold text-xs border border-white/10">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{movieInfo?.info.rating || selectedMovie.rating || '8.5'}</span>
                    </div>

                    {movieInfo?.info.duration && (
                      <span className="px-2.5 py-1 rounded-md bg-black/50 text-xs text-slate-300 flex items-center space-x-1 border border-white/10">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{movieInfo.info.duration}</span>
                      </span>
                    )}

                    {cleanInfo.year && (
                      <span className="px-2.5 py-1 rounded-md bg-black/50 text-xs text-slate-300 flex items-center space-x-1 border border-white/10">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{cleanInfo.year}</span>
                      </span>
                    )}
                  </div>

                  {/* Clean Title */}
                  <h2 className="text-2xl md:text-3xl font-black text-white">{cleanInfo.cleanDisplayName}</h2>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{selectedMovie.name}</p>

                  {movieInfo?.info.genre && (
                    <p className="text-xs font-semibold text-cyan-400 mt-2 uppercase tracking-wider">
                      {movieInfo.info.genre}
                    </p>
                  )}

                  {/* Plot */}
                  <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                    {movieInfo?.info.plot ||
                      'Una apasionante película disponible en alta definición para disfrutar en IPTV Nova Plus.'}
                  </p>

                  {/* Cast & Director */}
                  {movieInfo?.info.actors && (
                    <div className="mt-3 text-xs text-slate-400">
                      <span className="font-bold text-slate-300">{t('cast')}: </span>
                      {movieInfo.info.actors}
                    </div>
                  )}
                  {movieInfo?.info.director && (
                    <div className="mt-1 text-xs text-slate-400">
                      <span className="font-bold text-slate-300">{t('director')}: </span>
                      {movieInfo.info.director}
                    </div>
                  )}
                </div>

                {/* 1. AVAILABLE QUALITIES SELECTOR (If movie exists in multiple versions) */}
                {variants.length > 1 && (
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-inner">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                          {t('qualities_available')} ({variants.length})
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{t('choose_version')}</span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {variants.map(v => {
                        const isSelected = selectedMovie.stream_id === v.stream_id;
                        return (
                          <button
                            key={v.stream_id}
                            onClick={() => setSelectedMovie(v.movie)}
                            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all tv-focusable ${
                              isSelected
                                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/30 border border-amber-300/60 scale-105'
                                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                v.badge === '4K'
                                  ? 'bg-amber-400 text-slate-950 font-extrabold'
                                  : v.badge === '1080p'
                                  ? 'bg-cyan-500 text-slate-950 font-extrabold'
                                  : 'bg-slate-600 text-white'
                              }`}
                            >
                              {v.badge}
                            </span>
                            <span>{v.quality}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => handlePlayMovieWithPin(selectedMovie)}
                    className="flex-1 py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 font-extrabold text-white text-base flex items-center justify-center space-x-2 shadow-xl shadow-rose-600/30 tv-focusable"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>{t('play_movie')} ({activeQuality.badge})</span>
                  </button>

                  {movieInfo?.info?.youtube_trailer && (
                    <button
                      onClick={() =>
                        setShowTrailer({
                          title: cleanInfo.cleanDisplayName,
                          url: movieInfo.info.youtube_trailer!
                        })
                      }
                      className="py-4 px-5 rounded-2xl bg-red-600 hover:bg-red-500 font-extrabold text-white text-sm flex items-center space-x-2 shadow-lg shadow-red-600/30 tv-focusable"
                    >
                      <Film className="w-4 h-4" />
                      <span>{t('trailer')}</span>
                    </button>
                  )}

                  <button
                    onClick={e => toggleFavorite(selectedMovie.stream_id, e)}
                    className="py-4 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold text-slate-200 text-sm flex items-center space-x-2 tv-focusable"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        favorites.includes(selectedMovie.stream_id) ? 'text-yellow-400 fill-yellow-400' : ''
                      }`}
                    />
                    <span>{favorites.includes(selectedMovie.stream_id) ? t('in_favorites') : t('favorite')}</span>
                  </button>
                </div>

                {/* 2. SAGA SEQUELS & SIMILAR MOVIES RECOMMENDATION CAROUSEL */}
                {similarMovies.length > 0 && (() => {
                  const hasFranchise = similarMovies.some(s => s.isFranchise);
                  const franchiseCount = similarMovies.filter(s => s.isFranchise).length;

                  return (
                    <div className="border-t border-slate-800/80 pt-5 mt-2">
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center space-x-2">
                          <Film className="w-4 h-4 text-cyan-400" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                            {hasFranchise ? t('saga_similar') : t('similar_recommended')}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                          {hasFranchise && (
                            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border border-amber-500/30 font-bold">
                              ★ {franchiseCount}
                            </span>
                          )}
                          <span>{similarMovies.length} {t('suggestions')}</span>
                        </div>
                      </div>

                      {/* Horizontal Posters Carousel */}
                      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
                        {similarMovies.map(({ movie: sim, isFranchise }) => {
                          const simTitle = normalizeMovieTitle(sim.name).cleanDisplayName;
                          const simQ = extractMovieQuality(sim.name);

                          return (
                            <div
                              key={sim.stream_id}
                              onClick={() => handleOpenDetails(sim)}
                              className={`group/sim w-28 shrink-0 cursor-pointer rounded-xl overflow-hidden bg-slate-900 border transition-all tv-focusable ${
                                isFranchise
                                  ? 'border-amber-500/60 shadow-md shadow-amber-500/20 hover:border-amber-300'
                                  : 'border-slate-800 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20'
                              }`}
                            >
                              <div className="aspect-[2/3] w-full bg-slate-950 overflow-hidden relative">
                                {sim.stream_icon ? (
                                  <img
                                    src={sim.stream_icon}
                                    alt={simTitle}
                                    className="w-full h-full object-cover group-hover/sim:scale-105 transition-transform duration-200"
                                    onError={e => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Film className="w-8 h-8 text-slate-700" />
                                  </div>
                                )}

                                {sim.rating && (
                                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] text-amber-300 font-bold flex items-center space-x-0.5">
                                    <Star className="w-2.5 h-2.5 fill-amber-300" />
                                    <span>{String(sim.rating).slice(0, 3)}</span>
                                  </div>
                                )}

                                {isFranchise ? (
                                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-rose-600 text-[9px] font-black uppercase text-white shadow-md flex items-center space-x-0.5">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    <span>SAGA</span>
                                  </div>
                                ) : (
                                  <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-black/70 text-[9px] text-cyan-300 font-bold">
                                    {simQ.badge}
                                  </div>
                                )}
                              </div>
                              <div className="p-2">
                                <p
                                  className={`text-[11px] font-bold line-clamp-1 ${
                                    isFranchise
                                      ? 'text-amber-200 group-hover/sim:text-amber-400'
                                      : 'text-slate-200 group-hover/sim:text-cyan-300'
                                  }`}
                                >
                                  {simTitle}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        );
      })()}

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

