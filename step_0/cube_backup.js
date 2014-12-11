// We are using these things for nothing.
// However, I will let these information here as documentation

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
    theCubeProgram = initShaders(gl, "orbit-vertex-shader", "orbit-fragment-shader");
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

// in the onload function:
    // initCube();
// in the render function:
    // drawn for reference
    //var cubeScale = scale(10, 10, 10);
    //drawCube(p, mult(mv, cubeScale));