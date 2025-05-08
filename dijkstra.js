class PriorityQueue {
	constructor() {
		this.elements = [];
	}

	enqueue(element, priority) {
		this.elements.push({ element, priority });
		this.elements.sort((a, b) => a.priority - b.priority);
	}

	dequeue() {
		return this.elements.shift().element;
	}

	isEmpty() {
		return this.elements.length === 0;
	}
}

function buildPath(previous, end) {
	const path = [];
	let node = end;
	while (node) {
		path.unshift(node);
		node = previous[node];
	}
	return path;
}

function dijkstra(graph, start, end) {
	const distances = {};
	const previous = {};
	const queue = new PriorityQueue();
	const visited = new Set();

	// Initialize distances
	for (const node in graph) {
		distances[node] = node === start ? 0 : Infinity;
		queue.enqueue(node, distances[node]);
		previous[node] = null;
	}

	while (!queue.isEmpty()) {
		const current = queue.dequeue();

		if (current === end) {
			// Build path only if end node was reached
			if (distances[end] === Infinity) {
				return {
					path: [],
					distance: Infinity,
					time: Infinity,
					error: "No path exists to the destination",
				};
			}

			const path = buildPath(previous, end);

			// Calculate time (assuming 50 km/h average speed)
			const time = (distances[end] / 50) * 60; // Convert to minutes

			return {
				path,
				distance: distances[end],
				time: time,
				error: null,
			};
		}

		// Skip if we've already found a better way
		if (visited.has(current)) continue;
		visited.add(current);

		for (const neighbor of graph[current]) {
			const alt = distances[current] + neighbor.weight;
			if (alt < distances[neighbor.node]) {
				distances[neighbor.node] = alt;
				previous[neighbor.node] = current;
				queue.enqueue(neighbor.node, alt);
			}
		}
	}

	return {
		path: [],
		distance: Infinity,
		time: Infinity,
		error: "No path exists to the destination",
	};
}
