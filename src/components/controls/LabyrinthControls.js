/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 *
 * @author cms11 / i dont have a website
 */
 //import { Scene, Color, Box3, Vector3, Box3Helper, BoxGeometry, MeshNormalMaterial, Mesh } from 'three';

import {
	MathUtils,
	Spherical,
	Vector3,
	BoxGeometry,
	MeshNormalMaterial,
	Mesh
} from "../../../node_modules/three/build/three.module.js";

var EPS = 0.01;

var LabyrinthControls = function ( object, domElement, light ) {

	if ( domElement === undefined ) {

		console.warn( 'THREE.LabyrinthControls: The second parameter "domElement" is now mandatory.' );
		domElement = document;

	}

	this.object = object;
	this.domElement = domElement;

	// API

	this.enabled = true;

	this.movementSpeed = 1.0;
	this.lookSpeed = 0.005;

	this.lookVertical = true;
	this.autoForward = false;

	this.activeLook = true;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.heightMax = 1.0;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI;

	this.mouseDragOn = false;

	// internals

	this.autoSpeedFactor = 0.0;

	this.mouseX = 0;
	this.mouseY = 0;

	this.moveable = false;
	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

	this.scene = undefined;
	this.light = light;
	this.previous = this.object.position;
	this.didCollide = false;
	this.collideResultPosition = undefined;

	let box = new Mesh(new BoxGeometry(0.2, 0.2, 0.2), new MeshNormalMaterial({wireframe: true}));
    box.position.add(new Vector3(this.object.position.x, 0, this.object.position.z));
	this.box = box;
	// this.scene.add(this.box);

	// private variables

	var lat = 0;
	var lon = 0;

	var lookDirection = new Vector3();
	var spherical = new Spherical();
	var target = new Vector3();

	//

	if ( this.domElement !== document ) {

		this.domElement.setAttribute( 'tabindex', - 1 );

	}

	//

	this.handleResize = function () {

		if ( this.domElement === document ) {

			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;

		} else {

			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;

		}

	};

	this.onMouseDown = function ( event ) {

		if ( this.domElement !== document ) {

			this.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {

			switch ( event.button ) {

				case 0: this.moveForward = true; break;
				case 2: this.moveBackward = true; break;

			}

		}

		this.mouseDragOn = true;

	};

	this.onMouseUp = function ( event ) {

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {

			switch ( event.button ) {

				case 0: this.moveForward = false; break;
				case 2: this.moveBackward = false; break;

			}

		}

		this.mouseDragOn = false;

	};

	this.onMouseMove = function ( event ) {

		if (!this.moveable) {
			this.mouseX = 0;
			this.mouseY = 0;
			return;
		}

		if ( this.domElement === document ) {

			this.mouseX = event.pageX - this.viewHalfX;
			this.mouseY = event.pageY - this.viewHalfY;

		} else {

			this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

			// circle of radius stillRadius where motion is set to zero
			let stillRadius = 10;
			if (this.mouseX * this.mouseX + this.mouseY * this.mouseY < stillRadius*stillRadius) {
				this.mouseX = 0;
				this.mouseY = 0;
			}
		}

	};

	this.onKeyDown = function ( event ) {

		//event.preventDefault();

		switch ( event.keyCode ) {

			case 87: /*W*/ this.moveForward = true; break;
			case 65: /*A*/ this.moveLeft = true; break;
			case 83: /*S*/ this.moveBackward = true; break;
			case 68: /*D*/ this.moveRight = true; break;

			case 32: /*Space*/ this.moveUp = true; break;
			case 16: /*Shift*/ this.moveDown = true; break;

			case 38: /*up*/ this.mouseY = -400; break;
			case 37: /*left*/ this.mouseX = -400; break;
			case 40: /*down*/ this.mouseY = 400; break;
			case 39: /*right*/ this.mouseX = 400; break;

			//case 32: /*Space*/ this.moveable = !this.moveable; this.mouseX = 0; this.mouseY = 0; break;

		}

	};

	this.onKeyUp = function ( event ) {

		switch ( event.keyCode ) {

			case 87: /*W*/ this.moveForward = false; break;
			case 65: /*A*/ this.moveLeft = false; break;
			case 83: /*S*/ this.moveBackward = false; break;
			case 68: /*D*/ this.moveRight = false; break;

			case 32: /*Space*/ this.moveUp = false; break;
			case 16: /*Shift*/ this.moveDown = false; break;

			case 38: /*up*/ this.mouseY = 0; break;
			case 37: /*left*/ this.mouseX = 0; break;
			case 40: /*down*/ this.mouseY = 0; break;
			case 39: /*right*/ this.mouseX = 0; break;

		}

	};

	this.collisionCheck = function () {
		const { updateList } = this.scene.state;
		let maze;
		for (const obj of updateList) {
			if (obj.name == 'maze') {
				maze = obj;
				break;
			}
		}

		let buf = 0.25;

		// returns whether or not the point is in the bounding box
		function inWall(boundBox, point) {
			if (point.x > boundBox.min.x - buf && point.x < boundBox.max.x + buf &&
				point.y > boundBox.min.y - buf && point.y < boundBox.max.y + buf &&
				point.z > boundBox.min.z - buf && point.z < boundBox.max.z + buf) {
				// in wall!
				return true;
			}
			return false;
		}

		// returns the point on the surface of the bounding box closest to point
		function toSurface(boundBox, point) {
			let minDist;
			let dist;
			let closePair;
			for (let i = 0; i < 3; i++) {
				dist = Math.abs(point.getComponent(i) - boundBox.min.getComponent(i));
				if (dist < minDist || minDist == undefined) {
					closePair = [i, boundBox.min.getComponent(i) - buf];
					minDist = dist;
				}
				dist = Math.abs(point.getComponent(i) - boundBox.max.getComponent(i));
				if (dist < minDist) {
					closePair = [i, boundBox.max.getComponent(i) + buf];
					minDist = dist;
				}
			}
			let surfacePoint = point.clone();
			surfacePoint.setComponent(closePair[0], closePair[1]);
			return surfacePoint;
		}

		let didCollide = false;
		for (const wall of maze.children) {
			let prev = this.previous;
			let pos = this.object.position;
			let box = wall.geometry.boundingBox;
			let wallPos = wall.position;

			if (pos.distanceTo(wallPos) > 6)
				continue;

			if (inWall(box, prev)) {
				// move immediately to Surface
				this.collideResultPosition = toSurface(box, prev);
				return true; // didCollide
			}

			if (inWall(box, pos)) {
				this.collideResultPosition = toSurface(box, pos);
				return true;
			}

		}





		// let didCollide = false;
		// for ( const wall of maze.children ) {
		// 	if (wall.normal == undefined)
		// 		continue;

		// 	let halfWallThickness = 1.0;
		// 	let gridScale = 5 + EPS;

		// 	let prevVecMid = this.previous.clone().sub(wall.position);
		// 	let prevDotMid = wall.normal.dot(prevVecMid);
		// 	let wallSurface = wall.position.clone();

		// 	if (wall.normal.equals(new Vector3(1, 0, 0))) {
		// 		wallSurface.x += halfWallThickness * (prevDotMid / Math.abs(prevDotMid));

		// 		let posVec = this.object.position.clone().sub(wallSurface);
		// 		let posDot = wall.normal.dot(posVec);
		// 		let prevVec = this.previous.clone().sub(wallSurface);
		// 		let prevDot = wall.normal.dot(prevVec);

		// 		//if (posDot * prevDot <= 0 && this.object.position.z > wall.position.z - gridScale/2 && this.object.position.z < wall.position.z + gridScale/2) {
		// 		if (posDot * prevDot <= 0 && this.previous.y < 10 && this.previous.z > wall.position.z - gridScale/2 && this.previous.z < wall.position.z + gridScale/2) {
		// 			// collision detected
		// 			didCollide = true;
		// 			this.collideResultPosition = this.object.position.clone();
		// 			this.collideResultPosition.x = wallSurface.x - EPS * (posDot / Math.abs(posDot));
		// 			if (this.collideResultPosition.z < wall.position.z - gridScale/2 || this.collideResultPosition.z > wall.position.z + gridScale/2) {
		// 				console.log('oh no!');
		// 				//this.collideResultPosition = this.previous;
		// 			}
		// 			// if (this.collideResultPosition.z < wall.position.z - gridScale/2)
		// 			// 	this.collideResultPosition.z = wall.position.z - gridScale/2;
		// 			// if (this.collideResultPosition.z > wall.position.z + gridScale/2)
		// 			// 	this.collideResultPosition.z = wall.position.z + gridScale/2;
		// 		}
		// 	} else if (wall.normal.equals(new Vector3(0, 0, 1))) {
		// 		wallSurface.z += halfWallThickness * (prevDotMid / Math.abs(prevDotMid));

		// 		let posVec = this.object.position.clone().sub(wallSurface);
		// 		let posDot = wall.normal.dot(posVec);
		// 		let prevVec = this.previous.clone().sub(wallSurface);
		// 		let prevDot = wall.normal.dot(prevVec);

		// 		//if (posDot * prevDot <= 0 && this.object.position.x > wall.position.x - gridScale/2 && this.object.position.x < wall.position.x + gridScale/2) {
		// 		if (posDot * prevDot <= 0 && this.previous.y < 10 && this.previous.x > wall.position.x - gridScale/2 && this.previous.x < wall.position.x + gridScale/2) {
		// 			// collision detected
		// 			didCollide = true;
		// 			this.collideResultPosition = this.object.position.clone();
		// 			this.collideResultPosition.z = wallSurface.z - EPS * (posDot / Math.abs(posDot));
		// 			if (this.collideResultPosition.x < wall.position.x - gridScale/2 || this.collideResultPosition.x > wall.position.x + gridScale/2) {
		// 				console.log('oh no!');
		// 				//this.collideResultPosition = this.previous;
		// 			}
		// 			// if (this.collideResultPosition.x < wall.position.x - gridScale/2)
		// 			// 	this.collideResultPosition.x = wall.position.x - gridScale/2;
		// 			// if (this.collideResultPosition.x > wall.position.x + gridScale/2)
		// 			// 	this.collideResultPosition.x = wall.position.x + gridScale/2;
		// 		}
		// 	}
		// }
		// floor collision
		// if (this.object.position.y < 0) {
		// 	if (didCollide) {
		// 		this.collideResultPosition.y = 0;
		// 	} else {
		// 		didCollide = true;
		// 		this.collideResultPosition = this.object.position.clone();
		// 		this.collideResultPosition.y = 0;
		// 	}
		// }
		return didCollide;
	};

	this.lookAt = function ( x, y, z ) {

		if ( x.isVector3 ) {

			target.copy( x );

		} else {

			target.set( x, y, z );

		}

		this.object.lookAt( target );

		setOrientation( this );

		return this;

	};

let dbg = 0;
	this.update = function () {

		var targetPosition = new Vector3();

		return function update( delta ) {

			if ( this.enabled === false ) return;

			if ( this.heightSpeed ) {

				var y = MathUtils.clamp( this.object.position.y, this.heightMin, this.heightMax );
				var heightDelta = y - this.heightMin;

				this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

			} else {

				this.autoSpeedFactor = 0.0;

			}

			var actualMoveSpeed = delta * this.movementSpeed;

			// // for collision
			// if (!this.collisionCheck()) {
			// 	this.previous = this.object.position.clone();
			// 	if ( this.moveForward || ( this.autoForward && ! this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
			// 	if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

			// 	if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
			// 	if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

			// 	if ( this.moveUp ) this.object.translateY( 5 * actualMoveSpeed );
			// 	if ( this.moveDown ) this.object.translateY( - actualMoveSpeed * 5 );
			// } else {
			// 	//console.log('collided!');
			// 	this.object.position.copy(this.collideResultPosition);
			// }

			// rotate to flat before translation
			let ph = Math.PI / 2; // lat = 0
			let th = MathUtils.degToRad(lon);
			targetPosition.setFromSphericalCoords(1, ph, th).add(this.object.position);
			this.object.lookAt(targetPosition);

			// for collision
			//let prevPrev = this.previous.clone();
			this.previous = this.object.position.clone();
			if ( this.moveForward || ( this.autoForward && ! this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
			if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

			if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
			if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

			if ( this.moveUp ) this.object.translateY( 5 * actualMoveSpeed );
			if ( this.moveDown ) this.object.translateY( - actualMoveSpeed * 5 );

			if (this.collisionCheck()) {
				//console.log('collided!');
				//this.object.position.copy(this.previous);
				this.object.position.copy(this.collideResultPosition);
				//this.previous = prevPrev;
			}

			var actualLookSpeed = delta * this.lookSpeed;

			if ( ! this.activeLook ) {

				actualLookSpeed = 0;

			}

			var verticalLookRatio = 1;

			if ( this.constrainVertical ) {

				verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

			}

			lon -= this.mouseX * actualLookSpeed;
			if ( this.lookVertical ) lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

			lat = Math.max( - 85, Math.min( 85, lat ) );

			var phi = MathUtils.degToRad( 90 - lat );
			var theta = MathUtils.degToRad( lon );

			if ( this.constrainVertical ) {

				phi = MathUtils.mapLinear( phi, 0, Math.PI, this.verticalMin, this.verticalMax );

			}

			var position = this.object.position;
			
			targetPosition.setFromSphericalCoords( 1, phi, theta ).add( position );

			this.object.lookAt( targetPosition );
			
			//let oldPos = this.light.target.position;
			this.light.target.position.copy(targetPosition);//setFromSphericalCoords( 1, phi, theta ).add(oldPos);

			this.light.position.copy(this.object.position);

			// if (dbg == 0) {
			// 	console.log(this.light.target.position);
			// 	console.log(this.light.position);
			// 	console.log(targetPosition);
			// }
			// dbg++;

			//this.box.position.copy(this.object.position);
			this.box.position.copy(targetPosition);
			//this.box.posiiton.setFromSphericalCoords( 1, phi, theta );

		};

	}();

	function contextmenu( event ) {

		event.preventDefault();

	}

	this.dispose = function () {

		this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
		this.domElement.removeEventListener( 'mousedown', _onMouseDown, false );
		this.domElement.removeEventListener( 'mousemove', _onMouseMove, false );
		this.domElement.removeEventListener( 'mouseup', _onMouseUp, false );

		window.removeEventListener( 'keydown', _onKeyDown, false );
		window.removeEventListener( 'keyup', _onKeyUp, false );

	};

	var _onMouseMove = bind( this, this.onMouseMove );
	var _onMouseDown = bind( this, this.onMouseDown );
	var _onMouseUp = bind( this, this.onMouseUp );
	var _onKeyDown = bind( this, this.onKeyDown );
	var _onKeyUp = bind( this, this.onKeyUp );

	this.domElement.addEventListener( 'contextmenu', contextmenu, false );
	this.domElement.addEventListener( 'mousemove', _onMouseMove, false );
	this.domElement.addEventListener( 'mousedown', _onMouseDown, false );
	this.domElement.addEventListener( 'mouseup', _onMouseUp, false );

	window.addEventListener( 'keydown', _onKeyDown, false );
	window.addEventListener( 'keyup', _onKeyUp, false );

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	}

	function setOrientation( controls ) {

		var quaternion = controls.object.quaternion;

		lookDirection.set( 0, 0, - 1 ).applyQuaternion( quaternion );
		spherical.setFromVector3( lookDirection );

		lat = 90 - MathUtils.radToDeg( spherical.phi );
		lon = MathUtils.radToDeg( spherical.theta );

	}

	this.handleResize();

	setOrientation( this );

};

export default LabyrinthControls;
