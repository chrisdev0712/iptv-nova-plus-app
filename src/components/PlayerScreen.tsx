import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  SkipBack,
  SkipForward,
  Settings,
  Tv,
  Subtitles,
  AudioLines,
  Gauge,
  Sparkles,
  X,
  Check,
  Monitor,
  RotateCcw,
  RotateCw,
  Lock,
  Unlock
} from 'lucide-react';
import { normalizeTvKey } from '../utils/tvKeys';

export interface PlayerScreenProps {
  title: string;
  subtitle?: string;
  streamUrl: string;
  streamType: 'live' | 'movie' | 'series';
  onBack: () => void;
  onNextChannel?: () => void;
  onPrevChannel?: () => void;
}

const formatTrackLabel = (lang?: string, name?: string, fallback = 'Pista'): string => {
  if (name && name.trim() && !name.toLowerCase().startsWith('und') && !name.toLowerCase().startsWith('unk')) {
    return name;
  }
  if (!lang || lang.trim() === '') return fallback;
  const l = lang.trim().toLowerCase();
  if (l.startsWith('es') || l === 'spa' || l === 'castellano' || l === 'spanish') return 'Español';
  if (l.startsWith('en') || l === 'eng' || l === 'english') return 'Inglés';
  if (l.startsWith('pt') || l === 'por' || l === 'portuguese') return 'Portugués';
  if (l.startsWith('fr') || l === 'fra' || l === 'french') return 'Francés';
  if (l.startsWith('it') || l === 'ita' || l === 'italian') return 'Italiano';
  if (l.startsWith('de') || l === 'ger' || l === 'german') return 'Alemán';
  if (l.startsWith('ru') || l === 'rus' || l === 'russian') return 'Ruso';
  if (l.startsWith('ja') || l === 'jpn' || l === 'japanese') return 'Japonés';
  return lang.toUpperCase();
};

