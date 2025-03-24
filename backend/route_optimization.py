import osmnx as ox
import networkx as nx
import folium
from heapq import heappop, heappush
import requests

def heuristic(a_lat, a_lon, b_lat, b_lon):
    return ox.distance.euclidean(a_lat, a_lon, b_lat, b_lon)

def a_star(graph, start, goal):
    queue = [(0, start)]
    came_from = {start: None}
    cost_so_far = {start: 0}

    while queue:
        _, current = heappop(queue)

        if current == goal:
            path = []
            while current is not None:
                path.append(current)
                current = came_from[current]
            return path[::-1]  # Reverse the path

        for neighbor in graph.neighbors(current):
            new_cost = cost_so_far[current] + graph[current][neighbor][0]['length']
            if neighbor not in cost_so_far or new_cost < cost_so_far[neighbor]:
                cost_so_far[neighbor] = new_cost
                priority = new_cost + heuristic(
                    graph.nodes[neighbor]['y'], graph.nodes[neighbor]['x'],
                    graph.nodes[goal]['y'], graph.nodes[goal]['x']
                )
                heappush(queue, (priority, neighbor))
                came_from[neighbor] = current
    return None

# Integrate OpenWeatherMap API for weather-based fare adjustment
def get_weather_factor(lat, lon):
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}"
    response = requests.get(url).json()
    weather = response['weather'][0]['main']
    
    weather_factors = {"Clear": 1.0, "Rain": 1.2, "Snow": 1.5, "Fog": 1.3}
    return weather_factors.get(weather, 1.1)

def calculate_fare(distance_km, base_fare=50):
    return base_fare + (distance_km * 10)

def optimized_trip_selector(routes, weather_factors):
    adjusted_fares = [calculate_fare(route['distance']) * weather_factors[idx] for idx, route in enumerate(routes)]
    return min(adjusted_fares)

# Main logic for processing 5 requests
def process_requests(pickup_lat, pickup_lon, dropoffs):
    graph = ox.graph_from_place("Thiruvananthapuram, India", network_type='drive', simplify=False)

    routes = []
    weather_factors = []
    
    for dropoff in dropoffs:
        start = ox.distance.nearest_nodes(graph, pickup_lon, pickup_lat)
        goal = ox.distance.nearest_nodes(graph, dropoff[1], dropoff[0])
        path = a_star(graph, start, goal)

        if path:
            distance_km = sum(graph[current][neighbor][0]['length'] for current, neighbor in zip(path[:-1], path[1:])) / 1000
            weather_factors.append(get_weather_factor(dropoff[0], dropoff[1]))
            routes.append({
                'path': path,
                'distance': distance_km
            })

    best_fare = optimized_trip_selector(routes, weather_factors)
    return best_fare
