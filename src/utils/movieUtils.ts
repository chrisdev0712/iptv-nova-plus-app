import { XtreamVodStream, XtreamVodInfo } from '../types/xtream';

export interface MovieQualityVariant {
  stream_id: number;
  quality: string;
  badge: '4K' | '1080p' | '720p' | 'HD' | 'SD';
  container_extension: string;
  originalName: string;
  movie: XtreamVodStream;
}

export interface GroupedMovie {
  id: string; // unique normalized key
  name: string;
  cleanTitle: string;
  year?: string;
  primaryMovie: XtreamVodStream; // preferred variant (highest quality)
  variants: MovieQualityVariant[];
  availableQualities: string[];
}

/**
 * Extracts quality information from a movie title.
 */
export function extractMovieQuality(title: string): {
  badge: '4K' | '1080p' | '720p' | 'HD' | 'SD';
  label: string;
  rank: number;
} {
  const t = title.toUpperCase();

  // 4K / UHD (Rank 4)
  if (t.includes('4K') || t.includes('UHD') || t.includes('2160P') || t.includes('ULTRA HD')) {
    return { badge: '4K', label: '4K Ultra HD', rank: 4 };
  }
  // 1080p / Full HD (Rank 3)
  if (t.includes('1080P') || t.includes('FHD') || t.includes('FULL HD') || t.includes('FULL-HD')) {
    return { badge: '1080p', label: '1080p Full HD', rank: 3 };
  }
  // 720p / HD (Rank 2)
  if (t.includes('720P') || t.includes('HD') || t.includes('WEBRIP') || t.includes('BLURAY')) {
    return { badge: '720p', label: '720p HD', rank: 2 };
  }
  // SD / CAM / TS (Rank 1)
  if (t.includes('CAM') || t.includes('HDCAM') || t.includes('TELECINE') || t.includes('TS') || t.includes('480P') || t.includes('SD')) {
    return { badge: 'SD', label: 'SD / CAM', rank: 1 };
  }

  // Default HD
  return { badge: 'HD', label: 'HD Calidad Estándar', rank: 2 };
}

/**
 * Normalizes movie title by stripping quality tags, audio flags, resolution brackets,
 * file extensions, and extra punctuation to group identical movies together.
 */
export function normalizeMovieTitle(rawTitle: string): {
  normalizedKey: string;
  cleanDisplayName: string;
  year?: string;
} {
  if (!rawTitle) return { normalizedKey: '', cleanDisplayName: '' };

  let title = rawTitle;

  // Extract year if present, e.g. (2024), [2023], 2022
  const yearMatch = title.match(/[\(\[\s](19\d\d|20\d\d)[\)\]\s]?/);
  const year = yearMatch ? yearMatch[1] : undefined;

  // Remove common quality / format / language tags
  const tagsToRemove = [
    /\[\s*4k[^\]]*\]/gi,
    /\(\s*4k[^\)]*\)/gi,
    /\[\s*uhd[^\]]*\]/gi,
    /\(\s*uhd[^\)]*\)/gi,
    /\[\s*1080p?[^\]]*\]/gi,
    /\(\s*1080p?[^\)]*\)/gi,
    /\[\s*fhd[^\]]*\]/gi,
    /\(\s*fhd[^\)]*\)/gi,
    /\[\s*720p?[^\]]*\]/gi,
    /\(\s*720p?[^\)]*\)/gi,
    /\[\s*hd[^\]]*\]/gi,
    /\(\s*hd[^\)]*\)/gi,
    /\[\s*cam[^\]]*\]/gi,
    /\(\s*cam[^\)]*\)/gi,
    /\[\s*latino[^\]]*\]/gi,
    /\(\s*latino[^\)]*\)/gi,
    /\[\s*castellano[^\]]*\]/gi,
    /\(\s*castellano[^\)]*\)/gi,
    /\[\s*sub[^\]]*\]/gi,
    /\(\s*sub[^\)]*\)/gi,
    /\[\s*dual[^\]]*\]/gi,
    /\(\s*dual[^\)]*\)/gi,
    /\[\s*multi[^\]]*\]/gi,
    /\(\s*multi[^\)]*\)/gi,
    /\b4k\b/gi,
    /\buhd\b/gi,
    /\b2160p\b/gi,
    /\b1080p\b/gi,
    /\bfhd\b/gi,
    /\b720p\b/gi,
    /\bhdcam\b/gi,
    /\bcamrip\b/gi,
    /\btelecine\b/gi,
    /\bbluray\b/gi,
    /\bdvdrip\b/gi,
    /\bweb-dl\b/gi,
    /\bwebrip\b/gi,
    /\bhdr\b/gi,
    /\bhdr10\b/gi,
    /\bhevc\b/gi,
    /\bx264\b/gi,
    /\bx265\b/gi,
    /\bdual\b/gi,
    /\blatino\b/gi,
    /\bcastellano\b/gi,
    /\bsubtitulado\b/gi,
    /\bspanish\b/gi
  ];

  for (const reg of tagsToRemove) {
    title = title.replace(reg, ' ');
  }

  // Clean empty brackets () [] {}
  title = title.replace(/\(\s*\)/g, ' ').replace(/\[\s*\]/g, ' ').replace(/\{\s*\}/g, ' ');

  // Replace dots, underscores with space
  title = title.replace(/[\._]/g, ' ');

  // Clean multiple spaces and trim
  const cleanDisplayName = title.replace(/\s+/g, ' ').trim();

  // Create lowercase alphanumeric key for reliable grouping comparison
  let key = cleanDisplayName.toLowerCase();
  key = key.replace(/[^a-z0-9]/g, '');

  return {
    normalizedKey: key || rawTitle.toLowerCase().replace(/[^a-z0-9]/g, ''),
    cleanDisplayName: cleanDisplayName || rawTitle,
    year
  };
}

