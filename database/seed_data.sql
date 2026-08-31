-- Seed Data for 3D Cadastral Property Mapping (SIH26011)
-- Location 1: Cannaught Heights, Barakhamba Road, New Delhi (Lat: 28.6315, Lon: 77.2167)
-- Location 2: Tech Tower Complex, Cyber City, Gurgaon (Lat: 28.4952, Lon: 77.0885)

-- Building 1: Connaught Heights Tower A (Plot 2D: P402) - 4 Floors, Multiple Vertical Units
INSERT INTO plots_3d 
(ulpin_3d, plot_2d_id, state_code, district_code, building_name, floor_number, unit_number, z_min, z_max, owner_name, property_type, status, air_land_rights, area_sqm, geom)
VALUES
-- Ground Floor Retail Unit (Unit 101) - Commercial
('IN-DL-110001-P402-F00-U101-Z00M', 'P402', 'IN-DL', '110001', 'Connaught Heights', 0, '101', 0.0, 4.5, 
 'Apex Retail Holdings Pvt Ltd', 'Commercial', 'Commercial', 'Fee Simple Title', 450.0,
 ST_GeomFromText('POLYGON Z ((77.2165 28.6312 0, 77.2170 28.6312 0, 77.2170 28.6317 0, 77.2165 28.6317 0, 77.2165 28.6312 0))', 4326)),

-- Ground Floor Bank Branch (Unit 102) - Government/Public
('IN-DL-110001-P402-F00-U102-Z00M', 'P402', 'IN-DL', '110001', 'Connaught Heights', 0, '102', 0.0, 4.5, 
 'State Bank of India (Govt Branch)', 'Financial / Banking', 'Government Owned', 'Fee Simple Title', 380.0,
 ST_GeomFromText('POLYGON Z ((77.2170 28.6312 0, 77.2175 28.6312 0, 77.2175 28.6317 0, 77.2170 28.6317 0, 77.2170 28.6312 0))', 4326)),

-- 1st Floor Office Space (Unit 201) - Registered
('IN-DL-110001-P402-F01-U201-Z05M', 'P402', 'IN-DL', '110001', 'Connaught Heights', 1, '201', 4.5, 9.0, 
 'Rajesh Kumar & Sons Consultancy', 'Commercial Office', 'Registered', 'Air Rights', 450.0,
 ST_GeomFromText('POLYGON Z ((77.2165 28.6312 4.5, 77.2170 28.6312 4.5, 77.2170 28.6317 4.5, 77.2165 28.6317 4.5, 77.2165 28.6312 4.5))', 4326)),

-- 1st Floor Tech Office (Unit 202) - Pending Registration
('IN-DL-110001-P402-F01-U202-Z05M', 'P402', 'IN-DL', '110001', 'Connaught Heights', 1, '202', 4.5, 9.0, 
 'Vanguard Digital Solutions', 'Commercial Office', 'Pending', 'Air Rights', 380.0,
 ST_GeomFromText('POLYGON Z ((77.2170 28.6312 4.5, 77.2175 28.6312 4.5, 77.2175 28.6317 4.5, 77.2170 28.6317 4.5, 77.2170 28.6312 4.5))', 4326)),

-- 2nd Floor Executive Suite (Unit 301) - Registered
('IN-DL-110001-P402-F02-U301-Z09M', 'P402', 'IN-DL', '110001', 'Connaught Heights', 2, '301', 9.0, 13.5, 
 'Dr. Sunita Sharma', 'Executive Suite', 'Registered', 'Air Rights', 450.0,
 ST_GeomFromText('POLYGON Z ((77.2165 28.6312 9.0, 77.2170 28.6312 9.0, 77.2170 28.6317 9.0, 77.2165 28.6317 9.0, 77.2165 28.6312 9.0))', 4326)),

-- 2nd Floor Legal Firm (Unit 302) - Registered
('IN-DL-110001-P402-F02-U302-Z09M', 'P402', 'IN-DL', '110001', 'Connaught Heights', 2, '302', 9.0, 13.5, 
 'Verma & Associates Legal Chambers', 'Commercial Office', 'Registered', 'Air Rights', 380.0,
 ST_GeomFromText('POLYGON Z ((77.2170 28.6312 9.0, 77.2175 28.6312 9.0, 77.2175 28.6317 9.0, 77.2170 28.6317 9.0, 77.2170 28.6312 9.0))', 4326)),

-- 3rd Floor Penthouse (Unit 401) - Registered
('IN-DL-110001-P402-F03-U401-Z14M', 'P402', 'IN-DL', '110001', 'Connaught Heights', 3, '401', 13.5, 18.5, 
 'Vikramaditya Oberoi', 'Luxury Penthouse', 'Registered', 'Air Rights', 830.0,
 ST_GeomFromText('POLYGON Z ((77.2165 28.6312 13.5, 77.2175 28.6312 13.5, 77.2175 28.6317 13.5, 77.2165 28.6317 13.5, 77.2165 28.6312 13.5))', 4326)),

-- Building 2: Cyber Hub Horizon Tower (Plot 2D: P805)
-- Ground Floor Municipal Utility
('IN-HR-122002-P805-F00-U001-Z00M', 'P805', 'IN-HR', '122002', 'Horizon Tower', 0, '001', 0.0, 5.0, 
 'Gurugram Municipal Corporation (Data Hub)', 'Government Utility', 'Government Owned', 'Fee Simple Title', 520.0,
 ST_GeomFromText('POLYGON Z ((77.0880 28.4950 0, 77.0886 28.4950 0, 77.0886 28.4956 0, 77.0880 28.4956 0, 77.0880 28.4950 0))', 4326)),

-- 1st Floor AI Innovation Lab
('IN-HR-122002-P805-F01-U101-Z05M', 'P805', 'IN-HR', '122002', 'Horizon Tower', 1, '101', 5.0, 10.0, 
 'Indus AI Research Labs', 'Commercial R&D', 'Registered', 'Air Rights', 520.0,
 ST_GeomFromText('POLYGON Z ((77.0880 28.4950 5.0, 77.0886 28.4950 5.0, 77.0886 28.4956 5.0, 77.0880 28.4956 5.0, 77.0880 28.4950 5.0))', 4326)),

-- 2nd Floor Cloud Data Services (Pending)
('IN-HR-122002-P805-F02-U201-Z10M', 'P805', 'IN-HR', '122002', 'Horizon Tower', 2, '201', 10.0, 15.0, 
 'CloudScale Systems India', 'Commercial IT', 'Pending', 'Air Rights', 520.0,
 ST_GeomFromText('POLYGON Z ((77.0880 28.4950 10.0, 77.0886 28.4950 10.0, 77.0886 28.4956 10.0, 77.0880 28.4956 10.0, 77.0880 28.4950 10.0))', 4326));