export const PlayerScreen: React.FC<PlayerScreenProps> = ({
  title,
  subtitle,
  streamUrl,
  streamType,
  onBack,
  onNextChannel,
  onPrevChannel
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<'contain' | 'cover' | 'fill'>(() => {
    const saved = localStorage.getItem('iptv_player_aspect') as 'contain' | 'cover' | 'fill' | null;
    if (saved) return saved;
    return window.innerHeight <= 560 ? 'fill' : 'contain';
  });
  const [isLocked, setIsLocked] = useState(false);
  const [aspectToast, setAspectToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'audio' | 'subtitles' | 'quality' | 'aspect' | 'speed'>('audio');
  const [resolutionInfo, setResolutionInfo] = useState<string>('Detectando resolución...');
  
  // Tracks & Levels
  const [audioTracks, setAudioTracks] = useState<Array<{ id: number; name: string }>>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<number>(-1);
  const [subtitleTracks, setSubtitleTracks] = useState<Array<{ id: number; name: string }>>([]);
  const [currentSubtitleTrack, setCurrentSubtitleTrack] = useState<number>(-1);
  const [qualityLevels, setQualityLevels] = useState<Array<{ id: number; label: string; height: number; bitrate: number }>>([]);
  const [currentQualityLevel, setCurrentQualityLevel] = useState<number>(-1); // -1 is Auto
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const hideTimeoutRef = useRef<any>(null);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: -1, y: -1 });

  const showSettingsRef = useRef(showSettings);
  useEffect(() => {
    showSettingsRef.current = showSettings;
  }, [showSettings]);

  const showControlsRef = useRef(showControls);
  useEffect(() => {
    showControlsRef.current = showControls;
  }, [showControls]);

  const resetHideTimer = useCallback(() => {
    if (showSettingsRef.current) return;
    setShowControls(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      if (!showSettingsRef.current) {
        setShowControls(false);
      }
    }, 3500);
  }, []);

  // Auto-hide controls on mount
  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [resetHideTimer]);

  // Keep controls open when Settings modal is open, auto-hide when closed
  useEffect(() => {
    if (showSettings) {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      setShowControls(true);
    } else {
      resetHideTimer();
    }
  }, [showSettings, resetHideTimer]);

  // Show controls on real mouse movement, auto-hide when idle
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      const dx = Math.abs(e.clientX - lastMousePosRef.current.x);
      const dy = Math.abs(e.clientY - lastMousePosRef.current.y);
      if (dx > 2 || dy > 2) {
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        resetHideTimer();
      }
    };
    window.addEventListener('mousemove', handleWindowMouseMove);
    return () => window.removeEventListener('mousemove', handleWindowMouseMove);
  }, [resetHideTimer]);

  // Video initialization with HLS.js or native HTML5 video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setErrorMsg(null);
    let hls: Hls | null = null;

    // Helper to sync HLS audio tracks
    const syncHlsAudioTracks = (instance: Hls) => {
      if (instance && instance.audioTracks && instance.audioTracks.length > 0) {
        setAudioTracks(
          instance.audioTracks.map((t, idx) => ({
            id: idx,
            name: formatTrackLabel(t.lang, t.name, `Pista ${idx + 1}`)
          }))
        );
        setCurrentAudioTrack(instance.audioTrack);
      }
    };

    // Helper to sync HLS subtitle tracks
    const syncHlsSubtitleTracks = (instance: Hls) => {
      if (instance && instance.subtitleTracks && instance.subtitleTracks.length > 0) {
        setSubtitleTracks(
          instance.subtitleTracks.map((t, idx) => ({
            id: idx,
            name: formatTrackLabel(t.lang, t.name, `Subtítulo ${idx + 1}`)
          }))
        );
        setCurrentSubtitleTrack(instance.subtitleTrack);
      }
    };

    // Helper to sync native audio tracks (Samsung Tizen, LG webOS, Safari)
    const syncNativeAudioTracks = () => {
      const natAudio = (video as any).audioTracks;
      if (natAudio && natAudio.length > 0) {
        const tracks: Array<{ id: number; name: string }> = [];
        let activeIdx = 0;
        for (let i = 0; i < natAudio.length; i++) {
          const trk = natAudio[i];
          tracks.push({
            id: i,
            name: formatTrackLabel(trk.language, trk.label, `Pista ${i + 1}`)
          });
          if (trk.enabled) activeIdx = i;
        }
        setAudioTracks(tracks);
        setCurrentAudioTrack(activeIdx);
      }
    };

    // Helper to sync native text tracks
    const syncNativeTextTracks = () => {
      const natText = video.textTracks;
      if (natText && natText.length > 0) {
        const tracks: Array<{ id: number; name: string }> = [];
        let activeIdx = -1;
        for (let i = 0; i < natText.length; i++) {
          const trk = natText[i];
          if (trk.kind === 'subtitles' || trk.kind === 'captions' || !trk.kind) {
            tracks.push({
              id: i,
              name: formatTrackLabel(trk.language, trk.label, `Subtítulo ${i + 1}`)
            });
            if (trk.mode === 'showing') activeIdx = i;
          }
        }
        if (tracks.length > 0) {
          setSubtitleTracks(tracks);
          setCurrentSubtitleTrack(activeIdx);
        }
      }
    };

    if (streamUrl.includes('.m3u8') || streamType === 'live') {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(console.warn);

          if (hls) {
            syncHlsAudioTracks(hls);
            syncHlsSubtitleTracks(hls);

            // Quality levels
            if (hls.levels && hls.levels.length > 0) {
              const lvls = hls.levels.map((lvl, idx) => ({
                id: idx,
                label: lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)} kbps`,
                height: lvl.height,
                bitrate: lvl.bitrate
              }));
              setQualityLevels(lvls);
            }
          }
        });

        // Dynamic audio track discovery and update
        hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
          if (hls) syncHlsAudioTracks(hls);
        });

        hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_, data) => {
          setCurrentAudioTrack(data.id);
        });

        // Dynamic subtitle track discovery and update
        hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
          if (hls) syncHlsSubtitleTracks(hls);
        });

        hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (_, data) => {
          setCurrentSubtitleTrack(data.id);
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          if (hls && hls.levels[data.level]) {
            const lvl = hls.levels[data.level];
            setResolutionInfo(`${lvl.width || video.videoWidth} x ${lvl.height || video.videoHeight} (${lvl.height >= 1080 ? 'Full HD' : lvl.height >= 720 ? 'HD' : 'SD'})`);
          }
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.error('Fatal HLS error', data);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls?.recoverMediaError();
                break;
              default:
                hls?.destroy();
                setErrorMsg('Error de reproducción en el stream');
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else {
        // Native HLS for Safari, Tizen, webOS
        video.src = streamUrl;
        video.play().catch(console.warn);
      }
    } else {
      // Direct MP4 / MKV for VOD / Series
      video.src = streamUrl;
      video.play().catch(console.warn);
    }

    // Hardware/Native decoders audio & subtitle track event listeners
    const natAudio = (video as any).audioTracks;
    if (natAudio) {
      natAudio.addEventListener?.('addtrack', syncNativeAudioTracks);
      natAudio.addEventListener?.('change', syncNativeAudioTracks);
      natAudio.addEventListener?.('removetrack', syncNativeAudioTracks);
      syncNativeAudioTracks();
    }

    if (video.textTracks) {
      video.textTracks.addEventListener?.('addtrack', syncNativeTextTracks);
      video.textTracks.addEventListener?.('change', syncNativeTextTracks);
      video.textTracks.addEventListener?.('removetrack', syncNativeTextTracks);
      syncNativeTextTracks();
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      if (natAudio) {
        natAudio.removeEventListener?.('addtrack', syncNativeAudioTracks);
        natAudio.removeEventListener?.('change', syncNativeAudioTracks);
        natAudio.removeEventListener?.('removetrack', syncNativeAudioTracks);
      }
      if (video.textTracks) {
        video.textTracks.removeEventListener?.('addtrack', syncNativeTextTracks);
        video.textTracks.removeEventListener?.('change', syncNativeTextTracks);
        video.textTracks.removeEventListener?.('removetrack', syncNativeTextTracks);
      }
    };
  }, [streamUrl, streamType]);

  // Measure video dimensions and sync native tracks when loaded
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w && h) {
        let label = 'SD';
        if (h >= 2160 || w >= 3840) label = '4K Ultra HD';
        else if (h >= 1080 || w >= 1920) label = 'Full HD 1080p';
        else if (h >= 720 || w >= 1280) label = 'HD 720p';
        setResolutionInfo(`${w} x ${h} (${label})`);
      }

      // Check native audio & subtitle tracks on metadata loaded
      const natAudio = (video as any).audioTracks;
      if (natAudio && natAudio.length > 0) {
        const tracks: Array<{ id: number; name: string }> = [];
        let activeIdx = 0;
        for (let i = 0; i < natAudio.length; i++) {
          const trk = natAudio[i];
          tracks.push({
            id: i,
            name: formatTrackLabel(trk.language, trk.label, `Pista ${i + 1}`)
          });
          if (trk.enabled) activeIdx = i;
        }
        setAudioTracks(tracks);
        setCurrentAudioTrack(activeIdx);
      }

      if (video.textTracks && video.textTracks.length > 0) {
        const tracks: Array<{ id: number; name: string }> = [];
        let activeIdx = -1;
        for (let i = 0; i < video.textTracks.length; i++) {
          const trk = video.textTracks[i];
          if (trk.kind === 'subtitles' || trk.kind === 'captions' || !trk.kind) {
            tracks.push({
              id: i,
              name: formatTrackLabel(trk.language, trk.label, `Subtítulo ${i + 1}`)
            });
            if (trk.mode === 'showing') activeIdx = i;
          }
        }
        if (tracks.length > 0) {
          setSubtitleTracks(tracks);
          setCurrentSubtitleTrack(activeIdx);
        }
      }
    }
  };

  // Remote Control Key Listeners in Player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const action = normalizeTvKey(e);

      if (showSettingsRef.current) {
        if (action === 'BACK') {
          e.preventDefault();
          setShowSettings(false);
          resetHideTimer();
        }
        return;
      }

      resetHideTimer();

      if (action === 'BACK') {
        e.preventDefault();
        onBack();
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      if (action === 'PLAY' || action === 'PAUSE' || action === 'PLAY_PAUSE') {
        e.preventDefault();
        if (video.paused) {
          video.play();
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
        return;
      }

      if (action === 'ENTER') {
        if (!showControlsRef.current) {
          setShowControls(true);
          resetHideTimer();
        }
      }

      if (action === 'CH_UP' || (action === 'UP' && streamType === 'live' && !showControlsRef.current)) {
        if (onNextChannel) onNextChannel();
      }

      if (action === 'CH_DOWN' || (action === 'DOWN' && streamType === 'live' && !showControlsRef.current)) {
        if (onPrevChannel) onPrevChannel();
      }

      if (streamType !== 'live') {
        if (action === 'FAST_FORWARD' || (action === 'RIGHT' && !showControlsRef.current)) {
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
        }
        if (action === 'REWIND' || (action === 'LEFT' && !showControlsRef.current)) {
          video.currentTime = Math.max(0, video.currentTime - 10);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onBack, streamType, onNextChannel, onPrevChannel, resetHideTimer]);

  // Video time tracking
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  // Change Audio Track (HLS & Native Hardware Decoders)
  const handleSelectAudioTrack = (trackId: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = trackId;
      setCurrentAudioTrack(trackId);
    } else if (videoRef.current && (videoRef.current as any).audioTracks) {
      const tracks = (videoRef.current as any).audioTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].enabled = (i === trackId);
      }
      setCurrentAudioTrack(trackId);
    }
  };

  // Change Subtitle Track (HLS & Native Hardware Decoders)
  const handleSelectSubtitleTrack = (trackId: number) => {
    if (hlsRef.current) {
      hlsRef.current.subtitleTrack = trackId;
      setCurrentSubtitleTrack(trackId);
    } else if (videoRef.current && videoRef.current.textTracks) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = (i === trackId) ? 'showing' : 'disabled';
      }
      setCurrentSubtitleTrack(trackId);
    }
  };

  // Change Quality Level
  const handleSelectQuality = (levelId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId; // -1 for auto
      setCurrentQualityLevel(levelId);
    }
  };

  // Change Playback Speed
  const handleSelectSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  // Cycle Aspect Ratio on 1 click (Smarters bottom bar button)
  const cycleAspectRatio = () => {
    const order: Array<'fill' | 'cover' | 'contain'> = ['fill', 'cover', 'contain'];
    const labels: Record<'fill' | 'cover' | 'contain', string> = {
      fill: 'Pantalla Completa (Estirar)',
      cover: 'Rellenar 16:9 (Zoom)',
      contain: 'Ajustar Original'
    };
    const next = order[(order.indexOf(aspectRatio) + 1) % order.length];
    setAspectRatio(next);
    try {
      localStorage.setItem('iptv_player_aspect', next);
    } catch {}
    setAspectToast(labels[next]);
    setTimeout(() => setAspectToast(null), 1800);
  };

  // Cycle Speed on 1 click (Smarters bottom bar button)
  const cycleSpeedQuick = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0, 0.75];
    const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    handleSelectSpeed(next);
  };

  const seekBySeconds = (delta: number) => {
    if (!videoRef.current || streamType === 'live') return;
    const nextTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + delta));
    videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, [role="button"], .settings-modal')) {
      resetHideTimer();
      return;
    }
    if (showSettingsRef.current) return;

    if (showControlsRef.current) {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      setShowControls(false);
    } else {
      resetHideTimer();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`fixed inset-0 w-screen h-screen bg-black overflow-hidden select-none transition-all ${
        showControls || showSettings ? 'cursor-default' : 'cursor-none'
      }`}
    >
      {/* Video Element - Edge to Edge Fullscreen */}
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className={`fixed inset-0 w-full h-full bg-black ${
          aspectRatio === 'contain' ? 'object-contain' : aspectRatio === 'cover' ? 'object-cover' : 'object-fill'
        }`}
        playsInline
      />

      {/* Aspect Ratio Toast Notification */}
      {aspectToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2 rounded-2xl bg-black/85 border border-cyan-400/60 text-cyan-300 font-extrabold text-sm shadow-2xl pointer-events-none">
          {aspectToast}
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40 p-6 text-center">
          <div className="bg-red-950/90 border border-red-500/70 p-6 rounded-2xl max-w-lg shadow-2xl">
            <h3 className="text-lg font-bold text-red-200 mb-2">Error de Stream</h3>
            <p className="text-slate-300 text-xs mb-5">{errorMsg}</p>
            <button
              onClick={onBack}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white text-xs tv-focusable"
            >
              Volver a la lista
            </button>
          </div>
        </div>
      )}

      {/* LOCKED SCREEN OVERLAY (Only shows Unlock button when touched) */}
      {isLocked && (
        <div
          className={`absolute inset-0 z-30 flex items-start justify-end p-6 transition-opacity duration-300 ${
            showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={() => setIsLocked(false)}
            className="p-3.5 rounded-full bg-indigo-600/90 hover:bg-indigo-500 border-2 border-white/40 text-white shadow-2xl flex items-center space-x-2 font-bold text-xs tv-focusable"
          >
            <Lock className="w-5 h-5" />
            <span>Desbloquear Pantalla</span>
          </button>
        </div>
      )}

      {/* OSD CONTROLS OVERLAY (IPTV Smarters Pro Style) */}
      {!isLocked && (
        <div
          className={`absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-7 bg-gradient-to-t from-black/90 via-black/35 to-black/80 transition-opacity duration-300 ${
            showControls || showSettings ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* TOP BAR: Back Button + Title + Lock + Settings Gear */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 min-w-0">
              <button
                onClick={onBack}
                className="p-2.5 sm:p-3 rounded-full bg-indigo-600/80 border border-indigo-400/50 hover:bg-indigo-500 text-white shadow-lg transition-all tv-focusable shrink-0"
                title="Volver"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-extrabold text-white truncate drop-shadow-md">
                  {title}
                </h1>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold text-[10px] uppercase">
                    {streamType === 'live' ? 'EN VIVO' : streamType === 'movie' ? 'PELÍCULA' : 'SERIE'}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold truncate">
                    {resolutionInfo}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Right: Mute, Lock, Settings Gear */}
            <div className="flex items-center space-x-2.5 shrink-0">
              <button
                onClick={toggleMute}
                className="p-2.5 sm:p-3 rounded-full bg-black/60 border border-white/20 hover:bg-white/20 text-white backdrop-blur-md tv-focusable"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsLocked(true)}
                className="p-2.5 sm:p-3 rounded-full bg-black/60 border border-white/20 hover:bg-white/20 text-white backdrop-blur-md tv-focusable"
                title="Bloquear controles en pantalla"
              >
                <Unlock className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setShowSettings(true);
                  setShowControls(true);
                }}
                className="p-2.5 sm:p-3 rounded-full bg-indigo-600/85 hover:bg-indigo-500 border border-indigo-400/60 text-white backdrop-blur-md flex items-center space-x-1.5 text-xs font-bold tv-focusable shadow-lg"
                title="Ajustes de Audio, Subtítulos y Calidad"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden md:inline pr-1">AJUSTES</span>
              </button>
            </div>
          </div>

          {/* CENTER OVERLAY CONTROLS: -10s | Play/Pause | +10s (Smarters Layout) */}
          <div className="flex items-center justify-center space-x-10 sm:space-x-16 my-auto">
            {streamType !== 'live' ? (
              <button
                onClick={() => seekBySeconds(-10)}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/55 hover:bg-white/20 border-2 border-white/70 text-white flex flex-col items-center justify-center transition-all active:scale-90 tv-focusable shadow-xl"
                title="Retroceder 10 segundos"
              >
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[10px] font-extrabold -mt-0.5">-10s</span>
              </button>
            ) : (
              onPrevChannel && (
                <button
                  onClick={onPrevChannel}
                  className="w-14 h-14 rounded-full bg-black/55 hover:bg-white/20 border-2 border-white/70 text-white flex items-center justify-center tv-focusable"
                >
                  <SkipBack className="w-6 h-6" />
                </button>
              )
            )}

            <button
              onClick={togglePlay}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-600/90 hover:bg-indigo-500 border-2 border-white text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50 transition-all active:scale-95 tv-focusable"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-white" />
              ) : (
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
              )}
            </button>

            {streamType !== 'live' ? (
              <button
                onClick={() => seekBySeconds(10)}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/55 hover:bg-white/20 border-2 border-white/70 text-white flex flex-col items-center justify-center transition-all active:scale-90 tv-focusable shadow-xl"
                title="Adelantar 10 segundos"
              >
                <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[10px] font-extrabold -mt-0.5">+10s</span>
              </button>
            ) : (
              onNextChannel && (
                <button
                  onClick={onNextChannel}
                  className="w-14 h-14 rounded-full bg-black/55 hover:bg-white/20 border-2 border-white/70 text-white flex items-center justify-center tv-focusable"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              )
            )}
          </div>

          {/* BOTTOM BAR: Progress Slider + Smarters Aspect Ratio & Speed Pill Bar */}
          <div className="space-y-2.5 sm:space-y-3">
            {/* Progress / Seek bar */}
            {streamType !== 'live' && (
              <div className="flex items-center space-x-3 sm:space-x-4">
                <span className="text-xs sm:text-sm font-mono font-bold text-white min-w-[45px]">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setCurrentTime(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="w-full h-1.5 sm:h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-indigo-400 tv-focusable"
                />
                <span className="text-xs sm:text-sm font-mono font-bold text-slate-300 min-w-[45px] text-right">
                  {formatTime(duration)}
                </span>
              </div>
            )}

            {/* Bottom Smarters Quick Action Buttons: Aspect Ratio, Speed, Audio/Subtitles */}
            <div className="flex items-center justify-center space-x-4 sm:space-x-8 pt-0.5">
              <button
                onClick={cycleAspectRatio}
                className="px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-white/15 border border-white/20 text-white flex items-center space-x-2 text-xs sm:text-sm font-semibold tv-focusable"
              >
                <Maximize2 className="w-4 h-4 text-cyan-400" />
                <span>
                  Relación de aspecto ({aspectRatio === 'fill' ? 'Pantalla Completa' : aspectRatio === 'cover' ? 'Zoom 16:9' : 'Original'})
                </span>
              </button>

              {streamType !== 'live' && (
                <button
                  onClick={cycleSpeedQuick}
                  className="px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-white/15 border border-white/20 text-white flex items-center space-x-2 text-xs sm:text-sm font-semibold tv-focusable"
                >
                  <Gauge className="w-4 h-4 text-amber-400" />
                  <span>Velocidad ({playbackSpeed}x)</span>
                </button>
              )}

              <button
                onClick={() => {
                  setSettingsTab('audio');
                  setShowSettings(true);
                  setShowControls(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-white/15 border border-white/20 text-white flex items-center space-x-2 text-xs sm:text-sm font-semibold tv-focusable"
              >
                <Subtitles className="w-4 h-4 text-purple-400" />
                <span>Audio y Subtítulos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS GEAR MODAL (Audio, Subtitles, Quality, Resolution, Aspect Ratio, Speed) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-3 sm:p-6">
          <div className="settings-modal relative w-full max-w-2xl max-h-[92dvh] bg-[#0e1628] border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-3.5 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">Configuración del Reproductor</h3>
                  <p className="text-xs text-cyan-300 font-mono">{resolutionInfo}</p>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 tv-focusable"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs Row */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 space-x-2">
              <button
                onClick={() => setSettingsTab('audio')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all tv-focusable ${
                  settingsTab === 'audio'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <AudioLines className="w-4 h-4" />
                <span>Audio ({audioTracks.length || '1'})</span>
              </button>

              <button
                onClick={() => setSettingsTab('subtitles')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all tv-focusable ${
                  settingsTab === 'subtitles'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Subtitles className="w-4 h-4" />
                <span>Subtítulos ({subtitleTracks.length || '0'})</span>
              </button>

              <button
                onClick={() => setSettingsTab('quality')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all tv-focusable ${
                  settingsTab === 'quality'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Calidad / Pantalla</span>
              </button>

              <button
                onClick={() => setSettingsTab('aspect')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all tv-focusable ${
                  settingsTab === 'aspect'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Maximize2 className="w-4 h-4" />
                <span>Escala</span>
              </button>

              {streamType !== 'live' && (
                <button
                  onClick={() => setSettingsTab('speed')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all tv-focusable ${
                    settingsTab === 'speed'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Gauge className="w-4 h-4" />
                  <span>Velocidad</span>
                </button>
              )}
            </div>

            {/* Tab Contents */}
            <div className="p-6 max-h-[50vh] overflow-y-auto">
              {/* 1. AUDIO TRACKS */}
              {settingsTab === 'audio' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                    Pistas de Audio Disponibles
                  </span>
                  {audioTracks.length > 0 ? (
                    audioTracks.map(track => (
                      <button
                        key={track.id}
                        onClick={() => handleSelectAudioTrack(track.id)}
                        className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-sm font-semibold transition-all tv-focusable ${
                          currentAudioTrack === track.id
                            ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
                            : 'bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <AudioLines className="w-4 h-4 text-cyan-400" />
                          <span>{track.name}</span>
                        </div>
                        {currentAudioTrack === track.id && <Check className="w-5 h-5 text-cyan-400" />}
                      </button>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-800/40 text-slate-400 text-xs">
                      Pista de audio por defecto activa. Este stream no proporciona pistas secundarias.
                    </div>
                  )}
                </div>
              )}

              {/* 2. SUBTITLES */}
              {settingsTab === 'subtitles' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                    Opciones de Subtítulos
                  </span>
                  <button
                    onClick={() => handleSelectSubtitleTrack(-1)}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-sm font-semibold transition-all tv-focusable ${
                      currentSubtitleTrack === -1
                        ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>Desactivados (Off)</span>
                    {currentSubtitleTrack === -1 && <Check className="w-5 h-5 text-cyan-400" />}
                  </button>

                  {subtitleTracks.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => handleSelectSubtitleTrack(sub.id)}
                      className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-sm font-semibold transition-all tv-focusable ${
                        currentSubtitleTrack === sub.id
                          ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Subtitles className="w-4 h-4 text-cyan-400" />
                        <span>{sub.name}</span>
                      </div>
                      {currentSubtitleTrack === sub.id && <Check className="w-5 h-5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}

              {/* 3. QUALITY / RESOLUTION */}
              {settingsTab === 'quality' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Resolución Actual Detectada
                    </span>
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                      <span className="text-sm font-bold text-white">Dimensiones de Salida</span>
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-bold text-sm">
                        {resolutionInfo}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Seleccionar Calidad / Tasa de Bits
                    </span>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleSelectQuality(-1)}
                        className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-sm font-semibold transition-all tv-focusable ${
                          currentQualityLevel === -1
                            ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
                            : 'bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <span>Automática (Recomendada)</span>
                          <span className="text-xs text-slate-400 block font-normal">
                            Ajusta según la velocidad de tu internet
                          </span>
                        </div>
                        {currentQualityLevel === -1 && <Check className="w-5 h-5 text-cyan-400" />}
                      </button>

                      {qualityLevels.map(lvl => (
                        <button
                          key={lvl.id}
                          onClick={() => handleSelectQuality(lvl.id)}
                          className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-sm font-semibold transition-all tv-focusable ${
                            currentQualityLevel === lvl.id
                              ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
                              : 'bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <span>{lvl.label}</span>
                          {currentQualityLevel === lvl.id && <Check className="w-5 h-5 text-cyan-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. ASPECT RATIO */}
              {settingsTab === 'aspect' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                    Relación de Aspecto
                  </span>
                  {[
                    { id: 'contain', label: 'Ajustar a Pantalla (Contain)', desc: 'Mantiene proporción original con barras negras' },
                    { id: 'cover', label: 'Pantalla Completa 16:9 (Cover)', desc: 'Llena toda la pantalla sin distorsión' },
                    { id: 'fill', label: 'Estirar / Llenar (Fill)', desc: 'Estira el video para ocupar toda la pantalla' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setAspectRatio(item.id as any)}
                      className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-sm font-semibold transition-all tv-focusable ${
                        aspectRatio === item.id
                          ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <span>{item.label}</span>
                        <span className="text-xs text-slate-400 block font-normal">{item.desc}</span>
                      </div>
                      {aspectRatio === item.id && <Check className="w-5 h-5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}

              {/* 5. PLAYBACK SPEED */}
              {settingsTab === 'speed' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                    Velocidad de Reproducción
                  </span>
                  {[0.75, 1.0, 1.25, 1.5, 2.0].map(s => (
                    <button
                      key={s}
                      onClick={() => handleSelectSpeed(s)}
                      className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-sm font-semibold transition-all tv-focusable ${
                        playbackSpeed === s
                          ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span>{s === 1.0 ? 'Normal (1.0x)' : `${s}x`}</span>
                      {playbackSpeed === s && <Check className="w-5 h-5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="py-2.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white text-xs tv-focusable"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
