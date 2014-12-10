var Orbit = function() {
	this.VBOPoints = gl.createBuffer();
	this.Index = 0;
	this.orbitLength = 10000;
	this.Points = [];
	this.visible = true;
	this.orbitSize = 1.0;
	this.orbitColor = [ 128, 128, 0, 0.99 ];

	this.addOrbitPos = function( pos ) {
		if(this.Points.length >= this.orbitLength) {
            theOrbits.Points.splice(0, theOrbits.Points.length - theOrbits.orbitLength);
		}
		this.Points.push(pos)
	}

	var webglColor;
	this.drawOrbits = function(p, mv) {
	    gl.useProgram(theCubeProgram);
		
		gl.uniformMatrix4fv( gl.getUniformLocation(theCubeProgram, "projectionMatrix"),
			false, flatten(p));
		   
		gl.uniformMatrix4fv( gl.getUniformLocation(theCubeProgram, "modelViewMatrix"), 
			false, flatten(mv));   
		
		gl.uniform1f( gl.getUniformLocation(theCubeProgram, "orbitSize"), this.orbitSize);
		
		// we need this to correct the bug on dat.GUI
		if(typeof this.orbitColor != "string") {
			webglColor = vec4(this.orbitColor[0]/255, this.orbitColor[1]/255, this.orbitColor[2]/255, this.orbitColor[3]);
		} else {
			var thenums = this.orbitColor.match(/\d+/g);
			webglColor = vec4(thenums[0]/255, thenums[1]/255, thenums[2]/255, thenums[4]/100);
		}
		gl.uniform4fv( gl.getUniformLocation(theCubeProgram, "orbitColor"), webglColor);

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