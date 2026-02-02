const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates distance between two GPS points using Haversine formula
 * @returns distance in meters
 */
function haversineDistance(p1, p2) {
  const lat1 = toRadians(p1.lat);
  const lat2 = toRadians(p2.lat);
  const deltaLat = toRadians(p2.lat - p1.lat);
  const deltaLon = toRadians(p2.lon - p1.lon);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

module.exports = {
  haversineDistance
};
