var gl;
var canvas;

// ============================================================================
// Projection and modelview related data structures and functions
// ============================================================================
// Projection transformation parameters
var	theFovy = 45.0;  		// Field-of-view in Y direction angle (in degrees)
var theAspect = 1.0;       // Viewport aspect ratio
var theZNear = 0.1;
var theZFar = 10000.0;

// Rotation parameters
var theAngle = 0.0;
var theAxis = [];

var theTrackingMove = false;
var theScalingMove = false;

var	theLastPos = [];
var	theCurtX, theCurtY;
var	theStartX, theStartY;
var	theCurtQuat = [1, 0, 0, 0];
var	theScale = 1.0;
var theInit = true;

var date = -3543.0;

var lightPosition = vec4(0.0, 0.0, 0.0, 1.0 );
var ka = 0.3;
var kd = 0.7;
var ks = 0.5;
var shininess = 100.0;

// SCALES
var SUN_SCALE = 5e-6;
var PLANET_SCALE = 1e-4;
var DIST_SCALE = 2e-7;
var SAT_DIST_SCALE = 5e-6;

var theSystemObjects;
var ScaleOptions = function() {
	this.scaleMode = 'best';
	this.sunScale = 5e-6;
	this.planetScale = 1e-4;
	this.distanceScale = 2e-7;
	this.satelliteScale = 5e-6;

	this.changeScales = function() {
		switch(this.scaleMode) {
			case "best":
				SUN_SCALE = 5e-6;
				PLANET_SCALE = 1e-4;
				DIST_SCALE = 2e-7;
				SAT_DIST_SCALE = 5e-6;
				break;
			case "real":
				SUN_SCALE = 1;
				PLANET_SCALE = 1;
				DIST_SCALE = 1;
				SAT_DIST_SCALE = 1;
				break;
			case "close orbits":
				DIST_SCALE = 1e-7;
				SAT_DIST_SCALE = 2.5*1e-6;
				break;
			case "huge planets":
				PLANET_SCALE = 2e-4;
				SAT_DIST_SCALE = 1e-5;
				break;
			case "huge Sun":
				SUN_SCALE = 1e-5;
				break;
		}
	}

	this.setSunScale = function() {
		SUN_SCALE = this.sunScale;
	}

	this.setPlanetScale = function() {
		PLANET_SCALE = this.planetScale;
	}

	this.setDistanceScale = function() {
		DIST_SCALE = this.distanceScale;
	}

	this.setSatelliteScale = function() {
		SAT_DIST_SCALE = this.satelliteScale;
	}

}
// END SCALES

var CANVAS_SIZE_X = 2048;
var CANVAS_SIZE_Y = 1024;

// Rotation related functions
function trackball_ptov(x, y,  v)
{
    var d, a;

	/*
	 * project x,y onto a hemisphere centered within width, height, note z is up
	 * here
	 */
    v[0] = x;
    v[1] = y;    
    d = v[0] * v[0] + v[1] * v[1];
	if (d > 1) {
		v[2] = 0.0;
	} else {
		v[2] = Math.sqrt(1.0 - d);
	}

	a = 1.0 / Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    v[0] *= a;    
	v[1] *= a;    
	v[2] *= a;
}

function trackball_vtoq(angle, axis)
{
	var c = Math.cos(angle/2.0);
	var s = Math.sin(angle/2.0);
	var a = 1.0 / Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2]);
    
	var quat = [];
	
	quat[0] = c;
	quat[1] = axis[0] * a * s;
	quat[2] = axis[1] * a * s;
	quat[3] = axis[2] * a * s;
	
	return quat;
}

function multiplyQuat(a, b)
{
	var quat = [];
	
	quat[0] = a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3];
	quat[1] = a[0] * b[1] + b[0] * a[1] + a[2] * b[3] - b[2] * a[3];
	quat[2] = a[0] * b[2] - a[1] * b[3] + b[0] * a[2] + b[1] * a[3];
	quat[3] = a[0] * b[3] + a[1] * b[2] - b[1] * a[2] + b[0] * a[3];
	
	return quat;
}

