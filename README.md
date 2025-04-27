# Smart Route Navigator

A web-based application to find the shortest path between two points on a map using Dijkstra's algorithm.

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd smart-route-finder
   ```

2. Open the project in your preferred code editor.

3. Start a local server to serve the files. You can use one of the following methods:

   - **Using Python 3**:

     ```bash
     python3 -m http.server
     ```

     This will start a server on port 8000 by default. Open `http://localhost:8000` in your browser.

   - **Using Node.js (http-server)**:
     Install the `http-server` package globally if you don't already have it:

     ```bash
     npm install -g http-server
     ```

     Then start the server:

     ```bash
     http-server
     ```

     By default, this will serve the files on port 8080. Open `http://localhost:8080` in your browser.

   - **Using VS Code Live Server Extension(Easiest one imo)**:
     Install the Live Server extension in Visual Studio Code. Right-click on the `index.html` file and select "Open with Live Server."

4. Open the application in your browser and interact with the map to select start and end points. The shortest path will be displayed on the map.
