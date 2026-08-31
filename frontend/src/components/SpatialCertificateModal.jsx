import React, { useState, useEffect } from 'react';
import { X, Printer, ShieldCheck, Box, QrCode, Building, Award, Calendar } from 'lucide-react';
import { fetchSpatialCertificate } from '../utils/api';

export default function SpatialCertificateModal({ ulpin_3d, isOpen, onClose }) {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && ulpin_3d) {
      setLoading(true);
      fetchSpatialCertificate(ulpin_3d).then(data => {
        setCertificate(data);
        setLoading(false);
      });
    }
  }, [isOpen, ulpin_3d]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-100">Official 3D Cadastral Spatial Certificate</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Content */}
        <div className="p-8 overflow-y-auto bg-slate-950 text-slate-100 space-y-6 border border-slate-800/80 m-4 rounded-xl relative shadow-inner">
          {/* Watermark / Badge */}
          <div className="absolute right-6 top-6 opacity-10 pointer-events-none">
            <ShieldCheck className="w-36 h-36 text-blue-400" />
          </div>

          {loading || !certificate ? (
            <div className="py-12 text-center text-slate-400 font-medium text-xs">
              Loading 3D Spatial Title Certificate...
            </div>
          ) : (
            <>
              {/* Header Title */}
              <div className="text-center space-y-2 border-b border-slate-800 pb-6">
                <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>GOVERNMENT OF INDIA • CADASTRA 3D REGISTRY</span>
                </div>
                <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
                  CERTIFICATE OF 3D VERTICAL PROPERTY TITLE
                </h1>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {certificate.authority}
                </p>
              </div>

              {/* Certificate Number & Issue Date */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div>Certificate ID: <span className="text-blue-400 font-semibold">{certificate.certificate_id}</span></div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Issue Date: {certificate.issue_date}</span>
                </div>
              </div>

              {/* 3D ULPIN Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 rounded-xl border border-blue-800/50 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-300 font-semibold">
                  Unique 3D Land Parcel Identification Number (3D ULPIN)
                </span>
                <p className="text-base font-mono font-bold text-blue-400 tracking-wide break-all">
                  {certificate.ulpin_3d}
                </p>
              </div>

              {/* Spatial Ledger Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 text-[10px]">Primary Title Holder</span>
                  <p className="font-bold text-slate-200 text-sm">{certificate.owner_name}</p>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 text-[10px]">Building Complex & Unit</span>
                  <p className="font-bold text-slate-200 text-sm">
                    {certificate.building_name} (Floor {certificate.floor_number}, Unit {certificate.unit_number})
                  </p>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 text-[10px]">Vertical Elevation Envelope</span>
                  <p className="font-bold text-slate-200 text-sm">{certificate.z_elevation_range}</p>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 text-[10px]">Title Rights Classification</span>
                  <p className="font-bold text-emerald-400 text-sm">{certificate.air_land_rights}</p>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 text-[10px]">Ground Footprint Area</span>
                  <p className="font-bold text-slate-200 text-sm">{certificate.area_sqm} m²</p>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 text-[10px]">Enclosed 3D Air Volume</span>
                  <p className="font-bold text-purple-400 text-sm">{certificate.volume_cubic_meters} m³</p>
                </div>
              </div>

              {/* QR Code Verification Section */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-300">Cryptographic 3D Parcel Verification</span>
                  <p className="text-[10px] text-slate-400 max-w-xs">
                    Scan to verify spatial bounds and title ownership on the National PostGIS Cadastral Ledger.
                  </p>
                </div>

                <div className="p-2 bg-white rounded-lg shadow-md shrink-0 flex items-center justify-center">
                  {/* SVG Mock QR Code */}
                  <div className="w-16 h-16 bg-slate-950 rounded p-1 text-white font-mono text-[8px] flex flex-col items-center justify-center text-center leading-tight">
                    <QrCode className="w-10 h-10 text-white mb-0.5" />
                    <span>3D-ULPIN</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
