from flask import Flask, request, jsonify
import sys 
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.route_optimization import a_star, calculate_fare

app = Flask(__name__)

@app.route('/calculate_fare', methods=['POST'])
def calculate_fare_endpoint():
    data = request.json
    start_coords = data['start']  
    drop_coords = data['drop']

    # Calculate optimal path
    graph = ox.graph_from_place("Thiruvananthapuram, India", network_type='drive')
    start_node = ox.distance.nearest_nodes(graph, *start_coords)
    goal_node = ox.distance.nearest_nodes(graph, *drop_coords)

    path = a_star(graph, start_node, goal_node)

    # Calculate fare
    distance_km = sum(graph[current][next_node][0]['length'] for current, next_node in zip(path, path[1:])) / 1000
    fare = calculate_fare(distance_km, 'Clear', 2)

    return jsonify({
        'path': path,
        'fare': fare
    })

if __name__ == '__main__':
    app.run(debug=True)
