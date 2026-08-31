import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, CheckCircle2, AlertCircle, MapPin, MousePointerClick } from 'lucide-react';
import { generate3DUlpin } from '../utils/api';

export default function UlpinGeneratorModal({
  isOpen,
  onClose,
  onParcelCreated,
  pickedLocation,
  onTriggerPickLocation
}) {
  const [formData, setFormData] = useState({
    state_code: 'IN-DL',
    district_code: '110001',
    plot_2d_id: 'P901',
    building_name: 'Selected Building Site',
    floor_number: 1,
    unit_number: '101',
    z_min: 0.0,
    z_max: 4.5,
    owner_name: 'Rajesh & Meera Singhania',
    property_type: 'Commercial Office',
    status: 'Registered',
    air_land_rights: 'Air Rights'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultUlpin, setResultUlpin] = useState(null);

  // Sync picked location coordinates when user clicks a building on map
  useEffect(() => {
    if (pickedLocation && pickedLocation.coordinates) {
      setFormData(prev => ({
        ...prev,
        z_min: Math.round(pickedLocation.zHeight || 0.0),
        z_max: Math.round((pickedLocation.zHeight || 0.0) + 4.5),
        building_name: `Building Site (${pickedLocation.centerLat.toFixed(4)}°N, ${pickedLocation.centerLon.toFixed(4)}°E)`
      }));
    }
  }, [pickedLocation]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'floor_number' ? parseInt(value) || 0 : (name === 'z_min' || name === 'z_max') ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultUlpin(null);

    try {
      const coords = pickedLocation?.coordinates || [
        [77.2162, 28.6308],
        [77.2166, 28.6308],
        [77.2166, 28.6311],
        [77.2162, 28.6311],
        [77.2162, 28.6308]
      ];

      const payload = {
        ...formData,
        coordinates: coords
      };

      const res = await generate3DUlpin(payload);
      setResultUlpin(res.ulpin_3d);
      if (onParcelCreated) onParcelCreated(res.details);
    } catch (err) {
      setError(err.message || 'Failed to generate 3D ULPIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">3D ULPIN Generator Engine</h2>
              <p className="text-xs text-slate-400">Assign 3D ULPIN to Building or Land Plot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Pick Trigger Banner */}
        <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-amber-300">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>
              {pickedLocation
                ? `Picked Location: ${pickedLocation.centerLat.toFixed(4)}°N, ${pickedLocation.centerLon.toFixed(4)}°E`
                : 'No building picked yet. Click "Pick on Map" to select any building on the globe.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => { onClose(); onTriggerPickLocation(); }}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs flex items-center space-x-1 shadow transition-colors"
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>{pickedLocation ? 'Re-pick' : 'Pick on Map'}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resultUlpin && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 space-y-1">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-xs">3D ULPIN Successfully Generated & Extruded on Map!</span>
              </div>
              <p className="font-mono text-sm font-bold text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800 break-all select-all">
                {resultUlpin}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-400 mb-1">State Code</label>
              <input
                type="text"
                name="state_code"
                value={formData.state_code}
                onChange={handleChange}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-400 mb-1">District Code</label>
              <input
                type="text"
                name="district_code"
                value={formData.district_code}
                onChange={handleChange}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-400 mb-1">2D Parent Plot ID</label>
              <input
                type="text"
                name="plot_2d_id"
                value={formData.plot_2d_id}
                onChange={handleChange}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-400 mb-1">Building Name</label>
              <input
                type="text"
                name="building_name"
                value={formData.building_name}
                onChange={handleChange}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-400 mb-1">Floor Number</label>
              <input
                type="number"
                name="floor_number"
                value={formData.floor_number}
                onChange={handleChange}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-400 mb-1">Unit Number / Flat ID</label>
              <input
                type="text"
                name="unit_number"
                value={formData.unit_number}
                onChange={handleChange}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-400 mb-1">Base Elevation Z-min (meters)</label>
              <input
                type="number"
                step="0.1"
                name="z_min"
                value={formData.z_min}
                onChange={handleChange}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-400 mb-1">Top Elevation Z-max (meters)</label>
              <input
                type="number"
                step="0.1"
                name="z_max"
                value={formData.z_max}
                onChange={handleChange}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-400 mb-1">Property Owner Name</label>
            <input
              type="text"
              name="owner_name"
              value={formData.owner_name}
              onChange={handleChange}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-400 mb-1">Property Type</label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Commercial Office">Commercial Office</option>
                <option value="Luxury Residential Unit">Residential Flat</option>
                <option value="Retail Outlet">Retail Store</option>
                <option value="Government Utility">Government</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-400 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Registered">Registered</option>
                <option value="Pending">Pending</option>
                <option value="Government Owned">Government</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-400 mb-1">Air / Land Rights</label>
              <select
                name="air_land_rights"
                value={formData.air_land_rights}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Air Rights">Air Rights</option>
                <option value="Fee Simple Title">Fee Simple</option>
                <option value="Subsurface Rights">Subsurface</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md shadow-emerald-900/30 transition-all flex items-center space-x-2"
            >
              {loading ? <span>Extruding 3D Parcel...</span> : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Assign & Extrude 3D ULPIN</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
