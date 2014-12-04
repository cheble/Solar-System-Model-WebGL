var gl;

// ============================================================================
// Projection and modelview related data structures and functions
// ============================================================================
// Projection transformation parameters
var	theFovy = 45.0;  		// Field-of-view in Y direction angle (in degrees)
var theAspect = 1.0;       // Viewport aspect ratio
var theZNear = 0.1;
var theZFar = 1000.0;

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


var lightPosition = vec4(0.0, 0.0, 2.0, 0.0 );
var ka = 0.5;
var kd = 0.5;
var ks = 0.5;
var shininess = 100.0;

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
                         vec4( 0.0,  1.0,  0.0, 1.0 ),
                         vec4( 1.0,  0.0,  0.0, 1.0 ),
                         vec4( 2.0,  0.0,  0.0, 1.0 ),
                         vec4( 3.0,  1.0,  0.0, 1.0 )
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
    
    var N = 256;
    var data = new Uint8Array(N * N * 4);
    var count = 0;
    for(var i = 0; i < N; i++){
    	for(var j = 0; j < N; j++){
    		data[count++] = 255;
    		data[count++] = 0;
    		data[count++] = 0;
    		if(i >= N/4 && j >= N/4 && i < 3*N/4 && j < 3*N/4){
    			data[count++] = 255;
    		} else {
    			data[count++] = 0;
    		}
        }
    }
    
    var normalst = new Array()
    for (var i=0; i<N; i++){
    	normalst[i] = new Array();
    }
    for (var i=0; i<N; i++){
    	for ( var j = 0; j < N; j++){
    		normalst[i][j] = new Array();
    	}
    }
    for (var i=0; i<N; i++){
    	for ( var j = 0; j < N; j++) {
    		normalst[i][j][0] = data[i][j]-data[i+1][j];
    		normalst[i][j][1] = data[i][j]-data[i][j+1];
    		normalst[i][j][2] = 1;
    	}
    }
    
    var normals = new Uint8Array(3*N*N);

    for ( var i = 0; i < N; i++ ) 
        for ( var j = 0; j < N; j++ ) 
           for(var k =0; k<3; k++) 
                normals[3*N*i+3*j+k] = 255*normalst[i][j][k];
        
	
	var cubeMap = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
    /*
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    */
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, 256, 256, 0, gl.RGB, gl.UNSIGNED_BYTE, normals);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, 256, 256, 0, gl.RGB, gl.UNSIGNED_BYTE, normals);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, 256, 256, 0, gl.RGB, gl.UNSIGNED_BYTE, normals);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, 256, 256, 0, gl.RGB, gl.UNSIGNED_BYTE, normals);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, 256, 256, 0, gl.RGB, gl.UNSIGNED_BYTE, normals);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, 256, 256, 0, gl.RGB, gl.UNSIGNED_BYTE, normals);
    
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    
    gl.activeTexture( gl.TEXTURE0 );
    gl.uniform1i(gl.getUniformLocation(theSphereProgram, "texMap"),0);
	
}

function drawSphere(p, mv, inverseMV) 
{
    gl.useProgram(theSphereProgram);
	
	gl.uniformMatrix4fv( gl.getUniformLocation(theSphereProgram, "projectionMatrix"),false, flatten(p));
	 
	gl.uniformMatrix4fv( gl.getUniformLocation(theSphereProgram, "modelViewMatrix"),false, flatten(mv));
	 
	gl.uniformMatrix4fv( gl.getUniformLocation(theSphereProgram, "inveseMVMatrix"),false, flatten(inverseMV));
	
    gl.uniform1f( gl.getUniformLocation(theSphereProgram, "ka"), ka);
	
    gl.uniform1f( gl.getUniformLocation(theSphereProgram, "kd"), kd);
    
	gl.uniform1f( gl.getUniformLocation(theSphereProgram, "ks"), ks);
    
	gl.uniform4fv( gl.getUniformLocation(theSphereProgram, "lightPosition"),flatten(lightPosition) );
    
	gl.uniform1f( gl.getUniformLocation(theSphereProgram, "shininess"), shininess );
	
	var center = vec4(0.0, 0.5, 0.0, 1.0);
	gl.uniform4fv( gl.getUniformLocation(theSphereProgram, "center"), flatten(center));
	gl.uniform1f( gl.getUniformLocation(theSphereProgram, "scale"), theScale );
	
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
    var canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { 
        alert( "WebGL isn't available" ); 
    }
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
    // Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.95, 0.95, 0.95, 1.0 );	
	theAspect = canvas.width * 1.0 / canvas.height;
	
	initCube();
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
		}

		render();
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
                
				var q = trackball_vtoq(theAngle, theAxis);
		
				if (theInit) {
					theCurtQuat = q;
					theInit = false;
				} else {	
					theCurtQuat = multiplyQuat(q, theCurtQuat);
				}

				/* update position */
				theLastPos[0] = curPos[0];
				theLastPos[1] = curPos[1];
				theLastPos[2] = curPos[2];
			}
			
			render();
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
			
			render();
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
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	// projection matrix
    var  p = perspective( theFovy, theAspect, theZNear, theZFar );
	
    // modelview matrix
	var t = translate(0, 0, -5.0);
	var s = scale(theScale, theScale, theScale);
	var r = buildRotationMatrix(theCurtQuat);
	var mv = mat4();
	mv = mult(mv, t);
	mv = mult(mv, s);
	mv = mult(mv, r);
	
	t = translate(0.0, 0.0, 5.0);
	s = scale(1.0/theScale, 1.0/theScale, 1.0/theScale);
	r = buildRotationMatrix(invq(theCurtQuat));
	var inverseMV = mat4();
	inverseMV = mult(inverseMV, t);
	inverseMV = mult(inverseMV, s);
	inverseMV = mult(inverseMV, r);
	
	//console.log(inverseMV);
	//inverseMV = inverseMatrix(mv);
	//console.log(inverseMV);
	
	drawCube(p, mv);
	drawSphere(p, mv, inverseMV);
}