/**
 * Finds all quality variants of a movie in the given movie catalog.
 */
export function findMovieVariants(
  targetMovie: XtreamVodStream,
  allMovies: XtreamVodStream[]
): MovieQualityVariant[] {
  if (!targetMovie || !allMovies || allMovies.length === 0) {
    return [];
  }

  const { normalizedKey } = normalizeMovieTitle(targetMovie.name);

  const matched = allMovies.filter(m => {
    if (!m) return false;
    if (m.stream_id === targetMovie.stream_id) return true;
    const otherNorm = normalizeMovieTitle(m.name);
    return otherNorm.normalizedKey === normalizedKey && normalizedKey.length > 2;
  });

  const variants: MovieQualityVariant[] = matched.map(m => {
    const q = extractMovieQuality(m.name);
    return {
      stream_id: m.stream_id,
      quality: q.label,
      badge: q.badge,
      container_extension: m.container_extension || 'mp4',
      originalName: m.name,
      movie: m
    };
  });

  // Sort: 4K (rank 4) -> 1080p (rank 3) -> 720p (rank 2) -> SD (rank 1)
  variants.sort((a, b) => {
    const rankA = extractMovieQuality(a.originalName).rank;
    const rankB = extractMovieQuality(b.originalName).rank;
    return rankB - rankA;
  });

  return variants;
}

/**
 * Groups movies by title to combine multiple qualities of the same movie into a single entry.
 */
export function groupMoviesByTitle(moviesList: XtreamVodStream[]): GroupedMovie[] {
  if (!moviesList || !Array.isArray(moviesList)) return [];

  const groupsMap = new Map<string, XtreamVodStream[]>();

  for (const m of moviesList) {
    if (!m) continue;
    const { normalizedKey } = normalizeMovieTitle(m.name);
    const existing = groupsMap.get(normalizedKey);
    if (existing) {
      existing.push(m);
    } else {
      groupsMap.set(normalizedKey, [m]);
    }
  }

  const result: GroupedMovie[] = [];

  for (const [key, streamList] of groupsMap.entries()) {
    // Sort items by quality rank descending
    streamList.sort((a, b) => {
      const qA = extractMovieQuality(a.name).rank;
      const qB = extractMovieQuality(b.name).rank;
      return qB - qA;
    });

    const primary = streamList[0];
    const { cleanDisplayName, year } = normalizeMovieTitle(primary.name);

    const variants: MovieQualityVariant[] = streamList.map(item => {
      const q = extractMovieQuality(item.name);
      return {
        stream_id: item.stream_id,
        quality: q.label,
        badge: q.badge,
        container_extension: item.container_extension || 'mp4',
        originalName: item.name,
        movie: item
      };
    });

    // Unique badges for display
    const uniqueBadges = Array.from(new Set(variants.map(v => v.badge)));

    result.push({
      id: key,
      name: cleanDisplayName,
      cleanTitle: cleanDisplayName,
      year,
      primaryMovie: primary,
      variants,
      availableQualities: uniqueBadges
    });
  }

  return result;
}

