import React from 'react';
import Map from '../components/Map';
import RideRequests from '../components/RideRequests';
import RideForm from '../components/RideForm';

function HomePage() {

  return (
    <div className="home-page">
      <div className="header">
        <h1>TaxiMax</h1>
      </div>
      <Map />
      <RideRequests />
      {/* <RideForm /> */}
    </div>
  );
}

export default HomePage;