function buildRotationMatrix(q)
{
	var m = mat4(1-2*q[2]*q[2]-2*q[3]*q[3], 2*q[1]*q[2]+2*q[0]*q[3],   2*q[1]*q[3]-2*q[0]*q[2],   0,
				2*q[1]*q[2]-2*q[0]*q[3],   1-2*q[1]*q[1]-2*q[3]*q[3], 2*q[2]*q[3]+2*q[0]*q[1],   0,
				2*q[1]*q[3]+2*q[0]*q[2],   2*q[2]*q[3]-2*q[0]*q[1],   1-2*q[1]*q[1]-2*q[2]*q[2], 0,
				0,                         0,                         0,                         1);
   
   m = transpose(m);
   
   return m;
}

function invq(a)
{	
	return( scalev( 1.0/dot(a, a) , vec4(a[0], negate(a.slice(1,4)))) );
}

function getMousePos(e, canvas)
{
	var event = e || window.event;
	var client_x_r = event.clientX - canvas.offsetLeft;
	var client_y_r = event.clientY - canvas.offsetTop;
	var clip_x = -1 + 2 * client_x_r / canvas.width;
	var clip_y = -1 + 2 * (canvas.height - client_y_r) / canvas.height;
	var t = vec2(clip_x, clip_y);
	
	return t;
}

function startMotion(x, y)
{
	theTrackingMove = true;
	theStartX = x;
	theStartY = y;
	theCurtX = x;
	theCurtY = y;
	trackball_ptov(x, y, theLastPos);
}


function stopMotion(x, y)
{
    theTrackingMove = false;
	
	/* check if position has changed */
    if (theStartX == x && theStartY == y) {
	     theAngle = 0.0;
    }
}

function startScale(x, y)
{
	theScalingMove = true;
	theCurtX = x;
	theCurtY = y;
}

function stopScale(x, y)
{
    theScalingMove = false;
}

// ============================================================================
// Cube related data structures and functions
// ============================================================================
var theCubeVBOPoints;
var theCubeProgram;
var theWireCubePoints = [];

var theCubeVertices = [
        vec4( -1.0, -1.0,  1.0, 1.0 ),
        vec4( -1.0,  1.0,  1.0, 1.0 ),
        vec4(  1.0,  1.0,  1.0, 1.0 ),
        vec4(  1.0, -1.0,  1.0, 1.0 ),
        vec4( -1.0, -1.0, -1.0, 1.0 ),
        vec4( -1.0,  1.0, -1.0, 1.0 ),
        vec4(  1.0,  1.0, -1.0, 1.0 ),
        vec4(  1.0, -1.0, -1.0, 1.0 )
    ];

function wireQuad(a, b, c, d) 
{
     theWireCubePoints.push(theCubeVertices[a]); 
     theWireCubePoints.push(theCubeVertices[b]); 
     theWireCubePoints.push(theCubeVertices[c]); 
     theWireCubePoints.push(theCubeVertices[d]);
}

function wireCube()
{
    wireQuad( 1, 0, 3, 2 );
    wireQuad( 2, 3, 7, 6 );
    wireQuad( 3, 0, 4, 7 );
    wireQuad( 6, 5, 1, 2 );
    wireQuad( 4, 5, 6, 7 );
    wireQuad( 5, 4, 0, 1 );
}

function initCube()
{
    // initialize the cube
    wireCube();
	
	// Load shaders and initialize attribute buffers
    theCubeProgram = initShaders(gl, "cube-vertex-shader", "cube-fragment-shader");
    gl.useProgram(theCubeProgram);
    
    // Create VBOs and load the data into the VBOs
    theCubeVBOPoints = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, theCubeVBOPoints);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(theWireCubePoints), gl.STATIC_DRAW);   
}

