import React, { useEffect } from 'react';
import { X, Play, Film, ExternalLink } from 'lucide-react';

interface TrailerModalProps {
  title: string;
  trailerIdOrUrl: string;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  title,
  trailerIdOrUrl,
  onClose
}) => {
  // Extract YouTube ID
  const extractYoutubeId = (input: string): string => {
    if (!input) return '';
    const clean = input.trim();
    // If it's already an 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
      return clean;
    }
    // Match watch?v=ID or youtu.be/ID or embed/ID
    const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : clean;
  };

  const videoId = extractYoutubeId(trailerIdOrUrl);

  // Close on Escape or Back key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.keyCode === 10009 || e.keyCode === 461 || e.key === 'Backspace') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-6 select-none">
      <div className="relative w-full max-w-5xl h-[80vh] bg-slate-950 border border-red-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] tracking-wider uppercase">
                  TRAILER OFICIAL
                </span>
                <span className="text-xs text-slate-400">YouTube Player</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5 line-clamp-1">{title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all tv-focusable"
            title="Cerrar trailer [Atrás]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Iframe */}
        <div className="flex-1 bg-black relative flex items-center justify-center">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0`}
              title={`Trailer: ${title}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center p-8 text-slate-400">
              <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold">El servidor no proporcionó un trailer para este título.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 px-6 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Presiona <strong>[Atrás]</strong> o <strong>[Escape]</strong> para volver a la película</span>
          <span className="text-slate-500 font-mono">YouTube HD</span>
        </div>
      </div>
    </div>
  );
};

