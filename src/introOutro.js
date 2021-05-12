import { Vector3 } from 'three';

var titleHTML = "\
<span style='position: absolute; top: "+80+"px; left: "+55+"px; display: block;'>\
	<center><h1 id=title style='color: silver; font-size: 70px; opacity: 0;'>LABYRINTH</h1></center>\
	<center id=entertostart style='color: silver; position: relative; top: "+(-30)+"px; opacity: 0;'>Press Enter to Start</center>\
</span>\
";
var instructionsHTML = "\
<span id=pregame style='position: absolute; left: "+0+"px; top: "+0+"px; padding: 25px;\
height: "+300+"px; width: "+500+"px; background: linear-gradient(to bottom right, #d9d9d9, #737373); border-radius: 5px; display: block; opacity: 0.85;'>\
	<center><h1>LABYRINTH</h1></center>\
	<p><strong>Instructions:</strong> You will be placed in a random location of a multi-level maze. Your objective is to reach the goal hidden in the maze (tap <strong>S</strong> a few times for a view of the goal on this title screen).</p>\
	<p>Use the <strong>Up</strong>, <strong>Down</strong>, <strong>Left</strong>, and <strong>Right</strong> arrow keys to orient yourself, and use <strong>WASD</strong> to move around. Use <strong>Space</strong> to go up, and <strong>Shift</strong> to go down (try them out now). At any point in the game, press <strong>ESC</strong> to pause. Good luck!</p>\
	<span style='position: relative; top: "+(0*300/2-0)+"px;'>\
		<center style='position: relative; top: "+0+"px;'>Enter Difficulty (1-5)</center>\
		<center><input id=lvlInpPre value='' style='position: relative; top: "+10+"px;'></input><center>\
		<center id=entertostart style='position: relative; top: "+20+"px;'>Press Enter to Start</center>\
	</span>\
</span>\
";
var pausedHTML = "\
<span id=pregame style='position: absolute; left: "+0+"px; top: "+0+"px; padding: 25px;\
height: "+300+"px; width: "+500+"px; background: linear-gradient(to bottom right, #d9d9d9, #737373); border-radius: 5px; display: block; opacity: 0.85;'>\
	<center><h1>LABYRINTH</h1></center>\
	<p><strong>Instructions:</strong> You will be placed in a random location of a multi-level maze. Your objective is to reach the goal hidden in the maze.</p>\
	<p>Use the <strong>Up</strong>, <strong>Down</strong>, <strong>Left</strong>, and <strong>Right</strong> arrow keys to orient yourself, and use <strong>WASD</strong> to move around. Use <strong>Space</strong> to go up, and <strong>Shift</strong> to go down (try them out now). At any point in the game, press <strong>ESC</strong> to pause. Good luck!</p>\
	<span style='position: relative; top: "+(0*300/2-0)+"px;'>\
		<center style='position: relative; top: "+0+"px;'>Restart? Enter Difficulty (1-5)</center>\
		<center><input id=lvlInpPre value='' style='position: relative; top: "+10+"px;'></input><center>\
		<center id=entertostart style='position: relative; top: "+20+"px;'>Press Enter to Start, ESC to Resume, or Q to Quit</center>\
	</span>\
</span>\
";
var startingHTML = "\
<span id=start style='position: absolute; top: "+80+"px; left: "+55+"px; display: none; opacity: 1.0'>\
	<center><h1 style='color: silver; font-size: 70px;'>START!</h1></center>\
</span>\
";
var replayHTML = "\
<span id=endgame style='position: absolute; left: "+0+"px; top: "+0+"px; \
height: "+250+"px; width: "+400+"px; background: linear-gradient(to bottom right, #d9d9d9, #737373); border-radius: 5px; display: none; opacity: 0.85;'>\
	<span style='position: relative; top: "+0+"px;'>\
		<center style='position: relative; top: "+0+"px;'><h1 style='font-size: 40px;'>You won in <span id=finishtime></span>!</h1><p>Play again?</p></center>\
		<center style='position: relative; top: "+0+"px;'>Enter Difficulty (1-5)</center>\
		<center><input id=lvlInpEnd value='' style='position: relative; top: "+10+"px;'></input><center>\
		<center id=etsReplay style='position: relative; top: "+20+"px;'><strong>Press Enter to Start</strong></center>\
	</span>\
</span>\
";
var timedistHTML = "\
<span id=timedist style='position: absolute; top: "+80+"px; left: "+55+"px; display: none;'>\
	<h1 style='color: silver; font-size: 30px;'>Time:&nbsp<span id=time></span></h1>\
	<h1 style='color: silver; font-size: 30px; position: relative; top: "+(-25)+"px;'>Distance:&nbsp<span id=dist></span></h1>\
</span>\
";

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

	let intro = "<span id=intro style='position: absolute; display: block;'></span>";
	elem.innerHTML = intro;
	document.body.appendChild(elem);
	document.getElementById('intro').innerHTML = titleHTML;
}