function drawCube(p, mv) 
{
    gl.useProgram(theCubeProgram);
	
	gl.uniformMatrix4fv( gl.getUniformLocation(theCubeProgram, "projectionMatrix"),
		false, flatten(p));
	   
	gl.uniformMatrix4fv( gl.getUniformLocation(theCubeProgram, "modelViewMatrix"), 
		false, flatten(mv));   
  
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(theCubeProgram, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, theCubeVBOPoints);      
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
	for (var i = 0; i < 6; i++) {
		gl.drawArrays(gl.LINE_LOOP, i * 4, 4);
	}
}
	
// ============================================================================
// Sphere related data structures and functions
// ============================================================================
var theSphereVBOPoints;
var theSphereProgram;
var theSpherePoints = [];

var theSphereVertices = [
                         vec4( 0.0,  0.0,  0.0, 1.0 ),
                         vec4( 1.0,  0.0,  0.0, 1.0 ),
                         vec4( 2.0,  0.0,  0.0, 1.0 ),
                         vec4( 3.0,  0.0,  0.0, 1.0 )
                   ];

function sphereQuad(a, b, c, d) 
{

	theSpherePoints.push(theSphereVertices[a]); 
	theSpherePoints.push(theSphereVertices[b]); 
    theSpherePoints.push(theSphereVertices[c]); 
    theSpherePoints.push(theSphereVertices[d]);
}

function initSphere()
{
    // initialize the cube
	sphereQuad(0, 1, 2, 3);
	
	// Load shaders and initialize attribute buffers
	theSphereProgram = initShaders(gl, "sphere-vertex-shader", "sphere-fragment-shader");
    gl.useProgram(theSphereProgram);
    
    // Create VBOs and load the data into the VBOs
    theSphereVBOPoints = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, theSphereVBOPoints);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(theSpherePoints), gl.STATIC_DRAW);
}

