import React, { useState, useEffect } from 'react';
import { Lock, X, Check, Delete } from 'lucide-react';
import { getParentalPin } from '../utils/parentalControl';

interface PinModalProps {
  title?: string;
  subtitle?: string;
  onSuccess: () => void;
  onCancel: () => void;
  expectedPin?: string; // If verifying a specific PIN or change
}

export const PinModal: React.FC<PinModalProps> = ({
  title = 'Control Parental (+18)',
  subtitle = 'Ingresa el PIN de 4 dígitos para acceder al contenido para adultos',
  onSuccess,
  onCancel,
  expectedPin
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const targetPin = expectedPin !== undefined ? expectedPin : getParentalPin();

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      setError(false);
      if (next.length === 4) {
        verifyPin(next);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const verifyPin = (candidate: string) => {
    if (candidate === targetPin) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
      }, 700);
    }
  };

  // Keyboard and remote control digit listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, targetPin]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 select-none">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white tv-focusable"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 shadow-lg shadow-amber-500/20">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-[260px] leading-relaxed">
          {subtitle}
        </p>

        {/* 4 Pin Dots */}
        <div className={`flex items-center space-x-3 my-5 ${error ? 'animate-bounce text-red-500' : ''}`}>
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? error
                    ? 'bg-red-500 border-red-500 scale-110'
                    : 'bg-cyan-400 border-cyan-400 scale-110 shadow-lg shadow-cyan-400/50'
                  : 'border-slate-600 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs font-bold text-red-400 mb-2">
            PIN incorrecto. (Por defecto: 0000)
          </p>
        )}

        {/* Keypad 0-9 */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-lg active:scale-95 transition-all tv-focusable flex items-center justify-center"
            >
              {d}
            </button>
          ))}

          <button
            onClick={onCancel}
            className="h-12 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 text-xs font-bold tv-focusable flex items-center justify-center"
          >
            Salir
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-lg active:scale-95 transition-all tv-focusable flex items-center justify-center"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white tv-focusable flex items-center justify-center"
            title="Borrar dígito"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mt-4">
          PIN por defecto: <span className="font-mono font-bold text-slate-400">0000</span>
        </p>
      </div>
    </div>
  );
};

