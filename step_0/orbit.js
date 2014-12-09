var Orbit = function() {
	this.theOrbitVBOPoints = gl.createBuffer();
	this.orbitIndex = 0;
	this.theOrbitPoints = [];
	this.visible = true;

	this.addOrbitPos = function( pos ) {
		this.theOrbitPoints[this.orbitIndex++] = pos;
		
		this.orbitIndex = this.orbitIndex % 20000;
	}

	this.drawOrbits = function(p, mv) {
	    gl.useProgram(theCubeProgram);
		
		gl.uniformMatrix4fv( gl.getUniformLocation(theCubeProgram, "projectionMatrix"),
			false, flatten(p));
		   
		gl.uniformMatrix4fv( gl.getUniformLocation(theCubeProgram, "modelViewMatrix"), 
			false, flatten(mv));   
	  

	    gl.bindBuffer(gl.ARRAY_BUFFER, this.theOrbitVBOPoints);
	    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.theOrbitPoints), gl.STATIC_DRAW); 
		
	    // Associate out shader variables with our data buffer
	    var vPosition = gl.getAttribLocation(theCubeProgram, "vPosition");
	    gl.bindBuffer(gl.ARRAY_BUFFER, this.theOrbitVBOPoints);      
	    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	    gl.enableVertexAttribArray(vPosition);
	    
		if(this.visible) gl.drawArrays(gl.POINTS, 0, this.theOrbitPoints.length);
	}
}