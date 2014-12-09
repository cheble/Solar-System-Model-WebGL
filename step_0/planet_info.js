
function getPlanet(x, y){
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.clear( gl.COLOR_BUFFER_BIT );
	
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
	
	drawPlanets(p, mv, true);
	
	gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);
	

	// use codes to decipher planet by color
	var code = color[0];
	var body;
	if(code == SUN.colorCode){
		body = SUN;
	} else if(code == MERCURY.colorCode){
		body = MERCURY;
	} else if(code == VENUS.colorCode){
		body = VENUS;
	} else if(code == EARTH.colorCode){
		body = EARTH;
	} else if(code == MARS.colorCode){
		body = MARS;
	} else if(code == JUPITER.colorCode){
		body = JUPITER;
	} else if(code == SATURN.colorCode){
		body = SATURN;
	} else if(code == URANUS.colorCode){
		body = URANUS;
	} else if(code == NEPTUNE.colorCode){
		body = NEPTUNE;
	} else if(code == PLUTO.colorCode){
		body = PLUTO;
	} else if(code == MOON.colorCode){
		body = MOON;
	}
	
	if(body && body.name){
		document.getElementById("info").innerHTML = body.name;
	} else {
		document.getElementById("info").innerHTML = "";
	}
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	
}

function addOrbitPos( pos ){
	theOrbitPoints[orbitIndex++] = pos;
	
	orbitIndex = orbitIndex % 20000;
		
}

var framebuffer;
var texture;
var color = new Uint8Array(4);

function initFrameBuffer() {
	texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, CANVAS_SIZE, CANVAS_SIZE, 0, 
       gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.generateMipmap(gl.TEXTURE_2D);
	
	// Allocate a frame buffer object
	framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer);
	// Attach color buffer
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}