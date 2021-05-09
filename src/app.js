/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
import { LabyrinthControls } from 'controls';
import { Clock } from 'three';
import { LabyrinthScene } from 'scenes';

// Initialize core ThreeJS components
const scene = new LabyrinthScene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });

// Set up camera
let x = Math.floor(Math.random() * 10) * 5 - 2.5;
let z = Math.floor(Math.random() * 10) * 5 - 2.5;
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
const controls = new LabyrinthControls(camera, canvas);
controls.scene = scene;
controls.movementSpeed = 5;
controls.lookSpeed = 0.4;

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
