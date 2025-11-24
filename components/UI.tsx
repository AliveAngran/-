
import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] ${className}`}>
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 tracking-wider uppercase">
    {children}
  </span>
);

export const Button: React.FC<{ onClick: () => void; children: React.ReactNode; active?: boolean; disabled?: boolean; className?: string }> = ({ onClick, children, active, disabled, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 justify-center relative overflow-hidden
      ${active 
        ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.15)] border-white/20' 
        : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 border-transparent'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer border'}
      ${className}
    `}
  >
    {children}
  </button>
);

export const Slider: React.FC<{ value: number; onChange: (val: number) => void; min: number; max: number; label: string; step?: number; disabled?: boolean }> = ({ value, onChange, min, max, label, step = 1, disabled = false }) => (
  <div className="w-full select-none">
    <div className="flex justify-between items-center mb-2">
      <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-mono text-cyan-400">{value.toFixed(2)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none focus:ring-0 ${disabled ? 'opacity-50' : ''}`}
    />
  </div>
);

export const TechText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="font-mono text-cyan-400/80 text-xs bg-cyan-950/30 px-1 py-0.5 rounded mx-1 border border-cyan-500/20">
    {children}
  </span>
);

export const ProgressBar: React.FC<{ value: number; max: number; label?: string; color?: string }> = ({ value, max, label, color = 'bg-primary' }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <div className="w-full">
            {label && <div className="text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                <span>{label}</span>
                <span>{Math.round(percentage)}%</span>
            </div>}
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                <div 
                    className={`h-full transition-all duration-100 ease-linear shadow-[0_0_10px_currentColor] ${color}`} 
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};
