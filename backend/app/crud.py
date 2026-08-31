import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import Plot3DModel
from app.schemas import ULPINCreateRequest, SpatialCertificateResponse
from app.ulpin_engine import generate_3d_ulpin, calculate_polygon_area_3d

# High-density 3D Commercial Towers in Connaught Place & Cyber City
HIGH_DENSITY_CITY_PARCELS = [
  # Building 1: Connaught Heights Tower (Plot P402)
  {"ulpin_3d": "IN-DL-110001-P402-F00-U101-Z02M", "plot_2d_id": "P402", "state_code": "IN-DL", "district_code": "110001", "building_name": "Connaught Heights", "floor_number": 0, "unit_number": "101", "z_min": 0.0, "z_max": 4.0, "owner_name": "Apex Retail Holdings Pvt Ltd", "property_type": "Commercial Retail", "status": "Commercial", "air_land_rights": "Fee Simple Title", "area_sqm": 450.0, "coordinates": [[77.2162, 28.6308], [77.2166, 28.6308], [77.2166, 28.6311], [77.2162, 28.6311], [77.2162, 28.6308]]},
  {"ulpin_3d": "IN-DL-110001-P402-F01-U201-Z06M", "plot_2d_id": "P402", "state_code": "IN-DL", "district_code": "110001", "building_name": "Connaught Heights", "floor_number": 1, "unit_number": "201", "z_min": 4.0, "z_max": 8.0, "owner_name": "Rajesh Kumar Consultancy", "property_type": "Commercial Office", "status": "Registered", "air_land_rights": "Air Rights", "area_sqm": 450.0, "coordinates": [[77.2162, 28.6308], [77.2166, 28.6308], [77.2166, 28.6311], [77.2162, 28.6311], [77.2162, 28.6308]]},
  {"ulpin_3d": "IN-DL-110001-P402-F02-U301-Z10M", "plot_2d_id": "P402", "state_code": "IN-DL", "district_code": "110001", "building_name": "Connaught Heights", "floor_number": 2, "unit_number": "301", "z_min": 8.0, "z_max": 12.0, "owner_name": "Vanguard Digital Solutions", "property_type": "Commercial Office", "status": "Pending", "air_land_rights": "Air Rights", "area_sqm": 450.0, "coordinates": [[77.2162, 28.6308], [77.2166, 28.6308], [77.2166, 28.6311], [77.2162, 28.6311], [77.2162, 28.6308]]},
  {"ulpin_3d": "IN-DL-110001-P402-F03-U401-Z14M", "plot_2d_id": "P402", "state_code": "IN-DL", "district_code": "110001", "building_name": "Connaught Heights", "floor_number": 3, "unit_number": "401", "z_min": 12.0, "z_max": 16.0, "owner_name": "National Land Records Division", "property_type": "Government Utility", "status": "Government Owned", "air_land_rights": "Air Rights", "area_sqm": 450.0, "coordinates": [[77.2162, 28.6308], [77.2166, 28.6308], [77.2166, 28.6311], [77.2162, 28.6311], [77.2162, 28.6308]]},
  {"ulpin_3d": "IN-DL-110001-P402-F04-U501-Z18M", "plot_2d_id": "P402", "state_code": "IN-DL", "district_code": "110001", "building_name": "Connaught Heights", "floor_number": 4, "unit_number": "501", "z_min": 16.0, "z_max": 21.0, "owner_name": "Vikramaditya Oberoi", "property_type": "Luxury Penthouse", "status": "Registered", "air_land_rights": "Air Rights", "area_sqm": 450.0, "coordinates": [[77.2162, 28.6308], [77.2166, 28.6308], [77.2166, 28.6311], [77.2162, 28.6311], [77.2162, 28.6308]]},

  # Building 2: Statesman House Complex (Plot P501)
  {"ulpin_3d": "IN-DL-110001-P501-F00-U101-Z02M", "plot_2d_id": "P501", "state_code": "IN-DL", "district_code": "110001", "building_name": "Statesman House", "floor_number": 0, "unit_number": "101", "z_min": 0.0, "z_max": 4.5, "owner_name": "HDFC Bank Ltd", "property_type": "Banking Facility", "status": "Commercial", "air_land_rights": "Fee Simple Title", "area_sqm": 580.0, "coordinates": [[77.2215, 28.6308], [77.2220, 28.6308], [77.2220, 28.6313], [77.2215, 28.6313], [77.2215, 28.6308]]},
  {"ulpin_3d": "IN-DL-110001-P501-F01-U201-Z07M", "plot_2d_id": "P501", "state_code": "IN-DL", "district_code": "110001", "building_name": "Statesman House", "floor_number": 1, "unit_number": "201", "z_min": 4.5, "z_max": 9.0, "owner_name": "KPMG India Headquarters", "property_type": "Commercial Office", "status": "Registered", "air_land_rights": "Air Rights", "area_sqm": 580.0, "coordinates": [[77.2215, 28.6308], [77.2220, 28.6308], [77.2220, 28.6313], [77.2215, 28.6313], [77.2215, 28.6308]]},
  {"ulpin_3d": "IN-DL-110001-P501-F02-U301-Z11M", "plot_2d_id": "P501", "state_code": "IN-DL", "district_code": "110001", "building_name": "Statesman House", "floor_number": 2, "unit_number": "301", "z_min": 9.0, "z_max": 13.5, "owner_name": "Deloitte Advisory Labs", "property_type": "Commercial Office", "status": "Registered", "air_land_rights": "Air Rights", "area_sqm": 580.0, "coordinates": [[77.2215, 28.6308], [77.2220, 28.6308], [77.2220, 28.6313], [77.2215, 28.6313], [77.2215, 28.6308]]},
  {"ulpin_3d": "IN-DL-110001-P501-F03-U401-Z16M", "plot_2d_id": "P501", "state_code": "IN-DL", "district_code": "110001", "building_name": "Statesman House", "floor_number": 3, "unit_number": "401", "z_min": 13.5, "z_max": 18.0, "owner_name": "Ministry of Urban Affairs Sub-Office", "property_type": "Government Utility", "status": "Government Owned", "air_land_rights": "Air Rights", "area_sqm": 580.0, "coordinates": [[77.2215, 28.6308], [77.2220, 28.6308], [77.2220, 28.6313], [77.2215, 28.6313], [77.2215, 28.6308]]},
  {"ulpin_3d": "IN-DL-110001-P501-F04-U501-Z20M", "plot_2d_id": "P501", "state_code": "IN-DL", "district_code": "110001", "building_name": "Statesman House", "floor_number": 4, "unit_number": "501", "z_min": 18.0, "z_max": 23.5, "owner_name": "Oberoi Commercial Holdings", "property_type": "Executive Suite", "status": "Pending", "air_land_rights": "Air Rights", "area_sqm": 580.0, "coordinates": [[77.2215, 28.6308], [77.2220, 28.6308], [77.2220, 28.6313], [77.2215, 28.6313], [77.2215, 28.6308]]},

  # Building 3: Barakhamba Commercial Tower (Plot P602)
  {"ulpin_3d": "IN-DL-110001-P602-F00-U101-Z02M", "plot_2d_id": "P602", "state_code": "IN-DL", "district_code": "110001", "building_name": "Barakhamba Tower", "floor_number": 0, "unit_number": "101", "z_min": 0.0, "z_max": 4.0, "owner_name": "Standard Chartered Bank", "property_type": "Commercial Retail", "status": "Commercial", "air_land_rights": "Fee Simple Title", "area_sqm": 410.0, "coordinates": [[77.2185, 28.6295], [77.2189, 28.6295], [77.2189, 28.6299], [77.2185, 28.6299], [77.2185, 28.6295]]},
  {"ulpin_3d": "IN-DL-110001-P602-F01-U201-Z06M", "plot_2d_id": "P602", "state_code": "IN-DL", "district_code": "110001", "building_name": "Barakhamba Tower", "floor_number": 1, "unit_number": "201", "z_min": 4.0, "z_max": 8.0, "owner_name": "Tata Consultancy Services", "property_type": "Commercial Office", "status": "Registered", "air_land_rights": "Air Rights", "area_sqm": 410.0, "coordinates": [[77.2185, 28.6295], [77.2189, 28.6295], [77.2189, 28.6299], [77.2185, 28.6299], [77.2185, 28.6295]]},
  {"ulpin_3d": "IN-DL-110001-P602-F02-U301-Z10M", "plot_2d_id": "P602", "state_code": "IN-DL", "district_code": "110001", "building_name": "Barakhamba Tower", "floor_number": 2, "unit_number": "301", "z_min": 8.0, "z_max": 12.0, "owner_name": "Infosys Innovation Hub", "property_type": "Commercial Office", "status": "Registered", "air_land_rights": "Air Rights", "area_sqm": 410.0, "coordinates": [[77.2185, 28.6295], [77.2189, 28.6295], [77.2189, 28.6299], [77.2185, 28.6299], [77.2185, 28.6295]]},

  # Building 4: Inner Circle Block A (Plot P101)
  {"ulpin_3d": "IN-DL-110001-P101-F00-U101-Z02M", "plot_2d_id": "P101", "state_code": "IN-DL", "district_code": "110001", "building_name": "Inner Circle Block A", "floor_number": 0, "unit_number": "101", "z_min": 0.0, "z_max": 4.0, "owner_name": "Wenger's Heritage Bakery", "property_type": "Heritage Retail", "status": "Registered", "air_land_rights": "Fee Simple Title", "area_sqm": 390.0, "coordinates": [[77.2180, 28.6328], [77.2184, 28.6328], [77.2184, 28.6332], [77.2180, 28.6332], [77.2180, 28.6328]]},
  {"ulpin_3d": "IN-DL-110001-P101-F01-U201-Z06M", "plot_2d_id": "P101", "state_code": "IN-DL", "district_code": "110001", "building_name": "Inner Circle Block A", "floor_number": 1, "unit_number": "201", "z_min": 4.0, "z_max": 8.0, "owner_name": "United Coffee House Chambers", "property_type": "Commercial Hospitality", "status": "Registered", "air_land_rights": "Air Rights", "area_sqm": 390.0, "coordinates": [[77.2180, 28.6328], [77.2184, 28.6328], [77.2184, 28.6332], [77.2180, 28.6332], [77.2180, 28.6328]]},

  # Building 5: Cyber Hub Horizon Tower (Gurugram Plot P805)
  {"ulpin_3d": "IN-HR-122002-P805-F00-U001-Z02M", "plot_2d_id": "P805", "state_code": "IN-HR", "district_code": "122002", "building_name": "Horizon Tower", "floor_number": 0, "unit_number": "001", "z_min": 0.0, "z_max": 5.0, "owner_name": "Gurugram Municipal Corporation", "property_type": "Government Utility", "status": "Government Owned", "air_land_rights": "Fee Simple Title", "area_sqm": 520.0, "coordinates": [[77.0880, 28.4950], [77.0885, 28.4950], [77.0885, 28.4955], [77.0880, 28.4955], [77.0880, 28.4950]]},
  {"ulpin_3d": "IN-HR-122002-P805-F01-U101-Z07M", "plot_2d_id": "P805", "state_code": "IN-HR", "district_code": "122002", "building_name": "Horizon Tower", "floor_number": 1, "unit_number": "101", "z_min": 5.0, "z_max": 10.0, "owner_name": "Indus AI Research Labs", "property_type": "Commercial R&D", "status": "Registered", "air_land_rights": "Air Rights", "area_sqm": 520.0, "coordinates": [[77.0880, 28.4950], [77.0885, 28.4950], [77.0885, 28.4955], [77.0880, 28.4955], [77.0880, 28.4950]]},
  {"ulpin_3d": "IN-HR-122002-P805-F02-U201-Z12M", "plot_2d_id": "P805", "state_code": "IN-HR", "district_code": "122002", "building_name": "Horizon Tower", "floor_number": 2, "unit_number": "201", "z_min": 10.0, "z_max": 15.0, "owner_name": "CloudScale Systems India", "property_type": "Commercial IT", "status": "Pending", "air_land_rights": "Air Rights", "area_sqm": 520.0, "coordinates": [[77.0880, 28.4950], [77.0885, 28.4950], [77.0885, 28.4955], [77.0880, 28.4955], [77.0880, 28.4950]]}
]

