import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CesiumMap from './components/CesiumMap';
import UlpinGeneratorModal from './components/UlpinGeneratorModal';
import SpatialCertificateModal from './components/SpatialCertificateModal';
import { fetch3DParcels, autoDetectCityParcels } from './utils/api';

export default function App() {
  const [parcelsGeoJSON, setParcelsGeoJSON] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState('all');

  // Realistic 3D Resolution & 2D Lining TRUE by default
  const [showTerrain, setShowTerrain] = useState(true);
  const [show2DBoundaries, setShow2DBoundaries] = useState(true);
  const [show3DTiles, setShow3DTiles] = useState(true);

  const [activeLocation, setActiveLocation] = useState('delhi');
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [streetViewTrigger, setStreetViewTrigger] = useState(null);

  // Direct Map Pick State
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [tempPickedPolygon, setTempPickedPolygon] = useState(null);

  // Modals
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [certificateUlpin, setCertificateUlpin] = useState(null);

  // Load 3D Parcels from Backend API on mount
  const loadParcels = async () => {
    const data = await fetch3DParcels();
    setParcelsGeoJSON(data);
    if (data && data.features && data.features.length > 0 && !selectedUnit) {
      setSelectedUnit(data.features[0].properties);
    }
  };

  useEffect(() => {
    loadParcels();
  }, []);

  const handleLocationPicked = (pickedData) => {
    setTempPickedPolygon(pickedData);
    setIsPickingLocation(false);
    setIsGeneratorOpen(true);
  };

  const handleParcelCreated = (newParcel) => {
    setTempPickedPolygon(null);
    loadParcels();
    setSelectedUnit(newParcel);
  };

  const handleDeleteUnit = (deletedUlpin) => {
    setSelectedUnit(null);
    loadParcels();
  };

  const handleAutoDetectCity = async () => {
    setIsAutoDetecting(true);
    try {
      await autoDetectCityParcels();
      await loadParcels();
      setActiveLocation('delhi');
    } catch (err) {
      alert("Failed to auto-detect city: " + err.message);
    } finally {
      setIsAutoDetecting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 overflow-hidden text-slate-100">
      {/* Top Header Navigation */}
      <Header
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        onFlyToLocation={(loc) => setActiveLocation(loc)}
        activeLocation={activeLocation}
        isPickingLocation={isPickingLocation}
        onTogglePickLocation={() => setIsPickingLocation(!isPickingLocation)}
        onAutoDetectCity={handleAutoDetectCity}
        isAutoDetecting={isAutoDetecting}
      />

      {/* Main Content Area: Sidebar + 3D Cesium Map */}
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar
          selectedUnit={selectedUnit}
          onOpenCertificate={(ulpin) => setCertificateUlpin(ulpin)}
          onDeleteUnit={handleDeleteUnit}
          onTriggerStreetView={(unitProps) => setStreetViewTrigger(unitProps)}
          selectedFloor={selectedFloor}
          onSelectFloor={(fl) => setSelectedFloor(fl)}
          showTerrain={showTerrain}
          onToggleTerrain={() => setShowTerrain(!showTerrain)}
          show2DBoundaries={show2DBoundaries}
          onToggle2DBoundaries={() => setShow2DBoundaries(!show2DBoundaries)}
          show3DTiles={show3DTiles}
          onToggle3DTiles={() => setShow3DTiles(!show3DTiles)}
        />

        <div className="flex-1 h-full relative">
          <CesiumMap
            parcelsGeoJSON={parcelsGeoJSON}
            selectedUnit={selectedUnit}
            onSelectUnit={(unitProps) => {
              setSelectedUnit(unitProps);
              setStreetViewTrigger(unitProps);
            }}
            selectedFloor={selectedFloor}
            showTerrain={showTerrain}
            show2DBoundaries={show2DBoundaries}
            show3DTiles={show3DTiles}
            activeLocation={activeLocation}
            isPickingLocation={isPickingLocation}
            onLocationPicked={handleLocationPicked}
            tempPickedPolygon={tempPickedPolygon}
            streetViewTrigger={streetViewTrigger}
          />
        </div>
      </div>

      {/* 3D ULPIN Generator Modal */}
      <UlpinGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onParcelCreated={handleParcelCreated}
        pickedLocation={tempPickedPolygon}
        onTriggerPickLocation={() => {
          setIsGeneratorOpen(false);
          setIsPickingLocation(true);
        }}
      />

      {/* 3D Spatial Certificate Modal */}
      <SpatialCertificateModal
        ulpin_3d={certificateUlpin}
        isOpen={!!certificateUlpin}
        onClose={() => setCertificateUlpin(null)}
      />
    </div>
  );
}
