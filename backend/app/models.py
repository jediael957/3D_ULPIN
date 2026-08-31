from sqlalchemy import Column, Integer, String, Float, DateTime, Text, func
from app.database import Base

class Plot3DModel(Base):
    __tablename__ = "plots_3d"

    id = Column(Integer, primary_key=True, index=True)
    ulpin_3d = Column(String(100), unique=True, index=True, nullable=False)
    plot_2d_id = Column(String(50), index=True, nullable=False)
    state_code = Column(String(10), nullable=False, default="IN-DL")
    district_code = Column(String(10), nullable=False, default="110001")
    building_name = Column(String(100), nullable=False)
    floor_number = Column(Integer, nullable=False)
    unit_number = Column(String(20), nullable=False)
    z_min = Column(Float, nullable=False)
    z_max = Column(Float, nullable=False)
    owner_name = Column(String(150), nullable=False)
    property_type = Column(String(50), nullable=False)
    status = Column(String(30), nullable=False)
    air_land_rights = Column(String(50), nullable=False)
    area_sqm = Column(Float, nullable=False)
    coordinates_json = Column(Text, nullable=True) # JSON stored coordinates string for portability
    created_at = Column(DateTime(timezone=True), server_default=func.now())
