import React, { useState } from 'react';
import { Info, Layers, ChevronRight, ChevronLeft } from 'lucide-react';
import UnitInspector from './UnitInspector';
import LayerControl from './LayerControl';

export default function Sidebar({
  selectedUnit,
  onOpenCertificate,
  onDeleteUnit,
  onTriggerStreetView,
  selectedFloor,
  onSelectFloor,
  showTerrain,
  onToggleTerrain,
  show2DBoundaries,
  onToggle2DBoundaries,
  show3DTiles,
  onToggle3DTiles
}) {
  const [activeTab, setActiveTab] = useState('inspector');
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`relative h-[calc(100vh-4rem)] bg-slate-900/95 backdrop-blur border-r border-slate-800 transition-all duration-300 z-10 flex flex-col shrink-0 ${
        collapsed ? 'w-12' : 'w-96'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 shadow-md z-30"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {collapsed ? (
        <div className="flex flex-col items-center py-6 space-y-6 text-slate-400">
          <button
            onClick={() => { setCollapsed(false); setActiveTab('inspector'); }}
            className={`p-2 rounded-lg transition-colors ${activeTab === 'inspector' ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-slate-800'}`}
            title="Unit Inspector"
          >
            <Info className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setCollapsed(false); setActiveTab('layers'); }}
            className={`p-2 rounded-lg transition-colors ${activeTab === 'layers' ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-slate-800'}`}
            title="Layer Control"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          {/* Sidebar Tab Navigation */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/60 p-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('inspector')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'inspector'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Unit Inspector</span>
              {selectedUnit && (
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('layers')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'layers'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Layer Control</span>
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'inspector' ? (
              <UnitInspector
                selectedUnit={selectedUnit}
                onOpenCertificate={onOpenCertificate}
                onDeleteUnit={onDeleteUnit}
                onTriggerStreetView={onTriggerStreetView}
              />
            ) : (
              <LayerControl
                selectedFloor={selectedFloor}
                onSelectFloor={onSelectFloor}
                showTerrain={showTerrain}
                onToggleTerrain={onToggleTerrain}
                show2DBoundaries={show2DBoundaries}
                onToggle2DBoundaries={onToggle2DBoundaries}
                show3DTiles={show3DTiles}
                onToggle3DTiles={onToggle3DTiles}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
