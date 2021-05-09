/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3, SpotLight } from 'three';
import { LabyrinthControls } from 'controls';
import { Clock } from 'three';
import { LabyrinthScene } from 'scenes';
import { BasicLights } from 'lights';

const scale = 5;
var dimensions = null;
var message = "How difficult do you want the maze to be? Enter an integer 0-5";
while (dimensions == null) {
    dimensions = prompt(message, "0");
    message = "You must enter an integer between 0 and 5 to begin.";
    if (isNaN(dimensions) || isNaN(parseFloat(dimensions)) || isNaN(parseInt(dimensions))) { 
        dimensions == null; 
        continue;
    }
    if (parseFloat(dimensions) != parseInt(dimensions)) {
        dimensions = null;
        continue;
    }
    let level = parseInt(dimensions);
    if (level < 0 || level > 5) {
        dimensions = null;
        continue;
    }
    dimensions = level + 5;
}

console.log("The Maze will have dimension " + dimensions + "!");

// Initialize core ThreeJS components
const scene = new LabyrinthScene(dimensions, scale);
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });

// Set up camera
let x = Math.floor(/*Math.random()*/0.001 * 5) * 5 - 2.5;
let z = Math.floor(/*Math.random()*/0.001 * 5) * 5 - 2.5;
camera.position.set(x, 0, z);
camera.lookAt(new Vector3(x, 0, z));

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// Set up controls
let spotLight = new SpotLight(0xffffff, 1);
spotLight.position.set(x, 0, z);
spotLight.angle = Math.PI * 0.2;
spotLight.penumbra = 0.3;
spotLight.decay = 2;
spotLight.distance = 200;
spotLight.target.position.set(0, 0, 0);
scene.add(spotLight);
scene.add(spotLight.target);

const controls = new LabyrinthControls(camera, canvas, spotLight);
controls.scene = scene;
controls.scene.add(controls.box);

controls.movementSpeed = 5;
controls.lookSpeed = 0.4;

// let box = new Mesh(new BoxGeometry(1, 1, 1), new MeshNormalMaterial({wireframe: true}));
// box.position.add(new Vector3(x, 0, z));
// scene.add(box);
// controls.box = box;

// required for controls
const clock = new Clock();

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    controls.update(clock.getDelta());
    renderer.render(scene, camera);
    scene.update && scene.update(timeStamp);
    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    controls.handleResize();
};

windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);