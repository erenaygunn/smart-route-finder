document.addEventListener("DOMContentLoaded", function () {
	// Initialize map centered on Istanbul
	const map = L.map("map").setView([41.0082, 28.9784], 13);
	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	// DOM elements
	const selectionInfo = document.getElementById("selection-info");
	const distanceInfo = document.getElementById("distance-info");
	const timeInfo = document.getElementById("time-info");
	const pathInfo = document.getElementById("path-info");
	const errorMessage = document.getElementById("error-message");
	const clearBtn = document.getElementById("clear-btn");

	// Load graph data
	fetch("graph-data.json")
		.then((response) => response.json())
		.then((data) => {
			const graph = data.edges;
			const coordinates = data.coordinates;
			const nodeNames = data.nodes;

			// Plot nodes on the map
			const nodeMarkers = {};
			nodeNames.forEach((node) => {
				const coord = coordinates[node];
				nodeMarkers[node] = L.marker(coord, {
					icon: L.divIcon({
						className: "node-marker",
						html: node,
						iconSize: [20, 20],
					}),
				}).addTo(map);
			});

			// Draw edges (roads) between nodes
			for (const node in graph) {
				const edges = graph[node];
				edges.forEach((edge) => {
					const fromCoord = coordinates[node];
					const toCoord = coordinates[edge.node];
					L.polyline([fromCoord, toCoord], {
						color: "#95a5a6",
						weight: 2,
						opacity: 0.7,
					}).addTo(map);
				});
			}

			// Path finding logic
			let startNode = null;
			let endNode = null;
			let pathPolyline = null;

			// Clear button functionality
			clearBtn.addEventListener("click", function () {
				resetSelection();
				updateUI();
			});

			map.on("click", function (e) {
				// Find the nearest node to the clicked location
				let nearestNode = null;
				let minDistance = Infinity;

				for (const node in coordinates) {
					const coord = coordinates[node];
					const distance = map.distance(e.latlng, coord);
					if (distance < minDistance) {
						minDistance = distance;
						nearestNode = node;
					}
				}

				if (!startNode) {
					// Select start node
					startNode = nearestNode;
					nodeMarkers[startNode].setIcon(
						L.divIcon({
							className: "start-marker",
							html: startNode,
							iconSize: [25, 25],
						})
					);
					clearBtn.disabled = false;
				} else if (!endNode && nearestNode !== startNode) {
					// Select end node
					endNode = nearestNode;
					nodeMarkers[endNode].setIcon(
						L.divIcon({
							className: "end-marker",
							html: endNode,
							iconSize: [25, 25],
						})
					);

					// Calculate shortest path
					const result = dijkstra(graph, startNode, endNode);

					if (result.error) {
						// No path found
						nodeMarkers[endNode].setIcon(
							L.divIcon({
								className: "unreachable-marker",
								html: endNode,
								iconSize: [25, 25],
							})
						);
						errorMessage.textContent = result.error;
					} else {
						// Path found
						const pathCoords = result.path.map((node) => coordinates[node]);
						if (pathPolyline) {
							map.removeLayer(pathPolyline);
						}
						pathPolyline = L.polyline(pathCoords, {
							color: "#3498db",
							weight: 5,
							opacity: 0.7,
							className: "path-line",
						}).addTo(map);

						// Zoom to fit the path
						map.fitBounds(pathPolyline.getBounds());
					}
				} else {
					// Reset selection
					resetSelection();
					startNode = nearestNode;
					nodeMarkers[startNode].setIcon(
						L.divIcon({
							className: "start-marker",
							html: startNode,
							iconSize: [25, 25],
						})
					);
					clearBtn.disabled = false;
				}

				updateUI();
			});

			function resetNodeMarker(node, markerClass) {
				nodeMarkers[node].setIcon(
					L.divIcon({
						className: markerClass,
						html: node,
						iconSize: [20, 20],
					})
				);
			}

			function resetSelection() {
				if (startNode) resetNodeMarker(startNode, "node-marker");
				if (endNode) resetNodeMarker(endNode, "node-marker");
				if (pathPolyline) {
					map.removeLayer(pathPolyline);
					pathPolyline = null;
				}
				startNode = null;
				endNode = null;
				errorMessage.textContent = "";
			}

			function updateUI() {
				if (!startNode) {
					selectionInfo.textContent = "Select start and end points";
					distanceInfo.textContent = "Distance: -";
					timeInfo.textContent = "Estimated Time: -";
					pathInfo.textContent = "Path: -";
					clearBtn.disabled = true;
				} else if (!endNode) {
					selectionInfo.textContent = `Start: ${startNode} → Select destination`;
					distanceInfo.textContent = "Distance: -";
					timeInfo.textContent = "Estimated Time: -";
					pathInfo.textContent = "Path: -";
				} else {
					const result = dijkstra(graph, startNode, endNode);
					if (result.error) {
						selectionInfo.textContent = `Start: ${startNode} → End: ${endNode}`;
						distanceInfo.textContent = "Distance: Unreachable";
						timeInfo.textContent = "Estimated Time: -";
						pathInfo.textContent = "Path: -";
					} else {
						selectionInfo.textContent = `Start: ${startNode} → End: ${endNode}`;
						distanceInfo.textContent = `Distance: ${result.distance.toFixed(
							2
						)} km`;

						// Format time as hours and minutes
						const hours = Math.floor(result.time / 60);
						const minutes = Math.round(result.time % 60);
						let timeString = "";
						if (hours > 0) timeString += `${hours} hr${hours > 1 ? "s" : ""} `;
						timeString += `${minutes} min${minutes !== 1 ? "s" : ""}`;
						timeInfo.textContent = `Estimated Time: ${timeString}`;

						pathInfo.textContent = `Path: ${result.path.join(" → ")}`;
					}
				}
			}
		})
		.catch((error) => {
			console.error("Error loading graph data:", error);
			errorMessage.textContent =
				"Error loading map data. Please check console for details.";
		});
});
