

function initGUI() {
    var theGUI = new dat.GUI();

    // Skybox related options
    theSkyboxSource = new SkyboxTextureSource();
    // Choose from accepted values
    var reloadTexture = theGUI.add(theSkyboxSource, 'background', [ 'Purple Nebula', 'Astonishing', 'Green Cloud']);
    // reloadTexture look for events to trigger other functions
    reloadTexture.onChange(function(value) {
        initSkyboxTextures();
    });
}