// ============================================================================
// ---   The Amazing Orbit   ---
// ============================================================================
// Here you will find all the variables, sources and functions 
//  related to the planet orbits in the project.
// Basically the orbits are points drawn in the center of the 
//  planets as they move around the sun.
// This the first .js file that looks like a class implementation from JS.
// ============================================================================

var Orbit = function() {

	var theOrbitProgram = initShaders(gl, "orbit-vertex-shader", "orbit-fragment-shader");
    gl.useProgram(theOrbitProgram);

	this.VBOPoints = gl.createBuffer();
	this.Index = 0;
	this.orbitLength = 10000;
	this.Points = [];
	this.visible = true;
	this.orbitSize = 1.0;
	this.orbitColor = [ 128, 128, 0, 0.99 ];
	this.showRotations = true;

	// this function should be called to every planet/satellite moving on the system
	this.addOrbitPos = function( pos ) {
		if(!theTime.isPaused()) {	
			if(this.Points.length >= this.orbitLength) {
	            theOrbits.Points.splice(0, theOrbits.Points.length - theOrbits.orbitLength);
			}
			this.Points.push(pos);
		}
	}

	var webglColor;		// we only need this variable because dat.GUI library has a bug
	this.drawOrbits = function(p, mv) {
	    gl.useProgram(theOrbitProgram);
		
		gl.uniformMatrix4fv( gl.getUniformLocation(theOrbitProgram, "projectionMatrix"),
			false, flatten(p));
		   
		gl.uniformMatrix4fv( gl.getUniformLocation(theOrbitProgram, "modelViewMatrix"), 
			false, flatten(mv));   
		
		gl.uniform1f( gl.getUniformLocation(theOrbitProgram, "orbitSize"), this.orbitSize);
		
		// we need this to correct the bug on dat.GUI
		if(typeof this.orbitColor != "string") {
			webglColor = vec4(this.orbitColor[0]/255, this.orbitColor[1]/255, this.orbitColor[2]/255, this.orbitColor[3]);
		} else {
			var thenums = this.orbitColor.match(/\d+/g);
			webglColor = vec4(thenums[0]/255, thenums[1]/255, thenums[2]/255, thenums[4]/100);
		}
		gl.uniform4fv( gl.getUniformLocation(theOrbitProgram, "orbitColor"), webglColor);

	    gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOPoints);
	    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.Points), gl.STATIC_DRAW); 
		
	    // Associate out shader variables with our data buffer
	    var vPosition = gl.getAttribLocation(theOrbitProgram, "vPosition");
	    gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOPoints);      
	    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	    gl.enableVertexAttribArray(vPosition);
	    
		gl.drawArrays(gl.POINTS, 0, this.Points.length);
	}
}
