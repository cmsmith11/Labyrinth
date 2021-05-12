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
import { getChildNamed, pregamePromptHTML, endgamePromptHTML, handleResizeHTML, showPregamePrompt, hidePregamePrompt, showEndgamePrompt, hideEndgamePrompt, setUpPlayer, beginPlaying, playAgain, resetScene, animateHTML } from './introOutro.js';

const scale = 5;
var dimensions = 0;
// var message = "How difficult do you want the maze to be? Enter an integer 0-5";
// while (dimensions == null) {
//     dimensions = prompt(message, "0");
//     message = "You must enter an integer between 0 and 5 to begin.";
//     if (isNaN(dimensions) || isNaN(parseFloat(dimensions)) || isNaN(parseInt(dimensions))) { 
//         dimensions == null; 
//         continue;
//     }
//     if (parseFloat(dimensions) != parseInt(dimensions)) {
//         dimensions = null;
//         continue;
//     }
//     let level = parseInt(dimensions);
//     if (level < 0 || level > 5) {
//         dimensions = null;
//         continue;
//     }
//     dimensions = level + 5;
// }

// const hidePregamePrompt = () => {
// 	document.getElementById("pregame").display = 'hidden';
// }

// set up intro and outro HTML
pregamePromptHTML();
endgamePromptHTML();
showPregamePrompt();
// possible game states = { 'intro', 'playing', 'outro', 'paused' };
var gameState = 'intro';

console.log("The Maze will have dimension " + dimensions + "!");

// Initialize core ThreeJS components
const scene = new LabyrinthScene(dimensions, scale);
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

const spotLight = new SpotLight(0xffffff, 1);
spotLight.angle = Math.PI * 0.35;
spotLight.penumbra = 0.3;
spotLight.decay = 2;
spotLight.distance = 200;
scene.add(spotLight);
scene.add(spotLight.target);

const controls = new LabyrinthControls(camera, canvas, spotLight);
controls.scene = scene;
setUpPlayer(controls);
const clock = new Clock(); // required for controls

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    controls.update(clock.getDelta());
    renderer.render(scene, camera);
    let pos = new Vector3();
    pos.copy(camera.position);
    scene.update && scene.update(timeStamp, pos);

    //console.log(scene.destinationLoc.distanceTo(pos));
    if (scene.destinationLoc.distanceTo(pos) != 0 && scene.destinationLoc.distanceTo(pos) < 2 && gameState != 'intro') {
    	showEndgamePrompt();
    	gameState = 'outro';
    }
    animateHTML(timeStamp);

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
    handleResizeHTML();
};

// keydown Handler
const keydownHandler = (event) => {
	let k = event.key;
	if (k == 'Enter') {
		if (gameState == 'intro' || gameState == 'paused') {
			if (beginPlaying(scene, controls))
				gameState = 'playing';
		} else if (gameState == 'outro') {
			if (playAgain(scene, controls))
				gameState = 'playing';
		}
	}
	if (k == 'Escape') {
		if (gameState == 'paused') {
			hidePregamePrompt();
			gameState == 'playing';
		} else if (gameState == 'playing') {
			showPregamePrompt();
			gameState = 'paused';
		}
	}
};

windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
window.addEventListener('keydown', keydownHandler, false);