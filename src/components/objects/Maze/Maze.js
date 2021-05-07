import { Group, BoxGeometry, Vector3, MeshNormalMaterial, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

class Maze extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            gui: parent.state.gui,            
        };
        this.name = 'maze'

        
        this.buildRandomMaze();

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    buildRandomMaze(){
        const gridSize = 10.0
        const gridScale = 5.0

        // Inner Walls
        const toExclude = this.wallsToExclude(gridSize + 1, gridSize + 1, gridScale);
        let ex = 0;
        for(let i = 0; i < gridSize - 1; i ++) {
            let x = i*gridScale;
            while (ex < toExclude.length && toExclude[ex].x < x) {
                ex++;
            }
            for (let j = 0; j < gridSize; j ++) {
                let y = (j - 0.5)*gridScale;
                if (ex < toExclude.length && toExclude[ex].x == x) {
                    while (ex < toExclude.length && toExclude[ex].y < y) {
                        ex++;
                    }
                    if (ex < toExclude.length && toExclude[ex].y == y) {
                    ex++;
                    continue;
                    }
                }
                const pos = new Vector3(x, y, 0);
                const normal = new Vector3(1, 0, 0);
                this.addWall(pos, normal, gridScale);
            }
        }
        ex = 0;
        for(let i = 0; i < gridSize; i ++) {
            let x = (i - 0.5)*gridScale;
            while (ex < toExclude.length && toExclude[ex].x < x) {
                ex++;
            }
            for (let j = 0; j < gridSize - 1; j ++) {
                let y = j*gridScale;
                if (ex < toExclude.length && toExclude[ex].x == x) {
                    while (ex < toExclude.length && toExclude[ex].y < y) {
                        ex++;
                    }
                    if (ex < toExclude.length && toExclude[ex].y == y) {
                    ex++;
                    continue;
                    }
                }
                const pos = new Vector3(x, y, 0);
                const normal = new Vector3(0, 1, 0);
                this.addWall(pos, normal, gridScale);
            }
        }
        // Outer Walls
        for (let j = 0; j < gridSize; j ++) {
            let y = (j - 0.5)*gridScale;
            const normal = new Vector3(1, 0, 0);
            let x = -1 * gridScale;
            const pos = new Vector3(x, y, 0);
            this.addWall(pos, normal, gridScale);
            x = gridScale * (gridSize - 1);
            pos = new Vector3(x, y, 0);
            this.addWall(pos, normal, gridScale);
        }
        for (let i = 0; i < gridSize; i ++) {
            let x = (i - 0.5)*gridScale;
            const normal = new Vector3(0, 1, 0);
            let y = -1 * gridScale;
            const pos = new Vector3(x, y, 0);
            this.addWall(pos, normal, gridScale);
            y = gridScale * (gridSize - 1);
            pos = new Vector3(x, y, 0);
            this.addWall(pos, normal, gridScale);
        }
        
    }

    getNeighbors(i, j, rows, cols) {
        let neighbors = [];
        if (i > 1) { neighbors.push([i - 1, j]); }
        if (i < rows - 1) { neighbors.push([i + 1, j]); }
        if (j > 1){ neighbors.push([i, j - 1]); }
        if (j < cols - 1) { neighbors.push([i, j + 1]); }
        return neighbors;
    }

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

    getWallFromCellCoordinates(i, j, m, n) {
            i = i - 1.5;
            m = m - 1.5;
            j = j - 1.5;
            n = n - 1.5;
        
        const wall = new Vector3(i + (m - i) / 2.0, j + (n - j) / 2.0, 0);
        return wall;
    }

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

    wallsToExclude(rows, cols, scale){
        const visited = [];
        for (let i = 0; i < rows; i++) {
            visited[i] = [];
            for (let j = 0; j < cols; j++) {
                visited[i].push(false);
            }
        }

        let startx = Math.min(Math.floor(Math.random() * rows), rows - 1)
        let starty = Math.min(Math.floor(Math.random() * cols), cols - 1)
        const toExclude = [];
        this.mazeGen(startx, starty, rows, cols, visited, scale, toExclude);
        toExclude.sort((a, b) => a.x == b.x ? a.y - b.y : a.x - b.x);
        return toExclude;
    }

    addWall(pos, normal, gridScale){
        let geometry = undefined;
        if (normal.x == 1) {
            geometry = new BoxGeometry( gridScale/10, gridScale, gridScale);
        } else if (normal.y == 1) {
            geometry = new BoxGeometry( gridScale, gridScale/10, gridScale);
        } else if (normal.z == 1) {
            geometry = new BoxGeometry( gridScale, gridScale, gridScale/10);
        }
        const material = new MeshNormalMaterial({ flatShading: true } );
        const cube = new Mesh( geometry, material );
        cube.position.add(pos);
        this.add(cube)
    }

    update(timeStamp) {
        // Advance tween animations, if any exist
        TWEEN.update();
    }
}

export default Maze;