function drawSphere(p, mv, invMV, center, radius, luminous, colorCode) 
{
    gl.useProgram(theSphereProgram);
	
	gl.uniformMatrix4fv( gl.getUniformLocation(theSphereProgram, "projectionMatrix"),false, flatten(p));
	 
	gl.uniformMatrix4fv( gl.getUniformLocation(theSphereProgram, "modelViewMatrix"),false, flatten(mv));

    gl.uniformMatrix4fv( gl.getUniformLocation(theSphereProgram, "invMV"),false, flatten(invMV));
    
	if(colorCode){
		var code = colorCode/256.0;
		gl.uniform1f( gl.getUniformLocation(theSphereProgram, "colorCode"), code);
	} else {
		gl.uniform1f( gl.getUniformLocation(theSphereProgram, "colorCode"), 0.0);
	}
	
	if(luminous){
		gl.uniform1f( gl.getUniformLocation(theSphereProgram, "ka"), 0.9);
	} else {
		gl.uniform1f( gl.getUniformLocation(theSphereProgram, "ka"), ka);
	}
	
    gl.uniform1f( gl.getUniformLocation(theSphereProgram, "kd"), kd);
    
	gl.uniform1f( gl.getUniformLocation(theSphereProgram, "ks"), ks);
    
	gl.uniform4fv( gl.getUniformLocation(theSphereProgram, "lightPosition"),flatten(lightPosition) );
    
	gl.uniform1f( gl.getUniformLocation(theSphereProgram, "shininess"), shininess );
	
	gl.uniform4fv( gl.getUniformLocation(theSphereProgram, "center"), flatten(center));
	gl.uniform1f( gl.getUniformLocation(theSphereProgram, "radius"), radius );
	
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(theSphereProgram, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, theSphereVBOPoints);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    usePlanetTexture(theSphereProgram);
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

// ============================================================================
// WebGL Initialization
// ============================================================================
var theOrbits;

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { 
        alert( "WebGL isn't available" ); 
    }
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.getExtension("EXT_frag_depth");
	
    // Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.0, 0.0, 0.0, 1.0 );	
	theAspect = canvas.width * 1.0 / canvas.height;

	// init frame buffer
	loadPlanetTexture();
    //initTextures();
	initFrameBuffer();
	theOrbits = new Orbit();	// already call the init
	initGUI();
    initSkyboxTextures();
    initSkybox();
	initCube();
	initSphere();
	
    render();
    
    canvas.addEventListener("mousedown", function(e){
 		var pos = getMousePos(e, this);
		var x = pos[0];
		var y = pos[1];
		
		if (e.button == 0) { 
			startMotion(x, y);
			getPlanet(x, y);
		} else if (e.button == 1) {
			startScale(x, y);
		}
    } );
    
    canvas.addEventListener("mousemove", function(e){
		var pos = getMousePos(e, this);   
		var x = pos[0];
		var y = pos[1];
		
		var curPos = [];
		var dx, dy, dz;

		/* compute position on hemisphere */
		trackball_ptov(x, y, curPos);
		
		if(theTrackingMove && !theMovement.trackingPlanet)
		{    
			/*
			 * compute the change in position on the hemisphere
			 */
			dx = curPos[0] - theLastPos[0];
			dy = curPos[1] - theLastPos[1];
			dz = curPos[2] - theLastPos[2];

			if (dx || dy || dz) 
			{
				/* compute theta and cross product */
				theAngle = 90.0 * Math.sqrt(dx*dx + dy*dy + dz*dz) / 180.0 * Math.PI;
				theAxis = cross(theLastPos, curPos);
                var mouseDelta = vec2(dx, dy);

                /* update rotation quaternions */
				updateRQuat(theAngle, theAxis, mouseDelta);  

				rotateCamera();

				/* update position */
				theLastPos[0] = curPos[0];
				theLastPos[1] = curPos[1];
				theLastPos[2] = curPos[2];
			}
			
		} 

    });
   
    canvas.addEventListener("mouseup", function(e) {
		var pos = getMousePos(e, this);
		var x = pos[0];
		var y = pos[1];
		
		if (e.button == 0) { 
			stopMotion(x, y);
		} else if (e.button == 1) {
			stopScale(x, y);
		}
    });
    
    canvas.addEventListener("mouseout", function(e) {
        stopMotion(0, 0);
        stopScale(0, 0);
    } );

    document.addEventListener("keydown", function(e) {
        var event = e || window.event;
        var key = event.keyCode;
        var moved = false;

        keyDown(key);
    } );

    document.addEventListener("keyup", function(e) {
        var event = e || window.event;
        var key = event.keyCode;
        var moved = false;

        keyUp(key);
    } );
    
    canvas.addEventListener("contextmenu", function(e) {return false;});
};

