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

	this.movementSpeed = 5.0;//1.0;
	this.lookSpeed = 0.4;//0.005;

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

	// let box = new Mesh(new BoxGeometry(0.2, 0.2, 0.2), new MeshNormalMaterial({wireframe: true}));
 //    box.position.add(new Vector3(this.object.position.x, 0, this.object.position.z));
	// this.box = box;
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

	this.collisionCheck = function (prev, pos) {
		const { updateList } = this.scene.state;
		let maze;
		for (const obj of updateList) {
			if (obj.name == 'maze') {
				maze = obj;
				break;
			}
		}

		let buf = 0.5;

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
					closePair = [i, boundBox.min.getComponent(i) - buf - 0.01];
					minDist = dist;
				}
				dist = Math.abs(point.getComponent(i) - boundBox.max.getComponent(i));
				if (dist < minDist) {
					closePair = [i, boundBox.max.getComponent(i) + buf + 0.01];
					minDist = dist;
				}
			}
			let surfacePoint = point.clone();
			surfacePoint.setComponent(closePair[0], closePair[1]);
			return surfacePoint;
		}

		// returns the point on the surface of the bounding box closest to point
		function toSurfaceNotEdge(boundBox, point) {
			let min = boundBox.max.getComponent(2) - boundBox.min.getComponent(2);
			let minDim = 2;
			for (let i = 0; i < 2; i++) {
				let nmin = boundBox.max.getComponent(i) - boundBox.min.getComponent(i);
				if (nmin < min) {
					min = nmin;
					minDim = i;
				}
			}
			let minDist;
			let closePair;
			// only can test in minDim dimension
			let i = minDim;
			let dist = Math.abs(point.getComponent(i) - boundBox.min.getComponent(i));
			if (dist < minDist || minDist == undefined) {
				closePair = [i, boundBox.min.getComponent(i) - buf - 0.01];
				minDist = dist;
			}
			dist = Math.abs(point.getComponent(i) - boundBox.max.getComponent(i));
			if (dist < minDist) {
				closePair = [i, boundBox.max.getComponent(i) + buf + 0.01];
				minDist = dist;
			}
			let surfacePoint = point.clone();
			surfacePoint.setComponent(closePair[0], closePair[1]);
			return surfacePoint;
		}

		let didCollide = 0;
		this.collideResultPosition = [];
		for (const wall of maze.children) {
			//let prev = this.previous;
			//let pos = this.object.position;
			let box = wall.geometry.boundingBox;
			let wallPos = wall.position;

			if (pos.distanceTo(wallPos) > 6) // arbitrary cuttoff
				continue;

			if (inWall(box, prev)) {
				// move immediately to Surface
				this.collideResultPosition = [toSurface(box, prev)];
				console.log('moved immediately to surface');
				return 1; // didCollide
			}

			if (inWall(box, pos)) {
				this.collideResultPosition.push(toSurfaceNotEdge(box, pos));
				didCollide++;
			}

		}

		if (didCollide > 1) {
			//console.log('again!', didCollide);
			let p1 = this.collideResultPosition[0].clone();
			let p2 = this.collideResultPosition[1].clone();
			let p3;
			if (didCollide > 2)
				p3 = this.collideResultPosition[2].clone();
			let try1 = this.collisionCheck(prev, p1);
			if (try1 < 1) {
				this.collideResultPosition = [p1];
				return 1;
			}
			//console.log('try2?');
			let try2 = this.collisionCheck(prev, p2);
			if (try2 < 1) {
				this.collideResultPosition = [p2];
				return 1;
			}
			if (didCollide > 2) {
				//console.log('try3???');
				let try3 = this.collisionCheck(prev, p3);
				if (try3 < 1) {
					this.collideResultPosition = [p3];
					return 1;
				}
			}
			//console.log('oh well');
			return try1;
		}

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

			// rotate to flat before translation
			let ph = Math.PI / 2; // lat = 0
			let th = MathUtils.degToRad(lon);
			targetPosition.setFromSphericalCoords(1, ph, th).add(this.object.position);
			this.object.lookAt(targetPosition);

			// for collision
			this.previous = this.object.position.clone();
			if ( this.moveForward || ( this.autoForward && ! this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
			if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

			if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
			if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

			if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
			if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

			let collisions = this.collisionCheck(this.previous, this.object.position);
			if (collisions > 0) {
				this.object.position.copy(this.collideResultPosition[0]);
			} else if (collisions > 1) {
				this.object.position.copy(this.previous);
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
			
			this.light.target.position.copy(targetPosition);
			this.light.position.copy(this.object.position);
			//this.box.position.copy(targetPosition);

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
