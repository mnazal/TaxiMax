from flask import Flask, jsonify, request, make_response
import time
from datetime import datetime
import googlemaps
import heapq
import json

app = Flask(__name__)

# Google Maps API key
API_KEY = "AIzaSyCeOW2S_TCq4yaIIDICdXeKP-rr3j6ElfY"
gmaps = googlemaps.Client(key=API_KEY)

# Example rides data
example_rides = [
    {
        "id": "1679456789",
        "timestamp": "2025-03-21T10:30:00",
        "status": "pending",
        "pickupLocation": "Technopark, Trivandrum",
        "dropoffLocation": "Trivandrum International Airport",
        "passengerName": "Sidharth",
        "estimatedFare": 450,
        "estimatedDuration": "45m"
    },
    {
        "id": "1679456790",
        "timestamp": "2025-03-21T10:35:00",
        "status": "pending",
        "pickupLocation": "Lulu Mall, Trivandrum",
        "dropoffLocation": "Kovalam Beach",
        "passengerName": "Jaideep",
        "estimatedFare": 350,
        "estimatedDuration": "30m"
    },
    {
        "id": "1679456791",
        "timestamp": "2025-03-21T10:40:00",
        "status": "pending",
        "pickupLocation": "Medical College, Trivandrum",
        "dropoffLocation": "Shanghumukham Beach",
        "passengerName": "Navami",
        "estimatedFare": 300,
        "estimatedDuration": "25m",
        "driver_id": "DRV-123"
    }
]

# Store active rides and locations in memory
rides = example_rides.copy()
selected_locations = []

def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

@app.after_request
def after_request(response):
    return add_cors_headers(response)

@app.route('/add_location', methods=['POST'])
def add_location():
    """Add a location to the selected locations list"""
    try:
        location = request.json.get('location')
        if not location:
            return jsonify({
                'status': 'error',
                'message': 'Location is required'
            }), 400

        # Add to selected locations if not already present
        if location not in selected_locations:
            selected_locations.append(location)

        return jsonify({
            'status': 'success',
            'message': 'Location added successfully',
            'locations': selected_locations
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/get_locations', methods=['GET'])
def get_locations():
    """Get all selected locations"""
    return jsonify({
        'status': 'success',
        'locations': selected_locations
    })

@app.route('/clear_locations', methods=['POST'])
def clear_locations():
    """Clear all selected locations"""
    global selected_locations
    selected_locations = []
    return jsonify({
        'status': 'success',
        'message': 'All locations cleared'
    })

@app.route('/optimize-route', methods=['POST'])
def optimize_route():
    """Optimize the route for given locations using Google Maps API"""
    try:
        data = request.json
        locations = data.get('locations', [])
        
        if len(locations) < 2:
            return jsonify({
                'error': 'At least 2 locations are required'
            }), 400

        # Store selected locations
        global selected_locations
        selected_locations = locations

        # Calculate distances and durations between all pairs of locations
        n = len(locations)
        distances = [[0] * n for _ in range(n)]
        durations = [[0] * n for _ in range(n)]
        
        for i in range(n):
            for j in range(i + 1, n):
                # Get driving distance and duration from Google Maps
                result = gmaps.distance_matrix(
                    locations[i],
                    locations[j],
                    mode="driving",
                )
                
                if result['status'] == 'OK':
                    # Extract distance in meters and duration in seconds
                    element = result['rows'][0]['elements'][0]
                    distances[i][j] = element['distance']['value']
                    distances[j][i] = distances[i][j]
                    durations[i][j] = element['duration']['value']
                    durations[j][i] = durations[i][j]

        # Find optimal route using nearest neighbor algorithm
        start = 0  # Start from the first location
        unvisited = set(range(1, n))
        route = [start]
        total_distance = 0
        total_duration = 0

        while unvisited:
            current = route[-1]
            next_location = min(unvisited, key=lambda x: distances[current][x])
            route.append(next_location)
            total_distance += distances[current][next_location]
            total_duration += durations[current][next_location]
            unvisited.remove(next_location)

        # Add return to start if needed
        if len(route) > 1:
            total_distance += distances[route[-1]][start]
            total_duration += durations[route[-1]][start]

        # Convert route indices to actual locations
        optimized_route = [locations[i] for i in route]

        # Format duration nicely
        hours = total_duration // 3600
        minutes = (total_duration % 3600) // 60
        formatted_duration = f"{hours}h {minutes}m" if hours > 0 else f"{minutes}m"

        return jsonify({
            'status': 'success',
            'route': optimized_route,
            'total_distance': total_distance,
            'total_duration': total_duration,
            'formatted_duration': formatted_duration
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/get-rides', methods=['GET'])
def get_rides():
    """Get all ride requests"""
    return jsonify({
        'status': 'success',
        'rides': rides
    })

@app.route('/create-ride', methods=['POST'])
def create_ride():
    """Create a new ride request"""
    try:
        ride_request = request.json
        ride_request['id'] = str(int(time.time()))
        ride_request['timestamp'] = datetime.now().isoformat()
        ride_request['status'] = 'pending'
        
        rides.append(ride_request)
        
        return jsonify({
            'status': 'success',
            'message': 'Ride request created',
            'ride': ride_request
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/accept-ride', methods=['POST'])
def accept_ride():
    """Accept a ride request"""
    try:
        data = request.json
        ride_id = data.get('ride_id')
        
        for ride in rides:
            if ride['id'] == ride_id:
                ride['status'] = 'accepted'
                return jsonify({
                    'status': 'success',
                    'message': 'Ride accepted',
                    'ride': ride
                })
        
        return jsonify({
            'status': 'error',
            'message': 'Ride not found'
        }), 404
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/<path:path>', methods=['OPTIONS'])
def handle_preflight(path):
    response = make_response()
    return add_cors_headers(response)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)