

function initGUI() {
    var theGUI = new dat.GUI();

    // =========================
    // Skybox related options
    // =========================
    theSkyboxSource = new SkyboxTextureSource();
    var guiSkybox = theGUI.addFolder('Skybox');
     // Choose from accepted values
    var reloadTexture = guiSkybox.add(theSkyboxSource, 'source', [ 'Purple Nebula', 'Astonishing', 'Green Cloud']);
    // reloadTexture look for events to trigger other functions
    reloadTexture.onChange(function(value) {
        initSkyboxTextures();
    });


    // =========================
    // Orbits related options
    // =========================
    var guiOrbits = theGUI.addFolder('Orbits');
    guiOrbits.add(theOrbits, 'visible');
    guiOrbits.add(theOrbits, 'orbitSize', 0.5, 3.0);
    guiOrbits.add(theOrbits, 'orbitLength', 1000, 100000).step(1);
    guiOrbits.addColor(theOrbits, 'orbitColor');


    // =========================
    // Time related options
    // =========================
    theTime = new TimeOptions();
    var guiTime = theGUI.addFolder('Time');
    guiTime.add(theTime, 'speed', 0.1/60, 60);
    guiTime.add(theTime, 'pause');


    // =========================
    // Lookat related options
    // =========================
    theMovement = new MovementOptions();
    var guiMovement = theGUI.addFolder('Postion');
    guiMovement.add(theMovement, 'specificPositions', ['initial', 'all system', 'lateral', 'Sun', 'Moon']).onChange(
        function(value) {
            theMovement.trackingPlanet = false;
            theMovement.lookAtPosition();
    });
    guiMovement.add(theMovement, 'followPlanet', [" -- ", 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']).onChange(
        function(value) {
            if(theMovement.followPlanet == " -- ") {
                theMovement.trackingPlanet = false;
            } else {
                theMovement.trackingPlanet = true;
            }
    });
    guiMovement.add(theMovement, 'direction', ['up', 'side', 'down']);
    var guiMovSpeed = guiMovement.addFolder('Side Vision');
    guiMovSpeed.add(theMovement, 'rotationSpeed', ['day', 'night', 'slow', 'fast', 'stationary']).onChange(function() {
        theMovement.setRotationSpeed();
    });
}