def seed_database_if_empty(db: Session, force_reset: bool = False):
    """Populates initial seed data into DB."""
    if force_reset:
        db.query(Plot3DModel).delete()
        db.commit()

    count = db.query(Plot3DModel).count()
    if count == 0 or force_reset:
        for seed in HIGH_DENSITY_CITY_PARCELS:
            item = Plot3DModel(
                ulpin_3d=seed["ulpin_3d"],
                plot_2d_id=seed["plot_2d_id"],
                state_code=seed["state_code"],
                district_code=seed["district_code"],
                building_name=seed["building_name"],
                floor_number=seed["floor_number"],
                unit_number=seed["unit_number"],
                z_min=seed["z_min"],
                z_max=seed["z_max"],
                owner_name=seed["owner_name"],
                property_type=seed["property_type"],
                status=seed["status"],
                air_land_rights=seed["air_land_rights"],
                area_sqm=seed["area_sqm"],
                coordinates_json=json.dumps(seed["coordinates"])
            )
            db.add(item)
        db.commit()

def get_all_parcels(db: Session) -> List[Plot3DModel]:
    seed_database_if_empty(db)
    return db.query(Plot3DModel).all()

def get_parcel_by_ulpin(db: Session, ulpin_3d: str) -> Optional[Plot3DModel]:
    seed_database_if_empty(db)
    return db.query(Plot3DModel).filter(Plot3DModel.ulpin_3d == ulpin_3d).first()

