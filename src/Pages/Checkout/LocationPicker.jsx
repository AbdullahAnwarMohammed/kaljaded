import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 29.3759, 
  lng: 47.9774
};

const LocationPicker = ({ isOpen, onClose, onSelect, initialLat, initialLng }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyBi3fftA2gYvcBHigk-rwUBHXpve8ZAj_c" // Replace with actual key
  });

  const [map, setMap] = useState(null);
  
  const getInitialLocation = () => {
    if (initialLat && initialLng) {
      return { lat: parseFloat(initialLat), lng: parseFloat(initialLng) };
    }
    return center;
  };

  const [selectedLocation, setSelectedLocation] = useState(getInitialLocation());

  const onLoad = useCallback(function callback(map) {
  
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const handleMapClick = (e) => {
    setSelectedLocation({
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    });
  };

  const handleConfirm = () => {
    onSelect(selectedLocation);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
        display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="modal-content" style={{ 
          background: 'white', padding: '3px', 
          width: '100%', maxWidth: '600px' 
      }}>
        
        {isLoaded ? (
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={selectedLocation}
                zoom={10}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleMapClick}
            >
                <Marker position={selectedLocation} />
            </GoogleMap>
        ) : <div>Loading Map...</div>}

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="btn btn-secondary btn-sm">إلغاء</button>
            <button onClick={handleConfirm} className="btn btn-dark btn-sm" >
                تأكيد الموقع
            </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LocationPicker);
