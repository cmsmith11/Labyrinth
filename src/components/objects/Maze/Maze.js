import { Group, BoxGeometry, Vector3, MeshNormalMaterial, Mesh, 
    DoubleSide, MeshPhongMaterial, TextureLoader} from 'three';

class Maze extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();
        // Init state
        this.state = {
            gui: parent.state.gui,            
        };
        this.name = 'maze'
        // build the maze
        this.buildRandomMaze();
        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    // Builds a random, 3d maze that has gridSize x gridSize x gridSize cells 
    // with each cell having dimensions gridScale x gridScale x gridScale
    buildRandomMaze() {
        const gridSize = 5.0;
        const gridScale = 5.0;
        for (let level = 0; level <= gridSize; level++) {  
            if (level < gridSize) {
                this.addMazeLevel(level, gridSize, gridScale);
            }
            if (level == 0 || level == gridSize) {
                this.addFloor(level, gridSize, gridScale, false);
            }
            else {
                this.addFloor(level, gridSize, gridScale, true);
            }
        }   
    }

    // Builds inner walls of the maze at the given level
    addMazeInnerWalls(level, gridSize, gridScale) {
        const toExclude = this.wallsToExclude(gridSize + 1, gridSize + 1, gridScale);
        let ex = 0;
        for(let i = 0; i < gridSize - 1; i++) {
            let x = i * gridScale;
            while (ex < toExclude.length && toExclude[ex].x < x) {
                ex++;
            }
            for (let j = 0; j < gridSize; j++) {
                let z = (j - 0.5) * gridScale;
                if (ex < toExclude.length && toExclude[ex].x == x) {
                    while (ex < toExclude.length && toExclude[ex].z < z) {
                        ex++;
                    }
                    if (ex < toExclude.length && toExclude[ex].z == z) {
                        ex++;
                        continue;
                    }
                }
                const pos = new Vector3(x, level*gridScale, z);
                const normal = new Vector3(1, 0, 0);
                this.addWall(pos, normal, gridScale);
            }
        }
        ex = 0;
        for(let i = 0; i < gridSize; i++) {
            let x = (i - 0.5)*gridScale;
            while (ex < toExclude.length && toExclude[ex].x < x) {
                ex++;
            }
            for (let j = 0; j < gridSize - 1; j++) {
                let z = j*gridScale;
                if (ex < toExclude.length && toExclude[ex].x == x) {
                    while (ex < toExclude.length && toExclude[ex].z < z) {
                        ex++;
                    }
                    if (ex < toExclude.length && toExclude[ex].z == z) {
                        ex++;
                        continue;
                    }
                }
                const pos = new Vector3(x, level*gridScale, z);
                const normal = new Vector3(0, 0, 1);
                this.addWall(pos, normal, gridScale);
            }
        }
    }

    // Builds outer walls of the maze at the given level
    addMazeOuterWalls(level, gridSize, gridScale) {
        for (let j = 0; j < gridSize; j++) {
            const normal = new Vector3(1, 0, 0);
            let x = -1 * gridScale;
            let y = level * gridScale;
            let z = (j - 0.5) * gridScale;
            const pos = new Vector3(x, y, z);
            this.addWall(pos, normal, gridScale);
            x = gridScale * (gridSize - 1);
            pos = new Vector3(x, y, z);
            this.addWall(pos, normal, gridScale);
        }
        for (let i = 0; i < gridSize; i++) {
            const normal = new Vector3(0, 0, 1);
            let x = (i - 0.5) * gridScale;
            let y = level * gridScale;
            let z = -1 * gridScale;
            const pos = new Vector3(x, y, z);
            this.addWall(pos, normal, gridScale);
            z = gridScale * (gridSize - 1);
            pos = new Vector3(x, y, z);
            this.addWall(pos, normal, gridScale);
        }
    }

    // Adds the inner and outer walls of the maze at a given level
    addMazeLevel(level, gridSize, gridScale){
        this.addMazeInnerWalls(level, gridSize, gridScale);
        this.addMazeOuterWalls(level, gridSize, gridScale);
    }

    // gets the neighbors [[n1.x, n1.z], [...], ...] to cell (i, j) in 
    // a grid of rows x cols
    getNeighbors(i, j, rows, cols) {
        let neighbors = [];
        if (i > 1) { 
            neighbors.push([i - 1, j]); 
        }
        if (i < rows - 1) { 
            neighbors.push([i + 1, j]); 
        }
        if (j > 1){ 
            neighbors.push([i, j - 1]); 
        }
        if (j < cols - 1) { 
            neighbors.push([i, j + 1]); 
        }
        return neighbors;
    }

    // randomly shuffles an array
    shuffle(arr) {
        let c = arr.length;
        while (c > 0) {
            let index = Math.floor(Math.random() * c);
            c--;
            let temp = arr[c];
            arr[c] = arr[index];
            arr[index] = temp;
        }
    }

    // get the coordinates of the wall separating cell(i, j) from cell(m, n)
    // this is not adjusted for gridScale (that happens later)
    getWallFromCellCoordinates(i, j, m, n) {
        i = i - 1.5;
        m = m - 1.5;
        j = j - 1.5;
        n = n - 1.5;
        const wall = new Vector3(i + (m - i) / 2.0, 0, j + (n - j) / 2.0);
        return wall;
    }

    // generate the maze pattern using a recursive depth first search based algorithm
    // determines which walls to exclude to make passageways in the final
    // maze and stores their coordinates in toExclude
    mazeGen(i, j, rows, cols, visited, scale, toExclude) {
        visited[i][j] = true;
        const neighbors = this.getNeighbors(i, j, rows, cols);
        this.shuffle(neighbors);
        for (let n = 0; n < neighbors.length; n++) {
            let nbr = neighbors[n];
            if (visited[nbr[0]][nbr[1]]) { continue;}
            let wallToExclude = this.getWallFromCellCoordinates(i, j, nbr[0], nbr[1]);
            wallToExclude.multiplyScalar(scale);
            toExclude.push(wallToExclude);
            this.mazeGen(nbr[0], nbr[1], rows, cols, visited, scale, toExclude);
        }
    }

    // gets the sorted list of walls to exclude based on mazeGen
    wallsToExclude(rows, cols, scale) {
        const visited = [];
        for (let i = 0; i < rows; i++) {
            visited[i] = [];
            for (let j = 0; j < cols; j++) {
                visited[i].push(false);
            }
        }
        let startx = Math.min(Math.floor(Math.random() * rows), rows - 1);
        let starty = Math.min(Math.floor(Math.random() * cols), cols - 1);
        const toExclude = [];
        this.mazeGen(startx, starty, rows, cols, visited, scale, toExclude);
        toExclude.sort((a, b) => a.x == b.x ? a.z - b.z : a.x - b.x);
        return toExclude;
    }

    // adds random noise to the vertices in a geometry and returns
    // the new geometry
    addNoise(geometry, scale) {
        let newGeo = geometry.clone();
        const positions = newGeo.attributes.position.array;
        const num_points = positions.length / 3;
        let index = 0;
        for (let i = 0; i < num_points; i++) {
            let rx = (Math.random() - 0.5) * scale / 10;
            let ry = (Math.random() - 0.5) * scale / 10;
            let rz = (Math.random() - 0.5) * scale / 10;
            positions[index ++] += rx;
            positions[index ++] += ry;
            positions[index ++] += rz;
        }
        return newGeo;
    }

    // creates a material to be used in walls, based on a texture
    createWallMaterial() {
        const textureLoader = new TextureLoader();
        const texture = textureLoader.load('src/components/objects/Maze/waterTexture.png');
        const material = new MeshPhongMaterial({color: 'purple'});
        material.map = texture;
        material.displacementMap = texture;
        material.displacementScale = 0.1;
        material.shininess = 1000;
        return material;
    }

    // adds a wall at position pos with normal normal
    addWall(pos, normal, gridScale){
        let wallGeo = undefined;
        //let mirrorGeo = new PlaneGeometry(gridScale, gridScale);
        const segments = 10 * gridScale;
        const wallDepth = gridScale / 10;
        if (normal.x == 1) {
            wallGeo = new BoxGeometry(wallDepth, gridScale, gridScale, segments, segments, segments);
            //mirrorGeo.rotateY(Math.PI / 2.0)
        } else if (normal.y == 1) {
            wallGeo = new BoxGeometry(gridScale, wallDepth, gridScale, segments, segments, segments);
        } else if (normal.z == 1) {
            wallGeo = new BoxGeometry(gridScale, gridScale, wallDepth, segments, segments, segments);
        }
        const material = this.createWallMaterial();
        const wall = new Mesh(wallGeo, material);
        wall.normal = normal;
        wall.position.add(pos);
        this.add(wall);
        // if (Math.random < 0.1) {
        //     let mirrorWall = new Reflector( mirrorGeo, {
        //         clipBias: 0.003,
        //         textureWidth: window.innerWidth * window.devicePixelRatio,
        //         textureHeight: window.innerHeight * window.devicePixelRatio,
        //         color: 0x777777
        //     });
        //     mirrorWall.position.add(pos);
        //     this.add(mirrorWall); 
        // }   
    }

    // adds a floor at level, if hasOpening, one opening per floor is added to make it 
    // possible to get to any floor in the 3d maze
    addFloor(level, gridSize, gridScale, hasOpening) {
        if (hasOpening) {
            let openingX = Math.min(Math.floor(Math.random() * gridSize), gridSize - 1);
            let openingZ = Math.min(Math.floor(Math.random() * gridSize), gridSize - 1);
            for(let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    if (i == openingX && j == openingZ) { continue; }
                    let x = (i - 0.5) * gridScale;
                    let y = (level - 0.5) * gridScale;
                    let z = (j - 0.5) * gridScale;
                    let pos = new Vector3(x, y, z);
                    let normal = new Vector3(0, 1, 0);
                    this.addWall(pos, normal, gridScale);
                }
            }
        } else {
            let segments = 10 * gridSize * gridScale;
            const floorThickness = gridScale / 10;
            const floorWidth = gridSize * gridSize;
            let floorGeo = new BoxGeometry(floorWidth, floorThickness, floorWidth, segments, segments, segments);
            floorGeo = this.addNoise(floorGeo, gridScale);
            const material = new MeshNormalMaterial({ flatShading: true, side: DoubleSide} );  
            const floor = new Mesh(floorGeo, material);
            let x = gridSize * gridScale / 2.0 - gridScale;
            let y = level * gridScale - gridScale / 2.0;
            let z = gridSize * gridScale / 2.0 - gridScale;
            floor.position.add(new Vector3(x, y, z)); 
            this.add(floor);
        }
    }

    update(timeStamp) {
        // nothing to update
    }
}

export default Maze;
