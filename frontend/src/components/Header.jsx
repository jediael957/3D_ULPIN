import React from 'react';
import { Layers, Plus, MapPin, MousePointerClick, Box, Sparkles } from 'lucide-react';

export default function Header({
  onOpenGenerator,
  onFlyToLocation,
  activeLocation,
  isPickingLocation,
  onTogglePickLocation,
  onAutoDetectCity,
  isAutoDetecting
}) {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between z-20 shrink-0">
      {/* Title & Branding */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg shadow-lg shadow-blue-500/20">
          <Box className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-slate-100 tracking-tight">3D ULPIN Mapping System</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full">
              SIH26011 Prototype
            </span>
          </div>
          <p className="text-xs text-slate-400">Vertical Property Cadastre & 3D Title Registration</p>
        </div>
      </div>

      {/* Location Selector & Actions */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
          <button
            onClick={() => onFlyToLocation('delhi')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeLocation === 'delhi'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Connaught Place (DL)</span>
          </button>
          <button
            onClick={() => onFlyToLocation('gurgaon')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeLocation === 'gurgaon'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Cyber City (HR)</span>
          </button>
        </div>

        {/* Auto-Detect 3D City Cadastral Blocks */}
        <button
          onClick={onAutoDetectCity}
          disabled={isAutoDetecting}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-md shadow-purple-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>{isAutoDetecting ? 'Detecting City...' : 'Auto-Detect 3D City'}</span>
        </button>

        {/* Pick Building on Map Mode Toggle */}
        <button
          onClick={onTogglePickLocation}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
            isPickingLocation
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30 animate-pulse'
              : 'bg-slate-800 text-amber-400 border-amber-500/40 hover:bg-slate-700 hover:text-amber-300'
          }`}
        >
          <MousePointerClick className="w-4 h-4" />
          <span>{isPickingLocation ? 'Cancel Map Pick' : 'Pick Building on Map'}</span>
        </button>

        {/* Generate 3D ULPIN Button */}
        <button
          onClick={onOpenGenerator}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Generate 3D ULPIN</span>
        </button>
      </div>
    </header>
  );
}