// pregame prompt. Shows between games. Congratulates and prompts user to play again.
const endgamePromptHTML = () => {
	let elem = document.createElement("SPAN");
	let w = 500;
	let h = 300;
	let x = window.innerWidth / 2 - w / 2;
	let y = window.innerHeight / 2 - h / 2;
	elem.innerHTML = replayHTML;
	document.body.appendChild(elem);
}

// shows "START!" once the round starts
const startHTML = () => {
	let elem = document.createElement("SPAN");
	elem.innerHTML = startingHTML;
	document.body.appendChild(elem);
}

const timeAndDistHTML = () => {
	let elem = document.createElement("SPAN");
	elem.innerHTML = timedistHTML;
	document.body.appendChild(elem);
}

function handleResizeHTML() {
	let w = 500 + 50;
	let h = 300 + 50;
	let x = window.innerWidth / 2 - w / 2;
	let y = window.innerHeight / 2 - h / 2;
	let pre = document.getElementById('intro'); // used to be pregame
	pre.style.left = x + 'px';
	pre.style.top = y + 'px';
	let str = document.getElementById('start');
	str.style.left = window.innerWidth / 2 - 125 + 'px';
	str.style.top = window.innerHeight / 2 - 95 + 'px';
	w = 400;
	h = 250;
	x = window.innerWidth / 2 - w / 2;
	y = window.innerHeight / 2 - h / 2;
	let end = document.getElementById('endgame');
	end.style.left = x + 'px';
	end.style.top = y + 'px';
	let td = document.getElementById('timedist');
	td.style.left = (window.innerWidth - 220) + 'px';
	td.style.top = '0px';
}

function showPregamePrompt() {
	document.getElementById("intro").innerHTML = instructionsHTML;
	//document.getElementById("lvlInpPre").focus();
	document.getElementById("lvlInpPre").value = '';
}

function hidePregamePrompt() {
	document.getElementById("intro").innerHTML = instructionsHTML; //document.getElementById("intro").innerHTML.replace(' or Q to Quit', '');
	document.getElementById("intro").style.display = 'none';
}

function showPause() {
	// document.getElementById("intro").innerHTML = document.getElementById("intro").innerHTML.replace(' (tap <strong>S</strong> a few times for a view of the goal on this title screen)', '');
	// document.getElementById("intro").innerHTML = document.getElementById("intro").innerHTML.replace('Press Enter to Start', 'Press Enter to Start or Q to Quit');
	document.getElementById("intro").innerHTML = pausedHTML;
	document.getElementById("intro").style.display = 'block';
	document.getElementById("lvlInpPre").focus();
	document.getElementById("lvlInpPre").value = '';
}

function hidePause() {
	document.getElementById("intro").innerHTML = instructionsHTML;//document.getElementById("intro").innerHTML.replace(' or Q to Quit', '');
	document.getElementById("intro").style.display = 'none';
}

const showEndgamePrompt = () => {
	document.getElementById("endgame").style.display = 'block';
	document.getElementById("lvlInpEnd").focus();
	document.getElementById("lvlInpEnd").value = '';
}

const hideEndgamePrompt = () => {
	document.getElementById("endgame").style.display = 'none';
}

const showStart = () => {
	document.getElementById("start").style.opacity = 1.0;
	document.getElementById("start").style.display = 'block';
}

const hideStart = () => {
	document.getElementById("start").style.display = 'none';
}

function showTimeAndDist() {
	document.getElementById("timedist").style.display = 'block';
}

function hideTimeAndDist() {
	document.getElementById("timedist").style.display = 'none';
}

function verifyInp(inp) {
	console.log(parseInt(inp));
	let num = parseInt(inp);
	console.log(num);
	console.log(Number.isInteger(num) && num >= 0 && num <= 5);
	return Number.isInteger(num) && num >= 0 && num <= 5;
}

