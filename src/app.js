/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
import { LabyrinthControls } from 'objects';
import { Clock } from 'three'; // cms11 edit
import { SeedScene } from 'scenes';

// Initialize core ThreeJS components
const scene = new SeedScene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });

// Set up camera
camera.position.set(6, 3, -10);
camera.lookAt(new Vector3(0, 0, 0));

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// Set up controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.enablePan = false;
// controls.minDistance = 4;
// controls.maxDistance = 16;
// controls.update();

// Set up controls - cms11 edit
// const controls = new FirstPersonControls(camera, canvas);
// controls.movementSpeed = 5;
// controls.lookSpeed = 0.2;

// controls take 3
// class LabyrinthControls extends FirstPersonControls {
// 	constructor(camera, canvas) {
// 		super(camera, canvas);
// 		//this.dispose();
// 		//console.log(window.getEventListeners(canvas));
// 		//this.domElement.removeEventListener( 'keydown', this.onKeyDown, false );
// 		this.domElement.addEventListener( 'keydown', function(){console.log('hello??');}, false );
// 	};

// 	MyOnKeyDown( event ) {
// 		//event.preventDefault();
// 		console.log('...hello?');
// 		switch ( event.keyCode ) {
// 			//case 38: /*up*/
// 			//case 87: /*W*/ this.moveForward = true; break;

// 			case 37: /*left*/
// 			case 65: /*A*/ this.moveLeft = true; break;

// 			case 40: /*down*/
// 			case 83: /*S*/ this.moveBackward = true; break;

// 			case 39: /*right*/
// 			case 68: /*D*/ this.moveRight = true; break;

// 			case 82: /*R*/ this.moveUp = true; break;
// 			case 70: /*F*/ this.moveDown = true; break;
// 		}
// 	};
// }

// var LabyrinthControls = function() {
// 	FirstPersonControls.apply(this, arguments);
// };
// function MyOnKeyDown(event) {
// 	event.preventDefault();
// 	console.log('...hello?');
// 	switch ( event.keyCode ) {
// 		case 38: /*up*/
// 		case 87: /*W*/ this.moveForward = false; break;

// 		case 37: /*left*/
// 		case 65: /*A*/ this.moveLeft = true; break;

// 		case 40: /*down*/
// 		case 83: /*S*/ this.moveBackward = true; break;

// 		case 39: /*right*/
// 		case 68: /*D*/ this.moveRight = true; break;

// 		case 82: /*R*/ this.moveUp = true; break;
// 		case 70: /*F*/ this.moveDown = true; break;
// 	}
// };
// LabyrinthControls.prototype = new FirstPersonControls(camera, canvas);
// LabyrinthControls.prototype.constructor = FirstPersonControls;
// //console.log(LabyrinthControls.prototype);
// //LabyrinthControls.prototype.addEventListener( 'keydown', function(){console.log('hello??');}, false );

// const controls = new LabyrinthControls(camera, canvas);
// controls.movementSpeed = 5;
// controls.lookSpeed = 0.2;
// //controls.domElement.removeEventListener( 'keydown', null, false );
// //controls.dispose();
// console.log(controls.domElement);
// window.addEventListener( 'keydown', MyOnKeyDown, false );

// Set up controls - cms11 edit
const controls = new LabyrinthControls(camera, canvas);
controls.movementSpeed = 5;
controls.lookSpeed = 0.2;

// required for controls - cms11 edit
const clock = new Clock();

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    //controls.update();
    controls.update(clock.getDelta()); // cms11 edit
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
    controls.handleResize(); // cms11 edit
};

// Keydown handler - cms11 edit
const keyDownHandler = (event) => {
	console.log('keyCode was:', event.key);
	let k = event.key;
	if (k == 'ArrowLeft') {
		//
		console.log('cam position', camera.position);
		//camera.position.x++;// = camera.position.x + 1;
		//camera.rotateY(1);
	}
	if (k == 'ArrowRight') {
		//
		console.log('cam position', camera.position);
		//camera.position.x--;
		//camera.rotateY(-1);
	}
	if (k == 'ArrowUp') {
		//
		console.log('cam position', camera.position);
		//camera.position.z++;
		//camera.translateZ(1.0);
		//controls.autoForward = true;
	}
	if (k == 'ArrowDown') {
		//
		console.log('cam position', camera.position);
		//camera.position.z--;
		//camera.translateZ(-1.0);
		//controls.autoForward = false;
	}
	console.log('camera:', camera);
	// if (k == 'w') {
	// 	controls.autoForward = true;
	// }
}

// Keyup Handler - cms11 edit
const keyUpHandler = (event) => {
	console.log('keyup was', event.key);
	let k = event.key;
	// if (k == 'w') {
	// 	controls.autoForward = false;
	// }
}

windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
//window.addEventListener('keydown', keyDownHandler, false); // cms11 edit
//window.addEventListener('keyup', keyUpHandler, false); // cms11 edit
