import React from 'react';
import { useDispatch } from 'react-redux';
import { addRideRequest } from '../store/rideSlice';
import './RideForm.css';

function RideForm() {
  const dispatch = useDispatch();
  const [rideData, setRideData] = React.useState({
    pickupLocation: '',
    dropoffLocation: '',
    passengerName: '',
    estimatedFare: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/ride-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rideData),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(addRideRequest(data.request));
        // Clear the form
        setRideData({
          pickupLocation: '',
          dropoffLocation: '',
          passengerName: '',
          estimatedFare: ''
        });
        alert('Ride request sent successfully!');
      } else {
        alert('Failed to send ride request');
      }
    } catch (error) {
      console.error('Error sending ride request:', error);
      alert('Error sending ride request');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRideData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="ride-form-container">
      <h2>Create Ride Request</h2>
      <form onSubmit={handleSubmit} className="ride-form">
        <div className="form-group">
          <label htmlFor="pickupLocation">Pickup Location:</label>
          <input
            type="text"
            id="pickupLocation"
            name="pickupLocation"
            value={rideData.pickupLocation}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dropoffLocation">Dropoff Location:</label>
          <input
            type="text"
            id="dropoffLocation"
            name="dropoffLocation"
            value={rideData.dropoffLocation}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="passengerName">Passenger Name:</label>
          <input
            type="text"
            id="passengerName"
            name="passengerName"
            value={rideData.passengerName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="estimatedFare">Estimated Fare (₹):</label>
          <input
            type="number"
            id="estimatedFare"
            name="estimatedFare"
            value={rideData.estimatedFare}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-button">Send Ride Request</button>
      </form>
    </div>
  );
}

export default RideForm;
