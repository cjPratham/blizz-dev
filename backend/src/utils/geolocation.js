
export function isWithinRadius(studentLoc, teacherLoc, radius = 50) {
  if (!studentLoc || !teacherLoc) return false;

  const R = 6371e3; // earth radius in meters
  const φ1 = studentLoc.lat * Math.PI/180;
  const φ2 = teacherLoc.lat * Math.PI/180;
  const Δφ = (teacherLoc.lat - studentLoc.lat) * Math.PI/180;
  const Δλ = (teacherLoc.lng - studentLoc.lng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const distance = R * c; // in meters
  console.log(`Calculated distance: ${distance} meters`);
  console.log(`Allowed radius: ${radius} meters`);
  return distance <= radius;
}
