
function getPlanet(x, y){

    gl.activeTexture(gl.TEXTURE1);
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.clear( gl.COLOR_BUFFER_BIT );
	
	// projection matrix
    var  p = perspective( theFovy, theAspect, theZNear, theZFar );
	
    // modelview matrix
	var mv = lookAt(eye, at, up);
	
	drawPlanets(p, mv, true);
	

	var xPixel = (x+1)/2.0*canvas.width;
	var yPixel = (y+1)/2.0*canvas.height;
	gl.readPixels(xPixel, yPixel, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);
	

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
		document.getElementById("info").style.visibility = "visible";
		document.getElementById("info").innerHTML = body.info;
	} else {
		document.getElementById("info").innerHTML = "Click on a planet to view information.";
	}
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	
}

var framebuffer;
var texture;
var color = new Uint8Array(4);

function initFrameBuffer() {
    gl.activeTexture(gl.TEXTURE1);
	texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, CANVAS_SIZE_X, CANVAS_SIZE_Y, 0, 
       gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.generateMipmap(gl.TEXTURE_2D);
	
	// Allocate a frame buffer object
	framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer);
	// Attach color buffer
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}