//import { Group } from 'three';
import { Group, Vector3, BoxGeometry, MeshNormalMaterial, Mesh} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
//import MODEL from './flower.gltf';

class EndGoal extends Group {
    constructor(parent, dimensions, scale) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            //gui: parent.state.gui,
            bob: true,
            //spin: this.spin.bind(this),
            //twirl: 0,
        };

        // Load object
        //const loader = new GLTFLoader();

        this.name = 'endgoal';
        // loader.load(MODEL, (gltf) => {
        //     this.add(gltf.scene);
        // });
        let x = Math.floor(Math.random() * dimensions) * scale - scale/2;
        let y = Math.floor(Math.random() * dimensions) * scale;
        let z = Math.floor(Math.random() * dimensions) * scale - scale/2;
        this.position.copy(new Vector3(x, y, z));

        this.box = new Mesh(new BoxGeometry(1, 1, 1), new MeshNormalMaterial({wireframe: true}));
        this.box2 = this.box.clone();
        this.box3 = this.box.clone();
        this.add(this.box);
        this.add(this.box2);
        this.add(this.box3);

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    spin() {
        // Add a simple twirl
        this.state.twirl += 6 * Math.PI;

        // Use timing library for more precice "bounce" animation
        // TweenJS guide: http://learningthreejs.com/blog/2011/08/17/tweenjs-for-smooth-animation/
        // Possible easings: http://sole.github.io/tween.js/examples/03_graphs.html
        const jumpUp = new TWEEN.Tween(this.position)
            .to({ y: this.position.y + 1 }, 300)
            .easing(TWEEN.Easing.Quadratic.Out);
        const fallDown = new TWEEN.Tween(this.position)
            .to({ y: 0 }, 300)
            .easing(TWEEN.Easing.Quadratic.In);

        // Fall down after jumping up
        jumpUp.onComplete(() => fallDown.start());

        // Start animation
        jumpUp.start();
    }

    update(timeStamp) {
        if (this.state.bob) {
            // Bob back and forth
            this.box.position.y = 0.1 * Math.sin(timeStamp / 900);
            this.box.rotation.y = 0.05 * (timeStamp / 200) % (2 * Math.PI);
            this.box.rotation.x = 0.05 * (timeStamp / 500) % (2 * Math.PI);
            this.box.rotation.z = 0.05 * (timeStamp / 700) % (2 * Math.PI);

            this.box2.position.y = 0.1 * Math.sin(timeStamp / 900);
            this.box2.rotation.y = -0.05 * (timeStamp / 200) % (2 * Math.PI);
            this.box2.rotation.x = -0.05 * (timeStamp / 500) % (2 * Math.PI);
            this.box2.rotation.z = -0.05 * (timeStamp / 700) % (2 * Math.PI);

            this.box3.position.y = 0.1 * Math.sin(timeStamp / 900);
            this.box3.rotation.y = 0.05 * (timeStamp / 350) % (2 * Math.PI);
            this.box3.rotation.x = -0.05 * (timeStamp / 650) % (2 * Math.PI);
            this.box3.rotation.z = 0.05 * (timeStamp / 950) % (2 * Math.PI);
        }
        // if (this.state.twirl > 0) {
        //     // Lazy implementation of twirl
        //     this.state.twirl -= Math.PI / 8;
        //     this.rotation.y += Math.PI / 8;
        // }

        // Advance tween animations, if any exist
        TWEEN.update();
        //this.box.update(timeStamp);
        //this.box.updateMatrix();
    }
}

export default EndGoal;
