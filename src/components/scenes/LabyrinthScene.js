import * as Dat from 'dat.gui';
import { Scene, Color, Box3, Vector3, Box3Helper, BoxGeometry, MeshNormalMaterial, Mesh } from 'three';
import { Maze, Trophy } from 'objects';
import { BasicLights } from 'lights';

class LabyrinthScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            //gui: new Dat.GUI(), // Create GUI for scene
            //rotationSpeed: 1,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0x000000);

        // Add meshes to scene
        //const flower = new Flower(this);
        const lights = new BasicLights();
        const maze = new Maze(this);
        // end goal
        let endGoal = new Mesh(new BoxGeometry(1, 1, 1), new MeshNormalMaterial({wireframe: true}));
        let x = Math.floor(Math.random() * 5) * 5 - 2.5;
        let z = Math.floor(Math.random() * 5) * 5 - 2.5;
        endGoal.position.add(new Vector3(x, 0, z));
        //
        const trophy = new Trophy(this);

        this.add(maze, lights, endGoal, trophy);

        // Populate GUI
        //this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
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