function inverseMatrix(mat) {
	dest = mat4();
	
    var a11 = mat[0][0], a12 = mat[0][1], a13 = mat[0][2], a14 = mat[0][3];
    var a21 = mat[1][0], a22 = mat[1][1], a23 = mat[1][2], a24 = mat[1][3];
    var a31 = mat[2][0], a32 = mat[2][1], a33 = mat[2][2], a34 = mat[2][3];
    var a41 = mat[3][0], a42 = mat[3][1], a43 = mat[3][2], a44 = mat[3][3];

    var d = a11*a22*a33*a44 + a11*a23*a34*a42 + a11*a24*a32*a43;
    d    += a12*a21*a34*a43 + a12*a23*a31*a44 + a12*a24*a33*a41;
    d    += a13*a21*a32*a44 + a13*a22*a34*a41 + a13*a24*a31*a42;
    d    += a14*a21*a33*a42 + a14*a22*a31*a43 + a14*a23*a32*a41;
    d    -= a11*a22*a34*a43 + a11*a23*a32*a44 + a11*a24*a33*a42;
    d    -= a12*a21*a33*a44 + a12*a23*a34*a41 + a12*a24*a31*a43;
    d    -= a13*a21*a34*a42 + a13*a22*a31*a44 + a13*a24*a32*a41;
    d    -= a14*a21*a32*a43 + a14*a22*a33*a41 + a14*a23*a31*a42;
	
	if (d == 0.0) { return console.log("no inverse"); null; }
	var id = 1/d;
	
	
	dest[0][0] = id*(a22*a33*a44 + a23*a34*a42 + a24*a32*a43 - a22*a34*a43 - a23*a32*a44 - a24*a33*a42);
	dest[0][1] = id*(a12*a34*a43 + a13*a32*a44 + a14*a33*a42 - a12*a33*a44 - a13*a34*a42 - a14*a32*a43);
	dest[0][2] = id*(a12*a23*a44 + a13*a24*a42 + a14*a22*a43 - a12*a24*a43 - a13*a22*a44 - a14*a23*a42);
	dest[0][3] = id*(a12*a24*a33 + a13*a22*a34 + a14*a23*a32 - a12*a23*a34 - a13*a24*a32 - a14*a22*a33);

	dest[1][0] = id*(a21*a34*a43 + a23*a31*a44 + a24*a33*a41 - a21*a33*a44 - a23*a34*a41 - a24*a31*a43);
	dest[1][1] = id*(a11*a33*a44 + a13*a34*a41 + a14*a31*a43 - a11*a34*a43 - a13*a31*a44 - a14*a33*a41);
	dest[1][2] = id*(a11*a24*a43 + a13*a21*a44 + a14*a23*a41 - a11*a23*a44 - a13*a24*a41 - a14*a21*a43);
	dest[1][3] = id*(a11*a23*a34 + a13*a24*a31 + a14*a21*a33 - a11*a24*a33 - a13*a21*a34 - a14*a23*a31);

	dest[2][0] = id*(a21*a32*a44 + a22*a34*a41 + a24*a31*a42 - a21*a34*a42 - a22*a31*a44 - a24*a32*a41);
	dest[2][1] = id*(a11*a34*a42 + a12*a31*a44 + a14*a32*a41 - a11*a32*a44 - a12*a34*a41 - a14*a31*a42);
	dest[2][2] = id*(a11*a22*a44 + a12*a24*a41 + a14*a21*a42 - a11*a24*a42 - a12*a21*a44 - a14*a22*a41);
	dest[2][3] = id*(a11*a24*a32 + a12*a21*a34 + a14*a22*a31 - a11*a22*a34 - a12*a24*a31 - a14*a21*a32);

	dest[3][0] = id*(a21*a33*a42 + a22*a31*a43 + a23*a32*a41 - a21*a32*a43 - a22*a33*a41 - a23*a31*a42);
	dest[3][1] = id*(a11*a32*a43 + a12*a33*a41 + a13*a31*a42 - a11*a33*a42 - a12*a31*a43 - a13*a32*a41);
	dest[3][2] = id*(a11*a23*a42 + a12*a21*a43 + a13*a22*a41 - a11*a22*a43 - a12*a23*a41 - a13*a21*a42);
	dest[3][3] = id*(a11*a22*a33 + a12*a23*a31 + a13*a21*a32 - a11*a23*a32 - a12*a21*a33 - a13*a22*a31);
	
	if(dest[0]){
		
	}
	
	return dest;
};


// ============================================================================
// Rendering function
// ============================================================================
function render() 
{
	// increment date
	if(!theTime.isPaused()) {	
		date += 0.10*theTime.getDateScale();
	}

	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	// projection matrix
    var  p = perspective( theFovy, theAspect, theZNear, theZFar );
	
    // modelview matrix
    translateCamera();
    if(theMovement.trackingPlanet == true) theMovement.track();
	var mv = lookAt(eye, at, up);
	
    // draw the skybox first of all
    drawSkybox(p, mv);

	// drawn for reference
	//var cubeScale = scale(10, 10, 10);
	//drawCube(p, mult(mv, cubeScale));
	
	theOrbits.drawOrbits(p, mv);
	drawPlanets(p, mv);
	
    requestAnimFrame( render );
}

