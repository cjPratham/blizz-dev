// components/student/GeoLocation.jsx
import { useState } from "react";

export default function GeoLocation({ onLocationDetected }) {
  const [error, setError] = useState(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setError(null);
        onLocationDetected({
          lat: latitude,
          lng: longitude,
        });
      },
      (err) => {
        let errorMessage;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case err.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "Unable to retrieve location.";
        }
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="text-center">
      <button
        onClick={getLocation}
        className="bg-[#A020F0] text-white px-6 py-2 rounded-lg hover:bg-[#A020F0]/90"
      >
        Detect My Location
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
