var Orbit = function() {
	this.VBOPoints = gl.createBuffer();
	this.Index = 0;
	this.Points = [];
	this.visible = true;
	this.orbitSize = 1.0;
	this.orbitColor = [ 128, 128, 0, 0.3 ];

	this.addOrbitPos = function( pos ) {
		this.Points[this.Index++] = pos;
		
		this.Index = this.Index % 20000;
	}

	this.drawOrbits = function(p, mv) {
	    gl.useProgram(theCubeProgram);
		
		gl.uniformMatrix4fv( gl.getUniformLocation(theCubeProgram, "projectionMatrix"),
			false, flatten(p));
		   
		gl.uniformMatrix4fv( gl.getUniformLocation(theCubeProgram, "modelViewMatrix"), 
			false, flatten(mv));   
		
		gl.uniform1f( gl.getUniformLocation(theCubeProgram, "orbitSize"), this.orbitSize);
		gl.uniform4fv( gl.getUniformLocation(theCubeProgram, "orbitColor"), this.orbitColor);

	    gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOPoints);
	    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.Points), gl.STATIC_DRAW); 
		
	    // Associate out shader variables with our data buffer
	    var vPosition = gl.getAttribLocation(theCubeProgram, "vPosition");
	    gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOPoints);      
	    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	    gl.enableVertexAttribArray(vPosition);
	    
		if(this.visible) gl.drawArrays(gl.POINTS, 0, this.Points.length);
	}
}