def get_parcels_by_plot_2d(db: Session, plot_2d_id: str) -> List[Plot3DModel]:
    seed_database_if_empty(db)
    return db.query(Plot3DModel).filter(Plot3DModel.plot_2d_id == plot_2d_id).all()

def delete_parcel_by_ulpin(db: Session, ulpin_3d: str) -> bool:
    """Deletes a 3D block parcel from database by ULPIN."""
    parcel = db.query(Plot3DModel).filter(Plot3DModel.ulpin_3d == ulpin_3d).first()
    if parcel:
        db.delete(parcel)
        db.commit()
        return True
    return False

def auto_detect_and_generate_city(db: Session) -> List[Plot3DModel]:
    """Auto-detects buildings in commercial zone and populates all 3D Cadastral blocks."""
    seed_database_if_empty(db, force_reset=True)
    return db.query(Plot3DModel).all()

def create_3d_parcel(db: Session, payload: ULPINCreateRequest) -> Plot3DModel:
    seed_database_if_empty(db)
    
    generated_ulpin = generate_3d_ulpin(
        state_code=payload.state_code,
        district_code=payload.district_code,
        plot_2d_id=payload.plot_2d_id,
        floor_number=payload.floor_number,
        unit_number=payload.unit_number,
        z_min=payload.z_min,
        z_max=payload.z_max
    )
    
    area = calculate_polygon_area_3d(payload.coordinates)
    
    existing = db.query(Plot3DModel).filter(Plot3DModel.ulpin_3d == generated_ulpin).first()
    if existing:
        return existing
        
    db_parcel = Plot3DModel(
        ulpin_3d=generated_ulpin,
        plot_2d_id=payload.plot_2d_id,
        state_code=payload.state_code,
        district_code=payload.district_code,
        building_name=payload.building_name,
        floor_number=payload.floor_number,
        unit_number=payload.unit_number,
        z_min=payload.z_min,
        z_max=payload.z_max,
        owner_name=payload.owner_name,
        property_type=payload.property_type,
        status=payload.status,
        air_land_rights=payload.air_land_rights,
        area_sqm=area if area > 0 else 400.0,
        coordinates_json=json.dumps(payload.coordinates)
    )
    db.add(db_parcel)
    db.commit()
    db.refresh(db_parcel)
    return db_parcel

def build_spatial_certificate(parcel: Plot3DModel) -> SpatialCertificateResponse:
    coords = json.loads(parcel.coordinates_json) if parcel.coordinates_json else []
    height = abs(parcel.z_max - parcel.z_min)
    volume = round(parcel.area_sqm * height, 2)
    
    return SpatialCertificateResponse(
        certificate_id=f"CERT-3D-{parcel.id:06d}",
        ulpin_3d=parcel.ulpin_3d,
        issue_date=datetime.now().strftime("%Y-%m-%d"),
        owner_name=parcel.owner_name,
        building_name=parcel.building_name,
        floor_number=parcel.floor_number,
        unit_number=parcel.unit_number,
        z_elevation_range=f"{parcel.z_min:.1f}m to {parcel.z_max:.1f}m (Height: {height:.1f}m)",
        volume_cubic_meters=volume,
        area_sqm=parcel.area_sqm,
        property_type=parcel.property_type,
        status=parcel.status,
        air_land_rights=parcel.air_land_rights,
        polygon_coordinates=coords,
        qr_payload=f"ULPIN:{parcel.ulpin_3d}|OWNER:{parcel.owner_name}|RIGHTS:{parcel.air_land_rights}"
    )
