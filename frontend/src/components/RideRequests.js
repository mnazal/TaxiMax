import React, { useState, useEffect } from 'react';

const RideRequests = () => {
    const [rides, setRides] = useState([]);

    useEffect(() => {
        // Fetch initial rides
        fetchRides();
    }, []);

    const fetchRides = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/get-rides');
            if (response.ok) {
                const data = await response.json();
                setRides(data.rides || []);
            }
        } catch (error) {
            console.error('Error fetching rides:', error);
        }
    };

    const handleAcceptRide = async (rideId) => {
        try {
            const response = await fetch('http://127.0.0.1:5000/accept-ride', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ride_id: rideId }),
            });

            if (response.ok) {
                // Refresh rides after accepting
                fetchRides();
            }
        } catch (error) {
            console.error('Error accepting ride:', error);
        }
    };

    return (
        <div className="ride-requests-panel">
            <h2>Ride Requests</h2>
            <div className="ride-list">
                {rides.length === 0 ? (
                    <div className="no-rides">No ride requests available</div>
                ) : (
                    rides.map((ride) => (
                        <div key={ride.id} className="ride-item">
                            <div className="ride-details">
                                <h3>Passenger: {ride.passengerName}</h3>
                                <p>From: {ride.pickupLocation}</p>
                                <p>To: {ride.dropoffLocation}</p>
                                <p>Status: {ride.status}</p>
                            </div>
                            {ride.status === 'pending' && (
                                <button
                                    className="accept-btn"
                                    onClick={() => handleAcceptRide(ride.id)}
                                >
                                    Accept Ride
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RideRequests;
