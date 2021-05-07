import * as Dat from 'dat.gui';
//import { Flower, Land } from 'objects';
import { Scene, Color, Box3, Vector3, Box3Helper, BoxGeometry, MeshBasicMaterial, Mesh  } from 'three';
import { Maze } from 'objects';
import { BasicLights } from 'lights';

class LabyrinthScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        // const land = new Land();
        // const flower = new Flower(this);
        // const lights = new BasicLights();
        // this.add(land, flower, lights);

        // const geometry = new BoxGeometry( 1, 1, 1 );
        // const material = new MeshBasicMaterial( {color: 0x00ff00} );
        // const cube = new Mesh( geometry, material );
        // this.add( cube );
        const lights = new BasicLights();
        const maze = new Maze(this);
        this.add(maze, lights);

        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        // const { rotationSpeed, updateList } = this.state;
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;
        const { updateList } = this.state;
        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default LabyrinthScene;
