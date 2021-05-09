import { Group, BoxGeometry, BufferGeometry, PlaneGeometry, Vector3, MeshNormalMaterial, Mesh, DoubleSide, MeshPhongMaterial, TextureLoader, MeshStandardMaterial} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'; 

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
        const gridSize = 5.0
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
                //const pos = new Vector3(x, y, 0);
                const pos = new Vector3(x, 0, y);
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
                //const pos = new Vector3(x, y, 0);
                const pos = new Vector3(x, 0, y);
                //const normal = new Vector3(0, 1, 0);
                const normal = new Vector3(0, 0, 1);
                this.addWall(pos, normal, gridScale);
            }
        }
        // Outer Walls
        for (let j = 0; j < gridSize; j ++) {
            let y = (j - 0.5)*gridScale;
            const normal = new Vector3(1, 0, 0);
            let x = -1 * gridScale;
            //const pos = new Vector3(x, y, 0);
            const pos = new Vector3(x, 0, y);
            this.addWall(pos, normal, gridScale);
            x = gridScale * (gridSize - 1);
            //pos = new Vector3(x, y, 0);
            pos = new Vector3(x, 0, y);
            this.addWall(pos, normal, gridScale);
        }
        for (let i = 0; i < gridSize; i ++) {
            let x = (i - 0.5)*gridScale;
            //const normal = new Vector3(0, 1, 0);
            const normal = new Vector3(0, 0, 1);
            let y = -1 * gridScale;
            //const pos = new Vector3(x, y, 0);
            const pos = new Vector3(x, 0, y);
            this.addWall(pos, normal, gridScale);
            y = gridScale * (gridSize - 1);
            //pos = new Vector3(x, y, 0);
            pos = new Vector3(x, 0, y);
            this.addWall(pos, normal, gridScale);
        }
        this.addFloor(0, gridSize, gridScale, true);
        this.addFloor(1, gridSize, gridScale, false); 
        
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

    addNoise(geometry, scale) {
        let newGeo = geometry.clone();
        // let newGeo = new BufferGeometry();
        // newGeo.fromGeometry(geometry);
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

    addWall(pos, normal, gridScale){
        let wallGeo = undefined;
        let mirrorGeo = new PlaneGeometry(gridScale, gridScale);
        const segments = 10*gridScale;
        if (normal.x == 1) {
            wallGeo = new BoxGeometry( gridScale/10, gridScale+ gridScale/20, gridScale + gridScale/20, segments, segments, segments);
            mirrorGeo.rotateY(Math.PI / 2.0)
        } else if (normal.y == 1) {
            wallGeo = new BoxGeometry( gridScale, gridScale/10, gridScale, segments, segments, segments);
        } else if (normal.z == 1) {
            wallGeo = new BoxGeometry( gridScale, gridScale, gridScale/10, segments, segments, segments);
        }
        //wallGeo = this.addNoise(wallGeo, gridScale);
        //const material = new MeshNormalMaterial({ flatShading:true, side: DoubleSide} );

        //const material = new MeshPhongMaterial({color: 0x49ef4});
        // MAKE CUSTOM MATERIAL
        const material = this.createWallMaterial();
        const cube = new Mesh( wallGeo, material );
        cube.normal = normal;
        cube.position.add(pos);
        this.add(cube);
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

    addFloor(y, gridSize, gridScale, smooth) {
        if (false) {
            let mirrorGeo = new PlaneGeometry(gridSize*gridScale, gridSize* gridScale );
            mirrorGeo.rotateX(- Math.PI / 2.0);
            let mirrorWall = new Reflector( mirrorGeo, {
                clipBias: 0.003,
                textureWidth: window.innerWidth * window.devicePixelRatio,
                textureHeight: window.innerHeight * window.devicePixelRatio,
                color: 0x777777
            });
            
            mirrorWall.position.add(new Vector3(  gridSize*gridScale/2.0 - gridScale, y*gridScale - gridScale/2.0,   gridSize*gridScale/2.0 - gridScale));
            this.add(mirrorWall); 
        } else {
            let segments = 10*gridSize*gridScale;
            let floorGeo = new BoxGeometry(gridSize*gridScale, gridScale / 10, gridSize*gridScale, segments, segments, segments);
            floorGeo = this.addNoise(floorGeo, gridScale);
            const material = new MeshNormalMaterial({ flatShading: true, side: DoubleSide} );  
            const floor = new Mesh(floorGeo, material);
            floor.position.add(new Vector3(  gridSize*gridScale/2.0 - gridScale, y*gridScale - gridScale/2.0,   gridSize*gridScale/2.0 - gridScale)); 
            this.add(floor);
        }
//>>>>>>> d4c7ad481c3d7d59c1d0e0ac89f98ee7ceb497ae
    }

    update(timeStamp) {
        // Advance tween animations, if any exist
        TWEEN.update();
    }
}

export default Maze;
