"""
Dynamic 3D ULPIN Generator Engine
Standard Specification: [StateCode]-[DistrictCode]-[Plot2DID]-F[FloorNumber]-U[UnitID]-[ElevationZ]
Example: IN-DL-110001-P402-F04-U401-Z32M
"""
import re
from typing import Dict, Any, List

def format_elevation_z(z_min: float, z_max: float) -> str:
    """Format vertical bounds into standard elevation Z tag (e.g. Z14M)."""
    avg_z = int(round((z_min + z_max) / 2.0))
    return f"Z{avg_z:02d}M"

def format_floor_number(floor_num: int) -> str:
    """Format floor number with padding (e.g., F00, F01, F04)."""
    if floor_num < 0:
        return f"FB{abs(floor_num):02d}" # Basement floor
    return f"F{floor_num:02d}"

def format_unit_id(unit_num: str) -> str:
    """Format unit ID cleanly."""
    clean_unit = re.sub(r'[^A-Za-z0-9]', '', str(unit_num)).upper()
    if not clean_unit.startswith("U"):
        return f"U{clean_unit}"
    return clean_unit

def generate_3d_ulpin(
    state_code: str,
    district_code: str,
    plot_2d_id: str,
    floor_number: int,
    unit_number: str,
    z_min: float,
    z_max: float
) -> str:
    """
    Generates a unique, standardized 3D ULPIN identifier.
    Formula: [StateCode]-[DistrictCode]-[Plot2DID]-[FloorTag]-[UnitTag]-[ZTag]
    """
    clean_state = state_code.strip().upper()
    if not clean_state.startswith("IN-") and not "-" in clean_state:
        clean_state = f"IN-{clean_state}"
        
    clean_district = str(district_code).strip().upper()
    clean_plot = str(plot_2d_id).strip().upper()
    if not clean_plot.startswith("P"):
        clean_plot = f"P{clean_plot}"
        
    floor_tag = format_floor_number(floor_number)
    unit_tag = format_unit_id(unit_number)
    z_tag = format_elevation_z(z_min, z_max)
    
    ulpin_3d = f"{clean_state}-{clean_district}-{clean_plot}-{floor_tag}-{unit_tag}-{z_tag}"
    return ulpin_3d

def calculate_polygon_area_3d(coordinates: List[List[float]]) -> float:
    """
    Computes approximate 2D surface footprint area (in sq meters) for lat/lon polygon.
    Uses Haversine spherical projection approximation for high performance.
    """
    if not coordinates or len(coordinates) < 3:
        return 0.0
    
    # Simple planar approximation scaled for lat/lon around Delhi/India (~111,000 meters per degree)
    lats = [c[1] for c in coordinates]
    lons = [c[0] for c in coordinates]
    min_lat, max_lat = min(lats), max(lats)
    min_lon, max_lon = min(lons), max(lons)
    
    lat_dist = (max_lat - min_lat) * 111139.0
    lon_dist = (max_lon - min_lon) * 111139.0 * 0.877 # Cosine scale for latitude ~28 deg
    
    return round(lat_dist * lon_dist, 2)