/**
 * Extracts a franchise root string from a movie title to identify sequels, prequels and sagas.
 * E.g. "Sonic the Hedgehog 2" -> "sonic hedgehog"
 * "Sonic 3" -> "sonic"
 * "Harry Potter y las Reliquias de la Muerte" -> "harry potter"
 * "Gladiador II" -> "gladiador"
 */
export function extractFranchiseKey(rawTitle: string): {
  franchiseRoot: string;
  leadKeyword: string;
  partNumber?: number;
} {
  const { cleanDisplayName } = normalizeMovieTitle(rawTitle);
  let t = cleanDisplayName.toLowerCase();

  // Extract part number or roman numeral if present
  let partNumber: number | undefined;
  const numMatch = t.match(/\b(\d{1,2})\b/);
  if (numMatch && parseInt(numMatch[1], 10) < 30) {
    partNumber = parseInt(numMatch[1], 10);
  } else {
    const romanMatch = t.match(/\b(i{1,3}|iv|v|vi{1,3}|ix|x)\b/);
    if (romanMatch) {
      const rMap: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10 };
      partNumber = rMap[romanMatch[1]];
    }
  }

  // Split subtitles after colon, dash or pipe: e.g. "Sonic the Hedgehog: The Movie" -> "Sonic the Hedgehog"
  const sepMatch = t.match(/^([^:\-–—|]{3,})[:\-–—|]/);
  if (sepMatch) {
    t = sepMatch[1].trim();
  }

  // Remove sequel words, part numbers and roman numerals
  t = t.replace(/\b(part|parte|capitulo|chapter|volumen|volume|vol)\s*\d*\b/gi, ' ');
  t = t.replace(/\b(i{1,3}|iv|v|vi{1,3}|ix|x)\b/gi, ' ');
  t = t.replace(/\b\d+\b/g, ' ');

  // Remove common filler articles in Spanish and English
  t = t.replace(/\b(the|el|la|los|las|un|una|unos|unas|de|del|of|and|y)\b/gi, ' ');

  // Clean punctuation and multiple spaces
  t = t.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  const words = t.split(' ').filter(w => w.length >= 3);
  const franchiseRoot = words.slice(0, 3).join(' ');
  const leadKeyword = words[0] || t;

  return {
    franchiseRoot: franchiseRoot || t,
    leadKeyword,
    partNumber
  };
}

export interface SimilarMovieResult {
  movie: XtreamVodStream;
  isFranchise: boolean;
  score: number;
}

/**
 * Recommends similar movies with franchise/saga sequels and prequels prioritized first.
 */
