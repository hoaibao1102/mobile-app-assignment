/**
 * Calculate the great-circle distance between two points on the Earth
 * using the Haversine formula.
 *
 * @param {number} lat1 - Latitude of point 1 (in degrees)
 * @param {number} lon1 - Longitude of point 1 (in degrees)
 * @param {number} lat2 - Latitude of point 2 (in degrees)
 * @param {number} lon2 - Longitude of point 2 (in degrees)
 * @returns {{ km: number, mi: number }} Distance in kilometres and miles
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const R = 6371; // Earth's mean radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const km = R * c;
  const mi = km * 0.621371;

  return {
    km: Math.round(km * 100) / 100,
    mi: Math.round(mi * 100) / 100,
  };
}

/**
 * Sort an array of showrooms by distance from a reference location (ascending).
 * Each showroom must have `latitude` and `longitude` properties.
 *
 * @param {{ latitude: number, longitude: number }} origin
 * @param {Array<{ latitude: number, longitude: number }>} showrooms
 * @returns {Array<{ showroom: object, distance: { km: number, mi: number } }>}
 */
export function sortShowroomsByDistance(origin, showrooms) {
  const withDistance = showrooms.map((showroom) => ({
    showroom,
    distance: haversineDistance(
      origin.latitude,
      origin.longitude,
      showroom.latitude,
      showroom.longitude,
    ),
  }));

  withDistance.sort((a, b) => a.distance.km - b.distance.km);

  return withDistance;
}
