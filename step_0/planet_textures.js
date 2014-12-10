var earthTexture;

function configurePlanetTexture( image ) {
    earthTexture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, earthTexture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    
}


function loadPlanetTexture() {
    var image = new Image();
    image.onload = function() { 
        configurePlanetTexture( image );
        render();
    }

    image.src = PLANETS_PATH + "earthmap1k.png";
}

function usePlanetTexture(theProgram) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, earthTexture);
    gl.uniform1i(gl.getUniformLocation(theProgram, "texture"), 0);
}