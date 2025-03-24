import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RideRequests from './components/RideRequests';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <div className="main-layout">
          <div className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </div>
          <RideRequests />
        </div>
      </div>
    </Router>
  );
}

export default App;
