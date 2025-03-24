import React from 'react';

const RouteDetails = ({ totalDistance, totalDuration, formattedDuration, route }) => {
    const formatDistance = (meters) => {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)} km`;
        }
        return `${meters} m`;
    };

    return (
        <div className="route-details">
            {totalDistance > 0 && (
                <div>
                    <h3>Route Summary</h3>
                    <p><strong>Total Distance:</strong> {formatDistance(totalDistance)}</p>
                    <p><strong>Estimated Time:</strong> {formattedDuration}</p>
                    <div className="route-stops">
                        <h4>Stops:</h4>
                        <ol>
                            {route && route.map((stop, index) => (
                                <li key={index}>{stop}</li>
                            ))}
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RouteDetails;
