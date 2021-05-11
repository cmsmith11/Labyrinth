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

function hidePregamePrompt(scene) {
	let inp = document.getElementById("lvlInpPre").value;
	//console.log('pre:', inp, parseInt(inp));
	if (inp == '')
		return;
	dimensions = parseInt(inp) + 5;
	document.getElementById("pregame").style.display = 'none';
	// reset the maze
	console.log('scene', scene);
	scene.children[0].children = [];
	scene.children[0].maxDist = Math.sqrt(2*(dimensions*scale)*(dimensions*scale));
    scene.children[0].buildRandomMaze(dimensions, scale);

    let x = Math.floor(Math.random() * dimensions) * scale - scale/2;
    let y = Math.floor(Math.random() * dimensions) * scale;
    let z = Math.floor(Math.random() * dimensions) * scale - scale/2;
    scene.children[1].position.set(x, y, z);
    console.log(scene.children[1].position);
    setUpPlayer();
    scene.destinationLoc.copy(scene.children[1].position);
}

const showPregamePrompt = () => {
	document.getElementById("pregame").style.display = 'block';
}

// pregame prompt
const pregamePrompt = () => {
	let elem = document.createElement("SPAN");
	let w = 500;
	let h = 300;
	let x = window.innerWidth / 2 - w / 2;
	let y = window.innerHeight / 2 - h / 2;
	elem.innerHTML = "\
	<span id=pregame style='position: absolute; left: "+x+"px; top: "+y+"px; \
	height: "+h+"px; width: "+w+"px; background: blue; border-radius: 10px; display: block;'>\
		<span style='position: relative; top: "+(h/2-40)+"px;'>\
			<center style='position: relative; top: "+0+"px;'>Enter Difficulty (0-5)</center>\
			<center><input id=lvlInpPre value='' style='position: relative; top: "+10+"px;'></input><center>\
			<center style='position: relative; top: "+20+"px;'>Press Enter to Start</center>\
		</span>\
	</span>\
	";
	document.body.appendChild(elem);
}
pregamePrompt();

// pregame prompt
const endgamePrompt = () => {
	let elem = document.createElement("SPAN");
	let w = 500;
	let h = 300;
	let x = window.innerWidth / 2 - w / 2;
	let y = window.innerHeight / 2 - h / 2;
	elem.innerHTML = "\
	<span id=endgame style='position: absolute; left: "+x+"px; top: "+y+"px; \
	height: "+h+"px; width: "+w+"px; background: blue; border-radius: 10px; display: none;'>\
		<span style='position: relative; top: "+(h/2-40)+"px;'>\
			<center style='position: relative; top: "+(-10)+"px;'>You win! Play again?</center>\
			<center style='position: relative; top: "+0+"px;'>Enter Difficulty (0-5)</center>\
			<center><input id=lvlInpEnd value='' style='position: relative; top: "+10+"px;'></input><center>\
			<center style='position: relative; top: "+20+"px;'>Press Enter to Start</center>\
		</span>\
	</span>\
	";
	document.body.appendChild(elem);
}
endgamePrompt();

const showEndgamePrompt = () => {
	document.getElementById("endgame").style.display = 'block';
}

const hideEndgamePrompt = (scene) => {
	let inp = document.getElementById("lvlInpEnd").value;
	//console.log('end:', inp, parseInt(inp), inp == '');
	if (inp == '')
		return;
	dimensions = parseInt(inp) + 5;
	document.getElementById("endgame").style.display = 'none';
	// reset the maze
	console.log('scene', scene);
	scene.children[0].children = [];
	scene.children[0].maxDist = Math.sqrt(2*(dimensions*scale)*(dimensions*scale));
    scene.children[0].buildRandomMaze(dimensions, scale);

    let x = Math.floor(Math.random() * dimensions) * scale - scale/2;
    let y = Math.floor(Math.random() * dimensions) * scale;
    let z = Math.floor(Math.random() * dimensions) * scale - scale/2;
    scene.children[1].position.set(x, y, z);
    console.log(scene.children[1].position);
    setUpPlayer();
    scene.destinationLoc.copy(scene.children[1].position);
}

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

// Set up camera
function setUpPlayer() {
	let x = Math.floor(Math.random() * dimensions) * scale - scale/2;
	let y = Math.floor(Math.random() * dimensions) * scale;
	let z = Math.floor(Math.random() * dimensions) * scale - scale/2;
	camera.position.set(x, y, z);
	let halfDist = (dimensions / 2) * scale - scale/2;
	camera.lookAt(new Vector3(halfDist, y, halfDist));

	// Set up controls
	spotLight.position.set(x, y, z);
	spotLight.target.position.set(halfDist, y, halfDist);
	controls.mouseX = 0;
	controls.mouseY = 0;
	controls.object.lookAt(new Vector3(halfDist, y, halfDist));
}
const spotLight = new SpotLight(0xffffff, 1);
spotLight.angle = Math.PI * 0.4;
spotLight.penumbra = 0.3;
spotLight.decay = 2;
spotLight.distance = 200;
scene.add(spotLight);
scene.add(spotLight.target);

const controls = new LabyrinthControls(camera, canvas, spotLight);
controls.scene = scene;
controls.scene.add(controls.box);
controls.movementSpeed = 5;
controls.lookSpeed = 0.4;
setUpPlayer();

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
    let pos = new Vector3();
    pos.copy(camera.position);
    scene.update && scene.update(timeStamp, pos);

    //console.log(scene.destinationLoc.distanceTo(pos));
    if (scene.destinationLoc.distanceTo(pos) != 0 && scene.destinationLoc.distanceTo(pos) < 3) {
    	showEndgamePrompt();
    }

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

// keydown Handler
const keydownHandler = (event) => {
	let k = event.key;
	//console.log('key', k);
	if (k == 'Enter') {
		hidePregamePrompt(scene);
		hideEndgamePrompt(scene);
	}
	if (k == 'Escape') {
		showPregamePrompt();
	}
};

windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
window.addEventListener('keydown', keydownHandler, false);