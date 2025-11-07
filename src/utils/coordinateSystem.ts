// Coordinate system transformations and georeferencing utilities

import proj4 from 'proj4';
import type { GeoLocation } from '../types';

// Define common projections
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs');

const WGS84 = 'EPSG:4326';
const WEB_MERCATOR = 'EPSG:3857';

// Reference point for local coordinate system (San Francisco downtown)
const REFERENCE_POINT: GeoLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
  altitude: 0
};

/**
 * Convert geographic coordinates (lat/lon) to Web Mercator projection
 */
export function latLonToWebMercator(lat: number, lon: number): [number, number] {
  const [x, y] = proj4(WGS84, WEB_MERCATOR, [lon, lat]);
  return [x, y];
}

/**
 * Convert Web Mercator to geographic coordinates
 */
export function webMercatorToLatLon(x: number, y: number): [number, number] {
  const [lon, lat] = proj4(WEB_MERCATOR, WGS84, [x, y]);
  return [lat, lon];
}

/**
 * Convert geographic coordinates to local scene coordinates
 * Uses a simple equirectangular approximation for the demo
 */
export function geoToLocal(geoLocation: GeoLocation): [number, number, number] {
  const R = 6371000; // Earth radius in meters

  const latRef = REFERENCE_POINT.latitude * Math.PI / 180;
  const lonRef = REFERENCE_POINT.longitude * Math.PI / 180;
  const lat = geoLocation.latitude * Math.PI / 180;
  const lon = geoLocation.longitude * Math.PI / 180;

  const x = R * (lon - lonRef) * Math.cos(latRef);
  const z = R * (lat - latRef);
  const y = geoLocation.altitude - REFERENCE_POINT.altitude;

  return [x, y, z];
}

/**
 * Convert local scene coordinates to geographic coordinates
 */
export function localToGeo(x: number, y: number, z: number): GeoLocation {
  const R = 6371000;

  const latRef = REFERENCE_POINT.latitude * Math.PI / 180;
  const lonRef = REFERENCE_POINT.longitude * Math.PI / 180;

  const lon = lonRef + x / (R * Math.cos(latRef));
  const lat = latRef + z / R;

  return {
    latitude: lat * 180 / Math.PI,
    longitude: lon * 180 / Math.PI,
    altitude: y + REFERENCE_POINT.altitude
  };
}

/**
 * Calculate distance between two geographic points (Haversine formula)
 */
export function calculateDistance(point1: GeoLocation, point2: GeoLocation): number {
  const R = 6371000;
  const lat1 = point1.latitude * Math.PI / 180;
  const lat2 = point2.latitude * Math.PI / 180;
  const deltaLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const deltaLon = (point2.longitude - point1.longitude) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Get reference point for the scene
 */
export function getReferencePoint(): GeoLocation {
  return { ...REFERENCE_POINT };
}

/**
 * Set a new reference point for coordinate transformations
 */
export function setReferencePoint(newReference: GeoLocation): void {
  REFERENCE_POINT.latitude = newReference.latitude;
  REFERENCE_POINT.longitude = newReference.longitude;
  REFERENCE_POINT.altitude = newReference.altitude;
}
