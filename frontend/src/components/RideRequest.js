import React, { useState } from 'react';
import './RideRequest.css';

const RideRequest = () => {
    const [pickupLocation, setPickupLocation] = useState('');
    const [dropoffLocation, setDropoffLocation] = useState('');
    const [passengerName, setPassengerName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://127.0.0.1:5000/create-ride', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pickupLocation,
                    dropoffLocation,
                    passengerName
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create ride request');
            }

            // Clear form
            setPickupLocation('');
            setDropoffLocation('');
            setPassengerName('');
            
            alert('Ride request created successfully!');
        } catch (error) {
            console.error('Error creating ride request:', error);
            alert('Failed to create ride request');
        }
    };

    return (
        <div className="ride-request-container">
            <h2>Request a Ride</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Passenger Name:</label>
                    <input
                        type="text"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Pickup Location:</label>
                    <input
                        type="text"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Dropoff Location:</label>
                    <input
                        type="text"
                        value={dropoffLocation}
                        onChange={(e) => setDropoffLocation(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Submit Request</button>
            </form>
        </div>
    );
};

export default RideRequest;
