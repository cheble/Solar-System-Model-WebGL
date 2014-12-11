

function initGUI() {
    var theGUI = new dat.GUI();

    // ====================================
    // Skybox related options
    // ====================================
    theSkyboxSource = new SkyboxTextureSource();
    var guiSkybox = theGUI.addFolder('Skybox');
     // Choose from accepted values
    var reloadTexture = guiSkybox.add(theSkyboxSource, 'source', [ 'Purple Nebula', 'Astonishing', 'Green Cloud']);
    // reloadTexture look for events to trigger other functions
    reloadTexture.onChange(function(value) {
        initSkyboxTextures();
    });


    // ====================================
    // System objects related options
    // ====================================
    theSystemObjects = new ScaleOptions();
    var guiSysOb = theGUI.addFolder('System Objects');
    guiSysOb.add(theSystemObjects, 'scaleMode', ['real', 'best', 'close orbits', 'huge planets', 'huge Sun']).onChange(function() {
        theSystemObjects.changeScales();
    });
    guiSysOb.add(theSystemObjects, 'sunScale', 5e-7, 5e-5).onChange(function() {
        theSystemObjects.setSunScale();
    });
    guiSysOb.add(theSystemObjects, 'planetScale', 1e-5, 1e-3).onChange(function() {
        theSystemObjects.setPlanetScale();
    });
    guiSysOb.add(theSystemObjects, 'distanceScale', 2e-8, 2e-6).onChange(function() {
        theSystemObjects.setDistanceScale();
    });
    guiSysOb.add(theSystemObjects, 'satelliteScale', 5e-7, 5e-5).onChange(function() {
        theSystemObjects.setSatelliteScale();
    });


    // ====================================
    // Orbits related options
    // ====================================
    var guiOrbits = theGUI.addFolder('Orbits');
    guiOrbits.add(theOrbits, 'visible');
    guiOrbits.add(theOrbits, 'orbitSize', 0.5, 3.0);
    guiOrbits.add(theOrbits, 'orbitLength', 1000, 100000).step(1);
    guiOrbits.addColor(theOrbits, 'orbitColor');
    guiOrbits.add(theOrbits, 'showRotations');


    // ====================================
    // Time related options
    // ====================================
    theTime = new TimeOptions();
    var guiTime = theGUI.addFolder('Time');
    guiTime.add(theTime, 'speed', 0.1/60, 60);
    guiTime.add(theTime, 'pause');


    // ====================================
    // Camera position related options
    // ====================================
    theMovement = new MovementOptions();
    var guiMovement = theGUI.addFolder('Postion');
    guiMovement.add(theMovement, 'specificPositions', ['initial', 'all system', 'lateral', 'Sun', 'Moon', 'outside the box']).onChange(
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