// ============================================================================
// ---   The Amazing Skybox   ---
// ============================================================================
// Here you will find all the variables, sources and functions 
//  related to the skybox in the project.
// ============================================================================
var theSkyboxProgram;
var theSkyboxVBOPoints;
var theSkyboxPoints = [];
var theSkyboxTextures = [];
var theSkyImage = new Array(6);
var theSkyboxSource;

var SkyboxTextureSource = function() {
    this.source = "Purple Nebula";

    this.getSource = function() {
        if(this.source == "Purple Nebula") {
            return background3;
        } else if(this.source == "Astonishing") {
            return background2;
        } else if(this.source == "Green Cloud") {
            return background1;
        }
    }

    var background1 = [
        "green_cloud_0.jpg",
        "green_cloud_1.jpg",
        "green_cloud_2.jpg",
        "green_cloud_3.jpg",
        "green_cloud_4.jpg",
        "green_cloud_5.jpg"
    ]

    var background2 = [
        "astonishing-0.jpg",
        "astonishing-1.jpg",
        "astonishing-2.jpg",
        "astonishing-3.jpg",
        "astonishing-4.jpg",
        "astonishing-5.jpg"
    ]

    var background3 = [
        "purple_nebula-0.jpg",
        "purple_nebula-1.jpg",
        "purple_nebula-2.jpg",
        "purple_nebula-3.jpg",
        "purple_nebula-4.jpg",
        "purple_nebula-5.jpg"
    ]
}


var distScale = 5000;
var theSkyboxVertices = [
        vec4(-distScale, -distScale,  distScale, 1.0),
        vec4(-distScale,  distScale,  distScale, 1.0),
        vec4( distScale,  distScale,  distScale, 1.0),
        vec4( distScale, -distScale,  distScale, 1.0),
        vec4(-distScale, -distScale, -distScale, 1.0),
        vec4(-distScale,  distScale, -distScale, 1.0),
        vec4( distScale,  distScale, -distScale, 1.0),
        vec4( distScale, -distScale, -distScale, 1.0)
    ];


function skyboxFace(a, b, c, d) 
{
     theSkyboxPoints.push(theSkyboxVertices[a]); 
     theSkyboxPoints.push(theSkyboxVertices[b]); 
     theSkyboxPoints.push(theSkyboxVertices[c]); 
     theSkyboxPoints.push(theSkyboxVertices[d]);
}

function skyboxCube()
{
    skyboxFace( 1, 0, 3, 2 );
    skyboxFace( 2, 3, 7, 6 );
    skyboxFace( 3, 0, 4, 7 );
    skyboxFace( 6, 5, 1, 2 );
    skyboxFace( 4, 5, 6, 7 );
    skyboxFace( 5, 4, 0, 1 );
}

function initSkybox()
{
    //initialize the cube     
    skyboxCube();
    
    //  Load shaders and initialize attribute buffers    
    theSkyboxProgram = initShaders(gl, "skybox-vertex-shader", "skybox-fragment-shader");
    gl.useProgram(theSkyboxProgram);
    
    // Create VBOs and load the data into the VBOs
    theSkyboxVBOPoints = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, theSkyboxVBOPoints);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(theSkyboxPoints), gl.STATIC_DRAW);   
}

// The Skybox must be the first thing to be drawn
function drawSkybox(p, mv) 
{
    gl.useProgram(theSkyboxProgram);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(theSkyboxProgram, "projectionMatrix"),
        false, flatten(p));
       
    gl.uniformMatrix4fv( gl.getUniformLocation(theSkyboxProgram, "modelViewMatrix"), 
        false, flatten(mv));   
  
    // Associate out shader variables with our data buffer  
    var vPosition = gl.getAttribLocation(theSkyboxProgram, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, theSkyboxVBOPoints);      
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, theSkyboxTextures);
    gl.uniform1i(gl.getUniformLocation(theSkyboxProgram, "skybox"), 0);

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, i * 4, 4);
    }
}

function initSkyboxTextures() {
    var counter = 0;
    theSkyboxTextures = gl.createTexture();
    for(var i = 0 ; i < 6 ; i++) {
        theSkyImage[i] = new Image();
        theSkyImage[i].src = SKYBOX_PATH + theSkyboxSource.getSource()[i];    
        theSkyImage[i].onload = function()  { 
            counter++;
            if(counter == 6) { // call the function only one time: after finish loading the 6 images
                handleTextureLoaded(theSkyImage, theSkyboxTextures);
            }
        }  
    }
}


function handleTextureLoaded(image, texture) {
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    for (var j = 0; j < 6; j++) {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+j, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image[j]);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
}