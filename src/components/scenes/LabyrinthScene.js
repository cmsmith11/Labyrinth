import * as Dat from 'dat.gui';
import { Scene, Color, Box3, Vector3, Box3Helper, BoxGeometry, MeshNormalMaterial, Mesh } from 'three';
import { Maze, Trophy, EndGoal } from 'objects';
import { BasicLights } from 'lights';

class LabyrinthScene extends Scene {
    constructor(dimensions, scale) {
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
        this.dimensions = dimensions;
        this.mazeScale = scale;
        // Add meshes to scene
        const maze = new Maze(this, dimensions, scale);
        const endGoal = new EndGoal(this, dimensions, scale);

        this.destinationLoc = new Vector3();
        this.destinationLoc.copy(endGoal.position);

        //const trophy = new Trophy(this);

        this.add(maze, endGoal/*, trophy*/);

        // Populate GUI
        //this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp, cameraPos) {
        // const { rotationSpeed, updateList } = this.state;
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;
        const { updateList } = this.state;
        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp, this.destinationLoc.distanceTo(cameraPos));
        }
    }
}

export default LabyrinthScene;
