var sunTexture;
var mercuryTexture;
var venusTexture;
var earthTexture;
var marsTexture;
var jupiterTexture;
var saturnTexture;
var uranusTexture;
var neptuneTexture;
var plutoTexture;
var moonTexture;
var earthNightTexture;
var earthBumpMap;
var earthSpecularMap;
var earthCloudTexture;

var earthTextures = [];
var earthShaderTexNames = ["daycolormap", "nightcolormap",
                      "bumpmap", "specularmap", "cloudmap"];

function configurePlanetTexture( image, imageID) {
	var dataType = gl.RGB;  // the standard for our textures
    if(imageID == 1){
		earthTexture = gl.createTexture();
	    gl.bindTexture( gl.TEXTURE_2D, earthTexture );
        earthTextures.push(earthTexture);
	} else if (imageID == 2){
		jupiterTexture = gl.createTexture();
	    gl.bindTexture( gl.TEXTURE_2D, jupiterTexture );
	} else if (imageID == 3){
		marsTexture = gl.createTexture();
	    gl.bindTexture( gl.TEXTURE_2D, marsTexture );
	} else if (imageID == 4){
		mercuryTexture = gl.createTexture();
	    gl.bindTexture( gl.TEXTURE_2D, mercuryTexture );
	} else if (imageID == 5){
		neptuneTexture = gl.createTexture();
	    gl.bindTexture( gl.TEXTURE_2D, neptuneTexture );
	} else if (imageID == 6){
		plutoTexture = gl.createTexture();
	    gl.bindTexture( gl.TEXTURE_2D, plutoTexture );
	} else if (imageID == 7){
		saturnTexture = gl.createTexture();
	    gl.bindTexture( gl.TEXTURE_2D, saturnTexture );
	} else if (imageID == 8){
		sunTexture = gl.createTexture();
	    gl.bindTexture( gl.TEXTURE_2D, sunTexture );
	} else if (imageID == 9){
		uranusTexture = gl.createTexture();
	    gl.bindTexture( gl.TEXTURE_2D, uranusTexture );
	} else if (imageID == 10){
		venusTexture = gl.createTexture();
	    gl.bindTexture( gl.TEXTURE_2D, venusTexture );
	} else if (imageID == 11){
		moonTexture = gl.createTexture();
	    gl.bindTexture( gl.TEXTURE_2D, moonTexture );
	} else if (imageID == 12){
        earthNightTexture = gl.createTexture();
        gl.bindTexture( gl.TEXTURE_2D, earthNightTexture );
        earthTextures.push(earthNightTexture);
    } else if (imageID == 13){
        earthBumpMap = gl.createTexture();
        gl.bindTexture( gl.TEXTURE_2D, earthBumpMap );
        earthTextures.push(earthBumpMap);
    } else if (imageID == 14){
        earthSpecularMap = gl.createTexture();
        gl.bindTexture( gl.TEXTURE_2D, earthSpecularMap );
        earthTextures.push(earthSpecularMap);
        dataType = gl.LUMINANCE;
    } else if (imageID == 15) {
        earthCloudTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, earthCloudTexture);
        earthTextures.push(earthCloudTexture);
        dataType = gl.RGBA;
    } 
    else {
        return;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D( gl.TEXTURE_2D, 0, dataType, dataType, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
}


function loadPlanetTexture() {
    var image1 = new Image();
    image1.onload = function() { 
        configurePlanetTexture( image1, 1 );
    }
    image1.src = PLANETS_PATH + "earthmap2k.jpg";
    
    var image2 = new Image();
    image2.onload = function() { 
        configurePlanetTexture( image2, 2 );
    }
    image2.src = PLANETS_PATH + "jupitermap.jpg";
    
    var image3 = new Image();
    image3.onload = function() { 
        configurePlanetTexture( image3, 3 );
        
    }
    image3.src = PLANETS_PATH + "mars_1k_color.jpg";
    
    var image4 = new Image();
    image4.onload = function() { 
        configurePlanetTexture( image4, 4 );
        
    }
    image4.src = PLANETS_PATH + "mercurymap.jpg";
    
    var image5 = new Image();
    image5.onload = function() { 
        configurePlanetTexture( image5, 5 );
        
    }
    image5.src = PLANETS_PATH + "neptunemap.jpg";
    
    var image6 = new Image();
    image6.onload = function() { 
        configurePlanetTexture( image6, 6 );
        
    }
    image6.src = PLANETS_PATH + "plutomap1k.jpg";
    
    var image7 = new Image();
    image7.onload = function() { 
        configurePlanetTexture( image7, 7 );
        
    }
    image7.src = PLANETS_PATH + "saturnmap.jpg";
    
    var image8 = new Image();
    image8.onload = function() { 
        configurePlanetTexture( image8, 8 );
        
    }
    image8.src = PLANETS_PATH + "sunmap.jpg";
    
    var image9 = new Image();
    image9.onload = function() { 
        configurePlanetTexture( image9, 9 );
        
    }
    image9.src = PLANETS_PATH + "uranusmap.jpg";
    
    var image10 = new Image();
    image10.onload = function() { 
        configurePlanetTexture( image10, 10 );
    }
    image10.src = PLANETS_PATH + "venusmap.jpg";
    
    var image11 = new Image();
    image11.onload = function() { 
        configurePlanetTexture( image11, 11 );
    }
    image11.src = PLANETS_PATH + "moonmap1k.jpg";   

    var image12 = new Image();
    image12.onload = function() { 
        configurePlanetTexture( image12, 12 );
    }
    image12.src = PLANETS_PATH + "earthlights1k.jpg";

    var image13 = new Image();
    image13.onload = function() { 
        configurePlanetTexture( image13, 13 );
    }
    image13.src = PLANETS_PATH + "earthbump1k.jpg";

    var image14 = new Image();
    image14.onload = function() { 
        configurePlanetTexture( image14, 14 );
    }
    image14.src = PLANETS_PATH + "earthspec1k.jpg";
    
    var image15 = new Image();
    image15.onload = function() {
        configurePlanetTexture( image15, 15 );
    }
    image15.src = PLANETS_PATH + "earth-clouds.png";
}

function usePlanetTexture(theProgram, texture) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(theProgram, "texture"), 0);
}

function useEarthTextures(theProgram, textures) {
    for(var i = 0; i < textures.length; ++i) {
        gl.activeTexture(gl.TEXTURE0 + i);  // gl.TEXTUREi constants are consecutive
        gl.bindTexture(gl.TEXTURE_2D, textures[i]);
        gl.uniform1i(gl.getUniformLocation(theProgram, earthShaderTexNames[i]), i);
    }
}