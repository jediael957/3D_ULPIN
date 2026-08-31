import React, { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { getStatusColor, getStatusOutlineColor, HIGHLIGHT_COLOR } from '../utils/cesiumUtils';
import { ZoomIn, ZoomOut, Compass, Eye, Box, ArrowUpRight } from 'lucide-react';

export default function CesiumMap({
  parcelsGeoJSON,
  selectedUnit,
  onSelectUnit,
  selectedFloor,
  showTerrain = true,
  show2DBoundaries = true,
  show3DTiles = true,
  activeLocation,
  isPickingLocation,
  onLocationPicked,
  tempPickedPolygon,
  streetViewTrigger
}) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const entitiesRef = useRef({});
  const hoveredEntityRef = useRef(null);
  const tempEntityRef = useRef(null);

  const [isStreetView, setIsStreetView] = useState(false);

  // Refs for state inside event handlers without re-initializing viewer
  const isPickingRef = useRef(isPickingLocation);
  const onLocationPickedRef = useRef(onLocationPicked);
  const onSelectUnitRef = useRef(onSelectUnit);

  useEffect(() => {
    isPickingRef.current = isPickingLocation;
    if (viewerRef.current && viewerRef.current.canvas) {
      viewerRef.current.canvas.style.cursor = isPickingLocation ? 'crosshair' : 'default';
    }
  }, [isPickingLocation]);

  useEffect(() => {
    onLocationPickedRef.current = onLocationPicked;
  }, [onLocationPicked]);

  useEffect(() => {
    onSelectUnitRef.current = onSelectUnit;
  }, [onSelectUnit]);

  // Handle Street View Mode Trigger for selected block
  useEffect(() => {
    if (!streetViewTrigger || !viewerRef.current) return;
    const viewer = viewerRef.current;
    const coords = streetViewTrigger['2d_coordinates'] || streetViewTrigger.coordinates;
    
    if (coords && coords.length > 0) {
      const targetLon = coords[0][0];
      const targetLat = coords[0][1];

      // Fly to ground level (Z = 2.5m) right next to building facade, looking UP sideways
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(targetLon - 0.0003, targetLat - 0.0003, 3.5),
        orientation: {
          heading: Cesium.Math.toRadians(45.0),
          pitch: Cesium.Math.toRadians(18.0), // Pitch UP looking sideways at building facade
          roll: 0.0
        },
        duration: 1.8
      });
      setIsStreetView(true);
    }
  }, [streetViewTrigger]);

  // Initialize Cesium Viewer ONCE on mount
  useEffect(() => {
    if (!containerRef.current) return;

    // Set Cesium Ion Access Token
    const ionToken = import.meta.env.VITE_CESIUM_ION_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6Imw3dE40U1NwR1NMX294MzUiLCJqdGkiOiJlNDcyMzAwYi0yMDczLTQwZWQtYjIyNS00ODM2MzNjMmUxMjQiLCJpZCI6NDc2Nzg4LCJzdWIiOiJUZWNoamVkaWFlbCIsImlzcyI6Imh0dHBzOi8vYXBpLmNlc2l1bS5jb20iLCJhdWQiOiJTSUgxIiwiaWF0IjoxNzg4MTQ5NDU0fQ.avsA9JGGb_1_WGeSRmZ4CpgpbMuHg3m3rEk63c2i2CQ';
    if (ionToken) {
      Cesium.Ion.defaultAccessToken = ionToken;
    }

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: true,
      fullscreenButton: false,
      geocoder: true,
      homeButton: true,
      infoBox: false,
      selectionIndicator: false,
      sceneModePicker: true,
      navigationHelpButton: false
    });

    // Asynchronously load Cesium World Terrain
    if (showTerrain && Cesium.createWorldTerrainAsync) {
      Cesium.createWorldTerrainAsync()
        .then((terrainProvider) => {
          if (viewer && !viewer.isDestroyed()) {
            viewer.terrainProvider = terrainProvider;
          }
        })
        .catch((err) => {
          console.warn("Cesium World Terrain fallback to default ellipsoid:", err);
        });
    }

    // Enable depth testing & globe lighting
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.globe.enableLighting = true;

    // Initial Camera View over Connaught Heights 3D Building Site
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(77.2164, 28.6295, 180.0),
      orientation: {
        heading: Cesium.Math.toRadians(35.0),
        pitch: Cesium.Math.toRadians(-28.0),
        roll: 0.0
      }
    });

    viewerRef.current = viewer;

    // Screen Space Event Handler for Mouse Hover and Left Click Selection
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // MOUSE MOVE: Hover Highlight Effect
    handler.setInputAction((movement) => {
      if (isPickingRef.current) return;

      const pickedObject = viewer.scene.pick(movement.endPosition);
      
      if (hoveredEntityRef.current && hoveredEntityRef.current !== selectedUnit?.entity) {
        const entity = hoveredEntityRef.current;
        if (entity.polygon) {
          const status = entity.properties?.status?.getValue() || 'Registered';
          entity.polygon.material = getStatusColor(status);
        }
      }

      if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.properties) {
        const entity = pickedObject.id;
        hoveredEntityRef.current = entity;
        if (entity.polygon) {
          entity.polygon.material = HIGHLIGHT_COLOR;
        }
      } else {
        hoveredEntityRef.current = null;
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // LEFT CLICK: Select Unit OR Pick Location on Building/Land
    handler.setInputAction((click) => {
      if (isPickingRef.current) {
        let cartesian = null;
        try {
          if (viewer.scene.pickPositionSupported) {
            cartesian = viewer.scene.pickPosition(click.position);
          }
        } catch (e) {
          console.warn("pickPosition fallback triggered:", e);
        }

        if (!cartesian) {
          try {
            let ray = viewer.camera.getPickRay(click.position);
            if (ray) {
              cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            }
          } catch (e) {
            console.warn("globe.pick fallback triggered:", e);
          }
        }

        if (!cartesian) {
          cartesian = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
        }

        if (cartesian) {
          const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          const lon = Cesium.Math.toDegrees(cartographic.longitude);
          const lat = Cesium.Math.toDegrees(cartographic.latitude);
          const zHeight = cartographic.height || 0.0;

          const lonOffset = 0.00015;
          const latOffset = 0.00015;

          const polygonCoords = [
            [lon - lonOffset, lat - latOffset],
            [lon + lonOffset, lat - latOffset],
            [lon + lonOffset, lat + latOffset],
            [lon - lonOffset, lat + latOffset],
            [lon - lonOffset, lat - latOffset]
          ];

          if (onLocationPickedRef.current) {
            onLocationPickedRef.current({
              centerLon: lon,
              centerLat: lat,
              zHeight: Math.max(0, zHeight),
              coordinates: polygonCoords
            });
          }
        }
        return;
      }

      // Default Mode: Select Unit Inspector & Fly to Street View Perspective
      try {
        const pickedObject = viewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.properties) {
          const entity = pickedObject.id;
          const props = {
            ulpin_3d: entity.properties.ulpin_3d?.getValue(),
            plot_2d_id: entity.properties.plot_2d_id?.getValue(),
            building_name: entity.properties.building_name?.getValue(),
            floor_number: entity.properties.floor_number?.getValue(),
            unit_number: entity.properties.unit_number?.getValue(),
            z_min: entity.properties.z_min?.getValue(),
            z_max: entity.properties.z_max?.getValue(),
            height: entity.properties.height?.getValue(),
            owner_name: entity.properties.owner_name?.getValue(),
            property_type: entity.properties.property_type?.getValue(),
            status: entity.properties.status?.getValue(),
            air_land_rights: entity.properties.air_land_rights?.getValue(),
            area_sqm: entity.properties.area_sqm?.getValue(),
            entity: entity
          };
          
          if (onSelectUnitRef.current) {
            onSelectUnitRef.current(props);
          }

          // Automatically fly to Ground-Level Street View looking sideways up at building!
          const cartesian = viewer.scene.pickPosition(click.position) || entity.polygon?.hierarchy?.getValue()?.positions[0];
          if (cartesian) {
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const targetLon = Cesium.Math.toDegrees(cartographic.longitude);
            const targetLat = Cesium.Math.toDegrees(cartographic.latitude);

            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(targetLon - 0.0003, targetLat - 0.0003, 3.5),
              orientation: {
                heading: Cesium.Math.toRadians(45.0),
                pitch: Cesium.Math.toRadians(18.0), // Pitch UP looking sideways at building facade
                roll: 0.0
              },
              duration: 1.5
            });
            setIsStreetView(true);
          }
        }
      } catch (e) {
        console.warn("Unit selection pick error:", e);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []); // Run ONLY once on mount

  // Navigation Control Handlers
  const handleZoomIn = () => {
    if (viewerRef.current) viewerRef.current.camera.zoomIn(100);
  };
  const handleZoomOut = () => {
    if (viewerRef.current) viewerRef.current.camera.zoomOut(100);
  };
  const handleResetCompass = () => {
    if (viewerRef.current) {
      const pos = viewerRef.current.camera.positionCartographic;
      viewerRef.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromRadians(pos.longitude, pos.latitude, pos.height),
        orientation: { heading: 0.0, pitch: Cesium.Math.toRadians(-35.0), roll: 0.0 },
        duration: 1.0
      });
    }
  };
  const handleToggleViewMode = () => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    if (isStreetView) {
      // Switch back to 3D Orbit Overview View
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(77.2164, 28.6295, 180.0),
        orientation: { heading: Cesium.Math.toRadians(35.0), pitch: Cesium.Math.toRadians(-28.0), roll: 0.0 },
        duration: 1.5
      });
      setIsStreetView(false);
    } else {
      // Switch to Ground-Level Street View
      const pos = viewer.camera.positionCartographic;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromRadians(pos.longitude, pos.latitude, 3.5),
        orientation: { heading: Cesium.Math.toRadians(45.0), pitch: Cesium.Math.toRadians(18.0), roll: 0.0 },
        duration: 1.5
      });
      setIsStreetView(true);
    }
  };

  // Handle temporary picked building polygon preview
  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;

    if (tempEntityRef.current) {
      viewer.entities.remove(tempEntityRef.current);
      tempEntityRef.current = null;
    }

    if (tempPickedPolygon && tempPickedPolygon.coordinates) {
      const flatPositions = [];
      tempPickedPolygon.coordinates.forEach(c => {
        flatPositions.push(c[0], c[1]);
      });

      tempEntityRef.current = viewer.entities.add({
        name: 'Picked Building Site',
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(flatPositions),
          height: tempPickedPolygon.zHeight || 0.0,
          extrudedHeight: (tempPickedPolygon.zHeight || 0.0) + 15.0,
          material: Cesium.Color.YELLOW.withAlpha(0.6),
          outline: true,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 3
        }
      });

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          tempPickedPolygon.centerLon,
          tempPickedPolygon.centerLat - 0.0008,
          150.0
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-35.0),
          roll: 0.0
        },
        duration: 1.2
      });
    }
  }, [tempPickedPolygon]);

  // Update Location Fly-to
  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;

    if (activeLocation === 'gurgaon') {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(77.0883, 28.4940, 250.0),
        orientation: {
          heading: Cesium.Math.toRadians(10.0),
          pitch: Cesium.Math.toRadians(-35.0),
          roll: 0.0
        },
        duration: 1.5
      });
    } else {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(77.2164, 28.6295, 180.0),
        orientation: {
          heading: Cesium.Math.toRadians(35.0),
          pitch: Cesium.Math.toRadians(-28.0),
          roll: 0.0
        },
        duration: 1.5
      });
    }
  }, [activeLocation]);

  // Update 3D Parcels Data & Floor Filtering
  useEffect(() => {
    if (!viewerRef.current || !parcelsGeoJSON) return;
    const viewer = viewerRef.current;

    const temp = tempEntityRef.current;
    viewer.entities.removeAll();
    if (temp) {
      viewer.entities.add(temp);
      tempEntityRef.current = temp;
    }
    entitiesRef.current = {};

    const features = parcelsGeoJSON.features || [];

    features.forEach((feature) => {
      const props = feature.properties;
      const floorNum = props.floor_number;

      if (selectedFloor !== 'all' && floorNum !== parseInt(selectedFloor)) {
        return;
      }

      const rawCoords = props['2d_coordinates'] || feature.geometry.coordinates[0];
      const flatPositions = [];
      rawCoords.forEach(c => {
        flatPositions.push(c[0], c[1]);
      });

      const isSelected = selectedUnit && selectedUnit.ulpin_3d === props.ulpin_3d;
      const statusColor = isSelected ? HIGHLIGHT_COLOR : getStatusColor(props.status);

      const entity = viewer.entities.add({
        name: `3D Unit ${props.unit_number} (${props.building_name})`,
        properties: {
          ulpin_3d: props.ulpin_3d,
          plot_2d_id: props.plot_2d_id,
          building_name: props.building_name,
          floor_number: props.floor_number,
          unit_number: props.unit_number,
          z_min: props.z_min,
          z_max: props.z_max,
          height: props.height,
          owner_name: props.owner_name,
          property_type: props.property_type,
          status: props.status,
          air_land_rights: props.air_land_rights,
          area_sqm: props.area_sqm
        },
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(flatPositions),
          height: props.z_min,
          extrudedHeight: props.z_max,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          extrudedHeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          material: statusColor,
          outline: true,
          outlineColor: getStatusOutlineColor(props.status),
          outlineWidth: 2
        }
      });

      entitiesRef.current[props.ulpin_3d] = entity;

      if (show2DBoundaries && props.floor_number === 0) {
        viewer.entities.add({
          name: `2D Cadastral Plot ${props.plot_2d_id}`,
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(flatPositions),
            width: 3,
            material: Cesium.Color.YELLOW.withAlpha(0.8),
            clampToGround: true
          }
        });
      }
    });

    viewer.scene.requestRender();
  }, [parcelsGeoJSON, selectedFloor, selectedUnit, show2DBoundaries]);

  // Toggle Google Photorealistic 3D Tiles
  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;

    let tilesetPromise = null;
    if (show3DTiles && Cesium.createGooglePhotorealistic3DTileset) {
      Cesium.createGooglePhotorealistic3DTileset()
        .then(tileset => {
          viewer.scene.primitives.add(tileset);
          tilesetPromise = tileset;
        })
        .catch(err => {
          console.warn("Google Photorealistic 3D Tiles require a valid key:", err);
        });
    }

    return () => {
      if (tilesetPromise && viewer.scene && !viewer.scene.isDestroyed()) {
        viewer.scene.primitives.remove(tilesetPromise);
      }
    };
  }, [show3DTiles]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950">
      {/* Banner for Picking Location */}
      {isPickingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-extrabold px-4 py-2 rounded-full shadow-lg z-30 flex items-center space-x-2 text-xs animate-bounce pointer-events-none">
          <span>🎯 CLICK ANY BUILDING OR LAND PLOT ON THE MAP TO ASSIGN 3D ULPIN</span>
        </div>
      )}

      {/* Embedded Map Navigation Toolbar */}
      <div className="absolute bottom-8 right-6 z-30 flex flex-col space-y-2 bg-slate-900/90 backdrop-blur p-2 rounded-xl border border-slate-700 shadow-2xl">
        {/* Street View vs 3D Orbit View Toggle */}
        <button
          onClick={handleToggleViewMode}
          className={`p-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
            isStreetView
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
          title={isStreetView ? "Switch to 3D Orbit Overview" : "Switch to Ground-Level Street View"}
        >
          {isStreetView ? <Box className="w-4 h-4" /> : <Eye className="w-4 h-4 text-amber-400" />}
          <span className="hidden md:inline">{isStreetView ? '3D Overview' : 'Street View'}</span>
        </button>

        <hr className="border-slate-800" />

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center justify-center"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center justify-center"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Reset Compass */}
        <button
          onClick={handleResetCompass}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors flex items-center justify-center"
          title="Reset Compass (North)"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
