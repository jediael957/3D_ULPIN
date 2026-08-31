from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class Coordinate3D(BaseModel):
    longitude: float
    latitude: float
    elevation: float = 0.0

class PolygonGeometry3D(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]] # GeoJSON Polygon format: [[[lon, lat, z], ...]]

class Parcel3DBase(BaseModel):
    ulpin_3d: str
    plot_2d_id: str
    state_code: str = "IN-DL"
    district_code: str = "110001"
    building_name: str
    floor_number: int
    unit_number: str
    z_min: float
    z_max: float
    owner_name: str
    property_type: str
    status: str # Registered, Pending, Government Owned, Commercial
    air_land_rights: str # Fee Simple Title, Air Rights, Subsurface Rights
    area_sqm: float

class ULPINCreateRequest(BaseModel):
    state_code: str = Field("IN-DL", example="IN-DL")
    district_code: str = Field("110001", example="110001")
    plot_2d_id: str = Field("P402", example="P402")
    building_name: str = Field("Connaught Heights", example="Connaught Heights")
    floor_number: int = Field(4, example=4)
    unit_number: str = Field("401", example="401")
    z_min: float = Field(13.5, example=13.5)
    z_max: float = Field(18.5, example=18.5)
    owner_name: str = Field("Vikramaditya Oberoi", example="Vikramaditya Oberoi")
    property_type: str = Field("Luxury Penthouse", example="Luxury Penthouse")
    status: str = Field("Registered", example="Registered")
    air_land_rights: str = Field("Air Rights", example="Air Rights")
    coordinates: List[List[float]] = Field(
        default=[
            [77.2165, 28.6312],
            [77.2175, 28.6312],
            [77.2175, 28.6317],
            [77.2165, 28.6317],
            [77.2165, 28.6312]
        ],
        description="List of [lon, lat] polygon boundary points"
    )

class Parcel3DResponse(Parcel3DBase):
    id: int
    coordinates: List[List[float]]

    class Config:
        from_attributes = True

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    id: int
    geometry: Dict[str, Any]
    properties: Dict[str, Any]

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]

class SpatialCertificateResponse(BaseModel):
    certificate_id: str
    ulpin_3d: str
    issue_date: str
    owner_name: str
    building_name: str
    floor_number: int
    unit_number: str
    z_elevation_range: str
    volume_cubic_meters: float
    area_sqm: float
    property_type: str
    status: str
    air_land_rights: str
    polygon_coordinates: List[List[float]]
    qr_payload: str
    authority: str = "Survey of India - 3D Cadastral & Vertical Mapping Division"
