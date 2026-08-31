import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, Building2, User, MoveVertical, Compass, FileCheck, Tag, Trash2, Eye } from 'lucide-react';
import { deleteParcelByUlpin } from '../utils/api';

export default function UnitInspector({ selectedUnit, onOpenCertificate, onDeleteUnit, onTriggerStreetView }) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!selectedUnit) {
    return (
      <div className="p-6 text-center text-slate-400 space-y-3 my-auto">
        <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200">No Vertical Unit Selected</h3>
          <p className="text-xs text-slate-400 mt-1">
            Click on any 3D floor volume in the viewer to inspect ownership title, vertical bounds, and 3D ULPIN details.
          </p>
        </div>
      </div>
    );
  }

  const props = selectedUnit.properties || selectedUnit;
  const height = Math.abs(props.z_max - props.z_min).toFixed(1);

  const handleCopyUlpin = () => {
    navigator.clipboard.writeText(props.ulpin_3d);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete 3D Block '${props.ulpin_3d}'?`)) return;
    setDeleting(true);
    try {
      await deleteParcelByUlpin(props.ulpin_3d);
      if (onDeleteUnit) onDeleteUnit(props.ulpin_3d);
    } catch (err) {
      alert("Failed to delete parcel block: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Registered':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Government Owned':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Commercial':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="p-5 space-y-5">
      {/* Title & Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400">
            {props.building_name} • Floor {props.floor_number}
          </span>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadgeClass(props.status)}`}>
            {props.status}
          </span>
        </div>
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <span>Unit {props.unit_number}</span>
          <span className="text-xs font-normal text-slate-400">({props.property_type})</span>
        </h2>
      </div>

      {/* 3D ULPIN Badge */}
      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-400" />
            3D ULPIN Identifier
          </span>
          <button
            onClick={handleCopyUlpin}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="font-mono text-xs font-semibold text-blue-400 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800/80 break-all select-all">
          {props.ulpin_3d}
        </div>
      </div>

      {/* Street View Perspective Quick Action Button */}
      <button
        onClick={() => onTriggerStreetView(props)}
        className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
      >
        <Eye className="w-4 h-4 text-amber-400" />
        <span>Ground-Level Street View (Side-Look Perspective)</span>
      </button>

      {/* Elevation & Vertical Bounds */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
            <MoveVertical className="w-3.5 h-3.5 text-indigo-400" />
            <span>Elevation Bounds</span>
          </div>
          <p className="text-sm font-semibold text-slate-200">
            {props.z_min}m to {props.z_max}m
          </p>
          <p className="text-[10px] text-slate-400">Height: {height} meters</p>
        </div>

        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>Unit Footprint</span>
          </div>
          <p className="text-sm font-semibold text-slate-200">{props.area_sqm} m²</p>
          <p className="text-[10px] text-slate-400">Vol: {(props.area_sqm * height).toFixed(0)} m³</p>
        </div>
      </div>

      {/* Owner & Rights Metadata */}
      <div className="space-y-3 bg-slate-800/30 p-4 rounded-xl border border-slate-800/80 text-xs">
        <div className="flex items-start space-x-3">
          <User className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px]">Registered Owner</span>
            <p className="font-semibold text-slate-200">{props.owner_name}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px]">Air / Land Rights Classification</span>
            <p className="font-semibold text-slate-200">{props.air_land_rights}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Building2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px]">2D Parent Plot ID</span>
            <p className="font-semibold text-slate-200">{props.plot_2d_id}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons: View Certificate & Delete Block */}
      <div className="space-y-2">
        <button
          onClick={() => onOpenCertificate(props.ulpin_3d)}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md shadow-blue-900/30 transition-all"
        >
          <FileCheck className="w-4 h-4" />
          <span>View 3D Spatial Certificate</span>
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span>{deleting ? 'Deleting Block...' : 'Delete 3D Block'}</span>
        </button>
      </div>
    </div>
  );
}
