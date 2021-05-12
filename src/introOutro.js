import { Vector3 } from 'three';

function getChildNamed(parent, name) {
	for (const child of parent.children) {
		if (child.name == name) {
			return child;
		}
	}
}

// pregame prompt. Shows once per page load. Has intro + instructions. Initializes as hidden
const pregamePromptHTML = () => {
	let elem = document.createElement("SPAN");
	let w = 500;
	let h = 300;
	let x = window.innerWidth / 2 - w / 2;
	let y = window.innerHeight / 2 - h / 2;
	elem.innerHTML = "\
	<span id=pregame style='position: absolute; left: "+x+"px; top: "+y+"px; padding: 25px;\
	height: "+h+"px; width: "+w+"px; background: blue; border-radius: 10px; display: none;'>\
		<center><h1>LABYRINTH</h1></center>\
		<center><p>Instructions: You will be placed in a random location of a maze. Your objective is to reach the goal to make it to safety.</p>\
		<p>Use the <strong>Up</strong>, <strong>Down</strong>, <strong>Left</strong>, and <strong>Right</strong> arrow keys to orient yourself, and use <strong>WASD</strong> to move around. Use <strong>Space</strong> to go up, and <strong>Shift</strong> to go down. At any point in the game, press <strong>ESC</strong> to pause. Good luck!</p></center>\
		<span style='position: relative; top: "+(0*h/2-0)+"px;'>\
			<center style='position: relative; top: "+0+"px;'>Enter Difficulty (1-5)</center>\
			<center><input id=lvlInpPre value='' style='position: relative; top: "+10+"px;'></input><center>\
			<center id=entertostart style='position: relative; top: "+20+"px;'>Press Enter to Start</center>\
		</span>\
	</span>\
	";
	document.body.appendChild(elem);
}

// pregame prompt. Shows between games. Congratulates and prompts user to play again.
const endgamePromptHTML = () => {
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
			<center style='position: relative; top: "+20+"px;'><strong>Press Enter to Start</strong></center>\
		</span>\
	</span>\
	";
	document.body.appendChild(elem);
}

function handleResizeHTML() {
	let w = 500 + 50;
	let h = 300 + 50;
	let x = window.innerWidth / 2 - w / 2;
	let y = window.innerHeight / 2 - h / 2;
	let pre = document.getElementById('pregame');
	pre.style.left = x + 'px';
	pre.style.top = y + 'px';
	w = 500;
	h = 300;
	x = window.innerWidth / 2 - w / 2;
	y = window.innerHeight / 2 - h / 2;
	let end = document.getElementById('endgame');
	end.style.left = x + 'px';
	end.style.top = y + 'px';
}

function showPregamePrompt() {
	document.getElementById("pregame").style.display = 'block';
}

function hidePregamePrompt() {
	document.getElementById("pregame").style.display = 'none';
}

const showEndgamePrompt = () => {
	document.getElementById("endgame").style.display = 'block';
}

const hideEndgamePrompt = () => {
	document.getElementById("endgame").style.display = 'none';
}

// Set up camera
function setUpPlayer(controls) {
	let scene = controls.scene;
	let camera = controls.object;
	let spotLight = controls.light;
	let scale = scene.mazeScale;
	let dimensions = scene.dimensions;
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

function beginPlaying(scene, controls) {
	let inp = document.getElementById("lvlInpPre").value;
	if (inp == '')
		return 0;
	let dimensions = parseInt(inp) + 1;
	hidePregamePrompt();
	resetScene(scene, dimensions, controls);
	return 1;
}

function playAgain(scene, controls) {
	let inp = document.getElementById("lvlInpEnd").value;
	if (inp == '')
		return 0;
	let dimensions = parseInt(inp) + 1;
	hideEndgamePrompt();
	resetScene(scene, dimensions, controls);
	return 1;
}

function resetScene(scene, dimensions, controls) {
	let scale = scene.mazeScale;
	let maze = getChildNamed(scene, 'maze');
	scene.dimensions = dimensions;
	maze.children = [];
	maze.maxDist = Math.sqrt(2*(dimensions*scale)*(dimensions*scale));
    maze.buildRandomMaze(dimensions, scale);

    let x = Math.floor(Math.random() * dimensions) * scale - scale/2;
    let y = Math.floor(Math.random() * dimensions) * scale;
    let z = Math.floor(Math.random() * dimensions) * scale - scale/2;
    let endGoal = getChildNamed(scene, 'endgoal');
    endGoal.position.set(x, y, z);
    setUpPlayer(controls);
    scene.destinationLoc.copy(endGoal.position);
}

function animateHTML(timeStamp) {
	// sumn
	let opac = 0.4 * Math.sin(timeStamp / 500) + 0.6;
	document.getElementById('entertostart').style.opacity = '' + opac;
}

export { getChildNamed, pregamePromptHTML, endgamePromptHTML, handleResizeHTML, showPregamePrompt, hidePregamePrompt, showEndgamePrompt, hideEndgamePrompt, setUpPlayer, beginPlaying, playAgain, resetScene, animateHTML };