function toTitleScreen(scene, controls) {
	scene.dimensions = 0;
	hidePause();
	hideEndgamePrompt();
	resetScene(scene, 0, controls);
	hideTimeAndDist();
	document.getElementById("intro").style.display = 'block';
	document.getElementById("intro").innerHTML = titleHTML;
	renderedTitle = false;
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
	if (!verifyInp(inp))
		return 0;
	let dimensions = parseInt(inp) + 1;
	hidePregamePrompt();
	resetScene(scene, dimensions, controls);
	startTime = undefined;
	return 1;
}

function playAgain(scene, controls) {
	let inp = document.getElementById("lvlInpEnd").value;
	if (!verifyInp(inp))
		return 0;
	let dimensions = parseInt(inp) + 1;
	hideEndgamePrompt();
	resetScene(scene, dimensions, controls);
	startTime = undefined;
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
    showStart();
    showTimeAndDist();
}

function fixToLen(num, l) {
	let newNum = '' + num;
	let len = newNum.length;
	if (len < l) {
		if (!newNum.includes('.')) {
			newNum += '.';
			len++;
		}
		for (let i = 0; i < l - len; i++) {
			newNum += '0';
		}
	} else {
		newNum = newNum.substring(0, l);
	}
	return newNum;
}

function frontPad(num, l) {
	let newNum = '' + num;
	let len = l - newNum.length;
	if (len < l) {
		for (let i = 0; i < len; i++) {
			newNum = '0' + newNum;
		}
	}
	return newNum;
}

function backPad(num, l) {
	let newNum = '' + num;
	let len = l - newNum.length;
	if (len < l) {
		for (let i = 0; i < len; i++) {
			newNum = newNum + '0';
		}
	}
	return newNum;
}

var startTime = undefined;
function timeToString(time) {
	// let minutes = time.substring(0, time.indexOf(':'));
	// let seconds = time.substring(time.indexOf(':') + 1, time.indexOf('.'));
	// let milliseconds = time.substring(time.indexOf('.') + 1);
	// let newTime = minutes * 60 + seconds + milliseconds / 1000;
	//console.log(time);
	let totTime = (time - startTime);
	let seconds = Math.floor(totTime / 1000) % 60;
	let minutes = (Math.floor(totTime / 1000) - seconds) / 60;
	//console.log('millis:', totTime / 1000 - Math.floor(totTime / 1000));
	let milliseconds = '' + Math.floor((totTime / 1000 - Math.floor(totTime / 1000)) * 1000);
	return minutes + ':' + frontPad(seconds, 2) + '.' + backPad(milliseconds.substring(0, 4), 3);
}

var renderedTitle = false;
function animateHTML(timeStamp, gameState, dist) {
	// sumn
	if (gameState == 'intro' || gameState == 'paused') {
		let opac = 0.4 * Math.sin(timeStamp / 500) + 0.6;
		document.getElementById('entertostart').style.opacity = opac;
	}
	if (gameState == 'title') {
		let titleOpac = parseFloat(document.getElementById('title').style.opacity);
		if (titleOpac < 1) {
			titleOpac += 0.002;
			document.getElementById('title').style.opacity = titleOpac;
		}
		if (titleOpac > 0.55) {
			let opac = 0.45 * Math.sin(timeStamp / 500) + 0.55;
			if (opac < 0.11 || renderedTitle) {
				document.getElementById('entertostart').style.opacity = opac;
				renderedTitle = true;
			}
		}
	}
	if (gameState == 'playing') {
		let opac = parseFloat(document.getElementById('start').style.opacity);
		if (opac > 0.0) {
			document.getElementById('start').style.opacity = opac - 0.01;
		} else {
			document.getElementById('start').style.display = 'none';
		}
		// update time & dist
		//let time = timeToSeconds(document.getElementById('time').innerHTML);
		if (startTime == undefined)
			startTime = timeStamp;
		document.getElementById('time').innerHTML = timeToString(timeStamp);
		document.getElementById('dist').innerHTML = fixToLen(dist, 5);
	} else {
		document.getElementById('start').style.display = 'none';
	}
	if (gameState == 'outro') {
		let opac = 0.4 * Math.sin(timeStamp / 500) + 0.6;
		document.getElementById('etsReplay').style.opacity = opac;
		document.getElementById('finishtime').innerHTML = document.getElementById('time').innerHTML;
		document.getElementById('dist').innerHTML = '0.000';
	}
}

export { getChildNamed, pregamePromptHTML, endgamePromptHTML, startHTML, timeAndDistHTML, handleResizeHTML, showPregamePrompt, hidePregamePrompt, toTitleScreen, showPause, hidePause, showEndgamePrompt, hideEndgamePrompt, setUpPlayer, beginPlaying, playAgain, resetScene, animateHTML };
