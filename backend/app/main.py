import json
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import PORT, HOST, CESIUM_ION_TOKEN
from app.database import Base, engine, get_db
from app.schemas import ULPINCreateRequest, GeoJSONFeatureCollection, SpatialCertificateResponse, Parcel3DBase
import app.crud as crud

# Initialize database schema tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="3D ULPIN & Vertical Property Mapping System API",
    description="Backend spatial API for SIH26011: 3D ULPIN Generation & Cadastral Mapping",
    version="1.0.0"
)

# Enable CORS for Vite frontend (localhost:5173) & external spatial clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "service": "3D ULPIN & Vertical Cadastre Mapping System API",
        "version": "1.0.0",
        "endpoints": [
            "/api/v1/parcels/3d",
            "/api/v1/parcels/ulpin/{ulpin_id}",
            "/api/v1/parcels/generate-ulpin",
            "/api/v1/parcels/auto-detect-city",
            "/api/v1/parcels/ulpin/{ulpin_id}/certificate"
        ]
    }

@app.get("/api/v1/parcels/3d", tags=["Spatial 3D Parcels"])
def get_3d_parcels(db: Session = Depends(get_db)):
    """
    Returns all 3D parcel volumes in GeoJSON FeatureCollection format with height & elevation properties.
    """
    parcels = crud.get_all_parcels(db)
    features = []
    
    for parcel in parcels:
        coords = json.loads(parcel.coordinates_json) if parcel.coordinates_json else []
        coords_3d = [[c[0], c[1], parcel.z_min] for c in coords]
        
        feature = {
            "type": "Feature",
            "id": parcel.id,
            "geometry": {
                "type": "Polygon",
                "coordinates": [coords_3d]
            },
            "properties": {
                "ulpin_3d": parcel.ulpin_3d,
                "plot_2d_id": parcel.plot_2d_id,
                "building_name": parcel.building_name,
                "floor_number": parcel.floor_number,
                "unit_number": parcel.unit_number,
                "z_min": parcel.z_min,
                "z_max": parcel.z_max,
                "height": abs(parcel.z_max - parcel.z_min),
                "owner_name": parcel.owner_name,
                "property_type": parcel.property_type,
                "status": parcel.status,
                "air_land_rights": parcel.air_land_rights,
                "area_sqm": parcel.area_sqm,
                "2d_coordinates": coords
            }
        }
        features.append(feature)
        
    return {
        "type": "FeatureCollection",
        "features": features
    }

@app.delete("/api/v1/parcels/ulpin/{ulpin_id}", tags=["Spatial 3D Parcels"])
def delete_3d_parcel(ulpin_id: str, db: Session = Depends(get_db)):
    """
    Deletes a 3D block / parcel volume from database by ULPIN.
    """
    success = crud.delete_parcel_by_ulpin(db, ulpin_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parcel record '{ulpin_id}' not found for deletion."
        )
    return {"message": f"3D ULPIN parcel '{ulpin_id}' successfully deleted.", "ulpin_3d": ulpin_id}

@app.post("/api/v1/parcels/auto-detect-city", tags=["3D ULPIN Engine"])
def auto_detect_city_parcels(db: Session = Depends(get_db)):
    """
    Automatically detects high-density commercial buildings in city district and generates 3D Cadastral blocks.
    """
    parcels = crud.auto_detect_and_generate_city(db)
    return {
        "message": f"Successfully auto-detected and generated {len(parcels)} 3D Cadastral blocks across commercial district.",
        "count": len(parcels)
    }

@app.get("/api/v1/parcels/ulpin/{ulpin_id}", tags=["Spatial 3D Parcels"])
def get_parcel_by_ulpin(ulpin_id: str, db: Session = Depends(get_db)):
    parcel = crud.get_parcel_by_ulpin(db, ulpin_id)
    if not parcel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"3D ULPIN record '{ulpin_id}' not found."
        )
    
    coords = json.loads(parcel.coordinates_json) if parcel.coordinates_json else []
    sibling_units = crud.get_parcels_by_plot_2d(db, parcel.plot_2d_id)
    
    return {
        "ulpin_3d": parcel.ulpin_3d,
        "plot_2d_id": parcel.plot_2d_id,
        "state_code": parcel.state_code,
        "district_code": parcel.district_code,
        "building_name": parcel.building_name,
        "floor_number": parcel.floor_number,
        "unit_number": parcel.unit_number,
        "z_min": parcel.z_min,
        "z_max": parcel.z_max,
        "height_meters": abs(parcel.z_max - parcel.z_min),
        "owner_name": parcel.owner_name,
        "property_type": parcel.property_type,
        "status": parcel.status,
        "air_land_rights": parcel.air_land_rights,
        "area_sqm": parcel.area_sqm,
        "coordinates": coords,
        "building_total_units": len(sibling_units),
        "created_at": parcel.created_at.isoformat() if parcel.created_at else None
    }

@app.post("/api/v1/parcels/generate-ulpin", tags=["3D ULPIN Engine"])
def generate_and_save_ulpin(payload: ULPINCreateRequest, db: Session = Depends(get_db)):
    if payload.z_min >= payload.z_max:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Spatial validation error: z_min must be strictly less than z_max for vertical volume creation."
        )
        
    created_parcel = crud.create_3d_parcel(db, payload)
    coords = json.loads(created_parcel.coordinates_json) if created_parcel.coordinates_json else []
    
    return {
        "message": "3D ULPIN successfully generated and registered in Cadastral database.",
        "ulpin_3d": created_parcel.ulpin_3d,
        "parcel_id": created_parcel.id,
        "details": {
            "ulpin_3d": created_parcel.ulpin_3d,
            "plot_2d_id": created_parcel.plot_2d_id,
            "building_name": created_parcel.building_name,
            "floor_number": created_parcel.floor_number,
            "unit_number": created_parcel.unit_number,
            "z_min": created_parcel.z_min,
            "z_max": created_parcel.z_max,
            "owner_name": created_parcel.owner_name,
            "property_type": created_parcel.property_type,
            "status": created_parcel.status,
            "air_land_rights": created_parcel.air_land_rights,
            "area_sqm": created_parcel.area_sqm,
            "coordinates": coords
        }
    }

@app.get("/api/v1/parcels/ulpin/{ulpin_id}/certificate", response_model=SpatialCertificateResponse, tags=["Cadastral Certificates"])
def get_spatial_certificate(ulpin_id: str, db: Session = Depends(get_db)):
    parcel = crud.get_parcel_by_ulpin(db, ulpin_id)
    if not parcel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"3D ULPIN record '{ulpin_id}' not found."
        )
    return crud.build_spatial_certificate(parcel)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
