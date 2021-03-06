import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import MODEL from './Trophy.gltf';
//let dbg = 0;
class Trophy extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            //gui: parent.state.gui,
            //bob: true,
            spin: this.spin.bind(this),
            twirl: 0,
        };

        // Load object
        const loader = new GLTFLoader();

        this.name = 'trophy';
        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });

        this.position.set(2.5, 15, 2.5);
        this.scale.set(10, 10, 10);

        // Add self to parent's update list
        parent.addToUpdateList(this);

        // Populate GUI
        //this.state.gui.add(this.state, 'bob');
        //this.state.gui.add(this.state, 'spin');

        //console.log('trophy?', this);
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
        // if (this.state.bob) {
        //     // Bob back and forth
        //     this.rotation.z = 0.05 * Math.sin(timeStamp / 300);
        // }
        if (this.state.twirl > 0) {
            // Lazy implementation of twirl
            this.state.twirl -= Math.PI / 8;
            this.rotation.y += Math.PI / 8;
        }

        // if (dbg < 10)
        //     console.log(this);
        // dbg++;

        // Advance tween animations, if any exist
        TWEEN.update();
    }
}

export default Trophy;