function drawPlanets(p, mv, colorCode)
{
	// TODO if colorCode: call drawSphere with a color code and ignore lighting in shader

	var invMV = inverseMatrix(mv);
    
	// *** Sun ***
	var center = vec4(0.0, 0.0, 0.0, 1.0);
	var radius = SUN.radius * SUN_SCALE;
	if(colorCode){
		drawSphere(p, mv, invMV, center, radius, false, SUN.colorCode);
	}else{
		drawSphere(p, mv, invMV, center, radius, true);
	}
	
	// *** Mercury ***
	center = vec4( scalev(DIST_SCALE, planetPosition(MERCURY, date/36525.0)), 1.0 );
	radius = MERCURY.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, invMV, center, radius, false, MERCURY.colorCode);
	}else{
		drawSphere(p, mv, invMV, center, radius, false);
		theOrbits.addOrbitPos(center);
	}
	
	
	// *** Venus ***
	center = vec4( scalev(DIST_SCALE, planetPosition(VENUS, date/36525.0)), 1.0 );
	radius = VENUS.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, invMV, center, radius, false, VENUS.colorCode);
	}else{
		drawSphere(p, mv, invMV, center, radius, false);
		theOrbits.addOrbitPos(center);
	}
	

	// *** Earth ***
	center = vec4( scalev(DIST_SCALE, planetPosition(EARTH, date/36525.0)), 1.0 );
	radius = EARTH.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, invMV, center, radius, false, EARTH.colorCode);
	}else{
		drawSphere(p, mv, invMV, center, radius, false);
		theOrbits.addOrbitPos(center);
	}
	
	
	// *** Moon ***
	center = vec4( add(vec3(center), scalev(SAT_DIST_SCALE, planetPosition(MOON, date/36525.0))), 1.0 );
	radius = MOON.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, invMV, center, radius, false, MOON.colorCode);
	}else{
		drawSphere(p, mv, invMV, center, radius, false);
		theOrbits.addOrbitPos(center);
	}
	

	// *** Mars ***
	center = vec4( scalev(DIST_SCALE, planetPosition(MARS, date/36525.0)), 1.0 );
	radius = MARS.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, invMV, center, radius, false, MARS.colorCode);
	}else{
		drawSphere(p, mv, invMV, center, radius, false);
		theOrbits.addOrbitPos(center);
	}
	

	// *** Jupiter ***
	center = vec4( scalev(DIST_SCALE, planetPosition(JUPITER, date/36525.0)), 1.0 );
	radius = JUPITER.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, invMV, center, radius, false, JUPITER.colorCode);
	}else{
		drawSphere(p, mv, invMV, center, radius, false);
		theOrbits.addOrbitPos(center);
	}

	// *** Saturn ***
	center = vec4( scalev(DIST_SCALE, planetPosition(SATURN, date/36525.0)), 1.0 );
	radius = SATURN.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, invMV, center, radius, false, SATURN.colorCode);
	}else{
		drawSphere(p, mv, invMV, center, radius, false);
		theOrbits.addOrbitPos(center);
	}
	

	// *** Uranus ***
	center = vec4( scalev(DIST_SCALE, planetPosition(URANUS, date/36525.0)), 1.0 );
	radius = URANUS.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, invMV, center, radius, false, URANUS.colorCode);
	}else{
		drawSphere(p, mv, invMV, center, radius, false);
		theOrbits.addOrbitPos(center);
	}
	

	// *** Neptune ***
	center = vec4( scalev(DIST_SCALE, planetPosition(NEPTUNE, date/36525.0)), 1.0 );
	radius = NEPTUNE.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, invMV, center, radius, false, NEPTUNE.colorCode);
	}else{
		drawSphere(p, mv, invMV, center, radius, false);
		theOrbits.addOrbitPos(center);
	}
	

	// *** Pluto ***
	center = vec4( scalev(DIST_SCALE, planetPosition(PLUTO, date/36525.0)), 1.0 );
	radius = PLUTO.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, invMV, center, radius, false, PLUTO.colorCode);
	}else{
		drawSphere(p, mv, invMV, center, radius, false);
		theOrbits.addOrbitPos(center);
	}
	
}

var theTime;
var TimeOptions = function() {
	this.speed = 1.0;
	this.pause = false;

	this.getDateScale = function() {
		return this.speed;
	}

	this.isPaused = function() {
		return this.pause;
	}
}
