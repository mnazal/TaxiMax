from flask import Flask, request, jsonify
import sys
import osmnx as ox
import networkx as nx
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.route_optimization import a_star
from backend.fare_calculation import calculate_fare

app = Flask(__name__)

@app.route('/calculate_fare', methods=['POST'])
def calculate_fare_endpoint():
    print("Incoming Request Received")
    try:
        data = request.json
        print("Received Data:", data)

        start_coords = data.get('start')
        drop_coords = data.get('drop')

        if not start_coords or not drop_coords:
            return jsonify({"error": "Start and drop coordinates are required."}), 400

        print("Loading Map Data...")
        graph = ox.graph_from_place("Thiruvananthapuram, India", network_type='drive', simplify=True)

        print("Finding Nearest Nodes...")
        start_node = ox.distance.nearest_nodes(graph, *start_coords)
        goal_node = ox.distance.nearest_nodes(graph, *drop_coords)

        path = a_star(graph, start_node, goal_node)
        print("Calculated Path:", path)

        if not path:
            return jsonify({"error": "No path found between points."}), 404

        distance_km = sum(graph[current][next_node][0]['length'] for current, next_node in zip(path, path[1:])) / 1000

        weather_condition = data.get('weather', 'Clear')
        surge_factor = data.get('surge_factor', 1.2)

        fare = calculate_fare(distance_km, weather_condition, surge_factor)
        print("Calculated Fare:", fare)

        return jsonify({
            'path': path,
            'distance_km': round(distance_km, 2),
            'fare': round(fare, 2)
        })

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
