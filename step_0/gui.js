

function initGUI() {
    var theGUI = new dat.GUI();

    // =========================
    // Skybox related options
    // =========================
    theSkyboxSource = new SkyboxTextureSource();
    // Choose from accepted values
    var reloadTexture = theGUI.add(theSkyboxSource, 'background', [ 'Purple Nebula', 'Astonishing', 'Green Cloud']);
    // reloadTexture look for events to trigger other functions
    reloadTexture.onChange(function(value) {
        initSkyboxTextures();
    });


    // =========================
    // Orbits related options
    // =========================
    var guiOrbits = theGUI.addFolder('Orbits');
    guiOrbits.add(theOrbits, 'visible');
    guiOrbits.add(theOrbits, 'orbitSize', -0.5, 2.0);
    guiOrbits.add(theOrbits, 'orbitLength', 100, 10000).step(1);
    guiOrbits.addColor(theOrbits, 'orbitColor');
    // guiOrbits.add(theOrbits, 'orbitColor');
}