import * as Cesium from 'cesium';

export function getStatusColor(status, alpha = 0.65) {
  switch (status) {
    case 'Registered':
      return Cesium.Color.fromCssColorString('#10B981').withAlpha(alpha); // Emerald
    case 'Pending':
      return Cesium.Color.fromCssColorString('#F59E0B').withAlpha(alpha); // Amber
    case 'Government Owned':
      return Cesium.Color.fromCssColorString('#3B82F6').withAlpha(alpha); // Blue
    case 'Commercial':
      return Cesium.Color.fromCssColorString('#8B5CF6').withAlpha(alpha); // Purple
    default:
      return Cesium.Color.fromCssColorString('#64748B').withAlpha(alpha); // Slate
  }
}

export function getStatusOutlineColor(status) {
  switch (status) {
    case 'Registered':
      return Cesium.Color.fromCssColorString('#059669');
    case 'Pending':
      return Cesium.Color.fromCssColorString('#D97706');
    case 'Government Owned':
      return Cesium.Color.fromCssColorString('#2563EB');
    case 'Commercial':
      return Cesium.Color.fromCssColorString('#7C3AED');
    default:
      return Cesium.Color.fromCssColorString('#475569');
  }
}

export const HIGHLIGHT_COLOR = Cesium.Color.fromCssColorString('#38BDF8').withAlpha(0.9); // Cyan
export const HIGHLIGHT_OUTLINE = Cesium.Color.fromCssColorString('#F0F9FF');

export const DEFAULT_CAMERA_VIEW = {
  destination: Cesium.Cartesian3.fromDegrees(77.2167, 28.6300, 450.0), // Connaught Place Delhi 3D view
  orientation: {
    heading: Cesium.Math.toRadians(15.0),
    pitch: Cesium.Math.toRadians(-35.0),
    roll: 0.0
  }
};
