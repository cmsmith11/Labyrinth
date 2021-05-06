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
        const normal = new Vector3(1, 0, 0);
        const pos = new Vector3(0, 0, 0);
        this.addWall(pos, normal)
    }

    addWall(pos, normal){
        let geometry = undefined;
        if (normal.x == 1) {
            geometry = new BoxGeometry( 1, 10, 10);
        } else if (normal.y == 1) {
            geometry = new BoxGeometry( 10, 1, 10);
        } else if (normal.z == 1) {
            geometry = new BoxGeometry( 10, 10, 1 );
        }
        const material = new MeshNormalMaterial({ flatShading: true } );
        const cube = new Mesh( geometry, material );
        this.add(cube)
    }

    update(timeStamp) {
        // Advance tween animations, if any exist
        TWEEN.update();
    }
}

export default Maze;