export function findSimilarMovies(
  targetMovie: XtreamVodStream,
  targetInfo: XtreamVodInfo | null,
  allMovies: XtreamVodStream[],
  limit = 12
): SimilarMovieResult[] {
  if (!targetMovie || !allMovies || allMovies.length === 0) return [];

  const { normalizedKey: targetKey, year: targetYear } = normalizeMovieTitle(targetMovie.name);
  const targetFranchise = extractFranchiseKey(targetMovie.name);

  // Extract target genre keywords
  const rawGenre = (targetInfo?.info?.genre || '').toLowerCase();
  const genreWords = rawGenre
    .split(/[,/|\s]+/)
    .map(w => w.trim())
    .filter(w => w.length > 3);

  const director = (targetInfo?.info?.director || '').toLowerCase().trim();

  // Deduplicate quality variants in the pool so we don't suggest 4K and 1080p of the same movie
  const seenKeys = new Set<string>();
  seenKeys.add(targetKey);

  const candidates: SimilarMovieResult[] = [];

  for (const m of allMovies) {
    if (!m || m.stream_id === targetMovie.stream_id) continue;

    const { normalizedKey: mKey, year: mYear } = normalizeMovieTitle(m.name);
    // Don't recommend the same film in a different quality
    if (seenKeys.has(mKey)) continue;

    let score = 0;
    let isFranchise = false;

    const mFranchise = extractFranchiseKey(m.name);

    // 1. SAGA / FRANCHISE DETECTION (Highest priority)
    // Case A: Exact franchise root match (e.g. "sonic" or "sonic hedgehog" or "harry potter")
    if (
      targetFranchise.franchiseRoot &&
      mFranchise.franchiseRoot &&
      targetFranchise.franchiseRoot.length >= 3
    ) {
      if (
        mFranchise.franchiseRoot === targetFranchise.franchiseRoot ||
        mFranchise.franchiseRoot.startsWith(targetFranchise.franchiseRoot) ||
        targetFranchise.franchiseRoot.startsWith(mFranchise.franchiseRoot)
      ) {
        score += 2000;
        isFranchise = true;
      }
    }

    // Case B: Shared distinctive lead keyword (e.g. "sonic", "avatar", "shrek", "gladiator")
    if (!isFranchise && targetFranchise.leadKeyword && targetFranchise.leadKeyword.length >= 4) {
      if (
        mFranchise.leadKeyword === targetFranchise.leadKeyword ||
        m.name.toLowerCase().includes(targetFranchise.leadKeyword)
      ) {
        score += 1500;
        isFranchise = true;
      }
    }

    // 2. Same category bonus
    if (m.category_id && m.category_id === targetMovie.category_id) {
      score += 20;
    }

    // 3. Director match
    if (director && director.length > 3 && m.name.toLowerCase().includes(director)) {
      score += 40;
    }

    // 4. Genre keyword match
    const mLower = m.name.toLowerCase();
    for (const gw of genreWords) {
      if (mLower.includes(gw)) {
        score += 15;
      }
    }

    // 5. Rating bonus
    const r = parseFloat(String(m.rating || 0));
    if (r >= 7.5) score += 8;
    else if (r >= 6.0) score += 4;

    // 6. Year proximity (within +/- 3 years)
    if (targetYear && mYear) {
      const diff = Math.abs(parseInt(targetYear, 10) - parseInt(mYear, 10));
      if (diff <= 2) score += 8;
      else if (diff <= 5) score += 4;
    }

    if (score > 0) {
      seenKeys.add(mKey);
      candidates.push({ movie: m, isFranchise, score });
    }
  }

  // Sort: Franchise movies first (ordered by part number / year), then by highest score
  candidates.sort((a, b) => {
    if (a.isFranchise && !b.isFranchise) return -1;
    if (!a.isFranchise && b.isFranchise) return 1;

    // Both are franchise sequels: sort by part number or year
    if (a.isFranchise && b.isFranchise) {
      const fA = extractFranchiseKey(a.movie.name);
      const fB = extractFranchiseKey(b.movie.name);
      if (fA.partNumber !== undefined && fB.partNumber !== undefined) {
        return fA.partNumber - fB.partNumber;
      }
      const yA = parseInt(normalizeMovieTitle(a.movie.name).year || '0', 10);
      const yB = parseInt(normalizeMovieTitle(b.movie.name).year || '0', 10);
      if (yA && yB) return yA - yB;
    }

    return b.score - a.score;
  });

  // If not enough candidates, backfill with movies from same category
  if (candidates.length < limit) {
    for (const m of allMovies) {
      if (candidates.length >= limit) break;
      const { normalizedKey: mKey } = normalizeMovieTitle(m.name);
      if (!seenKeys.has(mKey) && m.stream_id !== targetMovie.stream_id) {
        seenKeys.add(mKey);
        candidates.push({ movie: m, isFranchise: false, score: 1 });
      }
    }
  }

  return candidates.slice(0, limit);
}

