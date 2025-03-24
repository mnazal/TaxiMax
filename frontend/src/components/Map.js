import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import RouteDetails from './RouteDetails';

const center = { lat: 8.5241, lng: 76.9366 };
const API_KEY = 'AIzaSyCeOW2S_TCq4yaIIDICdXeKP-rr3j6ElfY';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const API_BASE_URL = 'http://127.0.0.1:5000';

function Map() {
  const [markers, setMarkers] = useState([]);
  const [directions, setDirections] = useState(null);
  const [routeData, setRouteData] = useState({
    totalDistance: 0,
    totalDuration: 0,
    formattedDuration: '',
    route: null
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
  });

  const onMapClick = useCallback(async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const location = { lat, lng };
    
    try {
      // Get address from coordinates using Geocoding service
      const geocoder = new window.google.maps.Geocoder();
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode({ location }, (results, status) => {
          if (status === 'OK') {
            resolve(results[0].formatted_address);
          } else {
            reject(new Error('Geocoding failed'));
          }
        });
      });

      // Add marker and address
      setMarkers(prev => [...prev, { ...location, address: result }]);

      // Send address to backend
      const response = await fetch(`${API_BASE_URL}/add_location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ location: result }),
      });
      
      if (!response.ok) throw new Error('Failed to add location');
    } catch (error) {
      console.error('Error adding location:', error);
    }
  }, []);

  const optimizeRoute = useCallback(async () => {
    if (markers.length < 2) {
      alert('Please add at least 2 locations');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/optimize-route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          locations: markers.map(marker => marker.address)
        })
      });
      
      const data = await response.json();

      if (data.status === 'success') {
        setRouteData({
          totalDistance: data.total_distance,
          totalDuration: data.total_duration,
          formattedDuration: data.formatted_duration,
          route: data.route
        });
        
        // Convert addresses back to coordinates for drawing
        const geocoder = new window.google.maps.Geocoder();
        
        const getCoordinates = async (address) => {
          return new Promise((resolve, reject) => {
            geocoder.geocode({ address }, (results, status) => {
              if (status === 'OK') {
                resolve(results[0].geometry.location);
              } else {
                reject(new Error('Geocoding failed'));
              }
            });
          });
        };

        const route = await Promise.all(data.route.map(getCoordinates));
        drawRoute(route);
      }
    } catch (error) {
      console.error('Error optimizing route:', error);
    }
  }, [markers]);

  const drawRoute = useCallback((route) => {
    if (!window.google || route.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();
    const waypoints = route.slice(1, -1).map(location => ({
      location: location,
      stopover: true,
    }));

    const request = {
      origin: route[0],
      destination: route[route.length - 1],
      waypoints: waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        setDirections(result);
      } else {
        console.error('Failed to draw route:', status);
      }
    });
  }, []);

  const resetMap = useCallback(async () => {
    setMarkers([]);
    setDirections(null);
    setRouteData({
      totalDistance: 0,
      totalDuration: 0,
      formattedDuration: '',
      route: null
    });

    try {
      const response = await fetch(`${API_BASE_URL}/clear_locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to reset locations');
    } catch (error) {
      console.error('Error resetting locations:', error);
    }
  }, []);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="map-container">
      <GoogleMap
        center={center}
        zoom={13}
        mapContainerStyle={mapContainerStyle}
        onClick={onMapClick}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            label={(index + 1).toString()}
          />
        ))}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
      <div className="map-controls">
        <button onClick={optimizeRoute}>Optimize Route</button>
        <button onClick={resetMap}>Reset</button>
      </div>
      <RouteDetails
        totalDistance={routeData.totalDistance}
        totalDuration={routeData.totalDuration}
        formattedDuration={routeData.formattedDuration}
        route={routeData.route}
      />
    </div>
  );
}

export default Map;
