-- Enable PostGIS extension for 3D spatial operations
CREATE EXTENSION IF NOT EXISTS postgis;

-- 3D Cadastral Land Parcel Table
DROP TABLE IF EXISTS plots_3d CASCADE;

CREATE TABLE plots_3d (
    id SERIAL PRIMARY KEY,
    ulpin_3d VARCHAR(100) UNIQUE NOT NULL,
    plot_2d_id VARCHAR(50) NOT NULL,
    state_code VARCHAR(10) NOT NULL DEFAULT 'IN-DL',
    district_code VARCHAR(10) NOT NULL DEFAULT '110001',
    building_name VARCHAR(100) NOT NULL,
    floor_number INT NOT NULL,
    unit_number VARCHAR(20) NOT NULL,
    z_min FLOAT NOT NULL,
    z_max FLOAT NOT NULL,
    owner_name VARCHAR(150) NOT NULL,
    property_type VARCHAR(50) NOT NULL, -- Residential, Commercial, Mixed Use, Institutional
    status VARCHAR(30) NOT NULL,       -- Registered, Pending, Government Owned, Commercial
    air_land_rights VARCHAR(50) NOT NULL, -- Air Rights, Subsurface Rights, Fee Simple Title
    area_sqm FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(PolygonZ, 4326)
);

-- Create 3D Spatial Index using GIST
CREATE INDEX IF NOT EXISTS plots_3d_geom_idx ON plots_3d USING GIST (geom);
CREATE INDEX IF NOT EXISTS plots_3d_ulpin_idx ON plots_3d (ulpin_3d);
CREATE INDEX IF NOT EXISTS plots_3d_plot_2d_idx ON plots_3d (plot_2d_id);
