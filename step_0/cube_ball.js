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
var ka = 0.1;
var kd = 0.5;
var ks = 0.5;
var shininess = 100.0;

// SCALES

var SUN_SCALE = 5e-6;
var PLANET_SCALE = 1e-4;
var DIST_SCALE = 2e-7;
var SAT_DIST_SCALE = 5e-6;

// END SCALES

var CANVAS_SIZE = 900;

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

function drawSphere(p, mv, center, radius, luminous, colorCode) 
{
    gl.useProgram(theSphereProgram);
	
	gl.uniformMatrix4fv( gl.getUniformLocation(theSphereProgram, "projectionMatrix"),false, flatten(p));
	 
	gl.uniformMatrix4fv( gl.getUniformLocation(theSphereProgram, "modelViewMatrix"),false, flatten(mv));

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
	gl.uniform1f( gl.getUniformLocation(theSphereProgram, "radius"), theScale*radius );
	
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(theSphereProgram, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, theSphereVBOPoints);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

// ============================================================================
// WebGL Initialization
// ============================================================================
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
	initFrameBuffer();
	
    initTextures();
    initSkybox();
	initCube();
	initOrbits();
	initSphere();
	
    render();
    
    canvas.addEventListener("mousedown", function(e){
 		var pos = getMousePos(e, this);
		var x = pos[0];
		var y = pos[1];
		
		if (e.button == 0) { 
			startMotion(x, y);
		} else if (e.button == 1) {
			startScale(x, y);
		} else if (e.button == 2) {
			var xPixel = (x+1)/2.0*canvas.width;
			var yPixel = (y+1)/2.0*canvas.height;
			getPlanet(xPixel, yPixel);
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
		
		if(theTrackingMove)
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

		if (theScalingMove) {
			if (theCurtX != x || theCurtY != y) {
        
				theScale += (theCurtY * 1.0 - y)/2.0 * 1.3 * theScale; // 2.0 -
																		// the
																		// windows
																		// height
				if (theScale <= 0.0) {
					theScale = 0.00000001;
				}
        
				theCurtX = x;
				theCurtY = y;
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

        translateCamera(key);
    } );
};

function inverseMatrix(matrix) {
	  var r = [];
	  var m = flatten(matrix);

	  r[0] = m[5]*m[10]*m[15] - m[5]*m[14]*m[11] - m[6]*m[9]*m[15] + m[6]*m[13]*m[11] + m[7]*m[9]*m[14] - m[7]*m[13]*m[10];
	  r[1] = -m[1]*m[10]*m[15] + m[1]*m[14]*m[11] + m[2]*m[9]*m[15] - m[2]*m[13]*m[11] - m[3]*m[9]*m[14] + m[3]*m[13]*m[10];
	  r[2] = m[1]*m[6]*m[15] - m[1]*m[14]*m[7] - m[2]*m[5]*m[15] + m[2]*m[13]*m[7] + m[3]*m[5]*m[14] - m[3]*m[13]*m[6];
	  r[3] = -m[1]*m[6]*m[11] + m[1]*m[10]*m[7] + m[2]*m[5]*m[11] - m[2]*m[9]*m[7] - m[3]*m[5]*m[10] + m[3]*m[9]*m[6];

	  r[4] = -m[4]*m[10]*m[15] + m[4]*m[14]*m[11] + m[6]*m[8]*m[15] - m[6]*m[12]*m[11] - m[7]*m[8]*m[14] + m[7]*m[12]*m[10];
	  r[5] = m[0]*m[10]*m[15] - m[0]*m[14]*m[11] - m[2]*m[8]*m[15] + m[2]*m[12]*m[11] + m[3]*m[8]*m[14] - m[3]*m[12]*m[10];
	  r[6] = -m[0]*m[6]*m[15] + m[0]*m[14]*m[7] + m[2]*m[4]*m[15] - m[2]*m[12]*m[7] - m[3]*m[4]*m[14] + m[3]*m[12]*m[6];
	  r[7] = m[0]*m[6]*m[11] - m[0]*m[10]*m[7] - m[2]*m[4]*m[11] + m[2]*m[8]*m[7] + m[3]*m[4]*m[10] - m[3]*m[8]*m[6];

	  r[8] = m[4]*m[9]*m[15] - m[4]*m[13]*m[11] - m[5]*m[8]*m[15] + m[5]*m[12]*m[11] + m[7]*m[8]*m[13] - m[7]*m[12]*m[9];
	  r[9] = -m[0]*m[9]*m[15] + m[0]*m[13]*m[11] + m[1]*m[8]*m[15] - m[1]*m[12]*m[11] - m[3]*m[8]*m[13] + m[3]*m[12]*m[9];
	  r[10] = m[0]*m[5]*m[15] - m[0]*m[13]*m[7] - m[1]*m[4]*m[15] + m[1]*m[12]*m[7] + m[3]*m[4]*m[13] - m[3]*m[12]*m[5];
	  r[11] = -m[0]*m[5]*m[11] + m[0]*m[9]*m[7] + m[1]*m[4]*m[11] - m[1]*m[8]*m[7] - m[3]*m[4]*m[9] + m[3]*m[8]*m[5];

	  r[12] = -m[4]*m[9]*m[14] + m[4]*m[13]*m[10] + m[5]*m[8]*m[14] - m[5]*m[12]*m[10] - m[6]*m[8]*m[13] + m[6]*m[12]*m[9];
	  r[13] = m[0]*m[9]*m[14] - m[0]*m[13]*m[10] - m[1]*m[8]*m[14] + m[1]*m[12]*m[10] + m[2]*m[8]*m[13] - m[2]*m[12]*m[9];
	  r[14] = -m[0]*m[5]*m[14] + m[0]*m[13]*m[6] + m[1]*m[4]*m[14] - m[1]*m[12]*m[6] - m[2]*m[4]*m[13] + m[2]*m[12]*m[5];
	  r[15] = m[0]*m[5]*m[10] - m[0]*m[9]*m[6] - m[1]*m[4]*m[10] + m[1]*m[8]*m[6] + m[2]*m[4]*m[9] - m[2]*m[8]*m[5];

	  var det = m[0]*r[0] + m[1]*r[4] + m[2]*r[8] + m[3]*r[12];
	  for (var i = 0; i < 16; i++) r[i] /= det;
	  return mat4(result);
};


// ============================================================================
// Rendering function
// ============================================================================
function render() 
{
	// increment date
	date += 0.10;
	
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	// projection matrix
    var  p = perspective( theFovy, theAspect, theZNear, theZFar );
	
    // modelview matrix
	var t = translate(0, 0, -256.0);
	var s = scale(theScale, theScale, theScale);
	var r = buildRotationMatrix(theCurtQuat);
	var mv = mat4();
	mv = mult(mv, t);
	mv = mult(mv, s);
	mv = mult(mv, r);
	
	mv = lookAt(eye, at, up);

	// time
	date += 0.10;
	
    // draw the skybox first of all
    drawSkybox(p, mv);

	// drawn for reference
	//var cubeScale = scale(10, 10, 10);
	//drawCube(p, mult(mv, cubeScale));

	drawOrbits(p, mv);
	drawPlanets(p, mv);
	
    requestAnimFrame( render );
}

function drawPlanets(p, mv, colorCode)
{
	// TODO if colorCode: call drawSphere with a color code and ignore lighting in shader
	
	// *** Sun ***
	var center = vec4(0.0, 0.0, 0.0, 1.0);
	var radius = SUN.radius * SUN_SCALE;
	if(colorCode){
		drawSphere(p, mv, center, radius, false, SUN.colorCode);
	}else{
		drawSphere(p, mv, center, radius, true);
	}
	
	// *** Mercury ***
	center = vec4( scalev(DIST_SCALE, planetPosition(MERCURY, date/36525.0)), 1.0 );
	radius = MERCURY.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, center, radius, false, MERCURY.colorCode);
	}else{
		drawSphere(p, mv, center, radius, false);
		addOrbitPos(center);
	}
	
	
	// *** Venus ***
	center = vec4( scalev(DIST_SCALE, planetPosition(VENUS, date/36525.0)), 1.0 );
	radius = VENUS.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, center, radius, false, VENUS.colorCode);
	}else{
		drawSphere(p, mv, center, radius, false);
		addOrbitPos(center);
	}
	

	// *** Earth ***
	center = vec4( scalev(DIST_SCALE, planetPosition(EARTH, date/36525.0)), 1.0 );
	radius = EARTH.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, center, radius, false, EARTH.colorCode);
	}else{
		drawSphere(p, mv, center, radius, false);
		addOrbitPos(center);
	}
	
	
	// *** Moon ***
	center = vec4( add(vec3(center), scalev(SAT_DIST_SCALE, planetPosition(MOON, date/36525.0))), 1.0 );
	radius = MOON.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, center, radius, false, MOON.colorCode);
	}else{
		drawSphere(p, mv, center, radius, false);
		addOrbitPos(center);
	}
	

	// *** Mars ***
	center = vec4( scalev(DIST_SCALE, planetPosition(MARS, date/36525.0)), 1.0 );
	radius = MARS.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, center, radius, false, MARS.colorCode);
	}else{
		drawSphere(p, mv, center, radius, false);
		addOrbitPos(center);
	}
	

	// *** Jupiter ***
	center = vec4( scalev(DIST_SCALE, planetPosition(JUPITER, date/36525.0)), 1.0 );
	radius = JUPITER.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, center, radius, false, JUPITER.colorCode);
	}else{
		drawSphere(p, mv, center, radius, false);
		addOrbitPos(center);
	}

	// *** Saturn ***
	center = vec4( scalev(DIST_SCALE, planetPosition(SATURN, date/36525.0)), 1.0 );
	radius = SATURN.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, center, radius, false, SATURN.colorCode);
	}else{
		drawSphere(p, mv, center, radius, false);
		addOrbitPos(center);
	}
	

	// *** Uranus ***
	center = vec4( scalev(DIST_SCALE, planetPosition(URANUS, date/36525.0)), 1.0 );
	radius = URANUS.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, center, radius, false, URANUS.colorCode);
	}else{
		drawSphere(p, mv, center, radius, false);
		addOrbitPos(center);
	}
	

	// *** Neptune ***
	center = vec4( scalev(DIST_SCALE, planetPosition(NEPTUNE, date/36525.0)), 1.0 );
	radius = NEPTUNE.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, center, radius, false, NEPTUNE.colorCode);
	}else{
		drawSphere(p, mv, center, radius, false);
		addOrbitPos(center);
	}
	

	// *** Pluto ***
	center = vec4( scalev(DIST_SCALE, planetPosition(PLUTO, date/36525.0)), 1.0 );
	radius = PLUTO.radius * PLANET_SCALE;
	if(colorCode){
		drawSphere(p, mv, center, radius, false, PLUTO.colorCode);
	}else{
		drawSphere(p, mv, center, radius, false);
		addOrbitPos(center);
	}
	
}


var theOrbitVBOPoints;
var orbitIndex = 0;
var theOrbitPoints = [];


function initOrbits()
{
    
    // Create VBOs and load the data into the VBOs
	theOrbitVBOPoints = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, theOrbitVBOPoints);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(theOrbitPoints), gl.STATIC_DRAW);   
}

function drawOrbits(p, mv) 
{
    gl.useProgram(theCubeProgram);
	
	gl.uniformMatrix4fv( gl.getUniformLocation(theCubeProgram, "projectionMatrix"),
		false, flatten(p));
	   
	gl.uniformMatrix4fv( gl.getUniformLocation(theCubeProgram, "modelViewMatrix"), 
		false, flatten(mv));   
  

	theOrbitVBOPoints = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, theOrbitVBOPoints);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(theOrbitPoints), gl.STATIC_DRAW); 
	
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(theCubeProgram, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, theOrbitVBOPoints);      
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
	gl.drawArrays(gl.POINTS, 0, theOrbitPoints.length);
}


function addOrbitPos( pos ){
	theOrbitPoints[orbitIndex++] = pos;
	
	orbitIndex = orbitIndex % 20000;
		
}
