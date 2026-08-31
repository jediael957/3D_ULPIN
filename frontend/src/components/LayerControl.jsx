import React from 'react';
import { Layers, Eye, Mountain, Grid, Sparkles, SlidersHorizontal } from 'lucide-react';

export default function LayerControl({
  selectedFloor,
  onSelectFloor,
  showTerrain,
  onToggleTerrain,
  show2DBoundaries,
  onToggle2DBoundaries,
  show3DTiles,
  onToggle3DTiles
}) {
  const floorOptions = [
    { value: 'all', label: 'All Floors (Complete Building)' },
    { value: 0, label: 'Floor 0 (Ground / Retail)' },
    { value: 1, label: 'Floor 1 (Commercial Office)' },
    { value: 2, label: 'Floor 2 (Executive Offices)' },
    { value: 3, label: 'Floor 3 (Penthouse Suite)' }
  ];

  return (
    <div className="p-5 space-y-6">
      {/* Vertical Floor Slicing */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Vertical Slicing (Floor Isolation)
          </h3>
        </div>
        <p className="text-[11px] text-slate-400">
          Isolate specific multi-story floor volumes to inspect vertical title boundaries.
        </p>

        <div className="space-y-1.5">
          {floorOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelectFloor(opt.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between border ${
                selectedFloor === opt.value
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-sm'
                  : 'bg-slate-800/40 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{opt.label}</span>
              {selectedFloor === opt.value && <div className="w-2 h-2 rounded-full bg-blue-400"></div>}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-800" />

      {/* Spatial Layer Visibility Toggles */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            3D Cadastral Layers
          </h3>
        </div>

        <div className="space-y-2">
          {/* World Terrain Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2.5">
              <Mountain className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-medium text-slate-200">High-Res World Terrain</p>
                <p className="text-[10px] text-slate-400">Cesium World Elevation Model</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={showTerrain}
              onChange={onToggleTerrain}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
          </div>

          {/* 2D Plot Boundaries Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2.5">
              <Grid className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs font-medium text-slate-200">2D Plot Cadastral Outline</p>
                <p className="text-[10px] text-slate-400">Ground Parcel Polygon Overlay</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={show2DBoundaries}
              onChange={onToggle2DBoundaries}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
          </div>

          {/* Photorealistic 3D Tiles Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs font-medium text-slate-200">Google Photorealistic 3D Tiles</p>
                <p className="text-[10px] text-slate-400">High-detail 3D City Context</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={show3DTiles}
              onChange={onToggle3DTiles}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Property Status Color Code
        </span>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
            <span className="text-slate-300">Registered</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-sm bg-amber-500"></div>
            <span className="text-slate-300">Pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
            <span className="text-slate-300">Government</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-sm bg-purple-500"></div>
            <span className="text-slate-300">Commercial</span>
          </div>
        </div>
      </div>
    </div>
  );
}
